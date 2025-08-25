'use client';

import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import {
  Plus,
  BookOpen,
  Video,
  FileText,
  Edit3,
  Trash2,
  GripVertical,
  Clock,
  Eye,
  Settings,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  Upload,
  Save,
  Image,
  X,
  Music,
  Paperclip,
  Tag,
  Languages,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useReorderSectionsMutation,
  useReorderLessonsMutation,
  CourseSection,
  Lesson,
} from '@/lib/redux/api/teacher-lessons-api';
import { useGetCourseFileStatisticsQuery } from '@/lib/redux/api/teacher-courses-api';
import { useDirectUpload } from '@/hooks/useDirectUpload';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface CurriculumBuilderProps {
  courseId: string;
  sections: CourseSection[];
  onSectionsChange: (sections: CourseSection[]) => void;
}

interface SectionFormData {
  title: string;
  description: string;
  isRequired: boolean;
  objectives: string[];
  availableFrom: string;
  availableUntil: string;
  settings: {
    allowDownloads: boolean;
    requireSequentialAccess: boolean;
    completionCriteria: 'all_lessons' | 'percentage' | 'time_based';
  };
}

interface LessonFormData {
  title: string;
  description: string;
  content: string;
  lessonType: 'video' | 'text' | 'quiz' | 'assignment' | 'interactive';
  videoUrl: string;
  duration: number;
  isPreview: boolean;
  isMandatory: boolean;
  estimatedDuration: number;
  points: number;
  availableFrom: string;
  availableUntil: string;
  videoDuration: number;
  thumbnailUrl: string;
  objectives: string[];
  prerequisites: string[];
  uploadedVideoFile?: File;
  uploadedVideoFileId?: string;
  uploadedThumbnailFile?: File;
  uploadedThumbnailFileId?: string;
  uploadedAudioFile?: File;
  uploadedAudioFileId?: string;
  audioUrl: string;
  tags: string[];
  uploadedAttachments?: File[];
  attachments: Array<{
    filename: string;
    url: string;
    fileSize: number;
    mimeType: string;
  }>;
  transcript: Array<{ language: string; content: string }>;
  settings: {
    allowComments: boolean;
    showProgress: boolean;
    allowDownload: boolean;
    autoPlay: boolean;
    showTranscript: boolean;
  };
  metadata: {
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    tags: string[];
    language: string;
  };
}

