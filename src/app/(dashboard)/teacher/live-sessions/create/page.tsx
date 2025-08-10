'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Calendar,
  Clock,
  Users,
  Video,
  Settings,
  FileText,
  Plus,
  Trash2,
  Upload,
  ArrowLeft,
  Save,
  Eye,
  Mic,
  Camera,
  Monitor,
  MessageCircle,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  useCreateLiveSessionMutation,
  CreateLiveSessionRequest,
  LiveSessionSettings,
} from '@/lib/redux/api/teacher-live-sessions-api';
import { useGetTeacherCoursesQuery } from '@/lib/redux/api/teacher-courses-api';

interface ScheduleSessionForm {
  title: string;
  description: string;
  courseId: string;
  scheduledAt: string;
  duration: number;
  maxParticipants: number;
  isRecorded: boolean;
  materials: Array<{
    name: string;
    type: 'pdf' | 'video' | 'image' | 'code' | 'markdown' | 'link';
    url: string;
  }>;
  settings: LiveSessionSettings;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function CreateLiveSessionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [materials, setMaterials] = useState<
    Array<{
      name: string;
      type: 'pdf' | 'video' | 'image' | 'code' | 'markdown' | 'link';
      url: string;
    }>
  >([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ScheduleSessionForm>({
    defaultValues: {
      duration: 60,
      maxParticipants: 50,
      isRecorded: true,
      settings: {
        allowChat: true,
        allowMicrophone: false,
        allowCamera: false,
        allowScreenShare: true,
        recordSession: true,
        requireApproval: false,
      },
    },
  });

  // API hooks
  const { data: courses, isLoading: isLoadingCourses } =
    useGetTeacherCoursesQuery({});
  const [createLiveSession, { isLoading: isCreating }] =
    useCreateLiveSessionMutation();

  const watchedSettings = watch('settings');

  const addMaterial = () => {
    setMaterials([...materials, { name: '', type: 'pdf', url: '' }]);
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, field: string, value: string) => {
    const updated = materials.map((material, i) =>
      i === index ? { ...material, [field]: value } : material
    );
    setMaterials(updated);
  };

  const onSubmit = async (data: ScheduleSessionForm) => {
    try {
      const sessionData: CreateLiveSessionRequest = {
        title: data.title,
        description: data.description,
        courseId: data.courseId,
        scheduledAt: data.scheduledAt,
        duration: data.duration,
        maxParticipants: data.maxParticipants,
        isRecorded: data.isRecorded,
        materials: materials.filter(m => m.name && m.url),
        settings: data.settings,
      };

      const result = await createLiveSession(sessionData).unwrap();

      toast({
        title: 'Session Scheduled',
        description: 'Live session has been successfully scheduled.',
      });

      router.push('/teacher/live-sessions');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create live session.',
        variant: 'destructive',
      });
    }
  };

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateTime = formatDateTimeLocal(tomorrow);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-white/20"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Schedule Live Session
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Create a new live teaching session
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="container mx-auto space-y-8 px-6 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <motion.div variants={itemVariants}>
            <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Video className="h-5 w-5 text-red-500" />
                  <span>Session Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Session Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter session title"
                      {...register('title', { required: 'Title is required' })}
                      className="bg-white/80"
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="courseId">Course *</Label>
                    <Select
                      onValueChange={value => setValue('courseId', value)}
                      {...register('courseId', {
                        required: 'Course is required',
                      })}
                    >
                      <SelectTrigger className="bg-white/80">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses?.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.courseId && (
                      <p className="text-sm text-red-600">
                        {errors.courseId.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what will be covered in this session"
                    rows={3}
                    {...register('description')}
                    className="bg-white/80"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Schedule & Settings */}
          <motion.div variants={itemVariants}>
            <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span>Schedule & Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledAt">Scheduled Time *</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      min={minDateTime}
                      {...register('scheduledAt', {
                        required: 'Schedule time is required',
                      })}
                      className="bg-white/80"
                    />
                    {errors.scheduledAt && (
                      <p className="text-sm text-red-600">
                        {errors.scheduledAt.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={15}
                      max={240}
                      step={15}
                      {...register('duration', {
                        required: 'Duration is required',
                        min: { value: 15, message: 'Minimum 15 minutes' },
                        max: { value: 240, message: 'Maximum 240 minutes' },
                      })}
                      className="bg-white/80"
                    />
                    {errors.duration && (
                      <p className="text-sm text-red-600">
                        {errors.duration.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      min={1}
                      max={500}
                      {...register('maxParticipants', {
                        required: 'Max participants is required',
                        min: { value: 1, message: 'At least 1 participant' },
                        max: {
                          value: 500,
                          message: 'Maximum 500 participants',
                        },
                      })}
                      className="bg-white/80"
                    />
                    {errors.maxParticipants && (
                      <p className="text-sm text-red-600">
                        {errors.maxParticipants.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isRecorded">Recording</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="isRecorded"
                        {...register('isRecorded')}
                        onCheckedChange={checked =>
                          setValue('isRecorded', checked)
                        }
                      />
                      <Label htmlFor="isRecorded" className="text-sm">
                        Record this session
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Session Settings */}
          <motion.div variants={itemVariants}>
            <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-violet-500" />
                  <span>Session Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <MessageCircle className="h-4 w-4 text-blue-500" />
                        <Label htmlFor="allowChat">Allow Chat</Label>
                      </div>
                      <Switch
                        id="allowChat"
                        checked={watchedSettings?.allowChat}
                        onCheckedChange={checked =>
                          setValue('settings.allowChat', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mic className="h-4 w-4 text-emerald-500" />
                        <Label htmlFor="allowMicrophone">
                          Allow Student Microphones
                        </Label>
                      </div>
                      <Switch
                        id="allowMicrophone"
                        checked={watchedSettings?.allowMicrophone}
                        onCheckedChange={checked =>
                          setValue('settings.allowMicrophone', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Camera className="h-4 w-4 text-purple-500" />
                        <Label htmlFor="allowCamera">
                          Allow Student Cameras
                        </Label>
                      </div>
                      <Switch
                        id="allowCamera"
                        checked={watchedSettings?.allowCamera}
                        onCheckedChange={checked =>
                          setValue('settings.allowCamera', checked)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Monitor className="h-4 w-4 text-blue-500" />
                        <Label htmlFor="allowScreenShare">
                          Allow Screen Share
                        </Label>
                      </div>
                      <Switch
                        id="allowScreenShare"
                        checked={watchedSettings?.allowScreenShare}
                        onCheckedChange={checked =>
                          setValue('settings.allowScreenShare', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Video className="h-4 w-4 text-red-500" />
                        <Label htmlFor="recordSession">
                          Auto Record Session
                        </Label>
                      </div>
                      <Switch
                        id="recordSession"
                        checked={watchedSettings?.recordSession}
                        onCheckedChange={checked =>
                          setValue('settings.recordSession', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-4 w-4 text-amber-500" />
                        <Label htmlFor="requireApproval">
                          Require Join Approval
                        </Label>
                      </div>
                      <Switch
                        id="requireApproval"
                        checked={watchedSettings?.requireApproval}
                        onCheckedChange={checked =>
                          setValue('settings.requireApproval', checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Materials */}
          <motion.div variants={itemVariants}>
            <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-orange-500" />
                    <span>Session Materials</span>
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMaterial}
                    className="bg-white/80"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Material
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {materials.length === 0 ? (
                  <div className="py-8 text-center text-slate-500">
                    <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>No materials added yet.</p>
                    <p className="text-sm">
                      Add materials to share with participants.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {materials.map((material, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white/60 p-4 md:grid-cols-4"
                      >
                        <div>
                          <Label
                            htmlFor={`material-name-${index}`}
                            className="text-sm"
                          >
                            Name
                          </Label>
                          <Input
                            id={`material-name-${index}`}
                            placeholder="Material name"
                            value={material.name}
                            onChange={e =>
                              updateMaterial(index, 'name', e.target.value)
                            }
                            className="bg-white/80"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor={`material-type-${index}`}
                            className="text-sm"
                          >
                            Type
                          </Label>
                          <Select
                            value={material.type}
                            onValueChange={value =>
                              updateMaterial(index, 'type', value)
                            }
                          >
                            <SelectTrigger className="bg-white/80">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="code">Code</SelectItem>
                              <SelectItem value="markdown">Markdown</SelectItem>
                              <SelectItem value="link">Link</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label
                            htmlFor={`material-url-${index}`}
                            className="text-sm"
                          >
                            URL
                          </Label>
                          <Input
                            id={`material-url-${index}`}
                            placeholder="File URL or link"
                            value={material.url}
                            onChange={e =>
                              updateMaterial(index, 'url', e.target.value)
                            }
                            className="bg-white/80"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeMaterial(index)}
                            className="border-red-200 bg-white/80 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex justify-end space-x-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="bg-white/80"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
            >
              {isCreating ? (
                'Scheduling...'
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Schedule Session
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
