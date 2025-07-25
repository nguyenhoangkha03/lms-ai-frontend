import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, LOCAL_STORAGE_KEYS } from '../constants';
import { toast } from 'react-hot-toast';

interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

interface TokenManager {
  getToken: () => string | null;
  setToken: (token: string) => void;
  getRefreshToken: () => string | null;
  setRefreshToken: (token: string) => void;
  clearTokens: () => void;
}

export const tokenManager: TokenManager = {
  getToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  },

  setToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
  },

  getRefreshToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  clearTokens: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);
  },
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: any) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers['X-Request-ID'] = crypto.randomUUID();
    config.headers['X-Timestamp'] = new Date().toISOString();

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenManager.getRefreshToken();

      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_CONFIG.baseURL}/auth/refresh`,
            {
              refreshToken,
            }
          );

          const { accessToken } = response.data.data;
          tokenManager.setToken(accessToken);

          processQueue(null, accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          tokenManager.clearTokens();

          if (typeof window !== undefined) {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        tokenManager.clearTokens();

        if (typeof window !== undefined) {
          window.location.href = '/login';
        }

        return Promise.reject(error);
      }
    }

    if (error.response) {
      const apiError: ApiError = {
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        errors: error.response.data?.errors,
      };

      if (error.response.status >= 500) {
        toast.error('Server error. Please try again later.');
      } else if (error.response.status === 429) {
        toast.error('Too many requests. Please slow down.');
      } else if (error.response.status === 403) {
        toast.error('Access denied. You do not have permission.');
      }

      return Promise.reject(apiError);
    }

    if (error.code === 'NETWORK_ERROR' || !error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject({
        message: 'Network error',
        status: 0,
      });
    }

    return Promise.reject(error);
  }
);

export class BaseApiService {
  protected client: AxiosInstance;

  constructor(client: AxiosInstance = apiClient) {
    this.client = client;
  }

  protected async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<{ data: T }>(config);
    return response.data.data;
  }

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  protected async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  protected async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  protected async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  protected async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }
}