export default function CurriculumBuilder({
  courseId,
  sections: initialSections,
  onSectionsChange,
}: CurriculumBuilderProps) {
  const { toast } = useToast();
  // Normalize initial sections data structure
  const normalizedInitialSections = initialSections.map(section => {
    // If section has nested data.data structure, flatten it
    if (section?.data && (section.data as any).data) {
      return {
        data: (section.data as any).data,
        lessons: section.lessons || [],
      };
    }
    return section;
  });

  const [sections, setSections] = useState<CourseSection[]>(
    normalizedInitialSections
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [isAddingSectionOpen, setIsAddingSectionOpen] = useState(false);
  const [isEditingSectionOpen, setIsEditingSectionOpen] = useState(false);
  const [isAddingLessonOpen, setIsAddingLessonOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  // API hooks
  const [createSection, { isLoading: isCreatingSection }] =
    useCreateSectionMutation();
  const [updateSection, { isLoading: isUpdatingSection }] =
    useUpdateSectionMutation();
  const [deleteSection, { isLoading: isDeletingSection }] =
    useDeleteSectionMutation();
  const [createLesson, { isLoading: isCreatingLesson }] =
    useCreateLessonMutation();
  const [updateLesson, { isLoading: isUpdatingLesson }] =
    useUpdateLessonMutation();
  const [deleteLesson, { isLoading: isDeletingLesson }] =
    useDeleteLessonMutation();
  const [reorderSections] = useReorderSectionsMutation();
  const [reorderLessons] = useReorderLessonsMutation();
  const { uploadFile: directUpload } = useDirectUpload();

  // File statistics API
  const {
    data: fileStats,
    error: fileStatsError,
    isLoading: fileStatsLoading,
    refetch: refetchFileStats,
  } = useGetCourseFileStatisticsQuery(courseId, {
    skip: !courseId,
  });

  // Confirmation dialog states
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'section' | 'lesson';
    id: string;
    sectionId?: string;
    title: string;
  } | null>(null);

  // Lesson preview/edit states
  const [previewLesson, setPreviewLesson] = useState<{
    isOpen: boolean;
    lesson: Lesson;
  } | null>(null);

  const [editLesson, setEditLesson] = useState<{
    isOpen: boolean;
    lesson: Lesson;
    sectionId: string;
  } | null>(null);

  // Tag input states
  const [lessonTagInput, setLessonTagInput] = useState('');

  // Form states
  const [sectionForm, setSectionForm] = useState<SectionFormData>({
    title: '',
    description: '',
    isRequired: false,
    objectives: [],
    availableFrom: '',
    availableUntil: '',
    settings: {
      allowDownloads: true,
      requireSequentialAccess: false,
      completionCriteria: 'all_lessons',
    },
  });

  const [lessonForm, setLessonForm] = useState<LessonFormData>({
    title: '',
    description: '',
    content: '',
    lessonType: 'video',
    videoUrl: '',
    videoDuration: 0,
    duration: 0,
    isPreview: false,
    isMandatory: false,
    estimatedDuration: 0,
    points: 0,
    availableFrom: '',
    availableUntil: '',
    thumbnailUrl: '',
    objectives: [],
    tags: [],
    prerequisites: [],
    uploadedVideoFile: undefined,
    uploadedVideoFileId: undefined,
    uploadedThumbnailFile: undefined,
    uploadedThumbnailFileId: undefined,
    uploadedAudioFile: undefined,
    uploadedAudioFileId: undefined,
    audioUrl: '',
    uploadedAttachments: [],
    attachments: [],
    transcript: [],
    settings: {
      allowComments: true,
      showProgress: true,
      allowDownload: false,
      autoPlay: false,
      showTranscript: false,
    },
    metadata: {
      difficulty: 'beginner',
      tags: [],
      language: 'vi',
    },
  });

  const resetSectionForm = () => {
    setSectionForm({
      title: '',
      description: '',
      isRequired: false,
      objectives: [],
      availableFrom: '',
      availableUntil: '',
      settings: {
        allowDownloads: true,
        requireSequentialAccess: false,
        completionCriteria: 'all_lessons',
      },
    });
  };

  const resetLessonForm = () => {
    setLessonForm({
      title: '',
      description: '',
      content: '',
      lessonType: 'video',
      videoUrl: '',
      videoDuration: 0,
      duration: 0,
      isPreview: false,
      isMandatory: false,
      estimatedDuration: 0,
      points: 0,
      availableFrom: '',
      availableUntil: '',
      thumbnailUrl: '',
      objectives: [],
      tags: [],
      prerequisites: [],
      uploadedVideoFile: undefined,
      uploadedVideoFileId: undefined,
      uploadedThumbnailFile: undefined,
      uploadedThumbnailFileId: undefined,
      uploadedAudioFile: undefined,
      uploadedAudioFileId: undefined,
      audioUrl: '',
      uploadedAttachments: [],
      attachments: [],
      transcript: [],
      settings: {
        allowComments: true,
        showProgress: true,
        allowDownload: false,
        autoPlay: false,
        showTranscript: false,
      },
      metadata: {
        difficulty: 'beginner',
        tags: [],
        language: 'vi',
      },
    });
  };

  const populateSectionForm = (section: CourseSection['data']) => {
    setSectionForm({
      title: section.title,
      description: section.description || '',
      isRequired: section.isRequired,
      objectives: section.objectives || [],
      availableFrom: section.availableFrom
        ? new Date(section.availableFrom).toISOString().slice(0, 16)
        : '',
      availableUntil: section.availableUntil
        ? new Date(section.availableUntil).toISOString().slice(0, 16)
        : '',
      settings: section.settings || {
        allowDownloads: true,
        requireSequentialAccess: false,
        completionCriteria: 'all_lessons',
      },
    });
  };

  const startEditingSection = (sectionId: string) => {
    const section = sections.find(s => s.data.id === sectionId);
    if (section) {
      populateSectionForm(section.data);
      setEditingSection(sectionId);
      setIsEditingSectionOpen(true);
    }
  };

  const handleEditSection = async (sectionId: string) => {
    try {
      const result = await updateSection({
        id: sectionId,
        data: {
          title: sectionForm.title,
          description: sectionForm.description,
          isRequired: sectionForm.isRequired,
          objectives: sectionForm.objectives.filter(obj => obj.trim()),
          availableFrom: sectionForm.availableFrom || undefined,
          availableUntil: sectionForm.availableUntil || undefined,
          settings: sectionForm.settings,
        },
      }).unwrap();

      // Handle nested data structure from API
      const sectionData = (result.data as any).data
        ? (result.data as any).data
        : result.data
          ? result.data
          : result;

      const newSections = sections.map(section =>
        section.data.id === sectionId
          ? { ...section, data: sectionData }
          : section
      );
      setSections(newSections as CourseSection[]);
      onSectionsChange(newSections as CourseSection[]);

      toast({
        title: 'Section updated',
        description: `"${sectionForm.title}" has been updated successfully.`,
      });

      resetSectionForm();
      setIsEditingSectionOpen(false);
      setEditingSection(null);
    } catch (error: any) {
      console.error('❌ Section update failed:', error);
      toast({
        title: 'Failed to update section',
        description: error?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleCreateSection = async () => {
    try {
      const result = await createSection({
        courseId,
        title: sectionForm.title,
        description: sectionForm.description,
        isRequired: sectionForm.isRequired,
        objectives: sectionForm.objectives.filter(obj => obj.trim()),
        availableFrom: sectionForm.availableFrom || undefined,
        availableUntil: sectionForm.availableUntil || undefined,
        settings: sectionForm.settings,
        orderIndex: sections.length,
      }).unwrap();

      // Handle nested data structure from API: result.data.data or result.data
      const sectionData = (result.data as any).data
        ? (result.data as any).data
        : result.data
          ? result.data
          : result;

      const newSections = [...sections, { data: sectionData, lessons: [] }];
      setSections(newSections as CourseSection[]);
      onSectionsChange(newSections as CourseSection[]);

      toast({
        title: 'Section created',
        description: `"${sectionForm.title}" has been added to your course.`,
      });

      resetSectionForm();
      setIsAddingSectionOpen(false);
    } catch (error: any) {
      console.error('❌ Section creation failed:', error);
      toast({
        title: 'Failed to create section',
        description: error?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleCreateLesson = async (sectionId: string) => {
    try {
      // First create the lesson without files
      const result = await createLesson({
        courseId,
        sectionId,
        title: lessonForm.title,
        description: lessonForm.description,
        content: lessonForm.content || undefined,
        lessonType: lessonForm.lessonType,
        isPreview: lessonForm.isPreview,
        isMandatory: lessonForm.isMandatory,
        estimatedDuration: lessonForm.estimatedDuration,
        videoDuration: lessonForm.duration, // Video duration from form
        points: lessonForm.points,
        availableFrom: lessonForm.availableFrom || undefined,
        availableUntil: lessonForm.availableUntil || undefined,
        objectives: lessonForm.objectives.filter(obj => obj.trim()),
        prerequisites: lessonForm.prerequisites.filter(pre => pre.trim()),
        settings: lessonForm.settings,
        metadata: {
          ...lessonForm.metadata,
          tags: lessonForm.metadata.tags.filter(tag => tag.trim()),
        },
        orderIndex:
          sections.find(s => s.data.id === sectionId)?.data.lessons?.length ||
          0,
      }).unwrap();

      const createdLessonId = result.id;

      // Now upload files if provided and update the lesson
      let videoUrl = undefined;
      let thumbnailUrl = undefined;
      let audioUrl = undefined;

      // Upload video file if provided
      if (lessonForm.uploadedVideoFile) {
        toast({
          title: 'Uploading video...',
          description: 'Please wait while we upload your video file.',
        });
        try {
          const videoUploadResult = await directUpload(
            courseId,
            lessonForm.uploadedVideoFile,
            'lesson',
            createdLessonId,
            {
              onProgress: progress => {
                // Handle progress if needed
              },
              metadata: { lessonTitle: lessonForm.title, type: 'lesson_video' },
            }
          );
          videoUrl = videoUploadResult.success
            ? videoUploadResult.fileRecord?.fileUrl
            : undefined;
        } catch (error: any) {
          toast({
            title: 'Video upload failed',
            description: error?.message || 'Failed to upload video file',
            variant: 'destructive',
          });
          // Don't return, continue with lesson creation
        }
      }

      // Upload thumbnail file if provided
      if (lessonForm.uploadedThumbnailFile) {
        try {
          const thumbnailUploadResult = await directUpload(
            courseId,
            lessonForm.uploadedThumbnailFile,
            'lesson',
            createdLessonId,
            {
              onProgress: progress => {
                // Handle progress if needed
              },
              metadata: {
                lessonTitle: lessonForm.title,
                type: 'lesson_thumbnail',
              },
            }
          );
          thumbnailUrl = thumbnailUploadResult.success
            ? thumbnailUploadResult.fileRecord?.fileUrl
            : undefined;
        } catch (error: any) {
          toast({
            title: 'Thumbnail upload failed',
            description: error?.message || 'Failed to upload thumbnail file',
            variant: 'destructive',
          });
          // Don't return, continue
        }
      }

      // Upload audio file if provided
      if (lessonForm.uploadedAudioFile) {
        toast({
          title: 'Uploading audio...',
          description: 'Please wait while we upload your audio file.',
        });
        try {
          const audioUploadResult = await directUpload(
            courseId,
            lessonForm.uploadedAudioFile,
            'lesson',
            createdLessonId,
            {
              onProgress: progress => {
                // Handle progress if needed
              },
              metadata: { lessonTitle: lessonForm.title, type: 'lesson_audio' },
            }
          );
          audioUrl = audioUploadResult.success
            ? audioUploadResult.fileRecord?.fileUrl
            : undefined;
        } catch (error: any) {
          toast({
            title: 'Audio upload failed',
            description: error?.message || 'Failed to upload audio file',
            variant: 'destructive',
          });
          // Don't return, continue
        }
      }

      // Upload attachments if provided
      let attachments: Array<{
        filename: string;
        url: string;
        fileSize: number;
        mimeType: string;
      }> = [];
      if (
        lessonForm.uploadedAttachments &&
        lessonForm.uploadedAttachments.length > 0
      ) {
        toast({
          title: 'Uploading attachments...',
          description: `Please wait while we upload ${lessonForm.uploadedAttachments.length} file(s).`,
        });

        for (const file of lessonForm.uploadedAttachments) {
          try {
            const attachmentUploadResult = await directUpload(
              courseId,
              file,
              'lesson',
              createdLessonId,
              {
                onProgress: progress => {
                  // Handle progress if needed
                },
                metadata: {
                  lessonTitle: lessonForm.title,
                  type: 'lesson_attachment',
                },
              }
            );

            if (
              attachmentUploadResult.success &&
              attachmentUploadResult.fileRecord?.fileUrl
            ) {
              attachments.push({
                filename: file.name,
                url: attachmentUploadResult.fileRecord.fileUrl,
                fileSize: file.size,
                mimeType: file.type,
              });
            }
          } catch (error: any) {
            toast({
              title: `Failed to upload ${file.name}`,
              description: error?.message || 'Failed to upload attachment',
              variant: 'destructive',
            });
            // Continue with other files
          }
        }
      }

      // Update lesson with file URLs and attachments if any were uploaded
      if (videoUrl || thumbnailUrl || audioUrl || attachments.length > 0) {
        try {
          await updateLesson({
            id: createdLessonId,
            data: {
              videoUrl: videoUrl,
              thumbnailUrl: thumbnailUrl,
              audioUrl: audioUrl,
              attachments: attachments.length > 0 ? attachments : undefined,
            },
          }).unwrap();
        } catch (error: any) {
          toast({
            title: 'Failed to update lesson with file URLs',
            description:
              error?.message || 'Lesson created but file URLs not saved',
            variant: 'destructive',
          });
        }
      }

      const newSections = sections.map(section => {
        if (section.data.id === sectionId) {
          const updatedSection = {
            ...section,
            data: {
              ...section.data,
              totalLessons: (section.data.totalLessons || 0) + 1,
            },
            lessons: [...(section.lessons || []), result],
          };

          return updatedSection;
        }
        return section;
      });

      setSections(newSections);
      onSectionsChange(newSections);

      toast({
        title: 'Lesson created',
        description: `"${lessonForm.title}" has been added to the section.`,
      });

      // Ensure section is expanded to show new lesson
      setExpandedSections(prev => new Set([...prev, sectionId]));

      resetLessonForm();
      setIsAddingLessonOpen(false);
      setActiveSection('');
    } catch (error: any) {
      toast({
        title: 'Failed to create lesson',
        description: error?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSection = async (
    sectionId: string,
    sectionTitle: string
  ) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'section',
      id: sectionId,
      title: sectionTitle,
    });
  };

  const confirmDeleteSection = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteSection(deleteConfirm.id).unwrap();

      const newSections = sections.filter(s => s.data.id !== deleteConfirm.id);
      setSections(newSections);
      onSectionsChange(newSections);

      toast({
        title: 'Section deleted',
        description: 'The section and all its lessons have been removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to delete section',
        description: error?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleDeleteLesson = async (
    lessonId: string,
    sectionId: string,
    lessonTitle: string
  ) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'lesson',
      id: lessonId,
      sectionId,
      title: lessonTitle,
    });
  };

  const confirmDeleteLesson = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteLesson(deleteConfirm.id).unwrap();

      const newSections = sections.map(section =>
        section.data.id === deleteConfirm.sectionId
          ? {
              ...section,
              data: {
                ...section.data,
                totalLessons: Math.max((section.data.totalLessons || 0) - 1, 0),
              },
              lessons:
                section.lessons?.filter(l => l.id !== deleteConfirm.id) || [],
            }
          : section
      );

      setSections(newSections);
      onSectionsChange(newSections);

      toast({
        title: 'Lesson deleted',
        description: 'The lesson has been removed from the section.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to delete lesson',
        description: error?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Lesson preview handler
  const handlePreviewLesson = (lesson: Lesson) => {
    setPreviewLesson({
      isOpen: true,
      lesson,
    });
  };

  // Lesson edit handler
  const handleEditLesson = (lesson: Lesson, sectionId: string) => {
    // Populate edit form with lesson data
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      content: lesson.content || '',
      lessonType: lesson.lessonType,
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration || 0,
      videoDuration: lesson.videoDuration || 0,
      thumbnailUrl: lesson.thumbnailUrl || '',
      audioUrl: lesson.audioUrl || '',
      isPreview: lesson.isPreview || false,
      isMandatory: lesson.isMandatory || false,
      estimatedDuration: lesson.estimatedDuration || 0,
      points: lesson.points || 0,
      availableFrom: lesson.availableFrom || '',
      availableUntil: lesson.availableUntil || '',
      objectives: lesson.objectives || [],
      prerequisites: lesson.prerequisites || [],
      uploadedVideoFile: undefined,
      uploadedVideoFileId: undefined,
      uploadedThumbnailFile: undefined,
      uploadedThumbnailFileId: undefined,
      uploadedAudioFile: undefined,
      uploadedAudioFileId: undefined,
      uploadedAttachments: [],
      tags: lesson.tags || [],
      attachments: lesson.attachments || [],
      transcript: lesson.transcript || [],
      settings: lesson.settings || {
        allowComments: true,
        showProgress: true,
        allowDownload: false,
        autoPlay: false,
        showTranscript: false,
      },
      metadata: lesson.metadata || {
        difficulty: 'beginner',
        tags: lesson.tags || [],
        language: 'vi',
      },
    });

    setEditLesson({
      isOpen: true,
      lesson,
      sectionId,
    });
  };

  // Save edited lesson
  const handleSaveEditedLesson = async () => {
    if (!editLesson) return;

    try {
      const updatedLesson = await updateLesson({
        id: editLesson.lesson.id,
        data: {
          title: lessonForm.title,
          description: lessonForm.description,
          content: lessonForm.content,
          lessonType: lessonForm.lessonType,
          videoUrl: lessonForm.videoUrl,
          videoDuration: lessonForm.videoDuration,
          audioUrl: lessonForm.audioUrl,
          thumbnailUrl: lessonForm.thumbnailUrl,
          isPreview: lessonForm.isPreview,
          isMandatory: lessonForm.isMandatory,
          estimatedDuration: lessonForm.estimatedDuration,
          points: lessonForm.points,
          availableFrom: lessonForm.availableFrom,
          availableUntil: lessonForm.availableUntil,
          objectives: lessonForm.objectives,
          tags: lessonForm.tags,
          // materials: lessonForm.materials,
          settings: lessonForm.settings,
        },
      }).unwrap();

      // Update the lesson in sections
      const newSections = sections.map(section =>
        section.data.id === editLesson.sectionId
          ? {
              ...section,
              lessons:
                section.lessons?.map(l =>
                  l.id === editLesson.lesson.id ? updatedLesson : l
                ) || [],
            }
          : section
      );

      setSections(newSections);
      onSectionsChange(newSections);

      toast({
        title: 'Lesson updated',
        description: 'Lesson has been updated successfully',
      });

      setEditLesson(null);
      resetLessonForm();
    } catch (error: any) {
      toast({
        title: 'Failed to update lesson',
        description: error?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const toggleSectionExpansion = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <Edit3 className="h-4 w-4" />;
      case 'assignment':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <PlayCircle className="h-4 w-4" />;
    }
  };

  const getLessonTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'text':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'quiz':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'assignment':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Course Curriculum
          </h3>
          <p className="text-sm text-slate-600">
            Build your course structure with sections and lessons
          </p>
        </div>

        <Dialog
          open={isAddingSectionOpen}
          onOpenChange={setIsAddingSectionOpen}
        >
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-green-600">
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Section</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="border-b pb-2 text-sm font-semibold text-slate-700">
                  Basic Information
                </h4>

                <div>
                  <Label htmlFor="section-title">Section Title</Label>
                  <Input
                    id="section-title"
                    value={sectionForm.title}
                    onChange={e =>
                      setSectionForm(prev => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="e.g., Getting Started with React"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="section-description">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="section-description"
                    value={sectionForm.description}
                    onChange={e =>
                      setSectionForm(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Brief description of what this section covers..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Learning Objectives (Optional)</Label>
                  <div className="mt-1 space-y-2">
                    {sectionForm.objectives.map((objective, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={objective}
                          onChange={e => {
                            const newObjectives = [...sectionForm.objectives];
                            newObjectives[index] = e.target.value;
                            setSectionForm(prev => ({
                              ...prev,
                              objectives: newObjectives,
                            }));
                          }}
                          placeholder={`Objective ${index + 1}`}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newObjectives = sectionForm.objectives.filter(
                              (_, i) => i !== index
                            );
                            setSectionForm(prev => ({
                              ...prev,
                              objectives: newObjectives,
                            }));
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSectionForm(prev => ({
                          ...prev,
                          objectives: [...prev.objectives, ''],
                        }));
                      }}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Learning Objective
                    </Button>
                  </div>
                </div>
              </div>

              {/* Scheduling */}
              <div className="space-y-4">
                <h4 className="border-b pb-2 text-sm font-semibold text-slate-700">
                  Scheduling (Optional)
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="available-from">Available From</Label>
                    <Input
                      id="available-from"
                      type="datetime-local"
                      value={sectionForm.availableFrom}
                      onChange={e =>
                        setSectionForm(prev => ({
                          ...prev,
                          availableFrom: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      When this section becomes available
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="available-until">Available Until</Label>
                    <Input
                      id="available-until"
                      type="datetime-local"
                      value={sectionForm.availableUntil}
                      onChange={e =>
                        setSectionForm(prev => ({
                          ...prev,
                          availableUntil: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      When this section expires
                    </p>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h4 className="border-b pb-2 text-sm font-semibold text-slate-700">
                  Section Settings
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="section-required">Required Section</Label>
                      <p className="text-xs text-slate-500">
                        Students must complete this section to progress
                      </p>
                    </div>
                    <Switch
                      id="section-required"
                      checked={sectionForm.isRequired}
                      onCheckedChange={checked =>
                        setSectionForm(prev => ({
                          ...prev,
                          isRequired: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow-downloads">Allow Downloads</Label>
                      <p className="text-xs text-slate-500">
                        Let students download section materials
                      </p>
                    </div>
                    <Switch
                      id="allow-downloads"
                      checked={sectionForm.settings.allowDownloads}
                      onCheckedChange={checked =>
                        setSectionForm(prev => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            allowDownloads: checked,
                          },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sequential-access">
                        Sequential Access
                      </Label>
                      <p className="text-xs text-slate-500">
                        Students must complete lessons in order
                      </p>
                    </div>
                    <Switch
                      id="sequential-access"
                      checked={sectionForm.settings.requireSequentialAccess}
                      onCheckedChange={checked =>
                        setSectionForm(prev => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            requireSequentialAccess: checked,
                          },
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="completion-criteria">
                      Completion Criteria
                    </Label>
                    <Select
                      value={sectionForm.settings.completionCriteria}
                      onValueChange={(
                        value: 'all_lessons' | 'percentage' | 'time_based'
                      ) =>
                        setSectionForm(prev => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            completionCriteria: value,
                          },
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_lessons">
                          Complete All Lessons
                        </SelectItem>
                        <SelectItem value="percentage">
                          Percentage Based
                        </SelectItem>
                        <SelectItem value="time_based">Time Based</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-xs text-slate-500">
                      How students complete this section
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingSectionOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSection}
                  disabled={!sectionForm.title.trim() || isCreatingSection}
                  className="bg-gradient-to-r from-emerald-500 to-green-600"
                >
                  {isCreatingSection ? 'Creating...' : 'Create Section'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sections List */}
      {sections.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="mb-4 h-12 w-12 text-slate-400" />
            <h3 className="mb-2 text-lg font-semibold text-slate-600">
              No sections yet
            </h3>
            <p className="mb-6 text-center text-slate-500">
              Start building your course by creating your first section
            </p>
            <Button
              onClick={() => setIsAddingSectionOpen(true)}
              className="bg-gradient-to-r from-emerald-500 to-green-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create First Section
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sections.map((section, sectionIndex) => {
            const sec = section.data ? section.data : section;
            return (
              <Card key={sec.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSectionExpansion(sec.id)}
                        className="p-1"
                      >
                        {expandedSections.has(sec.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <CardTitle className="flex items-center space-x-2 text-base">
                          <span>{sec.title || '[No Title]'}</span>
                          {sec.isRequired && (
                            <Badge variant="secondary" className="text-xs">
                              Required
                            </Badge>
                          )}
                          {/* Debug info */}
                          {!sec.title && (
                            <Badge variant="destructive" className="text-xs">
                              Title Missing
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="mt-1 text-sm text-slate-600">
                          {section.lessons?.length || sec.lessons?.length || 0}{' '}
                          lessons • {sec.formattedDuration}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditingSection(sec.id)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSection(sec.id, sec.title)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedSections.has(sec.id) && (
                  <CardContent className="pt-0">
                    {sec.description && (
                      <p className="mb-4 text-sm text-slate-600">
                        {sec.description}
                      </p>
                    )}

                    {/* Lessons */}
                    <div className="space-y-2">
                      {(section.lessons || sec.lessons)?.map(
                        (lesson, lessonIndex) => (
                          <motion.div
                            key={lesson.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between rounded-lg border bg-slate-50 p-3"
                          >
                            <div className="flex items-center space-x-3">
                              <GripVertical className="h-4 w-4 text-slate-400" />
                              <div className="flex items-center space-x-2">
                                {getLessonTypeIcon(lesson.lessonType)}
                                <span className="font-medium">
                                  {lessonIndex + 1}. {lesson.title}
                                </span>
                              </div>
                              <Badge
                                className={getLessonTypeColor(
                                  lesson.lessonType
                                )}
                              >
                                {lesson.lessonType}
                              </Badge>
                              {lesson.isPreview && (
                                <Badge variant="outline" className="text-xs">
                                  Preview
                                </Badge>
                              )}
                              <div className="flex items-center space-x-1 text-xs text-slate-500">
                                <Clock className="h-3 w-3" />
                                <span>{lesson.formattedDuration}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePreviewLesson(lesson)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditLesson(lesson, sec.id)}
                                className="text-slate-600 hover:text-slate-700"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteLesson(
                                    lesson.id,
                                    sec.id,
                                    lesson.title
                                  )
                                }
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        )
                      )}

                      {/* Add Lesson Button */}
                      <Dialog
                        open={isAddingLessonOpen && activeSection === sec.id}
                        onOpenChange={open => {
                          setIsAddingLessonOpen(open);
                          if (!open) setActiveSection('');
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="mt-2 w-full border-dashed"
                            onClick={() => setActiveSection(sec.id)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Lesson to this Section
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Add New Lesson</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <Tabs defaultValue="basic" className="w-full">
                              <TabsList className="grid w-full grid-cols-6">
                                <TabsTrigger value="basic">Basic</TabsTrigger>
                                <TabsTrigger value="content">
                                  Content
                                </TabsTrigger>
                                <TabsTrigger value="media">Media</TabsTrigger>
                                <TabsTrigger value="attachments">
                                  Files
                                </TabsTrigger>
                                <TabsTrigger value="settings">
                                  Settings
                                </TabsTrigger>
                                <TabsTrigger value="advanced">
                                  Advanced
                                </TabsTrigger>
                              </TabsList>

                              <TabsContent value="basic" className="space-y-4">
                                <h4 className="border-b pb-2 text-sm font-semibold text-slate-700">
                                  Basic Information
                                </h4>

                                <div>
                                  <Label htmlFor="lesson-title">
                                    Lesson Title
                                  </Label>
                                  <Input
                                    id="lesson-title"
                                    value={lessonForm.title}
                                    onChange={e =>
                                      setLessonForm(prev => ({
                                        ...prev,
                                        title: e.target.value,
                                      }))
                                    }
                                    placeholder="e.g., Introduction to Components"
                                    className="mt-1"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="lesson-type">
                                    Lesson Type
                                  </Label>
                                  <Select
                                    value={lessonForm.lessonType}
                                    onValueChange={(value: any) =>
                                      setLessonForm(prev => ({
                                        ...prev,
                                        lessonType: value,
                                      }))
                                    }
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="video">
                                        Video Lesson
                                      </SelectItem>
                                      <SelectItem value="text">
                                        Text/Article
                                      </SelectItem>
                                      <SelectItem value="quiz">Quiz</SelectItem>
                                      <SelectItem value="assignment">
                                        Assignment
                                      </SelectItem>
                                      <SelectItem value="interactive">
                                        Interactive
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label htmlFor="lesson-description">
                                    Description (Optional)
                                  </Label>
                                  <Textarea
                                    id="lesson-description"
                                    value={lessonForm.description}
                                    onChange={e =>
                                      setLessonForm(prev => ({
                                        ...prev,
                                        description: e.target.value,
                                      }))
                                    }
                                    placeholder="What will students learn in this lesson?"
                                    className="mt-1"
                                    rows={3}
                                  />
                                </div>
                              </TabsContent>

                              <TabsContent
                                value="content"
                                className="space-y-4"
                              >
                                <h4 className="border-b pb-2 text-sm font-semibold text-slate-700">
                                  Lesson Content
                                </h4>

                                <div>
                                  <Label htmlFor="lesson-content">
                                    Main Content
                                  </Label>
                                  <RichTextEditor
                                    value={lessonForm.content}
                                    onChange={value =>
                                      setLessonForm(prev => ({
                                        ...prev,
                                        content: value,
                                      }))
                                    }
                                    placeholder="Write comprehensive lesson content with rich formatting. Use headings, lists, links, tables, and more to create engaging educational material..."
                                    minHeight={400}
                                    showWordCount={true}
                                    enableAdvancedFeatures={true}
                                  />
                                  <p className="mt-1 text-xs text-slate-500">
                                    Rich text content with formatting, links,
                                    and media support
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Content Difficulty</Label>
                                    <Select
                                      value={lessonForm.metadata.difficulty}
                                      onValueChange={(value: any) =>
                                        setLessonForm(prev => ({
                                          ...prev,
                                          metadata: {
                                            ...prev.metadata,
                                            difficulty: value,
                                          },
                                        }))
                                      }
                                    >
                                      <SelectTrigger className="mt-1">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="beginner">
                                          Beginner
                                        </SelectItem>
                                        <SelectItem value="intermediate">
                                          Intermediate
                                        </SelectItem>
                                        <SelectItem value="advanced">
                                          Advanced
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label>Content Language</Label>
                                    <Select
                                      value={lessonForm.metadata.language}
                                      onValueChange={value =>
                                        setLessonForm(prev => ({
                                          ...prev,
                                          metadata: {
                                            ...prev.metadata,
                                            language: value,
                                          },
                                        }))
                                      }
                                    >
                                      <SelectTrigger className="mt-1">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="vi">
                                          Tiếng Việt
                                        </SelectItem>
                                        <SelectItem value="en">
                                          English
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div>
                                  <Label>Content Tags</Label>
                                  <div className="mt-2 space-y-3">
                                    {/* Tag Input */}
                                    <Input
                                      value={lessonTagInput}
                                      onChange={e =>
                                        setLessonTagInput(e.target.value)
                                      }
                                      onKeyDown={e => {
                                        if (
                                          e.key === 'Enter' &&
                                          lessonTagInput.trim()
                                        ) {
                                          e.preventDefault();
                                          const newTag = lessonTagInput.trim();
                                          if (
                                            !lessonForm.metadata.tags.includes(
                                              newTag
                                            )
                                          ) {
                                            setLessonForm(prev => ({
                                              ...prev,
                                              metadata: {
                                                ...prev.metadata,
                                                tags: [
                                                  ...prev.metadata.tags,
                                                  newTag,
                                                ],
                                              },
                                            }));
                                          }
                                          setLessonTagInput('');
                                        }
                                      }}
                                      placeholder="Type a tag and press Enter to add"
                                      className="border-white/20 bg-white/80 backdrop-blur-sm"
                                    />

                                    {/* Tags Display */}
                                    {lessonForm.metadata.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-2">
                                        {lessonForm.metadata.tags.map(
                                          (tag, index) => (
                                            <Badge
                                              key={index}
                                              variant="secondary"
                                              className="flex items-center gap-1 bg-blue-100 px-3 py-1 text-blue-800 hover:bg-blue-200"
                                            >
                                              <span>{tag}</span>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const newTags =
                                                    lessonForm.metadata.tags.filter(
                                                      (_, i) => i !== index
                                                    );
                                                  setLessonForm(prev => ({
                                                    ...prev,
                                                    metadata: {
                                                      ...prev.metadata,
                                                      tags: newTags,
                                                    },
                                                  }));
                                                }}
                                                className="ml-1 rounded-full p-0.5 hover:bg-blue-300"
                                              >
                                                <X className="h-3 w-3" />
                                              </button>
                                            </Badge>
                                          )
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <p className="mt-1 text-sm text-slate-500">
                                    Type tags and press Enter to add them. Click
                                    ✕ to remove.
                                  </p>
                                </div>
                              </TabsContent>

                              <TabsContent value="media" className="space-y-4">
                                <h4 className="border-b pb-2 text-sm font-semibold text-slate-700">
                                  Media Content
                                </h4>

                                {/* Video Upload Section */}
                                {(lessonForm.lessonType === 'video' ||
                                  lessonForm.lessonType === 'interactive') && (
                                  <div className="space-y-4">
                                    <h5 className="text-sm font-medium text-slate-600">
                                      Video Upload
                                    </h5>

                                    <div className="rounded-lg border-2 border-dashed border-slate-300 p-4">
                                      <div className="text-center">
                                        <Upload className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                                        <p className="mb-2 text-sm text-slate-600">
                                          Upload Video File
                                        </p>
                                        <p className="mb-3 text-xs text-slate-500">
                                          Supports MP4, WebM, MOV (max 2GB).
                                          Files will be uploaded to AWS S3 and
                                          processed automatically.
                                        </p>
                                        <input
                                          type="file"
                                          accept="video/*"
                                          onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              setLessonForm(prev => ({
                                                ...prev,
                                                uploadedVideoFile: file,
                                              }));
                                            }
                                          }}
                                          className="hidden"
                                          id="video-upload"
                                        />
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            document
                                              .getElementById('video-upload')
                                              ?.click()
                                          }
                                        >
                                          <Upload className="mr-2 h-4 w-4" />
                                          Choose Video File
                                        </Button>

                                        {lessonForm.uploadedVideoFile && (
                                          <div className="mt-3 rounded border border-green-200 bg-green-50 p-2 text-sm">
                                            <span className="text-green-700">
                                              Selected:{' '}
                                              {
                                                lessonForm.uploadedVideoFile
                                                  .name
                                              }
                                            </span>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                setLessonForm(prev => ({
                                                  ...prev,
                                                  uploadedVideoFile: undefined,
                                                }))
                                              }
                                              className="ml-2 h-6 w-6 p-0"
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="rounded-lg border-2 border-dashed border-slate-300 p-4">
                                      <div className="text-center">
                                        <Image className="mx-auto mb-2 h-6 w-6 text-slate-400" />
                                        <p className="mb-2 text-sm text-slate-600">
                                          Upload Thumbnail (Optional)
                                        </p>
                                        <p className="mb-3 text-xs text-slate-500">
                                          JPG, PNG, WebP (max 5MB).
                                          Auto-generated if not provided.
                                        </p>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              setLessonForm(prev => ({
                                                ...prev,
                                                uploadedThumbnailFile: file,
                                              }));
                                            }
                                          }}
                                          className="hidden"
                                          id="thumbnail-upload"
                                        />
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            document
                                              .getElementById(
                                                'thumbnail-upload'
                                              )
                                              ?.click()
                                          }
                                        >
                                          <Image className="mr-2 h-4 w-4" />
                                          Choose Image
                                        </Button>

                                        {lessonForm.uploadedThumbnailFile && (
                                          <div className="mt-3 rounded border border-green-200 bg-green-50 p-2 text-sm">
                                            <span className="text-green-700">
                                              Selected:{' '}
                                              {
                                                lessonForm.uploadedThumbnailFile
                                                  .name
                                              }
                                            </span>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                setLessonForm(prev => ({
                                                  ...prev,
                                                  uploadedThumbnailFile:
                                                    undefined,
                                                }))
                                              }
                                              className="ml-2 h-6 w-6 p-0"
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Audio Upload Section */}
                                {(lessonForm.lessonType === 'video' ||
                                  lessonForm.lessonType === 'interactive') && (
                                  <div className="space-y-4">
                                    <h5 className="text-sm font-medium text-slate-600">
                                      Audio Upload
                                    </h5>

                                    <div className="rounded-lg border-2 border-dashed border-slate-300 p-4">
                                      <div className="text-center">
                                        <Music className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                                        <p className="mb-2 text-sm text-slate-600">
                                          Upload Audio File (Optional)
                                        </p>
                                        <p className="mb-3 text-xs text-slate-500">
                                          MP3, WAV, AAC (max 50MB). For
                                          background music, narration, or
                                          audio-only lessons.
                                        </p>
                                        <input
                                          type="file"
                                          accept="audio/*"
                                          onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              setLessonForm(prev => ({
                                                ...prev,
                                                uploadedAudioFile: file,
                                              }));
                                            }
                                          }}
                                          className="hidden"
                                          id="audio-upload"
                                        />
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            document
                                              .getElementById('audio-upload')
                                              ?.click()
                                          }
                                        >
                                          <Music className="mr-2 h-4 w-4" />
                                          Choose Audio File
                                        </Button>

                                        {lessonForm.uploadedAudioFile && (
                                          <div className="mt-3 rounded border border-green-200 bg-green-50 p-2 text-sm">
                                            <span className="text-green-700">
                                              Selected:{' '}
                                              {
                                                lessonForm.uploadedAudioFile
                                                  .name
                                              }
                                            </span>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                setLessonForm(prev => ({
                                                  ...prev,
                                                  uploadedAudioFile: undefined,
                                                }))
                                              }
                                              className="ml-2 h-6 w-6 p-0"
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </TabsContent>

                              <TabsContent
                                value="attachments"
                                className="space-y-4"
                              >
                                <div>
                                  <Label htmlFor="attachments">
                                    Tài liệu đính kèm (Documents)
                                  </Label>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Upload các tài liệu bổ sung như PDF, Word,
                                    slides, etc.
                                  </p>
                                  <div className="mt-3 space-y-4">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xlsx,.xls"
                                        onChange={e => {
                                          const files = Array.from(
                                            e.target.files || []
                                          );
                                          if (files.length > 0) {
                                            setLessonForm(prev => ({
                                              ...prev,
                                              uploadedAttachments: [
                                                ...(prev.uploadedAttachments ||
                                                  []),
                                                ...files,
                                              ],
                                            }));
                                          }
                                        }}
                                        className="hidden"
                                        id="attachments-upload"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          document
                                            .getElementById(
                                              'attachments-upload'
                                            )
                                            ?.click()
                                        }
                                      >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Choose Files
                                      </Button>
                                    </div>

                                    {lessonForm.uploadedAttachments &&
                                      lessonForm.uploadedAttachments.length >
                                        0 && (
                                        <div className="mt-3 space-y-2">
                                          <p className="text-sm font-medium">
                                            Selected files (
                                            {
                                              lessonForm.uploadedAttachments
                                                .length
                                            }
                                            ):
                                          </p>
                                          {lessonForm.uploadedAttachments.map(
                                            (file, index) => (
                                              <div
                                                key={index}
                                                className="flex items-center justify-between rounded border border-green-200 bg-green-50 p-2 text-sm"
                                              >
                                                <div className="flex items-center space-x-2">
                                                  <FileText className="h-4 w-4 text-green-600" />
                                                  <span className="text-green-700">
                                                    {file.name}
                                                  </span>
                                                  <span className="text-xs text-green-600">
                                                    (
                                                    {(
                                                      file.size /
                                                      1024 /
                                                      1024
                                                    ).toFixed(2)}{' '}
                                                    MB)
                                                  </span>
                                                </div>
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() =>
                                                    setLessonForm(prev => ({
                                                      ...prev,
                                                      uploadedAttachments:
                                                        prev.uploadedAttachments?.filter(
                                                          (_, i) => i !== index
                                                        ),
                                                    }))
                                                  }
                                                  className="h-6 w-6 p-0"
                                                >
                                                  <X className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent
                                value="settings"
                                className="space-y-4"
                              >
                                <h4 className="border-b pb-2 text-sm font-semibold text-slate-700">
                                  Lesson Settings
                                </h4>

                                <div className="space-y-4 rounded-lg bg-slate-50 p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <Label htmlFor="allow-comments">
                                        Allow Comments
                                      </Label>
                                      <p className="text-xs text-slate-500">
                                        Students can comment on this lesson
                                      </p>
                                    </div>
                                    <Switch
                                      id="allow-comments"
                                      checked={
                                        lessonForm.settings.allowComments
                                      }
                                      onCheckedChange={checked =>
                                        setLessonForm(prev => ({
                                          ...prev,
                                          settings: {
                                            ...prev.settings,
                                            allowComments: checked,
                                          },
                                        }))
                                      }
                                    />
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div>
                                      <Label htmlFor="show-progress">
                                        Show Progress
                                      </Label>
                                      <p className="text-xs text-slate-500">
                                        Display progress bar during lesson
                                      </p>
                                    </div>
                                    <Switch
                                      id="show-progress"
                                      checked={lessonForm.settings.showProgress}
                                      onCheckedChange={checked =>
                                        setLessonForm(prev => ({
                                          ...prev,
                                          settings: {
                                            ...prev.settings,
                                            showProgress: checked,
                                          },
                                        }))
                                      }
                                    />
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div>
                                      <Label htmlFor="allow-download">
                                        Allow Download
                                      </Label>
                                      <p className="text-xs text-slate-500">
                                        Students can download lesson materials
                                      </p>
                                    </div>
                                    <Switch
                                      id="allow-download"
                                      checked={
                                        lessonForm.settings.allowDownload
                                      }
                                      onCheckedChange={checked =>
                                        setLessonForm(prev => ({
                                          ...prev,
                                          settings: {
                                            ...prev.settings,
                                            allowDownload: checked,
                                          },
                                        }))
                                      }
                                    />
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div>
                                      <Label htmlFor="auto-play">
                                        Auto Play
                                      </Label>
                                      <p className="text-xs text-slate-500">
                                        Automatically start video when lesson
                                        opens
                                      </p>
                                    </div>
                                    <Switch
                                      id="auto-play"
                                      checked={lessonForm.settings.autoPlay}
                                      onCheckedChange={checked =>
                                        setLessonForm(prev => ({
                                          ...prev,
                                          settings: {
                                            ...prev.settings,
                                            autoPlay: checked,
                                          },
                                        }))
                                      }
                                    />
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div>
                                      <Label htmlFor="show-transcript">
                                        Show Transcript
                                      </Label>
                                      <p className="text-xs text-slate-500">
                                        Display video transcript/subtitles
                                      </p>
                                    </div>
                                    <Switch
                                      id="show-transcript"
                                      checked={
                                        lessonForm.settings.showTranscript
                                      }
                                      onCheckedChange={checked =>
                                        setLessonForm(prev => ({
                                          ...prev,
                                          settings: {
                                            ...prev.settings,
                                            showTranscript: checked,
                                          },
                                        }))
                                      }
                                    />
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent
                                value="advanced"
                                className="space-y-6"
                              >
                                <h4 className="border-b pb-2 text-sm font-semibold text-slate-700">
                                  Advanced Settings
                                </h4>

                                {/* Duration & Points */}
                                <div className="space-y-4">
                                  <h5 className="text-sm font-semibold text-slate-600">
                                    Duration & Scoring
                                  </h5>

                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <Label htmlFor="lesson-duration">
                                        Video Duration (min)
                                      </Label>
                                      <Input
                                        id="lesson-duration"
                                        type="number"
                                        value={lessonForm.duration}
                                        onChange={e =>
                                          setLessonForm(prev => ({
                                            ...prev,
                                            duration:
                                              parseInt(e.target.value) || 0,
                                          }))
                                        }
                                        placeholder="0"
                                        className="mt-1"
                                      />
                                      <p className="mt-1 text-xs text-slate-500">
                                        Actual video length
                                      </p>
                                    </div>

                                    <div>
                                      <Label htmlFor="estimated-duration">
                                        Estimated Duration (min)
                                      </Label>
                                      <Input
                                        id="estimated-duration"
                                        type="number"
                                        value={lessonForm.estimatedDuration}
                                        onChange={e =>
                                          setLessonForm(prev => ({
                                            ...prev,
                                            estimatedDuration:
                                              parseInt(e.target.value) || 0,
                                          }))
                                        }
                                        placeholder="0"
                                        className="mt-1"
                                      />
                                      <p className="mt-1 text-xs text-slate-500">
                                        Time to complete
                                      </p>
                                    </div>

                                    <div>
                                      <Label htmlFor="lesson-points">
                                        Points
                                      </Label>
                                      <Input
                                        id="lesson-points"
                                        type="number"
                                        value={lessonForm.points}
                                        onChange={e =>
                                          setLessonForm(prev => ({
                                            ...prev,
                                            points:
                                              parseInt(e.target.value) || 0,
                                          }))
                                        }
                                        placeholder="0"
                                        className="mt-1"
                                      />
                                      <p className="mt-1 text-xs text-slate-500">
                                        Achievement points
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Availability */}
                                <div className="space-y-4">
                                  <h5 className="text-sm font-semibold text-slate-600">
                                    Availability
                                  </h5>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="lesson-available-from">
                                        Available From (Optional)
                                      </Label>
                                      <Input
                                        id="lesson-available-from"
                                        type="datetime-local"
                                        value={lessonForm.availableFrom}
                                        onChange={e =>
                                          setLessonForm(prev => ({
                                            ...prev,
                                            availableFrom: e.target.value,
                                          }))
                                        }
                                        className="mt-1"
                                      />
                                      <p className="mt-1 text-xs text-slate-500">
                                        When this lesson becomes available
                                      </p>
                                    </div>

                                    <div>
                                      <Label htmlFor="lesson-available-until">
                                        Available Until (Optional)
                                      </Label>
                                      <Input
                                        id="lesson-available-until"
                                        type="datetime-local"
                                        value={lessonForm.availableUntil}
                                        onChange={e =>
                                          setLessonForm(prev => ({
                                            ...prev,
                                            availableUntil: e.target.value,
                                          }))
                                        }
                                        className="mt-1"
                                      />
                                      <p className="mt-1 text-xs text-slate-500">
                                        When this lesson expires
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Settings */}
                                <div className="space-y-4">
                                  <h5 className="text-sm font-semibold text-slate-600">
                                    Lesson Settings
                                  </h5>

                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <Label htmlFor="lesson-preview">
                                          Free Preview
                                        </Label>
                                        <p className="text-xs text-slate-500">
                                          Allow non-enrolled users to view this
                                          lesson
                                        </p>
                                      </div>
                                      <Switch
                                        id="lesson-preview"
                                        checked={lessonForm.isPreview}
                                        onCheckedChange={checked =>
                                          setLessonForm(prev => ({
                                            ...prev,
                                            isPreview: checked,
                                          }))
                                        }
                                      />
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <div>
                                        <Label htmlFor="lesson-mandatory">
                                          Mandatory Lesson
                                        </Label>
                                        <p className="text-xs text-slate-500">
                                          Students must complete this lesson to
                                          progress
                                        </p>
                                      </div>
                                      <Switch
                                        id="lesson-mandatory"
                                        checked={lessonForm.isMandatory}
                                        onCheckedChange={checked =>
                                          setLessonForm(prev => ({
                                            ...prev,
                                            isMandatory: checked,
                                          }))
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Learning Objectives */}
                                <div className="space-y-4">
                                  <h5 className="text-sm font-semibold text-slate-600">
                                    Learning Objectives
                                  </h5>

                                  <div className="space-y-2">
                                    {lessonForm.objectives.map(
                                      (objective, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center space-x-2"
                                        >
                                          <Input
                                            value={objective}
                                            onChange={e => {
                                              const newObjectives = [
                                                ...lessonForm.objectives,
                                              ];
                                              newObjectives[index] =
                                                e.target.value;
                                              setLessonForm(prev => ({
                                                ...prev,
                                                objectives: newObjectives,
                                              }));
                                            }}
                                            placeholder={`Objective ${index + 1}`}
                                            className="flex-1"
                                          />
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              const newObjectives =
                                                lessonForm.objectives.filter(
                                                  (_, i) => i !== index
                                                );
                                              setLessonForm(prev => ({
                                                ...prev,
                                                objectives: newObjectives,
                                              }));
                                            }}
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                      )
                                    )}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setLessonForm(prev => ({
                                          ...prev,
                                          objectives: [...prev.objectives, ''],
                                        }));
                                      }}
                                      className="w-full"
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      Add Learning Objective
                                    </Button>
                                  </div>
                                </div>

                                {/* Prerequisites */}
                                <div className="space-y-4">
                                  <h5 className="text-sm font-semibold text-slate-600">
                                    Prerequisites
                                  </h5>

                                  <div className="space-y-2">
                                    {lessonForm.prerequisites.map(
                                      (prerequisite, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center space-x-2"
                                        >
                                          <Input
                                            value={prerequisite}
                                            onChange={e => {
                                              const newPrerequisites = [
                                                ...lessonForm.prerequisites,
                                              ];
                                              newPrerequisites[index] =
                                                e.target.value;
                                              setLessonForm(prev => ({
                                                ...prev,
                                                prerequisites: newPrerequisites,
                                              }));
                                            }}
                                            placeholder={`Prerequisite ${index + 1}`}
                                            className="flex-1"
                                          />
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              const newPrerequisites =
                                                lessonForm.prerequisites.filter(
                                                  (_, i) => i !== index
                                                );
                                              setLessonForm(prev => ({
                                                ...prev,
                                                prerequisites: newPrerequisites,
                                              }));
                                            }}
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                      )
                                    )}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setLessonForm(prev => ({
                                          ...prev,
                                          prerequisites: [
                                            ...prev.prerequisites,
                                            '',
                                          ],
                                        }));
                                      }}
                                      className="w-full"
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      Add Prerequisite
                                    </Button>
                                  </div>
                                  <p className="text-xs text-slate-500">
                                    Required knowledge or skills students should
                                    have before taking this lesson
                                  </p>
                                </div>
                              </TabsContent>
                            </Tabs>

                            <div className="flex items-center justify-between border-t pt-4">
                              <div className="text-sm text-slate-600">
                                {!lessonForm.title.trim() && (
                                  <span className="text-red-500">
                                    • Title is required
                                  </span>
                                )}
                                {lessonForm.title.trim() &&
                                  !lessonForm.description.trim() && (
                                    <span className="text-red-500">
                                      • Description is required
                                    </span>
                                  )}
                                {lessonForm.title.trim() &&
                                  lessonForm.description.trim() && (
                                    <span className="text-green-600">
                                      • Ready to create
                                    </span>
                                  )}
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setIsAddingLessonOpen(false);
                                    setActiveSection('');
                                    resetLessonForm();
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleCreateLesson(sec.id)}
                                  disabled={
                                    !lessonForm.title.trim() ||
                                    !lessonForm.description.trim() ||
                                    isCreatingLesson
                                  }
                                  className="bg-gradient-to-r from-blue-500 to-indigo-600"
                                >
                                  {isCreatingLesson ? (
                                    <>
                                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                      Creating...
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="mr-2 h-4 w-4" />
                                      Create Lesson
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Content Summary */}
      {sections.length > 0 && (
        <div className="mt-8 rounded-lg border bg-white p-4 shadow-sm">
          <h4 className="mb-3 text-lg font-semibold text-slate-800">
            📊 Course Content Summary
          </h4>
          <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-5">
            <div className="rounded-lg bg-blue-50 p-3">
              <Video className="mx-auto mb-2 h-6 w-6 text-blue-500" />
              <p className="text-2xl font-bold text-blue-700">
                {fileStats?.filesByType?.video || 0}
              </p>
              <p className="text-xs text-blue-600">Videos</p>
              <p className="text-xs text-slate-500">From uploads</p>
            </div>
            <div className="rounded-lg bg-orange-50 p-3">
              <Music className="mx-auto mb-2 h-6 w-6 text-orange-500" />
              <p className="text-2xl font-bold text-orange-700">
                {fileStats?.filesByType?.audio || 0}
              </p>
              <p className="text-xs text-orange-600">Audio</p>
              <p className="text-xs text-slate-500">From uploads</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3">
              <Image className="mx-auto mb-2 h-6 w-6 text-purple-500" />
              <p className="text-2xl font-bold text-purple-700">
                {(fileStats?.filesByType?.image || 0) +
                  (fileStats?.filesByType?.thumbnail || 0)}
              </p>
              <p className="text-xs text-purple-600">Images</p>
              <p className="text-xs text-slate-500">Thumbs + images</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <FileText className="mx-auto mb-2 h-6 w-6 text-green-500" />
              <p className="text-2xl font-bold text-green-700">
                {fileStats?.filesByType?.document || 0}
              </p>
              <p className="text-xs text-green-600">Documents</p>
              <p className="text-xs text-slate-500">From uploads</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <Clock className="mx-auto mb-2 h-6 w-6 text-slate-500" />
              <p className="text-2xl font-bold text-slate-700">
                {fileStats?.totalSizeMB ? Math.round(fileStats.totalSizeMB) : 0}
              </p>
              <p className="text-xs text-slate-600">MB Total</p>
              <p className="text-xs text-slate-500">Storage used</p>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Preview Dialog */}
      <Dialog
        open={previewLesson?.isOpen ?? false}
        onOpenChange={open => !open && setPreviewLesson(null)}
      >
        <DialogContent className="max-h-[85vh] max-w-5xl overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {previewLesson?.lesson.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">Lesson Preview</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {previewLesson && (
            <div className="space-y-8 py-4">
              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <div className="text-2xl font-bold text-blue-700">
                    {previewLesson.lesson.lessonType}
                  </div>
                  <div className="text-xs uppercase tracking-wide text-blue-600">
                    Type
                  </div>
                </div>
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <div className="text-2xl font-bold text-green-700">
                    {previewLesson.lesson.estimatedDuration || 0}
                  </div>
                  <div className="text-xs uppercase tracking-wide text-green-600">
                    Minutes
                  </div>
                </div>
                <div className="rounded-lg bg-purple-50 p-4 text-center">
                  <div className="text-2xl font-bold text-purple-700">
                    {previewLesson.lesson.points || 0}
                  </div>
                  <div className="text-xs uppercase tracking-wide text-purple-600">
                    Points
                  </div>
                </div>
                <div className="rounded-lg bg-orange-50 p-4 text-center">
                  <div className="flex justify-center gap-1">
                    {previewLesson.lesson.isPreview && (
                      <Badge variant="secondary" className="text-xs">
                        Preview
                      </Badge>
                    )}
                    {previewLesson.lesson.isMandatory && (
                      <Badge variant="default" className="text-xs">
                        Required
                      </Badge>
                    )}
                    {!previewLesson.lesson.isPreview &&
                      !previewLesson.lesson.isMandatory && (
                        <Badge variant="outline" className="text-xs">
                          Standard
                        </Badge>
                      )}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-orange-600">
                    Status
                  </div>
                </div>
              </div>

              {/* Description Section */}
              {previewLesson.lesson.description && (
                <div className="rounded-lg bg-slate-50 p-6">
                  <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800">
                    <FileText className="h-5 w-5 text-slate-600" />
                    Description
                  </h4>
                  <p className="leading-relaxed text-slate-700">
                    {previewLesson.lesson.description}
                  </p>
                </div>
              )}

              {/* Content Section */}
              {previewLesson.lesson.content && (
                <div className="rounded-lg border bg-white p-6">
                  <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
                    <BookOpen className="h-5 w-5 text-slate-600" />
                    Lesson Content
                  </h4>
                  <div
                    className="prose prose-sm max-w-none text-slate-700"
                    dangerouslySetInnerHTML={{
                      __html: previewLesson.lesson.content,
                    }}
                  />
                </div>
              )}

              {/* Media Section */}
              {(previewLesson.lesson.videoUrl ||
                previewLesson.lesson.audioUrl) && (
                <div className="rounded-lg border bg-white p-6">
                  <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
                    <Video className="h-5 w-5 text-slate-600" />
                    Media Resources
                  </h4>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {previewLesson.lesson.videoUrl && (
                      <div className="rounded-lg bg-blue-50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <PlayCircle className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-blue-800">
                            Video Content
                          </span>
                        </div>
                        <p className="break-all font-mono text-sm text-blue-700">
                          {previewLesson.lesson.videoUrl}
                        </p>
                        {previewLesson.lesson.videoDuration && (
                          <p className="mt-2 text-xs text-blue-600">
                            Duration:{' '}
                            {Math.floor(
                              previewLesson.lesson.videoDuration / 60
                            )}
                            :
                            {(previewLesson.lesson.videoDuration % 60)
                              .toString()
                              .padStart(2, '0')}
                          </p>
                        )}
                      </div>
                    )}
                    {previewLesson.lesson.audioUrl && (
                      <div className="rounded-lg bg-orange-50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Music className="h-5 w-5 text-orange-600" />
                          <span className="font-medium text-orange-800">
                            Audio Content
                          </span>
                        </div>
                        <p className="break-all font-mono text-sm text-orange-700">
                          {previewLesson.lesson.audioUrl}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Learning Objectives */}
              {previewLesson.lesson.objectives &&
                previewLesson.lesson.objectives.length > 0 && (
                  <div className="rounded-lg bg-green-50 p-6">
                    <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-800">
                      <Tag className="h-5 w-5 text-green-600" />
                      Learning Objectives
                    </h4>
                    <ul className="space-y-2">
                      {previewLesson.lesson.objectives.map((objective, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-200">
                            <span className="text-xs font-medium text-green-800">
                              {idx + 1}
                            </span>
                          </div>
                          <span className="leading-relaxed text-green-700">
                            {objective}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Prerequisites */}
              {previewLesson.lesson.prerequisites &&
                previewLesson.lesson.prerequisites.length > 0 && (
                  <div className="rounded-lg bg-amber-50 p-6">
                    <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-amber-800">
                      <Languages className="h-5 w-5 text-amber-600" />
                      Prerequisites
                    </h4>
                    <ul className="space-y-2">
                      {previewLesson.lesson.prerequisites.map(
                        (prerequisite, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-200">
                              <span className="text-xs font-medium text-amber-800">
                                !
                              </span>
                            </div>
                            <span className="leading-relaxed text-amber-700">
                              {prerequisite}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {/* Attachments */}
              {previewLesson.lesson.attachments &&
                previewLesson.lesson.attachments.length > 0 && (
                  <div className="rounded-lg bg-slate-50 p-6">
                    <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
                      <Paperclip className="h-5 w-5 text-slate-600" />
                      Attachments ({previewLesson.lesson.attachments.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {previewLesson.lesson.attachments.map(
                        (attachment, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg border bg-white p-4 transition-colors hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                                <FileText className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-slate-800">
                                  {attachment.filename}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {(attachment.fileSize / 1024 / 1024).toFixed(
                                    2
                                  )}{' '}
                                  MB • {attachment.mimeType}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}

          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setPreviewLesson(null)}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Close Preview
            </Button>
            <Button
              onClick={() => {
                if (previewLesson) {
                  const currentLesson = previewLesson.lesson;
                  setPreviewLesson(null);
                  // Find the section ID for this lesson
                  const sectionWithLesson = sections.find(
                    section =>
                      section.lessons?.some(
                        lesson => lesson.id === currentLesson.id
                      ) ||
                      section.data?.lessons?.some(
                        lesson => lesson.id === currentLesson.id
                      )
                  );
                  handleEditLesson(
                    currentLesson,
                    sectionWithLesson?.data?.id || ''
                  );
                }
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Edit3 className="h-4 w-4" />
              Edit Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog
        open={editLesson?.isOpen ?? false}
        onOpenChange={open => !open && setEditLesson(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-slate-600" />
              Edit Lesson: {editLesson?.lesson.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="attachments">Files</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <h4 className="border-b pb-2 text-sm font-semibold text-slate-700">
                  Basic Information
                </h4>

                <div>
                  <Label htmlFor="edit-lesson-title">Lesson Title</Label>
                  <Input
                    id="edit-lesson-title"
                    value={lessonForm.title}
                    onChange={e =>
                      setLessonForm(prev => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="e.g., Introduction to Components"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-lesson-type">Lesson Type</Label>
                  <Select
                    value={lessonForm.lessonType}
                    onValueChange={(value: any) =>
                      setLessonForm(prev => ({
                        ...prev,
                        lessonType: value,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Lesson</SelectItem>
                      <SelectItem value="text">Text/Article</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="interactive">Interactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-lesson-description">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="edit-lesson-description"
                    value={lessonForm.description}
                    onChange={e =>
                      setLessonForm(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="What will students learn in this lesson?"
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <h4 className="border-b pb-2 text-sm font-semibold text-slate-700">
                  Lesson Content
                </h4>

                <div>
                  <Label htmlFor="edit-lesson-content">Main Content</Label>
                  <RichTextEditor
                    value={lessonForm.content}
                    onChange={value =>
                      setLessonForm(prev => ({
                        ...prev,
                        content: value,
                      }))
                    }
                    placeholder="Write comprehensive lesson content with rich formatting..."
                    minHeight={400}
                    showWordCount={true}
                    enableAdvancedFeatures={true}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Rich text content with formatting, links, and media support
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Content Difficulty</Label>
                    <Select
                      value={lessonForm.metadata.difficulty}
                      onValueChange={(value: any) =>
                        setLessonForm(prev => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            difficulty: value,
                          },
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Content Language</Label>
                    <Select
                      value={lessonForm.metadata.language}
                      onValueChange={value =>
                        setLessonForm(prev => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            language: value,
                          },
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vi">Tiếng Việt</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Content Tags</Label>
                  <div className="mt-2 space-y-3">
                    {/* Tag Input */}
                    <Input
                      value={lessonTagInput}
                      onChange={e => setLessonTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && lessonTagInput.trim()) {
                          e.preventDefault();
                          const newTag = lessonTagInput.trim();
                          if (!lessonForm.metadata.tags.includes(newTag)) {
                            setLessonForm(prev => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                tags: [...prev.metadata.tags, newTag],
                              },
                            }));
                          }
                          setLessonTagInput('');
                        }
                      }}
                      placeholder="Type a tag and press Enter to add"
                      className="border-white/20 bg-white/80 backdrop-blur-sm"
                    />

                    {/* Tags Display */}
                    {lessonForm.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {lessonForm.metadata.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1 bg-blue-100 px-3 py-1 text-blue-800 hover:bg-blue-200"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newTags = lessonForm.metadata.tags.filter(
                                  (_, i) => i !== index
                                );
                                setLessonForm(prev => ({
                                  ...prev,
                                  metadata: {
                                    ...prev.metadata,
                                    tags: newTags,
                                  },
                                }));
                              }}
                              className="ml-1 rounded-full p-0.5 hover:bg-blue-300"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Type tags and press Enter to add them. Click ✕ to remove.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4">
                <h4 className="border-b pb-2 text-sm font-semibold text-slate-700">
                  Media Content
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-video-url">Video URL</Label>
                    <Input
                      id="edit-video-url"
                      value={lessonForm.videoUrl}
                      onChange={e =>
                        setLessonForm(prev => ({
                          ...prev,
                          videoUrl: e.target.value,
                        }))
                      }
                      placeholder="https://youtube.com/watch?v=..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-audio-url">Audio URL</Label>
                    <Input
                      id="edit-audio-url"
                      value={lessonForm.audioUrl}
                      onChange={e =>
                        setLessonForm(prev => ({
                          ...prev,
                          audioUrl: e.target.value,
                        }))
                      }
                      placeholder="https://example.com/audio.mp3"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-estimated-duration">
                      Estimated Duration (minutes)
                    </Label>
                    <Input
                      id="edit-estimated-duration"
                      type="number"
                      value={lessonForm.estimatedDuration}
                      onChange={e =>
                        setLessonForm(prev => ({
                          ...prev,
                          estimatedDuration: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="30"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-video-duration">
                      Video Duration (seconds)
                    </Label>
                    <Input
                      id="edit-video-duration"
                      type="number"
                      value={lessonForm.videoDuration}
                      onChange={e =>
                        setLessonForm(prev => ({
                          ...prev,
                          videoDuration: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="1800"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-points">Points</Label>
                    <Input
                      id="edit-points"
                      type="number"
                      value={lessonForm.points}
                      onChange={e =>
                        setLessonForm(prev => ({
                          ...prev,
                          points: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="10"
                      className="mt-1"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="attachments" className="space-y-4">
                <h4 className="border-b pb-2 text-sm font-semibold text-slate-700">
                  Attachments & Resources
                </h4>
                <p className="text-sm text-slate-600">
                  File attachments are managed through lesson media uploads.
                </p>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <h4 className="border-b pb-2 text-sm font-semibold text-slate-700">
                  Lesson Settings
                </h4>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="edit-preview"
                        checked={lessonForm.isPreview}
                        onCheckedChange={checked =>
                          setLessonForm(prev => ({
                            ...prev,
                            isPreview: checked,
                          }))
                        }
                      />
                      <Label htmlFor="edit-preview">Allow Preview</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="edit-mandatory"
                        checked={lessonForm.isMandatory}
                        onCheckedChange={checked =>
                          setLessonForm(prev => ({
                            ...prev,
                            isMandatory: checked,
                          }))
                        }
                      />
                      <Label htmlFor="edit-mandatory">Mandatory Lesson</Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-available-from">
                        Available From
                      </Label>
                      <Input
                        id="edit-available-from"
                        type="datetime-local"
                        value={lessonForm.availableFrom}
                        onChange={e =>
                          setLessonForm(prev => ({
                            ...prev,
                            availableFrom: e.target.value,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-available-until">
                        Available Until
                      </Label>
                      <Input
                        id="edit-available-until"
                        type="datetime-local"
                        value={lessonForm.availableUntil}
                        onChange={e =>
                          setLessonForm(prev => ({
                            ...prev,
                            availableUntil: e.target.value,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <h4 className="border-b pb-2 text-sm font-semibold text-slate-700">
                  Advanced Settings
                </h4>

                {/* Learning Objectives */}
                <div className="space-y-4">
                  <h5 className="text-sm font-semibold text-slate-600">
                    Learning Objectives
                  </h5>

                  <div className="space-y-2">
                    {lessonForm.objectives.map((objective, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={objective}
                          onChange={e => {
                            const newObjectives = [...lessonForm.objectives];
                            newObjectives[index] = e.target.value;
                            setLessonForm(prev => ({
                              ...prev,
                              objectives: newObjectives,
                            }));
                          }}
                          placeholder={`Objective ${index + 1}`}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newObjectives = lessonForm.objectives.filter(
                              (_, i) => i !== index
                            );
                            setLessonForm(prev => ({
                              ...prev,
                              objectives: newObjectives,
                            }));
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLessonForm(prev => ({
                          ...prev,
                          objectives: [...prev.objectives, ''],
                        }));
                      }}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Learning Objective
                    </Button>
                  </div>
                </div>

                {/* Prerequisites */}
                <div className="space-y-4">
                  <h5 className="text-sm font-semibold text-slate-600">
                    Prerequisites
                  </h5>

                  <div className="space-y-2">
                    {lessonForm.prerequisites.map((prerequisite, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={prerequisite}
                          onChange={e => {
                            const newPrerequisites = [
                              ...lessonForm.prerequisites,
                            ];
                            newPrerequisites[index] = e.target.value;
                            setLessonForm(prev => ({
                              ...prev,
                              prerequisites: newPrerequisites,
                            }));
                          }}
                          placeholder={`Prerequisite ${index + 1}`}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newPrerequisites =
                              lessonForm.prerequisites.filter(
                                (_, i) => i !== index
                              );
                            setLessonForm(prev => ({
                              ...prev,
                              prerequisites: newPrerequisites,
                            }));
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLessonForm(prev => ({
                          ...prev,
                          prerequisites: [...prev.prerequisites, ''],
                        }));
                      }}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Prerequisite
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Required knowledge or skills students should have before
                    taking this lesson
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-slate-600">
                {!lessonForm.title.trim() && (
                  <span className="text-red-500">• Title is required</span>
                )}
                {lessonForm.title.trim() && !lessonForm.description.trim() && (
                  <span className="text-red-500">
                    • Description is required
                  </span>
                )}
                {lessonForm.title.trim() && lessonForm.description.trim() && (
                  <span className="text-green-600">
                    • Ready to save changes
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditLesson(null);
                    resetLessonForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEditedLesson}
                  disabled={
                    !lessonForm.title.trim() ||
                    !lessonForm.description.trim() ||
                    isUpdatingLesson
                  }
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isUpdatingLesson ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog
        open={isEditingSectionOpen}
        onOpenChange={setIsEditingSectionOpen}
      >
        <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>
          <div className="flex-1 space-y-6 overflow-y-auto">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="border-b pb-2 text-sm font-semibold text-slate-700">
                Basic Information
              </h4>

              <div>
                <Label htmlFor="edit-section-title">Section Title</Label>
                <Input
                  id="edit-section-title"
                  value={sectionForm.title}
                  onChange={e =>
                    setSectionForm(prev => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter section title..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-section-description">Description</Label>
                <Textarea
                  id="edit-section-description"
                  value={sectionForm.description}
                  onChange={e =>
                    setSectionForm(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe what students will learn in this section..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Section Settings */}
            <div className="space-y-4">
              <h4 className="border-b pb-2 text-sm font-semibold text-slate-700">
                Section Settings
              </h4>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-section-required"
                  checked={sectionForm.isRequired}
                  onCheckedChange={checked =>
                    setSectionForm(prev => ({ ...prev, isRequired: checked }))
                  }
                />
                <Label htmlFor="edit-section-required">
                  This section is required
                </Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-section-available-from">
                    Available From (Optional)
                  </Label>
                  <Input
                    id="edit-section-available-from"
                    type="datetime-local"
                    value={sectionForm.availableFrom}
                    onChange={e =>
                      setSectionForm(prev => ({
                        ...prev,
                        availableFrom: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-section-available-until">
                    Available Until (Optional)
                  </Label>
                  <Input
                    id="edit-section-available-until"
                    type="datetime-local"
                    value={sectionForm.availableUntil}
                    onChange={e =>
                      setSectionForm(prev => ({
                        ...prev,
                        availableUntil: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Learning Objectives */}
            <div className="space-y-4">
              <h4 className="border-b pb-2 text-sm font-semibold text-slate-700">
                Learning Objectives
              </h4>

              <div className="space-y-2">
                {sectionForm.objectives.map((objective, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={objective}
                      onChange={e => {
                        const newObjectives = [...sectionForm.objectives];
                        newObjectives[index] = e.target.value;
                        setSectionForm(prev => ({
                          ...prev,
                          objectives: newObjectives,
                        }));
                      }}
                      placeholder={`Objective ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newObjectives = sectionForm.objectives.filter(
                          (_, i) => i !== index
                        );
                        setSectionForm(prev => ({
                          ...prev,
                          objectives: newObjectives,
                        }));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSectionForm(prev => ({
                      ...prev,
                      objectives: [...prev.objectives, ''],
                    }))
                  }
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Objective
                </Button>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="space-y-4">
              <h4 className="border-b pb-2 text-sm font-semibold text-slate-700">
                Advanced Settings
              </h4>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-allow-downloads"
                    checked={sectionForm.settings.allowDownloads}
                    onCheckedChange={checked =>
                      setSectionForm(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          allowDownloads: checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="edit-allow-downloads">
                    Allow downloads for this section
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-sequential-access"
                    checked={sectionForm.settings.requireSequentialAccess}
                    onCheckedChange={checked =>
                      setSectionForm(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          requireSequentialAccess: checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="edit-sequential-access">
                    Require sequential access (students must complete lessons in
                    order)
                  </Label>
                </div>

                <div>
                  <Label htmlFor="edit-completion-criteria">
                    Completion Criteria
                  </Label>
                  <Select
                    value={sectionForm.settings.completionCriteria}
                    onValueChange={value =>
                      setSectionForm(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          completionCriteria: value as
                            | 'all_lessons'
                            | 'percentage'
                            | 'time_based',
                        },
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_lessons">
                        Complete all lessons
                      </SelectItem>
                      <SelectItem value="percentage">
                        Complete percentage of lessons
                      </SelectItem>
                      <SelectItem value="time_based">
                        Spend minimum time in section
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with validation and actions */}
          <div className="flex-shrink-0 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                {!sectionForm.title.trim() && (
                  <span className="text-red-500">• Title is required</span>
                )}
                {sectionForm.title.trim() &&
                  !sectionForm.description.trim() && (
                    <span className="text-red-500">
                      • Description is required
                    </span>
                  )}
                {sectionForm.title.trim() && sectionForm.description.trim() && (
                  <span className="text-green-600">
                    • Ready to save changes
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingSectionOpen(false);
                    setEditingSection(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    editingSection && handleEditSection(editingSection)
                  }
                  disabled={
                    !sectionForm.title.trim() ||
                    !sectionForm.description.trim() ||
                    isUpdatingSection
                  }
                >
                  {isUpdatingSection ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm?.isOpen ?? false}
        onOpenChange={open => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteConfirm?.type === 'section' ? 'Section' : 'Lesson'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm?.type === 'section' ? (
                <>
                  Are you sure you want to delete the section "
                  <strong>{deleteConfirm.title}</strong>"?
                  <br />
                  <span className="font-medium text-red-600">
                    All lessons in this section will also be deleted.
                  </span>
                  <br />
                  This action cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to delete the lesson "
                  <strong>{deleteConfirm?.title}</strong>"?
                  <br />
                  This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirm(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={
                deleteConfirm?.type === 'section'
                  ? confirmDeleteSection
                  : confirmDeleteLesson
              }
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete {deleteConfirm?.type === 'section' ? 'Section' : 'Lesson'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
