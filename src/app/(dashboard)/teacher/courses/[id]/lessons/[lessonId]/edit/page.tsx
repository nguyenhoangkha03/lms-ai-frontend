'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ChevronLeft,
  Save,
  Eye,
  Play,
  Upload,
  Image,
  Video,
  FileText,
  Link,
  Settings,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Plus,
  X,
  Edit3,
  Maximize2,
  Volume2,
  Download,
  Share2,
  Copy,
  Monitor,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  useGetTeacherLessonByIdQuery,
  useUpdateTeacherLessonMutation,
  useDeleteTeacherLessonMutation,
  usePublishLessonMutation,
  LessonType,
} from '@/lib/redux/api/teacher-lessons-api';
import useDirectUpload from '@/hooks/useDirectUpload';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { cn } from '@/lib/utils';
import { formatDuration, formatBytes } from '@/lib/utils';

interface LessonEditData {
  title: string;
  description: string;
  content: string;
  lessonType: LessonType;
  videoUrl: string;
  videoDuration: number;
  attachments: string[];
  isPreview: boolean;
  isMandatory: boolean;
  estimatedDuration: number;
  sortOrder: number;
  settings: {
    allowDownload: boolean;
    allowNotes: boolean;
    allowDiscussion: boolean;
    trackCompletion: boolean;
    requireFullWatch: boolean;
  };
  
  // File uploads
  videoFile: File | null;
  videoPreview: string;
  
  // Status
  status: string;
  isPublished: boolean;
}


