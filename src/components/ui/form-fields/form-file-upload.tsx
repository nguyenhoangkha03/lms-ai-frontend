'use client';

import React from 'react';
import { useFormField } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/enhanced-input';
import { Upload, X, File, Image as ImageIcon, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFileUploadProps {
  onFileChange?: (files: FileList | null) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
  className?: string;
  variant?: 'button' | 'dropzone';
  preview?: boolean;
}

export const FormFileUpload = React.forwardRef<
  HTMLInputElement,
  FormFileUploadProps
>(
  (
    {
      className,
      onFileChange,
      multiple = false,
      accept,
      maxSize = 10,
      disabled = false,
      variant = 'button',
      preview = true,
      ...props
    },
    ref
  ) => {
    const { error, formItemId } = useFormField();
    const [files, setFiles] = React.useState<File[]>([]);
    const [dragOver, setDragOver] = React.useState(false);

    const handleFileChange = (newFiles: FileList | null) => {
      if (!newFiles) return;

      const validFiles = Array.from(newFiles).filter(file => {
        if (maxSize && file.size > maxSize * 1024 * 1024) {
          console.warn(`File ${file.name} is too large`);
          return false;
        }
        return true;
      });

      setFiles(multiple ? [...files, ...validFiles] : validFiles);
      onFileChange?.(newFiles);
    };

    const removeFile = (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
    };

    const getFileIcon = (file: File) => {
      if (file.type.startsWith('image/'))
        return <ImageIcon className="h-4 w-4" />;
      if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />;
      return <File className="h-4 w-4" />;
    };

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (variant === 'dropzone') {
      return (
        <div className="space-y-4">
          <div
            className={cn(
              'rounded-lg border-2 border-dashed p-6 text-center transition-colors',
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25',
              error && 'border-destructive',
              disabled && 'cursor-not-allowed opacity-50',
              className
            )}
            onDragOver={e => {
              e.preventDefault();
              if (!disabled) setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault();
              setDragOver(false);
              if (!disabled) handleFileChange(e.dataTransfer.files);
            }}
          >
            <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              Drag and drop files here, or click to select
            </p>
            <Input
              ref={ref}
              type="file"
              id={formItemId}
              className="hidden"
              multiple={multiple}
              accept={accept}
              disabled={disabled}
              onChange={e => handleFileChange(e.target.files)}
              {...props}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled}
              onClick={() => document.getElementById(formItemId)?.click()}
            >
              Select Files
            </Button>
            {accept && (
              <p className="mt-1 text-xs text-muted-foreground">
                Accepted formats: {accept}
              </p>
            )}
            {maxSize && (
              <p className="text-xs text-muted-foreground">
                Max size: {maxSize}MB
              </p>
            )}
          </div>

          {preview && files.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Selected Files:</h4>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div className="flex items-center space-x-2">
                      {getFileIcon(file)}
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            ref={ref}
            type="file"
            id={formItemId}
            className="hidden"
            multiple={multiple}
            accept={accept}
            disabled={disabled}
            onChange={e => handleFileChange(e.target.files)}
            {...props}
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => document.getElementById(formItemId)?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {multiple ? 'Choose Files' : 'Choose File'}
          </Button>
          {files.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {files.length} file{files.length > 1 ? 's' : ''} selected
            </span>
          )}
        </div>

        {preview && files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <div className="flex items-center space-x-2">
                  {getFileIcon(file)}
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

FormFileUpload.displayName = 'FormFileUpload';
