import { useState, useCallback } from 'react';
import { apiClient, ApiError } from '@/lib/api-client';
import { GlobalErrorHandler, ErrorInfo } from '@/lib/error-handler';
import { RequestTransformer, ResponseTransformer } from '@/lib/transformers';

interface ApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ErrorInfo) => void;
  transform?: boolean;
  showErrorToast?: boolean;
}

export const useApi = () => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, ErrorInfo | null>>({});
  const errorHandler = GlobalErrorHandler.getInstance();

  const executeRequest = useCallback(
    async <T = any>(
      key: string,
      requestFn: () => Promise<T>,
      options: ApiOptions = {}
    ): Promise<T | null> => {
      const {
        onSuccess,
        onError,
        transform = true,
        showErrorToast = true,
      } = options;

      setLoading(prev => ({ ...prev, [key]: true }));
      setErrors(prev => ({ ...prev, [key]: null }));

      try {
        const response = await requestFn();
        const data = transform
          ? ResponseTransformer.toCamelCase<T>(response)
          : response;

        onSuccess?.(data);
        return data;
      } catch (error) {
        const errorInfo = errorHandler.handleError(error);

        setErrors(prev => ({ ...prev, [key]: errorInfo }));
        onError?.(errorInfo);

        if (showErrorToast) {
          errorHandler.reportError(errorInfo, { key });
        }

        return null;
      } finally {
        setLoading(prev => ({ ...prev, [key]: false }));
      }
    },
    [errorHandler]
  );

  // GET request
  const get = useCallback(
    <T = any>(
      url: string,
      params?: Record<string, any>,
      options?: ApiOptions
    ) => {
      const key = `GET:${url}`;
      const transformedParams = params
        ? ResponseTransformer.toCamelCase(params)
        : undefined;

      return executeRequest<T>(
        key,
        () => apiClient.get<T>(url, { params: transformedParams }),
        options
      );
    },
    [executeRequest]
  );

  // POST request
  const post = useCallback(
    <T = any>(url: string, data?: any, options?: ApiOptions) => {
      const key = `POST:${url}`;
      const transformedData = data
        ? RequestTransformer.toSnakeCase(data)
        : undefined;

      return executeRequest<T>(
        key,
        () => apiClient.post<T>(url, transformedData),
        options
      );
    },
    [executeRequest]
  );

  // PUT request
  const put = useCallback(
    <T = any>(url: string, data?: any, options?: ApiOptions) => {
      const key = `PUT:${url}`;
      const transformedData = data
        ? RequestTransformer.toSnakeCase(data)
        : undefined;

      return executeRequest<T>(
        key,
        () => apiClient.put<T>(url, transformedData),
        options
      );
    },
    [executeRequest]
  );

  // PATCH request
  const patch = useCallback(
    <T = any>(url: string, data?: any, options?: ApiOptions) => {
      const key = `PATCH:${url}`;
      const transformedData = data
        ? RequestTransformer.toSnakeCase(data)
        : undefined;

      return executeRequest<T>(
        key,
        () => apiClient.patch<T>(url, transformedData),
        options
      );
    },
    [executeRequest]
  );

  // DELETE request
  const del = useCallback(
    <T = any>(url: string, options?: ApiOptions) => {
      const key = `DELETE:${url}`;

      return executeRequest<T>(key, () => apiClient.delete<T>(url), options);
    },
    [executeRequest]
  );

  // Upload request
  const upload = useCallback(
    <T = any>(
      url: string,
      file: File,
      additionalData?: Record<string, any>,
      onProgress?: (progress: number) => void,
      options?: ApiOptions
    ) => {
      const key = `UPLOAD:${url}`;
      const formData = RequestTransformer.fileUpload(file, additionalData);

      return executeRequest<T>(
        key,
        () => apiClient.upload<T>(url, formData, onProgress),
        options
      );
    },
    [executeRequest]
  );

  const isLoading = useCallback(
    (key: string) => loading[key] || false,
    [loading]
  );
  const getError = useCallback((key: string) => errors[key] || null, [errors]);
  const clearError = useCallback((key: string) => {
    setErrors(prev => ({ ...prev, [key]: null }));
  }, []);

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    upload,
    isLoading,
    getError,
    clearError,
    loading,
    errors,
  };
};
