'use client';

import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  File,
  Image,
  Video,
  FileText,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  disabled?: boolean;
  showPreview?: boolean;
}

interface FileWithPreview extends File {
  id: string;
  preview?: string;
  uploadProgress?: number;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  acceptedTypes = ['*'],
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB default
  disabled = false,
  showPreview = true,
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File quá lớn. Tối đa ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
    }

    if (acceptedTypes[0] !== '*') {
      const isValidType = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        if (type.includes('/')) {
          return file.type.match(type.replace('*', '.*'));
        }
        return false;
      });

      if (!isValidType) {
        return `Loại file không được hỗ trợ. Chỉ chấp nhận: ${acceptedTypes.join(', ')}`;
      }
    }

    return null;
  };

  const processFiles = useCallback(
    (fileList: FileList) => {
      const newFiles: FileWithPreview[] = [];
      const errors: string[] = [];

      Array.from(fileList).forEach((file, index) => {
        if (files.length + newFiles.length >= maxFiles) {
          errors.push(`Chỉ có thể upload tối đa ${maxFiles} file`);
          return;
        }

        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
          return;
        }

        const fileWithPreview: FileWithPreview = {
          ...file,
          id: `${Date.now()}_${index}`,
          uploadStatus: 'pending',
        };

        // Create preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = e => {
            fileWithPreview.preview = e.target?.result as string;
            setFiles(prev => [...prev]);
          };
          reader.readAsDataURL(file);
        }

        newFiles.push(fileWithPreview);
      });

      if (errors.length > 0) {
        console.warn('File upload errors:', errors);
        // In a real app, you'd show these errors to the user
      }

      setFiles(prev => [...prev, ...newFiles]);

      // Simulate upload process
      newFiles.forEach((file, index) => {
        setTimeout(() => {
          simulateUpload(file.id);
        }, index * 100);
      });

      onFilesSelected(newFiles);
    },
    [files.length, maxFiles, maxSize, acceptedTypes, onFilesSelected]
  );

  const simulateUpload = (fileId: string) => {
    setFiles(prev =>
      prev.map(file =>
        file.id === fileId
          ? { ...file, uploadStatus: 'uploading', uploadProgress: 0 }
          : file
      )
    );

    const interval = setInterval(() => {
      setFiles(prev =>
        prev.map(file => {
          if (file.id === fileId && file.uploadStatus === 'uploading') {
            const newProgress = (file.uploadProgress || 0) + 10;
            if (newProgress >= 100) {
              clearInterval(interval);
              return { ...file, uploadProgress: 100, uploadStatus: 'success' };
            }
            return { ...file, uploadProgress: newProgress };
          }
          return file;
        })
      );
    }, 200);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        processFiles(droppedFiles);
      }
    },
    [disabled, processFiles]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (file.type.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (file.type.includes('pdf') || file.type.includes('document'))
      return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : disabled
              ? 'border-gray-200 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload
          className={`mx-auto mb-4 h-8 w-8 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`}
        />
        <p className="mb-2 text-lg font-medium text-gray-900">
          {isDragOver ? 'Thả file vào đây' : 'Kéo thả file hoặc click để chọn'}
        </p>
        <p className="mb-4 text-sm text-gray-600">
          Hỗ trợ: {acceptedTypes.join(', ')} • Tối đa {maxFiles} file •{' '}
          {formatFileSize(maxSize)}
        </p>

        <input
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button variant="outline" disabled={disabled} asChild>
            <span className="cursor-pointer">Chọn file</span>
          </Button>
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && showPreview && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">
            File đã chọn ({files.length})
          </h4>
          {files.map(file => (
            <div
              key={file.id}
              className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
            >
              <div className="flex-shrink-0">
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200">
                    {getFileIcon(file)}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>

                {file.uploadStatus === 'uploading' && (
                  <div className="mt-1">
                    <Progress value={file.uploadProgress} className="h-1" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {file.uploadStatus === 'success' && (
                  <Badge className="bg-green-100 text-green-800">
                    <Check className="mr-1 h-3 w-3" />
                    Hoàn thành
                  </Badge>
                )}
                {file.uploadStatus === 'error' && (
                  <Badge className="bg-red-100 text-red-800">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Lỗi
                  </Badge>
                )}
                {file.uploadStatus === 'uploading' && (
                  <Badge className="bg-blue-100 text-blue-800">
                    Đang upload...
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
