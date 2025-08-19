import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface UploadOptions {
  onProgress?: (progress: number) => void;
  onStatusChange?: (status: UploadStatus) => void;
}

export type UploadStatus = 'idle' | 'generating-url' | 'uploading' | 'confirming' | 'success' | 'error';

interface UploadResult {
  success: boolean;
  fileRecord?: any;
  error?: string;
}

interface GenerateUrlResponse {
  uploadId: string;
  presignedUrl: string;
  s3Key: string;
  expiresIn: number;
}

interface ConfirmUploadResponse {
  success: boolean;
  fileRecord: any;
}

export const useDirectUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const updateProgress = useCallback((progress: number) => {
    setUploadProgress(progress);
  }, []);

  const updateStatus = useCallback((status: UploadStatus) => {
    setUploadStatus(status);
  }, []);

  const uploadToS3 = useCallback(async (
    file: File,
    presignedUrl: string,
    options: UploadOptions = {}
  ): Promise<{ etag: string }> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          updateProgress(progress);
          options.onProgress?.(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const etag = xhr.getResponseHeader('ETag')?.replace(/"/g, '') || '';
          if (!etag) {
            reject(new Error('No ETag received from S3'));
            return;
          }
          resolve({ etag });
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status} - ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was aborted'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timed out'));
      });

      // Configure request
      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.timeout = 30 * 60 * 1000; // 30 minutes timeout
      
      // Send file
      xhr.send(file);
    });
  }, [updateProgress]);

  const uploadFile = useCallback(async (
    courseId: string,
    file: File,
    uploadType: 'trailer' | 'lesson' | 'promotional',
    lessonId?: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
      
      updateStatus('generating-url');
      options.onStatusChange?.('generating-url');

      // Step 1: Get presigned URL from backend
      const generateUrlResponse = await fetch(`/api/course/${courseId}/generate-upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Adjust based on your auth
        },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          uploadType,
          lessonId,
          metadata: {
            uploadedFrom: 'web-app',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!generateUrlResponse.ok) {
        const errorData = await generateUrlResponse.json();
        throw new Error(errorData.message || 'Failed to generate upload URL');
      }

      const urlData: GenerateUrlResponse = await generateUrlResponse.json();

      updateStatus('uploading');
      options.onStatusChange?.('uploading');

      // Step 2: Upload directly to S3
      const uploadResult = await uploadToS3(file, urlData.presignedUrl, {
        onProgress: (progress) => {
          updateProgress(progress);
          options.onProgress?.(progress);
        },
      });

      updateStatus('confirming');
      options.onStatusChange?.('confirming');

      // Step 3: Confirm upload with backend
      const confirmResponse = await fetch(`/api/course/${courseId}/confirm-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          uploadId: urlData.uploadId,
          s3Key: urlData.s3Key,
          etag: uploadResult.etag,
          actualFileSize: file.size,
          uploadMetadata: {
            uploadDuration: Date.now(), // You can calculate actual duration
            browser: navigator.userAgent,
            completedAt: new Date().toISOString(),
          },
        }),
      });

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        throw new Error(errorData.message || 'Failed to confirm upload');
      }

      const confirmResult: ConfirmUploadResponse = await confirmResponse.json();

      updateStatus('success');
      options.onStatusChange?.('success');
      setUploadProgress(100);

      toast({
        title: 'Upload Successful',
        description: `${file.name} has been uploaded successfully.`,
        variant: 'default',
      });

      return {
        success: true,
        fileRecord: confirmResult.fileRecord,
      };

    } catch (err: any) {
      const errorMessage = err.message || 'Upload failed';
      setError(errorMessage);
      updateStatus('error');
      options.onStatusChange?.('error');

      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsUploading(false);
    }
  }, [uploadToS3, updateStatus, toast]);

  const reset = useCallback(() => {
    setUploadProgress(0);
    setUploadStatus('idle');
    setError(null);
    setIsUploading(false);
  }, []);

  return {
    uploadFile,
    uploadProgress,
    uploadStatus,
    error,
    isUploading,
    reset,
  };
};

export default useDirectUpload;