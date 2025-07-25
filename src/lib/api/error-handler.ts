import { AxiosError } from 'axios';
import { toast } from 'sonner';

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

export class ApiErrorHandler {
  static handle(error: unknown): ApiError {
    console.error('API Error:', error);

    if (error instanceof AxiosError) {
      return this.handleAxiosError(error);
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        status: 0,
      };
    }

    return {
      message: 'An unexpected error occurred',
      status: 0,
    };
  }

  private static handleAxiosError(error: AxiosError): ApiError {
    const { response, request, message } = error;

    if (response) {
      const { status, data } = response;
      const apiError: ApiError = {
        message: (data as any)?.message || `HTTP ${status} Error`,
        status,
        code: (data as any)?.code,
        errors: (data as any)?.errors,
        timestamp: new Date().toISOString(),
      };

      switch (status) {
        case 400:
          apiError.message = 'Invalid request. Please check your input.';
          break;
        case 401:
          apiError.message = 'Authentication required. Please login.';
          break;
        case 403:
          apiError.message = 'Access denied. You do not have permission.';
          break;
        case 404:
          apiError.message = 'The requested resource was not found.';
          break;
        case 429:
          apiError.message = 'Too many requests. Please slow down.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          apiError.message = 'Server error. Please try again later.';
          break;
      }

      return apiError;
    }

    if (request) {
      return {
        message: 'Network error. Please check your connection.',
        status: 0,
        code: 'NETWORK_ERROR',
      };
    }

    return {
      message: message || 'Request configuration error',
      status: 0,
      code: 'REQUEST_ERROR',
    };
  }

  static showError(error: ApiError): void {
    if (error.status === 401) return;

    if (error.status >= 500) {
      toast.error('Server error. Our team has been notified.');
    } else if (error.status === 429) {
      toast.error('Please slow down and try again.');
    } else if (error.status === 0) {
      toast.error('Connection error. Please check your internet.');
    } else {
      toast.error(error.message);
    }
  }

  static logError(error: ApiError, context?: string): void {
    const logData = {
      ...error,
      context,
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV === 'development') {
      console.error('API Error Log:', logData);
    }

    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, etc.
      // Sentry.captureException(error, { extra: logData });
    }

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_map: {
          error_code: error.code,
          error_status: error.status,
        },
      });
    }
  }
}
