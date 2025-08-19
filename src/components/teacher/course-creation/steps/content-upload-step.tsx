'use client';

import React, { useState, useCallback } from 'react';
import {
  Upload,
  Video,
  FileText,
  Image as ImageIcon,
  Music,
  File,
  Trash2,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Folder,
  Plus,
  X,
  CloudUpload,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Import API hooks
import {
  useUploadCourseContentMutation,
  useUploadLessonContentMutation,
} from '@/lib/redux/api/course-creation-api';
import type {
  CourseDraft,
  CourseMaterial,
  CourseSection,
} from '@/lib/redux/api/course-creation-api';

interface ContentUploadStepProps {
  draft: CourseDraft;
  onUpdate: (updates: Partial<CourseDraft>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadProgress: number;
  status: 'uploading' | 'completed' | 'error' | 'cancelled';
  error?: string;
  thumbnail?: string;
  duration?: number;
  lessonId?: string;
  sectionId?: string;
}

const SUPPORTED_VIDEO_FORMATS = [
  '.mp4',
  '.mov',
  '.avi',
  '.wmv',
  '.flv',
  '.webm',
];
const SUPPORTED_AUDIO_FORMATS = ['.mp3', '.wav', '.aac', '.flac', '.ogg'];
const SUPPORTED_DOCUMENT_FORMATS = [
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.txt',
];
const SUPPORTED_IMAGE_FORMATS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
];

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const MAX_FILES_PER_LESSON = 10;

export function ContentUploadStep({
  draft,
  onUpdate,
  onNext,
  onPrevious,
  isLoading,
  errors = {},
}: ContentUploadStepProps) {
  const { toast } = useToast();
  const [uploadingFiles, setUploadingFiles] = useState<UploadedFile[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [trailerVideoUrl, setTrailerVideoUrl] = useState('');

  const [uploadContent] = useUploadCourseContentMutation();
  const [uploadLessonContent] = useUploadLessonContentMutation();

  // Get file type icon
  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();

    if (SUPPORTED_VIDEO_FORMATS.some(format => format.includes(extension!))) {
      return Video;
    } else if (
      SUPPORTED_AUDIO_FORMATS.some(format => format.includes(extension!))
    ) {
      return Music;
    } else if (
      SUPPORTED_IMAGE_FORMATS.some(format => format.includes(extension!))
    ) {
      return ImageIcon;
    } else if (
      SUPPORTED_DOCUMENT_FORMATS.some(format => format.includes(extension!))
    ) {
      return FileText;
    }
    return File;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`;
    }

    const extension = '.' + file.name.toLowerCase().split('.').pop();
    const allSupportedFormats = [
      ...SUPPORTED_VIDEO_FORMATS,
      ...SUPPORTED_AUDIO_FORMATS,
      ...SUPPORTED_DOCUMENT_FORMATS,
      ...SUPPORTED_IMAGE_FORMATS,
    ];

    if (!allSupportedFormats.includes(extension)) {
      return `Unsupported file format. Supported formats: ${allSupportedFormats.join(', ')}`;
    }

    return null;
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList, lessonId?: string) => {
    const filesToUpload = Array.from(files);

    for (const file of filesToUpload) {
      const validationError = validateFile(file);
      if (validationError) {
        toast({
          title: 'Invalid File',
          description: validationError,
          variant: 'destructive',
        });
        continue;
      }

      const uploadedFile: UploadedFile = {
        id: `upload_${Date.now()}_${Math.random()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: '',
        uploadProgress: 0,
        status: 'uploading',
        lessonId,
      };

      setUploadingFiles(prev => [...prev, uploadedFile]);

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev =>
            prev.map(f =>
              f.id === uploadedFile.id
                ? {
                    ...f,
                    uploadProgress: Math.min(
                      f.uploadProgress + Math.random() * 15,
                      90
                    ),
                  }
                : f
            )
          );
        }, 200);

        const result = await uploadContent({
          file,
          type: lessonId ? 'video' : 'material',
          courseId: draft.id,
          onProgress: progress => {
            setUploadingFiles(prev =>
              prev.map(f =>
                f.id === uploadedFile.id
                  ? { ...f, uploadProgress: progress }
                  : f
              )
            );
          },
        }).unwrap();

        clearInterval(progressInterval);

        // Update file status
        setUploadingFiles(prev =>
          prev.map(f =>
            f.id === uploadedFile.id
              ? {
                  ...f,
                  url: result.url,
                  uploadProgress: 100,
                  status: 'completed',
                }
              : f
          )
        );

        // Add to course materials or lesson content
        if (lessonId) {
          // Add to specific lesson
          const updatedSections = draft.curriculum.sections.map(section => ({
            ...section,
            lessons: section.lessons.map(lesson =>
              lesson.id === lessonId
                ? {
                    ...lesson,
                    content: {
                      ...lesson.content,
                      videoFile:
                        lesson.lessonType === 'video'
                          ? result.url
                          : lesson.content?.videoFile,
                      audioFile:
                        lesson.lessonType === 'audio'
                          ? result.url
                          : lesson.content?.audioFile,
                      attachments: [
                        ...(lesson.content?.attachments || []),
                        result.url,
                      ],
                    },
                  }
                : lesson
            ),
          }));

          onUpdate({
            curriculum: {
              ...draft.curriculum,
              sections: updatedSections as CourseSection[],
            },
          });
        } else {
          // Add to course materials
          const newMaterial: CourseMaterial = {
            id: result.fileId,
            name: file.name,
            type: file.name.split('.').pop() as any,
            url: result.url,
            size: file.size,
            isDownloadable: true,
            orderIndex: draft.content.materials.length,
          };

          onUpdate({
            content: {
              ...draft.content,
              materials: [...draft.content.materials, newMaterial],
            },
          });
        }

        toast({
          title: 'Upload Successful',
          description: `${file.name} has been uploaded successfully`,
        });
      } catch (error) {
        setUploadingFiles(prev =>
          prev.map(f =>
            f.id === uploadedFile.id
              ? {
                  ...f,
                  status: 'error',
                  error: 'Upload failed. Please try again.',
                }
              : f
          )
        );

        toast({
          title: 'Upload Failed',
          description: `Failed to upload ${file.name}`,
          variant: 'destructive',
        });
      }
    }
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files, selectedLesson || undefined);
      }
    },
    [selectedLesson]
  );

  // Remove file
  const removeFile = (fileId: string, isUploading = false) => {
    if (isUploading) {
      setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
    } else {
      // Remove from course materials
      onUpdate({
        content: {
          ...draft.content,
          materials: draft.content.materials.filter(m => m.id !== fileId),
        },
      });
    }

    toast({
      title: 'File Removed',
      description: 'File has been removed successfully',
    });
  };

  // Add trailer video URL
  const handleAddTrailerVideo = () => {
    if (!trailerVideoUrl.trim()) return;

    onUpdate({
      content: {
        ...draft.content,
        trailerVideo: trailerVideoUrl,
      },
    });

    setTrailerVideoUrl('');
    toast({
      title: 'Trailer Added',
      description: 'Course trailer video has been added',
    });
  };

  return (
    <div className="space-y-6">
      {/* Course Trailer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Course Trailer Video
          </CardTitle>
          <CardDescription>
            Add a promotional video to showcase your course (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {draft.content.trailerVideo ? (
            <div className="space-y-4">
              <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-100">
                <div className="text-center">
                  <Video className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                  <p className="text-sm text-gray-600">Trailer Video</p>
                  <p className="break-all text-xs text-gray-500">
                    {typeof draft.content.trailerVideo === 'string'
                      ? draft.content.trailerVideo
                      : 'Uploaded file'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  onUpdate({
                    content: { ...draft.content, trailerVideo: undefined },
                  })
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Trailer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                  value={trailerVideoUrl}
                  onChange={e => setTrailerVideoUrl(e.target.value)}
                />
                <Button onClick={handleAddTrailerVideo}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add URL
                </Button>
              </div>

              <div className="text-center">
                <p className="mb-2 text-sm text-gray-500">or</p>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(e.target.files!, undefined);
                    }
                  }}
                  className="mx-auto max-w-xs"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Upload Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Course Content
          </CardTitle>
          <CardDescription>
            Upload videos, materials, and resources for your course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="materials" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="materials">Course Materials</TabsTrigger>
              <TabsTrigger value="lessons">Lesson Content</TabsTrigger>
            </TabsList>

            {/* Course Materials Tab */}
            <TabsContent value="materials" className="space-y-4">
              {/* Upload Area */}
              <div
                className={cn(
                  'rounded-lg border-2 border-dashed p-8 text-center transition-colors',
                  dragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <CloudUpload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium">
                  Drag and drop files here
                </h3>
                <p className="mb-4 text-gray-500">or click to browse files</p>
                <Input
                  type="file"
                  multiple
                  onChange={e => {
                    if (e.target.files) {
                      handleFileUpload(e.target.files);
                    }
                  }}
                  className="mx-auto max-w-xs"
                />
                <p className="mt-2 text-xs text-gray-400">
                  Supported formats: Video ({SUPPORTED_VIDEO_FORMATS.join(', ')}
                  ), Audio ({SUPPORTED_AUDIO_FORMATS.join(', ')}), Documents (
                  {SUPPORTED_DOCUMENT_FORMATS.join(', ')}), Images (
                  {SUPPORTED_IMAGE_FORMATS.join(', ')})
                </p>
              </div>

              {/* Uploading Files */}
              {uploadingFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Uploading Files</h4>
                  {uploadingFiles.map(file => {
                    const FileIcon = getFileIcon(file.name);
                    return (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <FileIcon className="h-5 w-5 flex-shrink-0 text-blue-600" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                          {file.status === 'uploading' && (
                            <Progress
                              value={file.uploadProgress}
                              className="mt-1 h-1"
                            />
                          )}
                          {file.status === 'error' && (
                            <p className="text-sm text-red-500">{file.error}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {file.status === 'uploading' && (
                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600" />
                          )}
                          {file.status === 'completed' && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          {file.status === 'error' && (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id, true)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Uploaded Materials */}
              {draft.content.materials.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">
                    Course Materials ({draft.content.materials.length})
                  </h4>
                  {draft.content.materials.map(material => {
                    const FileIcon = getFileIcon(material.name);
                    return (
                      <div
                        key={material.id}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <FileIcon className="h-5 w-5 flex-shrink-0 text-blue-600" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {material.name}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{formatFileSize(material.size || 0)}</span>
                            <Badge variant="outline" className="text-xs">
                              {material.type?.toUpperCase()}
                            </Badge>
                            {material.isDownloadable && (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-xs"
                              >
                                Downloadable
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setPreviewFile({
                                id: material.id!,
                                name: material.name,
                                type: material.type!,
                                size: material.size || 0,
                                url: material.url!,
                                uploadProgress: 100,
                                status: 'completed',
                              })
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(material.url, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Switch
                            checked={material.isDownloadable}
                            onCheckedChange={checked => {
                              const updatedMaterials =
                                draft.content.materials.map(m =>
                                  m.id === material.id
                                    ? { ...m, isDownloadable: checked }
                                    : m
                                );
                              onUpdate({
                                content: {
                                  ...draft.content,
                                  materials: updatedMaterials,
                                },
                              });
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(material.id!)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Lesson Content Tab */}
            <TabsContent value="lessons" className="space-y-4">
              {draft.curriculum.sections.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please create your curriculum structure first before
                    uploading lesson content.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {draft.curriculum.sections.map(section => (
                    <Card key={section.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Folder className="h-5 w-5" />
                          {section.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {section.lessons.length === 0 ? (
                          <p className="py-4 text-center text-gray-500">
                            No lessons in this section
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {section.lessons.map(lesson => {
                              const LessonIcon = getFileIcon(lesson.lessonType);
                              const hasContent =
                                lesson.content?.videoFile ||
                                lesson.content?.audioFile ||
                                (lesson.content?.attachments &&
                                  lesson.content.attachments.length > 0);

                              return (
                                <div
                                  key={lesson.id}
                                  className="rounded-lg border p-4"
                                >
                                  <div className="mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <LessonIcon className="h-4 w-4" />
                                      <span className="font-medium">
                                        {lesson.title}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {lesson.lessonType}
                                      </Badge>
                                      {hasContent && (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                      )}
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const input =
                                          document.createElement('input');
                                        input.type = 'file';
                                        input.multiple = true;
                                        input.accept =
                                          lesson.lessonType === 'video'
                                            ? 'video/*'
                                            : lesson.lessonType === 'audio'
                                              ? 'audio/*'
                                              : '*';
                                        input.onchange = e => {
                                          const files = (
                                            e.target as HTMLInputElement
                                          ).files;
                                          if (files) {
                                            handleFileUpload(files, lesson.id);
                                          }
                                        };
                                        input.click();
                                      }}
                                    >
                                      <Upload className="mr-2 h-4 w-4" />
                                      Upload Content
                                    </Button>
                                  </div>

                                  {lesson.description && (
                                    <p className="mb-3 text-sm text-gray-600">
                                      {lesson.description}
                                    </p>
                                  )}

                                  {/* Show uploaded content */}
                                  {hasContent && (
                                    <div className="space-y-2">
                                      {lesson.content?.videoFile && (
                                        <div className="flex items-center gap-2 text-sm">
                                          <Video className="h-4 w-4 text-blue-600" />
                                          <span>Video content uploaded</span>
                                        </div>
                                      )}
                                      {lesson.content?.audioFile && (
                                        <div className="flex items-center gap-2 text-sm">
                                          <Music className="h-4 w-4 text-purple-600" />
                                          <span>Audio content uploaded</span>
                                        </div>
                                      )}
                                      {lesson.content?.attachments &&
                                        lesson.content.attachments.length >
                                          0 && (
                                          <div className="flex items-center gap-2 text-sm">
                                            <File className="h-4 w-4 text-gray-600" />
                                            <span>
                                              {
                                                lesson.content.attachments
                                                  .length
                                              }{' '}
                                              attachments
                                            </span>
                                          </div>
                                        )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Upload Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Content Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Content Best Practices:</strong>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                <li>
                  Use high-quality video (1080p recommended) with clear audio
                </li>
                <li>
                  Keep video lessons between 5-15 minutes for optimal engagement
                </li>
                <li>
                  Provide downloadable resources to supplement video content
                </li>
                <li>Use consistent naming conventions for your files</li>
                <li>Test all media files before uploading to ensure quality</li>
                <li>Include captions or transcripts for accessibility</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* File Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-auto">
          <DialogHeader>
            <DialogTitle>File Preview</DialogTitle>
            <DialogDescription>{previewFile?.name}</DialogDescription>
          </DialogHeader>
          {previewFile && (
            <div className="space-y-4">
              {previewFile.type.startsWith('image/') && (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="h-auto max-w-full rounded-lg"
                />
              )}
              {previewFile.type.startsWith('video/') && (
                <video
                  src={previewFile.url}
                  controls
                  className="h-auto max-w-full rounded-lg"
                />
              )}
              {previewFile.type.startsWith('audio/') && (
                <audio src={previewFile.url} controls className="w-full" />
              )}
              {previewFile.type === 'application/pdf' && (
                <iframe
                  src={previewFile.url}
                  className="h-96 w-full rounded-lg"
                />
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{previewFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(previewFile.size)}
                  </p>
                </div>
                <Button onClick={() => window.open(previewFile.url, '_blank')}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
