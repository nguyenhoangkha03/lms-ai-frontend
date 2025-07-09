import { AxiosError } from 'axios';
import { ApiError } from '../api/client';

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  details?: string[];
  code?: string;
  status?: number;
}

export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;

  public static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  public handleError(error: any): ErrorInfo {
    console.error('Global error handler:', error);

    if (error instanceof ApiError) {
      return this.handleApiError(error);
    }

    // Handle Axios errors
    if (error.isAxiosError) {
      return this.handleAxiosError(error);
    }

    // Handle JavaScript errors
    if (error instanceof Error) {
      return this.handleJavaScriptError(error);
    }

    // Handle unknown errors
    return this.handleUnknownError(error);
  }

  private handleApiError(error: ApiError): ErrorInfo {
    let type = ErrorType.UNKNOWN;

    switch (error.status) {
      case 0:
        type = ErrorType.NETWORK;
        break;
      case 401:
        type = ErrorType.AUTHENTICATION;
        break;
      case 403:
        type = ErrorType.AUTHORIZATION;
        break;
      case 404:
        type = ErrorType.NOT_FOUND;
        break;
      case 422:
        type = ErrorType.VALIDATION;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        type = ErrorType.SERVER;
        break;
    }

    return {
      type,
      message: error.message,
      details: error.data?.errors || [],
      code: error.code,
      status: error.status,
    };
  }

  private handleAxiosError(error: AxiosError): ErrorInfo {
    return {
      type: error.response?.status === 0 ? ErrorType.NETWORK : ErrorType.SERVER,
      message: error.message,
      status: error.response?.status,
    };
  }

  private handleJavaScriptError(error: Error): ErrorInfo {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
    };
  }

  private handleUnknownError(error: any): ErrorInfo {
    return {
      type: ErrorType.UNKNOWN,
      message: 'An unexpected error occurred',
    };
  }

  // Report error to monitoring service
  public reportError(error: ErrorInfo, context?: Record<string, any>): void {
    // In production, send to error monitoring service (Sentry, Bugsnag, etc.)
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: context });
      console.error('Error reported:', error, context);
    }
  }
}
