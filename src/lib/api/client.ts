import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, LOCAL_STORAGE_KEYS } from '../constants/constants';
import { toast } from 'react-hot-toast';
import { AdvancedTokenManager } from '@/lib/auth/token-manager';

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
    const token = AdvancedTokenManager.getAccessToken();
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

    // Let AdvancedTokenManager handle all token refresh logic
    // Don't duplicate refresh logic here to avoid conflicts
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🚫 401 error in axios interceptor, but TokenManager will handle refresh');
      
      // Just mark as retried to prevent infinite loops
      originalRequest._retry = true;
      
      // Let the error bubble up so other handlers can deal with it
      // The AdvancedTokenManager will handle refresh automatically via its intervals
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
