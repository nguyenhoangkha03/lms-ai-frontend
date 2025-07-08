import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/api-client';
import { useToast } from '@/hooks/use-toast';

interface UploadOptions {
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  showToast?: boolean;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
}

export const useUpload = (uploadUrl: string, options: UploadOptions = {}) => {
  const {
    onSuccess,
    onError,
    showToast = true,
    acceptedTypes = [],
    maxSize = 10 * 1024 * 1024, // 10MB default
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<any>(null);

  const { toast } = useToast();

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxSize) {
        return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`;
      }

      // Check file type
      if (acceptedTypes.length > 0) {
        const fileType = file.type;
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

        const isValidType = acceptedTypes.some(type => {
          if (type.includes('*')) {
            return fileType.startsWith(type.replace('*', ''));
          }
          return type === fileType || type === fileExtension;
        });

        if (!isValidType) {
          return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
        }
      }

      return null;
    },
    [maxSize, acceptedTypes]
  );

  const upload = useCallback(
    async (file: File, additionalData?: Record<string, any>) => {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        if (showToast) {
          toast({
            type: 'error',
            message: validationError,
          });
        }
        return null;
      }

      setIsUploading(true);
      setProgress(0);
      setError(null);
      setUploadedFile(null);

      try {
        const formData = new FormData();
        formData.append('file', file);

        if (additionalData) {
          Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(
              key,
              typeof value === 'object' ? JSON.stringify(value) : String(value)
            );
          });
        }

        const response = await apiClient.upload(
          uploadUrl,
          formData,
          progressValue => setProgress(progressValue)
        );

        setUploadedFile(response);

        if (showToast) {
          toast({
            type: 'success',
            message: 'File uploaded successfully',
          });
        }

        onSuccess?.(response);
        return response;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || 'Upload failed';
        setError(errorMessage);

        if (showToast) {
          toast({
            type: 'error',
            message: errorMessage,
          });
        }

        onError?.(err);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [uploadUrl, validateFile, showToast, toast, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setUploadedFile(null);
  }, []);

  return {
    upload,
    isUploading,
    progress,
    error,
    uploadedFile,
    reset,
  };
};