export default function LessonEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const lessonId = params.id as string;

  // File input refs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // API mutations
  const [updateLesson, { isLoading: isUpdating }] = useUpdateTeacherLessonMutation();
  const [deleteLesson, { isLoading: isDeleting }] = useDeleteTeacherLessonMutation();
  const [publishLesson, { isLoading: isPublishing }] = usePublishLessonMutation();

  // Direct S3 Upload hook
  const { uploadFile, uploadProgress, uploadStatus, isUploading } = useDirectUpload();

  // Fetch lesson data
  const {
    data: lessonData,
    isLoading: isLoadingLesson,
    error: lessonError,
    refetch: refetchLesson,
  } = useGetTeacherLessonByIdQuery(lessonId);

  // State management
  const [activeTab, setActiveTab] = useState('content');
  const [isDirty, setIsDirty] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  const [lessonEditData, setLessonEditData] = useState<LessonEditData>({
    title: '',
    description: '',
    content: '',
    lessonType: LessonType.VIDEO,
    videoUrl: '',
    videoDuration: 0,
    attachments: [],
    isPreview: false,
    isMandatory: true,
    estimatedDuration: 0,
    sortOrder: 0,
    settings: {
      allowDownload: false,
      allowNotes: true,
      allowDiscussion: true,
      trackCompletion: true,
      requireFullWatch: false,
    },
    videoFile: null,
    videoPreview: '',
    status: 'draft',
    isPublished: false,
  });

  // Load lesson data when it's available
  useEffect(() => {
    if (lessonData) {
      setLessonEditData({
        title: lessonData.title || '',
        description: lessonData.description || '',
        content: lessonData.content || '',
        lessonType: lessonData.lessonType || LessonType.VIDEO,
        videoUrl: lessonData.videoUrl || '',
        videoDuration: lessonData.videoDuration || 0,
        attachments: lessonData.attachments || [],
        isPreview: lessonData.isPreview || false,
        isMandatory: lessonData.isMandatory !== undefined ? lessonData.isMandatory : true,
        estimatedDuration: lessonData.estimatedDuration || 0,
        sortOrder: lessonData.sortOrder || 0,
        settings: {
          allowDownload: lessonData.settings?.allowDownload || false,
          allowNotes: lessonData.settings?.allowNotes !== undefined ? lessonData.settings.allowNotes : true,
          allowDiscussion: lessonData.settings?.allowDiscussion !== undefined ? lessonData.settings.allowDiscussion : true,
          trackCompletion: lessonData.settings?.trackCompletion !== undefined ? lessonData.settings.trackCompletion : true,
          requireFullWatch: lessonData.settings?.requireFullWatch || false,
        },
        videoFile: null,
        videoPreview: lessonData.videoUrl || '',
        status: lessonData.status || 'draft',
        isPublished: lessonData.isPublished || false,
      });
    }
  }, [lessonData]);

  const updateLessonData = (updates: Partial<LessonEditData>) => {
    setLessonEditData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a video file',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > 500 * 1024 * 1024) { // 500MB limit
        toast({
          title: 'File too large',
          description: 'Please select a video smaller than 500MB',
          variant: 'destructive',
        });
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      
      if (lessonEditData.videoPreview && lessonEditData.videoPreview !== lessonEditData.videoUrl) {
        URL.revokeObjectURL(lessonEditData.videoPreview);
      }

      updateLessonData({
        videoFile: file,
        videoPreview: previewUrl,
        lessonType: LessonType.VIDEO,
      });

      // Get video duration
      const video = document.createElement('video');
      video.src = previewUrl;
      video.onloadedmetadata = () => {
        updateLessonData({
          videoDuration: Math.round(video.duration),
          estimatedDuration: Math.round(video.duration / 60), // Convert to minutes
        });
      };

      toast({
        title: 'Video selected',
        description: `${file.name} selected as lesson video`,
      });
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Prepare lesson data
      const { videoFile, videoPreview, ...updateData } = lessonEditData;
      console.log('🔄 Updating lesson with data:', updateData);

      await updateLesson({ id: lessonId, data: updateData }).unwrap();

      // Upload video file if new one is selected
      if (lessonEditData.videoFile) {
        try {
          const result = await uploadFile(
            lessonId,
            lessonEditData.videoFile,
            'lesson_video'
          );
          
          if (result.success && result.fileRecord) {
            updateLessonData({ videoUrl: result.fileRecord.fileUrl });
            toast({
              title: 'Video updated',
              description: 'Lesson video updated successfully',
            });
          }
        } catch (error) {
          console.error('Failed to upload video:', error);
        }
      }

      toast({
        title: 'Changes saved!',
        description: 'Lesson has been updated successfully.',
      });
      
      setIsDirty(false);
      refetchLesson();
    } catch (error: any) {
      console.error('❌ Lesson update failed:', error);
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to save changes',
        variant: 'destructive',
      });
    }
  };

  const handlePublishLesson = async () => {
    try {
      await publishLesson(lessonId).unwrap();
      
      toast({
        title: 'Lesson published!',
        description: 'Lesson is now available to students.',
      });
      
      setShowPublishDialog(false);
      refetchLesson();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to publish lesson',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLesson = async () => {
    try {
      await deleteLesson(lessonId).unwrap();
      
      toast({
        title: 'Lesson deleted',
        description: 'Lesson has been deleted successfully.',
      });
      
      router.back();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete lesson',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingLesson) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p>Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (lessonError || !lessonData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold">Lesson Not Found</h3>
              <p className="mb-4 text-muted-foreground">
                The lesson you're looking for doesn't exist or you don't have permission to edit it.
              </p>
              <Button onClick={() => router.back()}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Course
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'content':
        return (
          <motion.div
            key="content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="title" className="text-lg font-semibold">
                Lesson Title
              </Label>
              <Input
                id="title"
                value={lessonEditData.title}
                onChange={e => updateLessonData({ title: e.target.value })}
                placeholder="Enter lesson title..."
                className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-lg font-semibold">
                Lesson Description
              </Label>
              <Textarea
                id="description"
                value={lessonEditData.description}
                onChange={e => updateLessonData({ description: e.target.value })}
                placeholder="Brief description of the lesson content..."
                rows={3}
                className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lessonType" className="text-lg font-semibold">
                  Lesson Type
                </Label>
                <Select
                  value={lessonEditData.lessonType}
                  onValueChange={(value: LessonType) => updateLessonData({ lessonType: value })}
                >
                  <SelectTrigger className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LessonType.VIDEO}>Video Lesson</SelectItem>
                    <SelectItem value={LessonType.TEXT}>Text Content</SelectItem>
                    <SelectItem value={LessonType.QUIZ}>Quiz</SelectItem>
                    <SelectItem value={LessonType.ASSIGNMENT}>Assignment</SelectItem>
                    <SelectItem value={LessonType.INTERACTIVE}>Interactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estimatedDuration" className="text-lg font-semibold">
                  Duration (minutes)
                </Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  value={lessonEditData.estimatedDuration}
                  onChange={e => updateLessonData({ estimatedDuration: parseInt(e.target.value) })}
                  placeholder="15"
                  className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Video Content */}
            {lessonEditData.lessonType === LessonType.VIDEO && (
              <div>
                <Label className="text-lg font-semibold">Lesson Video</Label>
                <div className="mt-2 rounded-xl border-2 border-dashed border-white/30 bg-white/40 p-4 backdrop-blur-sm">
                  {lessonEditData.videoPreview ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <video
                          src={lessonEditData.videoPreview}
                          className="h-64 w-full rounded-lg object-cover"
                          controls
                          onTimeUpdate={(e) => setVideoCurrentTime(e.currentTarget.currentTime)}
                        />
                        <div className="absolute right-2 top-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              if (lessonEditData.videoPreview && lessonEditData.videoPreview !== lessonEditData.videoUrl) {
                                URL.revokeObjectURL(lessonEditData.videoPreview);
                              }
                              updateLessonData({
                                videoFile: null,
                                videoPreview: lessonEditData.videoUrl,
                              });
                            }}
                            className="bg-red-500 text-white hover:bg-red-600"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          Duration: {formatDuration(lessonEditData.videoDuration)}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="bg-white/80"
                          onClick={() => videoInputRef.current?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Change Video
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <Video className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                      <p className="mb-4 text-slate-600">Upload lesson video</p>
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-white/80"
                        onClick={() => videoInputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Choose Video
                      </Button>
                    </div>
                  )}
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* Text Content */}
            {lessonEditData.lessonType === LessonType.TEXT && (
              <div>
                <Label className="text-lg font-semibold">
                  Lesson Content
                </Label>
                <div className="mt-2">
                  <RichTextEditor
                    content={lessonEditData.content}
                    onChange={(content) => updateLessonData({ content })}
                    placeholder="Write your lesson content here..."
                  />
                </div>
              </div>
            )}
          </motion.div>
        );

      case 'settings':
        return (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Lesson Settings</Label>
              <div className="space-y-4 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isPreview">Preview Lesson</Label>
                    <p className="text-sm text-slate-500">Allow free preview of this lesson</p>
                  </div>
                  <Switch
                    id="isPreview"
                    checked={lessonEditData.isPreview}
                    onCheckedChange={checked => updateLessonData({ isPreview: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isMandatory">Mandatory</Label>
                    <p className="text-sm text-slate-500">Students must complete this lesson</p>
                  </div>
                  <Switch
                    id="isMandatory"
                    checked={lessonEditData.isMandatory}
                    onCheckedChange={checked => updateLessonData({ isMandatory: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowDownload">Allow Downloads</Label>
                    <p className="text-sm text-slate-500">Students can download lesson materials</p>
                  </div>
                  <Switch
                    id="allowDownload"
                    checked={lessonEditData.settings.allowDownload}
                    onCheckedChange={checked => updateLessonData({
                      settings: { ...lessonEditData.settings, allowDownload: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowNotes">Allow Notes</Label>
                    <p className="text-sm text-slate-500">Students can take notes during lesson</p>
                  </div>
                  <Switch
                    id="allowNotes"
                    checked={lessonEditData.settings.allowNotes}
                    onCheckedChange={checked => updateLessonData({
                      settings: { ...lessonEditData.settings, allowNotes: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowDiscussion">Allow Discussion</Label>
                    <p className="text-sm text-slate-500">Enable lesson discussion forum</p>
                  </div>
                  <Switch
                    id="allowDiscussion"
                    checked={lessonEditData.settings.allowDiscussion}
                    onCheckedChange={checked => updateLessonData({
                      settings: { ...lessonEditData.settings, allowDiscussion: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="trackCompletion">Track Completion</Label>
                    <p className="text-sm text-slate-500">Track student progress automatically</p>
                  </div>
                  <Switch
                    id="trackCompletion"
                    checked={lessonEditData.settings.trackCompletion}
                    onCheckedChange={checked => updateLessonData({
                      settings: { ...lessonEditData.settings, trackCompletion: checked }
                    })}
                  />
                </div>

                {lessonEditData.lessonType === LessonType.VIDEO && (
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="requireFullWatch">Require Full Watch</Label>
                      <p className="text-sm text-slate-500">Students must watch entire video</p>
                    </div>
                    <Switch
                      id="requireFullWatch"
                      checked={lessonEditData.settings.requireFullWatch}
                      onCheckedChange={checked => updateLessonData({
                        settings: { ...lessonEditData.settings, requireFullWatch: checked }
                      })}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="sortOrder" className="text-lg font-semibold">
                Sort Order
              </Label>
              <Input
                id="sortOrder"
                type="number"
                value={lessonEditData.sortOrder}
                onChange={e => updateLessonData({ sortOrder: parseInt(e.target.value) })}
                placeholder="1"
                className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-white/20 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-slate-600 backdrop-blur-sm hover:bg-white/60 hover:text-slate-900"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Course
              </Button>

              <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent" />

              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Edit Lesson
                  </h1>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {lessonEditData.title || 'Untitled Lesson'}
                    </p>
                    <Badge variant={lessonEditData.status === 'published' ? 'default' : 'secondary'}>
                      {lessonEditData.status}
                    </Badge>
                    <Badge variant="outline">
                      {lessonEditData.lessonType}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewMode(true)}
                className="border-white/20 bg-white/60 backdrop-blur-sm hover:bg-white/80"
              >
                <Eye className="mr-1 h-4 w-4" />
                Preview
              </Button>

              <Button
                onClick={handleSaveChanges}
                disabled={isUpdating || isUploading || !isDirty}
                className="bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg hover:from-emerald-600 hover:to-green-700"
              >
                {isUpdating || isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-1 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>

              {lessonEditData.status === 'draft' && (
                <Button
                  onClick={() => setShowPublishDialog(true)}
                  variant="outline"
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                >
                  <Play className="mr-1 h-4 w-4" />
                  Publish
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Navigation Tabs */}
          <div className="col-span-3">
            <Card className="sticky top-32 border-white/30 bg-white/80 shadow-xl backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-lg">Lesson Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical">
                  <TabsList className="flex h-auto w-full flex-col bg-transparent">
                    <TabsTrigger 
                      value="content" 
                      className="w-full justify-start rounded-xl p-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
                    >
                      <FileText className="mr-3 h-4 w-4" />
                      Content
                    </TabsTrigger>
                    <TabsTrigger 
                      value="settings" 
                      className="w-full justify-start rounded-xl p-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white"
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      Settings
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Upload Progress */}
            {isUploading && (
              <Card className="mt-6 border-white/30 bg-white/80 shadow-xl backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    <Upload className="h-4 w-4" />
                    <span>Uploading...</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {uploadProgress}% complete
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content Area */}
          <div className="col-span-9">
            <Card className="min-h-96 border-white/30 bg-white/80 shadow-xl backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-xl">
                  {activeTab === 'content' && 'Lesson Content'}
                  {activeTab === 'settings' && 'Lesson Settings'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {renderTabContent()}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lesson? This action cannot be undone and will remove all lesson content and student progress data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLesson}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Lesson'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Lesson</DialogTitle>
            <DialogDescription>
              Are you ready to publish this lesson? Students will be able to access it once published.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg bg-amber-50 p-4">
              <h4 className="font-semibold text-amber-800">Before publishing:</h4>
              <ul className="mt-2 list-inside list-disc text-sm text-amber-700">
                <li>Review all lesson content</li>
                <li>Check video/content quality</li>
                <li>Verify lesson settings</li>
                <li>Ensure proper duration is set</li>
              </ul>
            </div>
            
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-700">
                Once published, students enrolled in the course will be able to access this lesson.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePublishLesson} disabled={isPublishing}>
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Publish Lesson
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
