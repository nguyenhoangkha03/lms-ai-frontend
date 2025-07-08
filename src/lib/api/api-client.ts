import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse, // Type cho đối tượng response trả về từ server.
  AxiosError, // Type cho đối tượng lỗi của axios.
  InternalAxiosRequestConfig, // Type cho cấu hình request nội bộ, thường dùng trong interceptor.
} from 'axios';
import { TokenManager } from '../auth/token-manager';
import { API_CONFIG, ERROR_MESSAGES } from '@/constants';
import { logout, refreshAuthToken } from '@/store/slices/auth';
import { store } from '@/store';
import { addToast } from '@/store/slices/ui';

interface QueueRequest {
  resolve: (value: any) => void;
  reject: (error: any) => void;
  config: AxiosRequestConfig;
}

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  private tokenManager: TokenManager;
  private isRefreshing = false;
  private refreshQueue: QueueRequest[] = [];

  private constructor() {
    this.tokenManager = TokenManager.getInstance();
    this.axiosInstance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private createAxiosInstance(): AxiosInstance {
    const config: AxiosRequestConfig = {
      baseURL: `${API_CONFIG.baseUrl}/${API_CONFIG.version}`,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      withCredentials: true,
    };

    return axios.create(config);
  }

  private setupInterceptors(): void {
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  private setupRequestInterceptor(): void {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        config.metadata = { startTime: Date.now() };

        const token = this.tokenManager.getToken();
        if (token && !this.isPublicEndpoint(config.url || '')) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        config.headers['X-Request-ID'] = this.generateRequestId();

        // Kiểm tra xem code có đang chạy trên trình duyệt không.
        if (typeof window !== 'undefined') {
          config.headers['X-Client-Version'] =
            process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
          config.headers['X-Client-Platform'] = 'web';
        }

        if (process.env.NODE_ENV === 'development') {
          console.log(
            `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
            {
              headers: config.headers,
              data: config.data,
            }
          );
        }

        return config;
      },
      (error: AxiosError) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(this.transformError(error));
      }
    );
  }

  private setupResponseInterceptor(): void {
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        const startTime = response.config.metadata?.startTime;
        const duration = startTime ? Date.now() - startTime : 0;

        if (process.env.NODE_ENV === 'development') {
          console.log(
            `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
            {
              status: response.status,
              duration: `${duration}ms`,
              data: response.data,
            }
          );
        }

        if (duration > 3000) {
          console.warn(
            `⚠️ Slow API request detected: ${response.config.url} took ${duration}ms`
          );
        }

        return this.transformResponse(response);
      },
      async (error: AxiosError) => {
        // Lấy lại cấu hình của request gốc đã gây ra lỗi.
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean; // Thêm một thuộc tính _retry để đánh dấu request này đã được thử lại chưa.
        };

        if (process.env.NODE_ENV === 'development') {
          console.error(
            `❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
            {
              status: error.response?.status,
              message: error.message,
              data: error.response?.data,
            }
          );
        }

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          // Kiểm tra xem đã có một request khác "dẫn đầu" đi làm mới token chưa.
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.refreshQueue.push({
                resolve,
                reject,
                config: originalRequest,
              });
            });
          }

          this.isRefreshing = true;

          try {
            // unwrap Lấy ra giá trị trả về thật sự (kết quả của fulfilled)
            // Tự động throw lỗi nếu rejected, giúp bạn xử lý với try...catch
            await store.dispatch(refreshAuthToken()).unwrap();

            this.processRefreshQueue(null);

            const newToken = this.tokenManager.getToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            this.processRefreshQueue(refreshError);
            store.dispatch(logout());

            if (
              typeof window !== 'undefined' &&
              !window.location.pathname.includes('/login')
            ) {
              window.location.href = '/login?reason=session_expired';
            }
          } finally {
            this.isRefreshing = false;
            this.refreshQueue = [];
          }
        }

        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : 1000;

          console.warn(`Rate limited. Retrying after ${delay}ms`);

          return new Promise(resolve => {
            setTimeout(() => {
              resolve(this.axiosInstance(originalRequest));
            }, delay);
          });
        }

        return Promise.reject(this.transformError(error));
      }
    );
  }

  private processRefreshQueue(error: any): void {
    this.refreshQueue.forEach(({ resolve, reject, config }) => {
      if (error) {
        reject(error);
      } else {
        const newToken = this.tokenManager.getToken();
        if (newToken) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${newToken}`;
          resolve(this.axiosInstance(config));
        } else {
          reject(new Error('No token available after refresh'));
        }
      }
    });
  }

  private isPublicEndpoint(url: string): boolean {
    const publicEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify-email',
      '/courses', // Public course listing
      '/categories',
      '/search',
    ];

    return publicEndpoints.some(endpoint => url.includes(endpoint));
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private transformResponse(response: AxiosResponse): AxiosResponse {
    if (response.data && typeof response.data === 'object') {
      if (!response.data.hasOwnProperty('success')) {
        response.data = {
          success: true,
          data: response.data,
          message: response.statusText,
        };
      }
    }

    return response;
  }

  private transformError(error: AxiosError): ApiError {
    const apiError = new ApiError(
      error.message,
      error.response?.status || 0,
      error.response?.data || null,
      error.config?.url || '',
      error.code || 'UNKNOWN_ERROR'
    );

    // Show toast notification for certain errors
    this.handleErrorNotification(apiError);

    return apiError;
  }

  private handleErrorNotification(error: ApiError): void {
    // Don't show notifications for auth endpoints or 401 errors (handled by auth system)
    if (
      error.endpoint.includes('/auth/') ||
      error.status === 401 ||
      error.status === 422 // Validation errors (handled by forms)
    ) {
      return;
    }

    let message: string = ERROR_MESSAGES.SERVER_ERROR;

    switch (error.status) {
      case 0:
        message = ERROR_MESSAGES.NETWORK_ERROR;
        break;
      case 403:
        message = ERROR_MESSAGES.FORBIDDEN;
        break;
      case 404:
        message = ERROR_MESSAGES.NOT_FOUND;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        message = ERROR_MESSAGES.SERVER_ERROR;
        break;
      default:
        if (error.data && typeof error.data === 'object') {
          const errorData = error.data as any;
          message = errorData.message || errorData.error || message;
        }
    }

    // Dispatch toast notification
    store.dispatch(
      addToast({
        type: 'error',
        message,
        duration: 5000,
      })
    );
  }

  // Public API methods
  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.get(url, config).then(response => response.data);
  }

  public post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.axiosInstance
      .post(url, data, config)
      .then(response => response.data);
  }

  public put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.axiosInstance
      .put(url, data, config)
      .then(response => response.data);
  }

  public patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.axiosInstance
      .patch(url, data, config)
      .then(response => response.data);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance
      .delete(url, config)
      .then(response => response.data);
  }

  // Upload with progress tracking
  public upload<T = any>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    return this.axiosInstance
      .post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: progressEvent => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      })
      .then(response => response.data);
  }

  // Download with progress tracking
  public download(
    url: string,
    filename?: string,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    return this.axiosInstance
      .get(url, {
        responseType: 'blob',
        onDownloadProgress: progressEvent => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      })
      .then(response => {
        // Auto-download file if filename provided
        if (filename && typeof window !== 'undefined') {
          const blob = new Blob([response.data]);
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);
        }

        return response.data;
      });
  }

  // Get axios instance for advanced usage
  public getInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Custom error class
export class ApiError extends Error {
  public status: number;
  public data: any;
  public endpoint: string;
  public code: string;

  constructor(
    message: string,
    status: number,
    data: any,
    endpoint: string,
    code: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.endpoint = endpoint;
    this.code = code;
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();
