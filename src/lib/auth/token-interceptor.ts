import axios, { AxiosResponse } from 'axios';
import { AdvancedTokenManager } from './token-manager';

export class TokenInterceptor {
  private static isRefreshing = false;
  private static failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];

  static setup(axiosInstance: typeof axios) {
    axiosInstance.interceptors.request.use(
      async (config: any) => {
        const token = AdvancedTokenManager.getAccessToken();

        if (token) {
          if (AdvancedTokenManager.needsRefresh()) {
            try {
              await AdvancedTokenManager.refreshTokenSilently();
              const newToken = AdvancedTokenManager.getAccessToken();
              if (newToken) {
                config.headers.Authorization = `Bearer ${newToken}`;
              }
            } catch (error) {
              console.error(
                'Token refresh failed in request interceptor:',
                error
              );
            }
          } else {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        config.headers['X-Request-ID'] = crypto.randomUUID();
        config.headers['X-Timestamp'] = new Date().toISOString();

        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return axiosInstance(originalRequest);
              })
              .catch(err => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const success = await AdvancedTokenManager.refreshTokenSilently();

            if (success) {
              const newToken = AdvancedTokenManager.getAccessToken();
              this.processQueue(null, newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axiosInstance(originalRequest);
            } else {
              this.processQueue(new Error('Token refresh failed'), null);
              this.redirectToLogin();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.redirectToLogin();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private static processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private static redirectToLogin() {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }
  }
}

if (typeof window !== 'undefined') {
  AdvancedTokenManager.initialize();
}
