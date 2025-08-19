import React, { useState, useRef } from 'react';
import { Upload, Video, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import useDirectUpload, { UploadStatus } from '@/hooks/useDirectUpload';

interface DirectVideoUploadProps {
  courseId: string;
  uploadType: 'trailer' | 'lesson' | 'promotional';
  lessonId?: string;
  onUploadComplete?: (fileRecord: any) => void;
  onUploadError?: (error: string) => void;
  maxSizeGB?: number;
  accept?: string;
  disabled?: boolean;
}

const DirectVideoUpload: React.FC<DirectVideoUploadProps> = ({
  courseId,
  uploadType,
  lessonId,
  onUploadComplete,
  onUploadError,
  maxSizeGB = 0.5, // 500MB default
  accept = 'video/*',
  disabled = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    uploadFile,
    uploadProgress,
    uploadStatus,
    error,
    isUploading,
    reset,
  } = useDirectUpload();

  const maxSizeBytes = maxSizeGB * 1024 * 1024 * 1024;

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('video/')) {
      return 'Please select a video file.';
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeGB}GB limit. Current size: ${(file.size / 1024 / 1024 / 1024).toFixed(2)}GB`;
    }

    // Check specific video formats
    const allowedTypes = [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/avi',
      'video/mov',
      'video/wmv'
    ];

    if (!allowedTypes.includes(file.type)) {
      return `Unsupported video format. Supported formats: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      onUploadError?.(validationError);
      return;
    }

    setSelectedFile(file);
    reset(); // Reset previous upload state
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const result = await uploadFile(
      courseId,
      selectedFile,
      uploadType,
      lessonId,
      {
        onProgress: (progress) => {
          // Progress is already handled by the hook
        },
        onStatusChange: (status) => {
          // Status is already handled by the hook
        },
      }
    );

    if (result.success) {
      onUploadComplete?.(result.fileRecord);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      onUploadError?.(result.error || 'Upload failed');
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusColor = (status: UploadStatus) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'uploading': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'uploading':
      case 'generating-url':
      case 'confirming': return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      default: return <Upload className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: UploadStatus) => {
    switch (status) {
      case 'idle': return 'Ready to upload';
      case 'generating-url': return 'Preparing upload...';
      case 'uploading': return `Uploading... ${uploadProgress}%`;
      case 'confirming': return 'Finalizing upload...';
      case 'success': return 'Upload completed successfully!';
      case 'error': return `Upload failed: ${error}`;
      default: return 'Unknown status';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
    } else if (bytes >= 1024 * 1024) {
      return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    } else {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Upload {uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} Video
          <Badge variant="outline">Direct S3 Upload</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Drop Zone */}
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            disabled={disabled}
            className="hidden"
          />

          <div className="flex flex-col items-center space-y-3">
            <Upload className="h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                Choose video file or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                Supports MP4, WebM, MOV, AVI up to {maxSizeGB}GB
              </p>
            </div>
          </div>
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(uploadStatus)}
                  <span className={`text-sm font-medium ${getStatusColor(uploadStatus)}`}>
                    {getStatusText(uploadStatus)}
                  </span>
                </div>
              </div>

              {/* Upload Progress */}
              {(uploadStatus === 'uploading' || uploadStatus === 'generating-url' || uploadStatus === 'confirming') && (
                <div className="mt-3">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-gray-500 mt-1">
                    {uploadProgress}% complete
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || uploadStatus === 'success'}
                  size="sm"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : uploadStatus === 'success' ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Uploaded
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Video
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Alert */}
        {error && uploadStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Tips */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 <strong>Tips for better uploads:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Use stable internet connection for large files</li>
            <li>MP4 format provides best compatibility</li>
            <li>Videos are uploaded directly to cloud storage</li>
            <li>Upload can be resumed if interrupted</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DirectVideoUpload;