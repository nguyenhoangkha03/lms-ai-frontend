'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUploadChatFileMutation } from '@/lib/redux/api/enhanced-chat-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Upload,
  File,
  Image,
  Video,
  Music,
  Archive,
  X,
  Check,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FileUploadDialogProps {
  roomId: string;
  onUploadComplete: () => void;
  maxFileSize?: number; // MB
  allowedTypes?: string[];
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  preview?: string;
  description?: string;
}

export function FileUploadDialog({
  roomId,
  onUploadComplete,
  maxFileSize = 10,
  allowedTypes = [
    'image/*',
    'video/*',
    'audio/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/*',
    'application/zip',
    'application/x-rar-compressed',
  ],
}: FileUploadDialogProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const [uploadChatFile] = useUploadChatFileMutation();

  // File type configurations
  const getFileIcon = (file: File) => {
    const type = file.type;

    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('pdf')) return FileText;
    if (type.includes('zip') || type.includes('rar')) return Archive;
    if (type.startsWith('text/')) return FileText;

    return File;
  };

  const getFileTypeLabel = (file: File) => {
    const type = file.type;

    if (type.startsWith('image/')) return 'Image';
    if (type.startsWith('video/')) return 'Video';
    if (type.startsWith('audio/')) return 'Audio';
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('word')) return 'Document';
    if (type.includes('excel') || type.includes('sheet')) return 'Spreadsheet';
    if (type.includes('powerpoint') || type.includes('presentation'))
      return 'Presentation';
    if (type.includes('zip') || type.includes('rar')) return 'Archive';
    if (type.startsWith('text/')) return 'Text';

    return 'File';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const createFilePreview = (file: File): Promise<string | null> => {
    return new Promise(resolve => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      } else {
        resolve(null);
      }
    });
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }

    // Check file type
    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAllowed) {
      return 'File type not allowed';
    }

    return null;
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: UploadFile[] = [];

      for (const file of acceptedFiles) {
        const error = validateFile(file);
        const preview = await createFilePreview(file);

        newFiles.push({
          file,
          id: Math.random().toString(36).substr(2, 9),
          progress: 0,
          status: error ? 'error' : 'pending',
          error: error ?? undefined,
          preview: preview ?? undefined,
          description: '',
        });
      }

      setUploadFiles(prev => [...prev, ...newFiles]);
    },
    [maxFileSize, allowedTypes]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: maxFileSize * 1024 * 1024,
  });

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileDescription = (fileId: string, description: string) => {
    setUploadFiles(prev =>
      prev.map(f => (f.id === fileId ? { ...f, description } : f))
    );
  };

  const uploadSingleFile = async (uploadFile: UploadFile): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Update status to uploading
      setUploadFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, status: 'uploading', progress: 0 }
            : f
        )
      );

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadFiles(prev =>
          prev.map(f => {
            if (f.id === uploadFile.id && f.progress < 90) {
              return { ...f, progress: f.progress + Math.random() * 20 };
            }
            return f;
          })
        );
      }, 200);

      // Actual upload
      uploadChatFile({
        roomId,
        file: uploadFile.file,
        description: uploadFile.description,
      })
        .unwrap()
        .then(() => {
          clearInterval(progressInterval);
          setUploadFiles(prev =>
            prev.map(f =>
              f.id === uploadFile.id
                ? { ...f, status: 'completed', progress: 100 }
                : f
            )
          );
          resolve();
        })
        .catch(error => {
          clearInterval(progressInterval);
          setUploadFiles(prev =>
            prev.map(f =>
              f.id === uploadFile.id
                ? {
                    ...f,
                    status: 'error',
                    error: error.message || 'Upload failed',
                  }
                : f
            )
          );
          reject(error);
        });
    });
  };

  const handleUploadAll = async () => {
    const validFiles = uploadFiles.filter(f => f.status === 'pending');

    if (validFiles.length === 0) {
      toast.error('No valid files to upload');
      return;
    }

    setUploading(true);

    try {
      // Upload files sequentially to avoid overwhelming the server
      for (const file of validFiles) {
        await uploadSingleFile(file);
      }

      const completedCount = uploadFiles.filter(
        f => f.status === 'completed'
      ).length;
      toast.success(`Successfully uploaded ${completedCount} file(s)`);

      // Call completion callback after a short delay to show completed status
      setTimeout(() => {
        onUploadComplete();
      }, 1000);
    } catch (error) {
      toast.error('Some files failed to upload');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setUploadFiles([]);
    onUploadComplete();
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return <Upload className="h-4 w-4 text-blue-500" />;
      case 'uploading':
        return <Upload className="h-4 w-4 animate-pulse text-blue-500" />;
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Upload className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return 'border-blue-200 bg-blue-50';
      case 'uploading':
        return 'border-blue-300 bg-blue-100';
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
  const uploadingFiles = uploadFiles.filter(f => f.status === 'uploading');
  const completedFiles = uploadFiles.filter(f => f.status === 'completed');
  const errorFiles = uploadFiles.filter(f => f.status === 'error');

  const totalProgress =
    uploadFiles.length > 0
      ? uploadFiles.reduce((sum, file) => sum + file.progress, 0) /
        uploadFiles.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />

        {isDragActive ? (
          <div>
            <p className="text-lg font-medium text-blue-600">Drop files here</p>
            <p className="text-sm text-blue-500">Release to upload</p>
          </div>
        ) : (
          <div>
            <p className="mb-2 text-lg font-medium text-gray-900">
              Drag & drop files here, or click to select
            </p>
            <p className="mb-4 text-sm text-gray-500">
              Maximum file size: {maxFileSize}MB
            </p>

            {/* Supported file types */}
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Images
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Videos
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Audio
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Documents
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Archives
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploadFiles.length > 0 && (
        <div className="space-y-4">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Upload Progress ({completedFiles.length}/{uploadFiles.length})
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(totalProgress)}%
              </span>
            </div>
            <Progress value={totalProgress} className="h-2" />
          </div>

          {/* File List */}
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {uploadFiles.map(uploadFile => {
              const FileIcon = getFileIcon(uploadFile.file);

              return (
                <Card
                  key={uploadFile.id}
                  className={cn(
                    'transition-colors',
                    getStatusColor(uploadFile.status)
                  )}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      {/* File Preview/Icon */}
                      <div className="flex-shrink-0">
                        {uploadFile.preview ? (
                          <div className="relative">
                            <img
                              src={uploadFile.preview}
                              alt={uploadFile.file.name}
                              className="h-12 w-12 rounded border object-cover"
                            />
                            <div className="absolute -right-1 -top-1">
                              {getStatusIcon(uploadFile.status)}
                            </div>
                          </div>
                        ) : (
                          <div className="relative flex h-12 w-12 items-center justify-center rounded border bg-gray-100">
                            <FileIcon className="h-6 w-6 text-gray-600" />
                            <div className="absolute -right-1 -top-1">
                              {getStatusIcon(uploadFile.status)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="truncate text-sm font-medium">
                              {uploadFile.file.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {getFileTypeLabel(uploadFile.file)}
                            </Badge>
                          </div>

                          {uploadFile.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => removeFile(uploadFile.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="mb-2 text-xs text-gray-500">
                          {formatFileSize(uploadFile.file.size)}
                        </div>

                        {/* Progress Bar for individual file */}
                        {uploadFile.status === 'uploading' && (
                          <div className="mb-2">
                            <Progress
                              value={uploadFile.progress}
                              className="h-1"
                            />
                          </div>
                        )}

                        {/* Error Message */}
                        {uploadFile.status === 'error' && uploadFile.error && (
                          <div className="mb-2 flex items-center text-xs text-red-600">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            {uploadFile.error}
                          </div>
                        )}

                        {/* Description Input */}
                        {uploadFile.status === 'pending' && (
                          <Input
                            placeholder="Add description (optional)"
                            value={uploadFile.description}
                            onChange={e =>
                              updateFileDescription(
                                uploadFile.id,
                                e.target.value
                              )
                            }
                            className="h-7 text-xs"
                          />
                        )}

                        {/* Completed Description */}
                        {uploadFile.status === 'completed' &&
                          uploadFile.description && (
                            <div className="rounded bg-white/50 px-2 py-1 text-xs text-gray-600">
                              {uploadFile.description}
                            </div>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="flex items-center justify-between rounded bg-gray-50 p-2 text-xs text-gray-500">
            <div className="flex space-x-4">
              {pendingFiles.length > 0 && (
                <span>⏳ {pendingFiles.length} pending</span>
              )}
              {uploadingFiles.length > 0 && (
                <span>⬆️ {uploadingFiles.length} uploading</span>
              )}
              {completedFiles.length > 0 && (
                <span>✅ {completedFiles.length} completed</span>
              )}
              {errorFiles.length > 0 && (
                <span>❌ {errorFiles.length} failed</span>
              )}
            </div>
            <div>
              Total:{' '}
              {formatFileSize(
                uploadFiles.reduce((sum, f) => sum + f.file.size, 0)
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>

        <Button
          onClick={handleUploadAll}
          disabled={pendingFiles.length === 0 || uploading}
          className="min-w-24"
        >
          {uploading ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-pulse" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload {pendingFiles.length > 0 ? `(${pendingFiles.length})` : ''}
            </>
          )}
        </Button>
      </div>

      {/* Upload Tips */}
      {uploadFiles.length === 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-2 font-medium text-blue-900">Upload Tips:</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Drag multiple files at once for batch upload</li>
            <li>• Add descriptions to help others understand your files</li>
            <li>• Supported formats: Images, Videos, Documents, Archives</li>
            <li>• Maximum file size: {maxFileSize}MB per file</li>
            <li>• Files are automatically scanned for safety</li>
          </ul>
        </div>
      )}
    </div>
  );
}
