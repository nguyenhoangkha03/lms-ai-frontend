'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  X,
  File,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Archive,
  CheckCircle,
  AlertTriangle,
  Settings,
  CloudUpload,
  Zap,
  Shield,
  Clock,
  FilesIcon as FileIconIcon,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

import {
  useUploadFileMutation,
  useUploadMultipleFilesMutation,
} from '@/lib/redux/api/file-management-api';
import {
  FileAccessLevel,
  MediaProcessingOptions,
} from '@/lib/types/file-management';
import { cn, formatFileSize } from '@/lib/utils';
import { toast } from 'sonner';

interface FileUploadZoneProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
  courseId?: string;
  lessonId?: string;
  maxFileSize?: number; // MB
  maxFiles?: number;
  allowedTypes?: string[];
  defaultAccessLevel?: FileAccessLevel;
  enableProcessing?: boolean;
  enableVersioning?: boolean;
}

interface UploadingFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  uploadedFileId?: string;
  metadata: {
    title: string;
    description: string;
    tags: string[];
    accessLevel: FileAccessLevel;
    category: string;
  };
  processingOptions: MediaProcessingOptions;
}

export function FileUploadZone({
  open,
  onClose,
  onUploadComplete,
  courseId,
  lessonId,
  maxFileSize = 100, // MB
  maxFiles = 10,
  allowedTypes = [
    'image/*',
    'video/*',
    'audio/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/*',
    'application/zip',
    'application/x-rar-compressed',
  ],
  defaultAccessLevel = 'enrolled_only',
  enableProcessing = true,
  enableVersioning = true,
}: FileUploadZoneProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [currentStep, setCurrentStep] = useState<
    'select' | 'configure' | 'upload' | 'complete'
  >('select');
  const [globalSettings, setGlobalSettings] = useState({
    accessLevel: defaultAccessLevel,
    enableAutoProcessing: enableProcessing,
    enableSecurityScan: true,
    enableVersioning: enableVersioning,
    category: 'general',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mutations
  const [uploadFile] = useUploadFileMutation();
  const [uploadMultipleFiles] = useUploadMultipleFilesMutation();

  // File validation
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
      return `File type not supported. Allowed types: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  // File type detection
  const getFileType = (
    file: File
  ): 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other' => {
    const type = file.type;
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (
      type.includes('pdf') ||
      type.includes('document') ||
      type.includes('text')
    )
      return 'document';
    if (
      type.includes('zip') ||
      type.includes('rar') ||
      type.includes('archive')
    )
      return 'archive';
    return 'other';
  };

  // Create file preview
  const createFilePreview = async (file: File): Promise<string | undefined> => {
    return new Promise(resolve => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  // Handle file drop/selection
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (uploadingFiles.length + acceptedFiles.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const newFiles: UploadingFile[] = [];

      for (const file of acceptedFiles) {
        const error = validateFile(file);
        if (error) {
          toast.error(`${file.name}: ${error}`);
          continue;
        }

        const preview = await createFilePreview(file);
        const fileType = getFileType(file);

        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview,
          progress: 0,
          status: 'pending',
          metadata: {
            title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
            description: '',
            tags: [],
            accessLevel: globalSettings.accessLevel,
            category: globalSettings.category,
          },
          processingOptions: {
            image:
              fileType === 'image'
                ? {
                    optimize: true,
                    thumbnails: [
                      { width: 150, height: 150, suffix: 'thumb' },
                      { width: 300, height: 300, suffix: 'medium' },
                    ],
                    format: 'webp',
                  }
                : undefined,
            video:
              fileType === 'video'
                ? {
                    transcode: {
                      quality: 'medium',
                      format: 'mp4',
                    },
                    thumbnails: {
                      count: 3,
                      size: { width: 320, height: 180 },
                    },
                    streaming: {
                      enabled: true,
                      adaptive: true,
                      qualities: ['720p', '480p', '360p'],
                    },
                  }
                : undefined,
          },
        });
      }

      setUploadingFiles(prev => [...prev, ...newFiles]);
      if (newFiles.length > 0) {
        setCurrentStep('configure');
      }
    },
    [uploadingFiles.length, maxFiles, maxFileSize, allowedTypes, globalSettings]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: maxFileSize * 1024 * 1024,
    accept: allowedTypes.reduce(
      (acc, type) => {
        acc[type] = [];
        return acc;
      },
      {} as Record<string, string[]>
    ),
  });

  // Remove file
  const removeFile = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Update file metadata
  const updateFileMetadata = (
    fileId: string,
    metadata: Partial<UploadingFile['metadata']>
  ) => {
    setUploadingFiles(prev =>
      prev.map(f =>
        f.id === fileId ? { ...f, metadata: { ...f.metadata, ...metadata } } : f
      )
    );
  };

  // Update processing options
  const updateProcessingOptions = (
    fileId: string,
    options: Partial<MediaProcessingOptions>
  ) => {
    setUploadingFiles(prev =>
      prev.map(f =>
        f.id === fileId
          ? {
              ...f,
              processingOptions: {
                ...f.processingOptions,
                ...options,
              },
            }
          : f
      )
    );
  };

  // Start upload process
  const startUpload = async () => {
    setCurrentStep('upload');

    for (const uploadingFile of uploadingFiles) {
      try {
        setUploadingFiles(prev =>
          prev.map(f =>
            f.id === uploadingFile.id ? { ...f, status: 'uploading' } : f
          )
        );

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev =>
            prev.map(f =>
              f.id === uploadingFile.id && f.progress < 90
                ? { ...f, progress: f.progress + Math.random() * 10 }
                : f
            )
          );
        }, 500);

        const result = await uploadFile({
          file: uploadingFile.file,
          relatedType: lessonId
            ? 'lesson_attachment'
            : courseId
              ? 'course_attachment'
              : 'general',
          relatedId: lessonId || courseId,
          accessLevel: uploadingFile.metadata.accessLevel,
          metadata: {
            title: uploadingFile.metadata.title,
            description: uploadingFile.metadata.description,
            tags: uploadingFile.metadata.tags,
            category: uploadingFile.metadata.category,
            processingOptions: globalSettings.enableAutoProcessing
              ? uploadingFile.processingOptions
              : undefined,
          },
        }).unwrap();

        clearInterval(progressInterval);

        setUploadingFiles(prev =>
          prev.map(f =>
            f.id === uploadingFile.id
              ? {
                  ...f,
                  status: globalSettings.enableAutoProcessing
                    ? 'processing'
                    : 'completed',
                  progress: 100,
                  uploadedFileId: result.id,
                }
              : f
          )
        );

        // If auto-processing is enabled, show processing status
        if (globalSettings.enableAutoProcessing) {
          // Simulate processing
          setTimeout(() => {
            setUploadingFiles(prev =>
              prev.map(f =>
                f.id === uploadingFile.id ? { ...f, status: 'completed' } : f
              )
            );
          }, 2000);
        }
      } catch (error: any) {
        setUploadingFiles(prev =>
          prev.map(f =>
            f.id === uploadingFile.id
              ? {
                  ...f,
                  status: 'error',
                  error: error.message || 'Upload failed',
                }
              : f
          )
        );
      }
    }

    // Check if all uploads completed
    setTimeout(() => {
      const allCompleted = uploadingFiles.every(
        f => f.status === 'completed' || f.status === 'error'
      );
      if (allCompleted) {
        setCurrentStep('complete');
      }
    }, 1000);
  };

  // Get file icon
  const getFileIcon = (file: File) => {
    const type = getFileType(file);
    switch (type) {
      case 'image':
        return ImageIcon;
      case 'video':
        return Video;
      case 'audio':
        return Music;
      case 'document':
        return FileText;
      case 'archive':
        return Archive;
      default:
        return File;
    }
  };

  // Handle close
  const handleClose = () => {
    if (
      currentStep === 'upload' &&
      uploadingFiles.some(f => f.status === 'uploading')
    ) {
      toast.error('Cannot close while files are uploading');
      return;
    }

    setUploadingFiles([]);
    setCurrentStep('select');
    onClose();
  };

  // Handle complete
  const handleComplete = () => {
    onUploadComplete();
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CloudUpload className="h-5 w-5" />
            Advanced File Upload
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[
              { key: 'select', label: 'Select Files', icon: Upload },
              { key: 'configure', label: 'Configure', icon: Settings },
              { key: 'upload', label: 'Upload', icon: CloudUpload },
              { key: 'complete', label: 'Complete', icon: CheckCircle },
            ].map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.key;
              const isCompleted =
                ['select', 'configure', 'upload', 'complete'].indexOf(
                  currentStep
                ) > index;

              return (
                <div key={step.key} className="flex items-center">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border-2',
                      isActive && 'border-blue-500 bg-blue-500 text-white',
                      isCompleted && 'border-green-500 bg-green-500 text-white',
                      !isActive && !isCompleted && 'border-gray-300'
                    )}
                  >
                    <StepIcon className="h-4 w-4" />
                  </div>
                  <span
                    className={cn(
                      'ml-2 text-sm font-medium',
                      isActive && 'text-blue-600',
                      isCompleted && 'text-green-600',
                      !isActive && !isCompleted && 'text-gray-500'
                    )}
                  >
                    {step.label}
                  </span>
                  {index < 3 && (
                    <div
                      className={cn(
                        'mx-4 h-0.5 w-16',
                        isCompleted && 'bg-green-500',
                        !isCompleted && 'bg-gray-300'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          {currentStep === 'select' && (
            <div className="space-y-6">
              {/* Global Settings */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 text-lg font-semibold">
                    Upload Settings
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Default Access Level</Label>
                      <Select
                        value={globalSettings.accessLevel}
                        onValueChange={value =>
                          setGlobalSettings(prev => ({
                            ...prev,
                            accessLevel: value as FileAccessLevel,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="enrolled_only">
                            Enrolled Only
                          </SelectItem>
                          <SelectItem value="premium_only">
                            Premium Only
                          </SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={globalSettings.category}
                        onValueChange={value =>
                          setGlobalSettings(prev => ({
                            ...prev,
                            category: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="lesson">
                            Lesson Material
                          </SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                          <SelectItem value="resource">Resource</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="auto-processing"
                        checked={globalSettings.enableAutoProcessing}
                        onCheckedChange={checked =>
                          setGlobalSettings(prev => ({
                            ...prev,
                            enableAutoProcessing: checked as boolean,
                          }))
                        }
                      />
                      <Label
                        htmlFor="auto-processing"
                        className="flex items-center gap-2"
                      >
                        <Zap className="h-4 w-4" />
                        Auto-process media files
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="security-scan"
                        checked={globalSettings.enableSecurityScan}
                        onCheckedChange={checked =>
                          setGlobalSettings(prev => ({
                            ...prev,
                            enableSecurityScan: checked as boolean,
                          }))
                        }
                      />
                      <Label
                        htmlFor="security-scan"
                        className="flex items-center gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        Enable security scanning
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* File Drop Zone */}
              <div
                {...getRootProps()}
                className={cn(
                  'cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors',
                  isDragActive && 'border-blue-500 bg-blue-50',
                  !isDragActive && 'border-gray-300 hover:border-gray-400'
                )}
              >
                <input {...getInputProps()} ref={fileInputRef} />
                <CloudUpload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold">
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </h3>
                <p className="mb-4 text-gray-500">
                  or click to browse your computer
                </p>
                <div className="text-sm text-gray-400">
                  <p>Maximum file size: {maxFileSize}MB</p>
                  <p>Maximum files: {maxFiles}</p>
                  <p>
                    Supported formats: Images, Videos, Audio, Documents,
                    Archives
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Files
                </Button>
              </div>

              {/* Selected Files Preview */}
              {uploadingFiles.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Selected Files ({uploadingFiles.length})
                    </h3>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('configure')}
                      disabled={uploadingFiles.length === 0}
                    >
                      Configure Files
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {uploadingFiles.map(uploadingFile => {
                      const FileIcon = getFileIcon(uploadingFile.file);
                      return (
                        <Card key={uploadingFile.id} className="relative">
                          <CardContent className="p-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-2 h-6 w-6 p-0"
                              onClick={() => removeFile(uploadingFile.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>

                            <div className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-muted">
                              {uploadingFile.preview ? (
                                <img
                                  src={uploadingFile.preview}
                                  alt={uploadingFile.file.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <FileIconIcon className="h-8 w-8 text-muted-foreground" />
                              )}
                            </div>

                            <div className="space-y-1">
                              <h4
                                className="truncate text-sm font-medium"
                                title={uploadingFile.file.name}
                              >
                                {uploadingFile.file.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(uploadingFile.file.size)}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {uploadingFile.metadata.accessLevel}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 'configure' && (
            <FileConfigurationStep
              files={uploadingFiles}
              onUpdateMetadata={updateFileMetadata}
              onUpdateProcessingOptions={updateProcessingOptions}
              onNext={() => startUpload()}
              onBack={() => setCurrentStep('select')}
              enableProcessing={globalSettings.enableAutoProcessing}
            />
          )}

          {currentStep === 'upload' && (
            <FileUploadProgress
              files={uploadingFiles}
              onComplete={() => setCurrentStep('complete')}
            />
          )}

          {currentStep === 'complete' && (
            <FileUploadComplete
              files={uploadingFiles}
              onClose={handleComplete}
              onUploadMore={() => {
                setUploadingFiles([]);
                setCurrentStep('select');
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// File Configuration Step Component
interface FileConfigurationStepProps {
  files: UploadingFile[];
  onUpdateMetadata: (
    fileId: string,
    metadata: Partial<UploadingFile['metadata']>
  ) => void;
  onUpdateProcessingOptions: (
    fileId: string,
    options: Partial<MediaProcessingOptions>
  ) => void;
  onNext: () => void;
  onBack: () => void;
  enableProcessing: boolean;
}

function FileConfigurationStep({
  files,
  onUpdateMetadata,
  onUpdateProcessingOptions,
  onNext,
  onBack,
  enableProcessing,
}: FileConfigurationStepProps) {
  const [selectedFileId, setSelectedFileId] = useState<string>(
    files[0]?.id || ''
  );
  const selectedFile = files.find(f => f.id === selectedFileId);

  if (!selectedFile) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Configure Files</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>Start Upload</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* File List */}
        <div className="space-y-2">
          <Label>Files ({files.length})</Label>
          <div className="max-h-96 space-y-1 overflow-y-auto">
            {files.map(file => {
              const FileIcon = getFileIcon(file.file);
              return (
                <Card
                  key={file.id}
                  className={cn(
                    'cursor-pointer transition-colors',
                    selectedFileId === file.id && 'ring-2 ring-blue-500'
                  )}
                  onClick={() => setSelectedFileId(file.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <FileIconIcon className="h-6 w-6 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {file.metadata.title || file.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.file.size)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Configuration Panels */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="metadata" className="space-y-4">
            <TabsList>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              {enableProcessing && (
                <TabsTrigger value="processing">Processing</TabsTrigger>
              )}
              <TabsTrigger value="access">Access & Security</TabsTrigger>
            </TabsList>

            <TabsContent value="metadata" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={selectedFile.metadata.title}
                    onChange={e =>
                      onUpdateMetadata(selectedFileId, {
                        title: e.target.value,
                      })
                    }
                    placeholder="Enter file title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={selectedFile.metadata.category}
                    onValueChange={value =>
                      onUpdateMetadata(selectedFileId, { category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="lesson">Lesson Material</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="resource">Resource</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={selectedFile.metadata.description}
                  onChange={e =>
                    onUpdateMetadata(selectedFileId, {
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter file description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <Input
                  value={selectedFile.metadata.tags.join(', ')}
                  onChange={e =>
                    onUpdateMetadata(selectedFileId, {
                      tags: e.target.value
                        .split(',')
                        .map(tag => tag.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </TabsContent>

            {enableProcessing && (
              <TabsContent value="processing" className="space-y-4">
                {getFileType(selectedFile.file) === 'image' && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Image Processing Options</h4>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="optimize-image"
                        checked={
                          selectedFile.processingOptions.image?.optimize ||
                          false
                        }
                        onCheckedChange={checked =>
                          onUpdateProcessingOptions(selectedFileId, {
                            image: {
                              ...selectedFile.processingOptions.image,
                              optimize: checked as boolean,
                            },
                          })
                        }
                      />
                      <Label htmlFor="optimize-image">Optimize for web</Label>
                    </div>

                    <div className="space-y-2">
                      <Label>Output Format</Label>
                      <Select
                        value={
                          selectedFile.processingOptions.image?.format || 'webp'
                        }
                        onValueChange={value =>
                          onUpdateProcessingOptions(selectedFileId, {
                            image: {
                              ...selectedFile.processingOptions.image,
                              format: value as any,
                            },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="webp">
                            WebP (Recommended)
                          </SelectItem>
                          <SelectItem value="jpeg">JPEG</SelectItem>
                          <SelectItem value="png">PNG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Max Width</Label>
                        <Input
                          type="number"
                          value={
                            selectedFile.processingOptions.image?.resize
                              ?.width || ''
                          }
                          onChange={e =>
                            onUpdateProcessingOptions(selectedFileId, {
                              image: {
                                ...selectedFile.processingOptions.image,
                                resize: {
                                  ...selectedFile.processingOptions.image
                                    ?.resize,
                                  width: parseInt(e.target.value) || undefined,
                                },
                              },
                            })
                          }
                          placeholder="Auto"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Height</Label>
                        <Input
                          type="number"
                          value={
                            selectedFile.processingOptions.image?.resize
                              ?.height || ''
                          }
                          onChange={e =>
                            onUpdateProcessingOptions(selectedFileId, {
                              image: {
                                ...selectedFile.processingOptions.image,
                                resize: {
                                  ...selectedFile.processingOptions.image
                                    ?.resize,
                                  height: parseInt(e.target.value) || undefined,
                                },
                              },
                            })
                          }
                          placeholder="Auto"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {getFileType(selectedFile.file) === 'video' && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Video Processing Options</h4>

                    <div className="space-y-2">
                      <Label>Quality</Label>
                      <Select
                        value={
                          selectedFile.processingOptions.video?.transcode
                            ?.quality || 'medium'
                        }
                        onValueChange={value =>
                          onUpdateProcessingOptions(selectedFileId, {
                            video: {
                              ...selectedFile.processingOptions.video,
                              transcode: {
                                ...selectedFile.processingOptions.video
                                  ?.transcode,
                                quality: value as any,
                              },
                            },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">
                            Low (Fast encoding)
                          </SelectItem>
                          <SelectItem value="medium">
                            Medium (Balanced)
                          </SelectItem>
                          <SelectItem value="high">
                            High (Better quality)
                          </SelectItem>
                          <SelectItem value="ultra">
                            Ultra (Best quality)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enable-streaming"
                        checked={
                          selectedFile.processingOptions.video?.streaming
                            ?.enabled || false
                        }
                        onCheckedChange={checked =>
                          onUpdateProcessingOptions(selectedFileId, {
                            video: {
                              ...selectedFile.processingOptions.video,
                              streaming: {
                                ...selectedFile.processingOptions.video
                                  ?.streaming,
                                enabled: checked as boolean,
                              },
                            },
                          })
                        }
                      />
                      <Label htmlFor="enable-streaming">
                        Enable adaptive streaming
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="generate-thumbnails"
                        checked={
                          (selectedFile.processingOptions.video?.thumbnails
                            ?.count || 0) > 0
                        }
                        onCheckedChange={checked =>
                          onUpdateProcessingOptions(selectedFileId, {
                            video: {
                              ...selectedFile.processingOptions.video,
                              thumbnails: {
                                ...selectedFile.processingOptions.video
                                  ?.thumbnails,
                                count: checked ? 3 : 0,
                              },
                            },
                          })
                        }
                      />
                      <Label htmlFor="generate-thumbnails">
                        Generate thumbnails
                      </Label>
                    </div>
                  </div>
                )}

                {!['image', 'video'].includes(
                  getFileType(selectedFile.file)
                ) && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No processing options available for this file type.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            )}

            <TabsContent value="access" className="space-y-4">
              <div className="space-y-2">
                <Label>Access Level</Label>
                <Select
                  value={selectedFile.metadata.accessLevel}
                  onValueChange={value =>
                    onUpdateMetadata(selectedFileId, {
                      accessLevel: value as FileAccessLevel,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        Public - Anyone can access
                      </div>
                    </SelectItem>
                    <SelectItem value="enrolled_only">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        Enrolled Only - Course students only
                      </div>
                    </SelectItem>
                    <SelectItem value="premium_only">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                        Premium Only - Premium members only
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        Private - Restricted access
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  All uploaded files will be automatically scanned for security
                  threats and inappropriate content.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// File Upload Progress Component
interface FileUploadProgressProps {
  files: UploadingFile[];
  onComplete: () => void;
}

function FileUploadProgress({ files, onComplete }: FileUploadProgressProps) {
  const completedFiles = files.filter(f => f.status === 'completed').length;
  const errorFiles = files.filter(f => f.status === 'error').length;
  const processingFiles = files.filter(f => f.status === 'processing').length;
  const overallProgress = (completedFiles / files.length) * 100;

  React.useEffect(() => {
    if (completedFiles + errorFiles === files.length) {
      setTimeout(() => onComplete(), 1000);
    }
  }, [completedFiles, errorFiles, files.length, onComplete]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-semibold">Uploading Files</h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{completedFiles} completed</span>
          <span>{processingFiles} processing</span>
          <span>{errorFiles} failed</span>
          <span>{files.length} total</span>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Overall Progress</span>
          <span>{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      {/* Individual File Progress */}
      <div className="max-h-96 space-y-3 overflow-y-auto">
        {files.map(file => {
          const FileIcon = getFileIcon(file.file);

          return (
            <Card key={file.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <FileIconIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="truncate font-medium">
                        {file.metadata.title}
                      </h4>
                      {file.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {file.status === 'error' && (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      {file.status === 'processing' && (
                        <Clock className="h-4 w-4 text-blue-600" />
                      )}
                    </div>

                    <div className="mb-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.file.size)}</span>
                      <Badge variant="outline" className="text-xs">
                        {file.status === 'completed'
                          ? 'Completed'
                          : file.status === 'error'
                            ? 'Failed'
                            : file.status === 'processing'
                              ? 'Processing'
                              : 'Uploading'}
                      </Badge>
                    </div>

                    {(file.status === 'uploading' ||
                      file.status === 'processing') && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>
                            {file.status === 'processing'
                              ? 'Processing media...'
                              : 'Uploading...'}
                          </span>
                          <span>{Math.round(file.progress)}%</span>
                        </div>
                        <Progress value={file.progress} className="h-1" />
                      </div>
                    )}

                    {file.status === 'error' && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {file.error || 'Upload failed'}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// File Upload Complete Component
interface FileUploadCompleteProps {
  files: UploadingFile[];
  onClose: () => void;
  onUploadMore: () => void;
}

function FileUploadComplete({
  files,
  onClose,
  onUploadMore,
}: FileUploadCompleteProps) {
  const completedFiles = files.filter(f => f.status === 'completed');
  const errorFiles = files.filter(f => f.status === 'error');

  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Upload Complete!</h3>
          <p className="text-muted-foreground">
            {completedFiles.length} files uploaded successfully
            {errorFiles.length > 0 && `, ${errorFiles.length} failed`}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {completedFiles.length}
            </div>
            <div className="text-sm text-muted-foreground">Successful</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {
                completedFiles.filter(
                  f => f.processingOptions.image || f.processingOptions.video
                ).length
              }
            </div>
            <div className="text-sm text-muted-foreground">Processing</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {errorFiles.length}
            </div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" onClick={onUploadMore}>
          Upload More Files
        </Button>
        <Button onClick={onClose}>Done</Button>
      </div>

      {/* Error Files */}
      {errorFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-left font-medium">Failed Uploads</h4>
          <div className="space-y-1">
            {errorFiles.map(file => (
              <Alert key={file.id} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-left">
                  <strong>{file.file.name}</strong>: {file.error}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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

const getFileType = (
  file: File
): 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other' => {
  const type = file.type;
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  if (
    type.includes('pdf') ||
    type.includes('document') ||
    type.includes('text')
  )
    return 'document';
  if (type.includes('zip') || type.includes('rar') || type.includes('archive'))
    return 'archive';
  return 'other';
};
