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
} from '@/components/ui/dialog';
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
    difficulty: 'beginner' | 'intermediate' | 'advanced';
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
  const [sections, setSections] = useState<CourseSection[]>(initialSections);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [isAddingSectionOpen, setIsAddingSectionOpen] = useState(false);
  const [isAddingLessonOpen, setIsAddingLessonOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  // API hooks
  const [createSection] = useCreateSectionMutation();
  const [updateSection] = useUpdateSectionMutation();
  const [deleteSection] = useDeleteSectionMutation();
  const [createLesson] = useCreateLessonMutation();
  const [updateLesson] = useUpdateLessonMutation();
  const [deleteLesson] = useDeleteLessonMutation();
  const [reorderSections] = useReorderSectionsMutation();
  const [reorderLessons] = useReorderLessonsMutation();
  const { uploadFile: directUpload } = useDirectUpload();

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
    duration: 0,
    isPreview: false,
    isMandatory: false,
    estimatedDuration: 0,
    points: 0,
    availableFrom: '',
    availableUntil: '',
    thumbnailUrl: '',
    objectives: [],
    prerequisites: [],
    uploadedVideoFile: undefined,
    uploadedVideoFileId: undefined,
    uploadedThumbnailFile: undefined,
    uploadedThumbnailFileId: undefined,
    uploadedAudioFile: undefined,
    uploadedAudioFileId: undefined,
    audioUrl: '',
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
      duration: 0,
      isPreview: false,
      isMandatory: false,
      estimatedDuration: 0,
      points: 0,
      availableFrom: '',
      availableUntil: '',
      thumbnailUrl: '',
      objectives: [],
      prerequisites: [],
      uploadedVideoFile: undefined,
      uploadedVideoFileId: undefined,
      uploadedThumbnailFile: undefined,
      uploadedThumbnailFileId: undefined,
      uploadedAudioFile: undefined,
      uploadedAudioFileId: undefined,
      audioUrl: '',
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

      const newSections = [...sections, result];
      setSections(newSections);
      onSectionsChange(newSections);

      toast({
        title: 'Section created',
        description: `"${sectionForm.title}" has been added to your course.`,
      });

      resetSectionForm();
      setIsAddingSectionOpen(false);
    } catch (error: any) {
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
          sections.find(s => s.id === sectionId)?.lessons?.length || 0,
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
              onProgress: (progress) => {
                // Handle progress if needed
              },
              metadata: { lessonTitle: lessonForm.title, type: 'lesson_video' }
            }
          );
          videoUrl = videoUploadResult.success ? videoUploadResult.fileRecord?.fileUrl : undefined;
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
              onProgress: (progress) => {
                // Handle progress if needed
              },
              metadata: { lessonTitle: lessonForm.title, type: 'lesson_thumbnail' }
            }
          );
          thumbnailUrl = thumbnailUploadResult.success ? thumbnailUploadResult.fileRecord?.fileUrl : undefined;
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
              onProgress: (progress) => {
                // Handle progress if needed
              },
              metadata: { lessonTitle: lessonForm.title, type: 'lesson_audio' }
            }
          );
          audioUrl = audioUploadResult.success ? audioUploadResult.fileRecord?.fileUrl : undefined;
        } catch (error: any) {
          toast({
            title: 'Audio upload failed',
            description: error?.message || 'Failed to upload audio file',
            variant: 'destructive',
          });
          // Don't return, continue
        }
      }

      // Update lesson with file URLs if any were uploaded
      if (videoUrl || thumbnailUrl || audioUrl) {
        try {
          await updateLesson({
            id: createdLessonId,
            data: {
              videoUrl: videoUrl,
              thumbnailUrl: thumbnailUrl,
              audioUrl: audioUrl,
            }
          }).unwrap();
        } catch (error: any) {
          toast({
            title: 'Failed to update lesson with file URLs',
            description: error?.message || 'Lesson created but file URLs not saved',
            variant: 'destructive',
          });
        }
      }

      const newSections = sections.map(section =>
        section.id === sectionId
          ? { ...section, lessons: [...(section.lessons || []), result] }
          : section
      );

      setSections(newSections);
      onSectionsChange(newSections);

      toast({
        title: 'Lesson created',
        description: `"${lessonForm.title}" has been added to the section.`,
      });

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

  const handleDeleteSection = async (sectionId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this section? All lessons in this section will also be deleted.'
      )
    ) {
      return;
    }

    try {
      await deleteSection(sectionId).unwrap();

      const newSections = sections.filter(s => s.id !== sectionId);
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
    }
  };

  const handleDeleteLesson = async (lessonId: string, sectionId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      await deleteLesson(lessonId).unwrap();

      const newSections = sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              lessons: section.lessons?.filter(l => l.id !== lessonId) || [],
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
                  disabled={!sectionForm.title.trim()}
                  className="bg-gradient-to-r from-emerald-500 to-green-600"
                >
                  Create Section
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
          {sections.map((section, sectionIndex) => (
            <Card key={section.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSectionExpansion(section.id)}
                      className="p-1"
                    >
                      {expandedSections.has(section.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    <div>
                      <CardTitle className="flex items-center space-x-2 text-base">
                        <span>
                          Section {sectionIndex + 1}: {section.title}
                        </span>
                        {section.isRequired && (
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="mt-1 text-sm text-slate-600">
                        {section.lessons?.length || 0} lessons •{' '}
                        {section.formattedDuration}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSection(section.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedSections.has(section.id) && (
                <CardContent className="pt-0">
                  {section.description && (
                    <p className="mb-4 text-sm text-slate-600">
                      {section.description}
                    </p>
                  )}

                  {/* Lessons */}
                  <div className="space-y-2">
                    {section.lessons?.map((lesson, lessonIndex) => (
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
                            className={getLessonTypeColor(lesson.lessonType)}
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
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteLesson(lesson.id, section.id)
                            }
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}

                    {/* Add Lesson Button */}
                    <Dialog
                      open={isAddingLessonOpen && activeSection === section.id}
                      onOpenChange={open => {
                        setIsAddingLessonOpen(open);
                        if (!open) setActiveSection('');
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="mt-2 w-full border-dashed"
                          onClick={() => setActiveSection(section.id)}
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
                            <TabsList className="grid w-full grid-cols-5">
                              <TabsTrigger value="basic">Basic</TabsTrigger>
                              <TabsTrigger value="content">Content</TabsTrigger>
                              <TabsTrigger value="media">Media</TabsTrigger>
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
                                <Label htmlFor="lesson-type">Lesson Type</Label>
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

                            <TabsContent value="content" className="space-y-4">
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
                                  Rich text content with formatting, links, and
                                  media support
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
                                <Input
                                  value={lessonForm.metadata.tags.join(', ')}
                                  onChange={e =>
                                    setLessonForm(prev => ({
                                      ...prev,
                                      metadata: {
                                        ...prev.metadata,
                                        tags: e.target.value
                                          .split(',')
                                          .map(tag => tag.trim())
                                          .filter(tag => tag),
                                      },
                                    }))
                                  }
                                  placeholder="Enter tags separated by commas"
                                  className="mt-1"
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                  Help categorize lesson content
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
                                        Supports MP4, WebM, MOV (max 2GB). Files
                                        will be uploaded to AWS S3 and processed
                                        automatically.
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
                                            {lessonForm.uploadedVideoFile.name}
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
                                        JPG, PNG, WebP (max 5MB). Auto-generated
                                        if not provided.
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
                                            .getElementById('thumbnail-upload')
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
                                        MP3, WAV, AAC (max 50MB). For background
                                        music, narration, or audio-only lessons.
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
                                            {lessonForm.uploadedAudioFile.name}
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

                            <TabsContent value="settings" className="space-y-4">
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
                                    checked={lessonForm.settings.allowComments}
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
                                    checked={lessonForm.settings.allowDownload}
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
                                    <Label htmlFor="auto-play">Auto Play</Label>
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
                                    checked={lessonForm.settings.showTranscript}
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

                            <TabsContent value="advanced" className="space-y-6">
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
                                          points: parseInt(e.target.value) || 0,
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
                                onClick={() => handleCreateLesson(section.id)}
                                disabled={
                                  !lessonForm.title.trim() ||
                                  !lessonForm.description.trim()
                                }
                                className="bg-gradient-to-r from-blue-500 to-indigo-600"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Lesson
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
          ))}
        </div>
      )}
    </div>
  );
}
