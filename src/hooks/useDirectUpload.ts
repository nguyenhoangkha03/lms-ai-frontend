import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  useGenerateUploadUrlMutation,
  useConfirmUploadMutation,
  type GenerateUploadUrlRequest,
  type ConfirmUploadRequest,
} from '@/lib/redux/api/teacher-courses-api';

interface UploadOptions {
  onProgress?: (progress: number) => void;
  onStatusChange?: (status: UploadStatus) => void;
  metadata?: Record<string, any>;
}

export type UploadStatus =
  | 'idle'
  | 'generating-url'
  | 'uploading'
  | 'confirming'
  | 'success'
  | 'error';

interface UploadResult {
  success: boolean;
  fileRecord?: any;
  error?: string;
}

// Interfaces are now imported from RTK Query API

export const useDirectUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // RTK Query mutations
  const [generateUploadUrl] = useGenerateUploadUrlMutation();
  const [confirmUpload] = useConfirmUploadMutation();

  const updateProgress = useCallback((progress: number) => {
    setUploadProgress(progress);
  }, []);

  const updateStatus = useCallback((status: UploadStatus) => {
    setUploadStatus(status);
  }, []);

  const uploadToS3 = useCallback(
    async (
      file: File,
      presignedUrl: string,
      options: UploadOptions = {}
    ): Promise<{ etag: string }> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', event => {
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
            // Log detailed S3 error for debugging
            console.error('❌ S3 Upload failed:', {
              status: xhr.status,
              statusText: xhr.statusText,
              responseText: xhr.responseText,
              responseHeaders: xhr.getAllResponseHeaders()
            });
            reject(
              new Error(
                `S3 Upload failed: ${xhr.status} - ${xhr.statusText}\nResponse: ${xhr.responseText}`
              )
            );
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
        // Don't set Content-Type - let S3 handle it from presigned URL
        // xhr.setRequestHeader('Content-Type', file.type);
        xhr.timeout = 30 * 60 * 1000; // 30 minutes timeout

        // Send file
        xhr.send(file);
      });
    },
    [updateProgress]
  );

  const uploadFile = useCallback(
    async (
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

        // Step 1: Get presigned URL using RTK Query
        const urlResult = await generateUploadUrl({
          courseId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          uploadType,
          lessonId,
          metadata: {
            uploadedFrom: 'web-app',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            ...options.metadata,
          },
        }).unwrap();

        const urlData = urlResult;

        updateStatus('uploading');
        options.onStatusChange?.('uploading');

        // Step 2: Upload directly to S3
        const uploadResult = await uploadToS3(file, urlData.presignedUrl, {
          onProgress: progress => {
            updateProgress(progress);
            options.onProgress?.(progress);
          },
        });

        updateStatus('confirming');
        options.onStatusChange?.('confirming');

        // Step 3: Confirm upload using RTK Query
        const confirmResult = await confirmUpload({
          courseId,
          uploadId: urlData.uploadId,
          s3Key: urlData.s3Key,
          etag: uploadResult.etag,
          actualFileSize: file.size,
        }).unwrap();

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
    },
    [uploadToS3, updateStatus, toast, generateUploadUrl, confirmUpload]
  );

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
