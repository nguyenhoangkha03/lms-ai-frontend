'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Check,
  Eye,
  Upload,
  Sparkles,
  AlertCircle,
  Clock,
  FileText,
  Video,
  Settings,
  DollarSign,
  Target,
  Save,
  PlayCircle,
  Image,
  Globe,
  Users,
  Award,
  Loader2,
  CheckCircle,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  ClipboardList,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  useGetTeacherCourseQuery,
  useUpdateTeacherCourseMutation,
  useSubmitCourseForReviewMutation,
} from '@/lib/redux/api/teacher-courses-api';
import useDirectUpload from '@/hooks/useDirectUpload';
import { useGetCategoriesQuery } from '@/lib/redux/api/course-api';
import {
  CourseLevel,
  CourseLanguage,
  CoursePricing,
} from '@/lib/types/course-enums';
import CurriculumBuilder from '@/components/course/creation/builders/curriculum-builder';
import { CourseSection } from '@/lib/redux/api/teacher-lessons-api';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CourseEditData {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnailUrl: string;
  trailerVideoUrl: string;
  categoryId: string;
  level: CourseLevel;
  language: CourseLanguage;
  durationHours: number;
  durationMinutes: number;
  price: number;
  currency: string;
  originalPrice: number;
  isFree: boolean;
  pricingModel: CoursePricing;
  enrollmentLimit: number;

  // Arrays
  tags: string[];
  requirements: string[];
  whatYouWillLearn: string[];
  targetAudience: string[];

  // Settings
  allowReviews: boolean;
  allowDiscussions: boolean;
  hasCertificate: boolean;
  lifetimeAccess: boolean;
  accessDuration: number;

  // Course Features
  featured: boolean;
  bestseller: boolean;
  isNew: boolean;

  // SEO Meta
  seoMeta: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };

  // Advanced Settings
  settings: Record<string, any>;
  metadata: Record<string, any>;

  // Date fields
  availableFrom: string;
  availableUntil: string;

  // File uploads
  thumbnailFile: File | null;
  trailerVideoFile: File | null;

  // Preview URLs
  thumbnailPreview: string;
  trailerVideoPreview: string;

  // Course structure
  sections: CourseSection[];

  // Status and metadata
  status: string;
  isPublished: boolean;
  lastModified: string;
}

export default function CourseEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const courseId = params.id as string;

  // File input refs
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const trailerVideoInputRef = useRef<HTMLInputElement>(null);

  // API mutations
  const [updateCourse, { isLoading: isUpdating }] = useUpdateTeacherCourseMutation();
  const [submitForReview, { isLoading: isSubmitting }] = useSubmitCourseForReviewMutation();

  // Direct S3 Upload hook
  const { uploadFile, uploadProgress, uploadStatus, isUploading } = useDirectUpload();

  // Fetch course data
  const {
    data: courseData,
    isLoading: isLoadingCourse,
    error: courseError,
    refetch: refetchCourse,
  } = useGetTeacherCourseQuery({ id: courseId, options: { includeSections: true } });

  // Fetch categories from API
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useGetCategoriesQuery();

  // State management
  const [activeTab, setActiveTab] = useState('basic-info');
  const [isDirty, setIsDirty] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const [courseEditData, setCourseEditData] = useState<CourseEditData>({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    thumbnailUrl: '',
    trailerVideoUrl: '',
    categoryId: '',
    level: CourseLevel.BEGINNER,
    language: CourseLanguage.VIETNAMESE,
    durationHours: 0,
    durationMinutes: 0,
    price: 0,
    currency: 'VND',
    originalPrice: 0,
    isFree: true,
    pricingModel: CoursePricing.FREE,
    enrollmentLimit: 0,
    tags: [],
    requirements: [],
    whatYouWillLearn: [],
    targetAudience: [],
    allowReviews: true,
    allowDiscussions: true,
    hasCertificate: false,
    lifetimeAccess: true,
    accessDuration: 0,
    featured: false,
    bestseller: false,
    isNew: false,
    seoMeta: {
      title: '',
      description: '',
      keywords: [],
      ogImage: '',
    },
    settings: {},
    metadata: {},
    availableFrom: '',
    availableUntil: '',
    thumbnailFile: null,
    trailerVideoFile: null,
    thumbnailPreview: '',
    trailerVideoPreview: '',
    sections: [],
    status: 'draft',
    isPublished: false,
    lastModified: '',
  });

  // Load course data when it's available
  useEffect(() => {
    if (courseData) {
      setCourseEditData({
        title: courseData.title || '',
        slug: courseData.slug || '',
        description: courseData.description || '',
        shortDescription: courseData.shortDescription || '',
        thumbnailUrl: courseData.thumbnailUrl || '',
        trailerVideoUrl: courseData.trailerVideoUrl || '',
        categoryId: courseData.categoryId || '',
        level: courseData.level || CourseLevel.BEGINNER,
        language: courseData.language || CourseLanguage.VIETNAMESE,
        durationHours: courseData.durationHours || 0,
        durationMinutes: courseData.durationMinutes || 0,
        price: courseData.price || 0,
        currency: courseData.currency || 'VND',
        originalPrice: courseData.originalPrice || 0,
        isFree: courseData.isFree !== undefined ? courseData.isFree : true,
        pricingModel: courseData.pricingModel || CoursePricing.FREE,
        enrollmentLimit: courseData.enrollmentLimit || 0,
        tags: courseData.tags || [],
        requirements: courseData.requirements || [],
        whatYouWillLearn: courseData.whatYouWillLearn || [],
        targetAudience: courseData.targetAudience || [],
        allowReviews: courseData.allowReviews !== undefined ? courseData.allowReviews : true,
        allowDiscussions: courseData.allowDiscussions !== undefined ? courseData.allowDiscussions : true,
        hasCertificate: courseData.hasCertificate !== undefined ? courseData.hasCertificate : false,
        lifetimeAccess: courseData.lifetimeAccess !== undefined ? courseData.lifetimeAccess : true,
        accessDuration: courseData.accessDuration || 0,
        featured: courseData.featured !== undefined ? courseData.featured : false,
        bestseller: courseData.bestseller !== undefined ? courseData.bestseller : false,
        isNew: courseData.isNew !== undefined ? courseData.isNew : false,
        seoMeta: courseData.seoMeta || {
          title: '',
          description: '',
          keywords: [],
          ogImage: '',
        },
        settings: courseData.settings || {},
        metadata: courseData.metadata || {},
        availableFrom: courseData.availableFrom || '',
        availableUntil: courseData.availableUntil || '',
        thumbnailFile: null,
        trailerVideoFile: null,
        thumbnailPreview: courseData.thumbnailUrl || '',
        trailerVideoPreview: courseData.trailerVideoUrl || '',
        sections: courseData.sections || [],
        status: courseData.status || 'draft',
        isPublished: courseData.isPublished || false,
        lastModified: courseData.updatedAt || '',
      });
    }
  }, [courseData]);

  const updateCourseData = (updates: Partial<CourseEditData>) => {
    setCourseEditData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
    
    // Simulate auto-save
    setIsAutoSaving(true);
    setTimeout(() => {
      setIsAutoSaving(false);
      setLastAutoSave(new Date());
    }, 1000);
  };

  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      
      if (courseEditData.thumbnailPreview && courseEditData.thumbnailPreview !== courseEditData.thumbnailUrl) {
        URL.revokeObjectURL(courseEditData.thumbnailPreview);
      }

      updateCourseData({
        thumbnailFile: file,
        thumbnailPreview: previewUrl,
      });

      toast({
        title: 'Image selected',
        description: `${file.name} selected as course thumbnail`,
      });
    }
  };

  const handleTrailerVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast({
          title: 'File too large',
          description: 'Please select a video smaller than 100MB',
          variant: 'destructive',
        });
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      
      if (courseEditData.trailerVideoPreview && courseEditData.trailerVideoPreview !== courseEditData.trailerVideoUrl) {
        URL.revokeObjectURL(courseEditData.trailerVideoPreview);
      }

      updateCourseData({
        trailerVideoFile: file,
        trailerVideoPreview: previewUrl,
      });

      toast({
        title: 'Video selected',
        description: `${file.name} selected as course trailer`,
      });
    }
  };

  const prepareCourseUpdateData = () => {
    const { thumbnailFile, trailerVideoFile, thumbnailPreview, trailerVideoPreview, sections, status, isPublished, lastModified, ...updateData } = courseEditData;
    
    return {
      ...updateData,
      tags: courseEditData.tags.length > 0 ? courseEditData.tags : undefined,
      requirements: courseEditData.requirements.length > 0 ? courseEditData.requirements : undefined,
      whatYouWillLearn: courseEditData.whatYouWillLearn.length > 0 ? courseEditData.whatYouWillLearn : undefined,
      targetAudience: courseEditData.targetAudience.length > 0 ? courseEditData.targetAudience : undefined,
      enrollmentLimit: courseEditData.enrollmentLimit || undefined,
      accessDuration: courseEditData.accessDuration || undefined,
      availableFrom: courseEditData.availableFrom || undefined,
      availableUntil: courseEditData.availableUntil || undefined,
    };
  };

  const handleSaveChanges = async () => {
    try {
      const updateData = prepareCourseUpdateData();
      console.log('🔄 Updating course with data:', updateData);

      await updateCourse({ id: courseId, data: updateData }).unwrap();

      // Upload files if new ones are selected
      const uploadPromises = [];

      if (courseEditData.thumbnailFile) {
        const thumbnailPromise = uploadFile(
          courseId,
          courseEditData.thumbnailFile,
          'promotional'
        )
          .then(result => {
            if (result.success && result.fileRecord) {
              updateCourseData({ thumbnailUrl: result.fileRecord.fileUrl });
              toast({
                title: 'Thumbnail updated',
                description: 'Course thumbnail updated successfully',
              });
            }
          })
          .catch(error => {
            console.error('Failed to upload thumbnail:', error);
          });
        uploadPromises.push(thumbnailPromise);
      }

      if (courseEditData.trailerVideoFile) {
        const trailerPromise = uploadFile(
          courseId,
          courseEditData.trailerVideoFile,
          'promotional'
        )
          .then(result => {
            if (result.success && result.fileRecord) {
              updateCourseData({ trailerVideoUrl: result.fileRecord.fileUrl });
              toast({
                title: 'Trailer video updated',
                description: 'Course trailer video updated successfully',
              });
            }
          })
          .catch(error => {
            console.error('Failed to upload trailer video:', error);
          });
        uploadPromises.push(trailerPromise);
      }

      if (uploadPromises.length > 0) {
        await Promise.allSettled(uploadPromises);
      }

      toast({
        title: 'Changes saved!',
        description: 'Course has been updated successfully.',
      });
      
      setIsDirty(false);
      refetchCourse();
    } catch (error: any) {
      console.error('❌ Course update failed:', error);
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to save changes',
        variant: 'destructive',
      });
    }
  };

  const handlePublishCourse = async () => {
    try {
      await submitForReview(courseId).unwrap();
      
      toast({
        title: 'Course submitted!',
        description: 'Course has been submitted for admin review.',
      });
      
      setShowPublishDialog(false);
      refetchCourse();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to submit course for review',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingCourse) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p>Loading course...</p>
        </div>
      </div>
    );
  }

  if (courseError || !courseData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold">Course Not Found</h3>
              <p className="mb-4 text-muted-foreground">
                The course you're looking for doesn't exist or you don't have permission to edit it.
              </p>
              <Button onClick={() => router.push('/teacher/courses')}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Courses
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic-info':
        return (
          <motion.div
            key="basic-info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Basic Course Information */}
            <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Basic Course Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-lg font-semibold">
                    Course Title
                  </Label>
                  <Input
                    id="title"
                    value={courseEditData.title}
                    onChange={e => updateCourseData({ title: e.target.value })}
                    placeholder="Enter course title..."
                    className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-lg font-semibold">
                    Course Description
                    <span className="ml-1 text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={courseEditData.description}
                    onChange={e => updateCourseData({ description: e.target.value })}
                    placeholder="Detailed description of what students will learn..."
                    rows={6}
                    className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="shortDescription" className="text-lg font-semibold">
                    Short Description
                  </Label>
                  <Input
                    id="shortDescription"
                    value={courseEditData.shortDescription}
                    onChange={e => updateCourseData({ shortDescription: e.target.value })}
                    placeholder="A brief summary for course cards..."
                    className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Course Categories & Settings */}
            <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Settings className="h-5 w-5 text-green-600" />
                  Course Categories & Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="categoryId" className="text-lg font-semibold">
                      Category
                    </Label>
                    <Select
                      value={courseEditData.categoryId}
                      onValueChange={value => updateCourseData({ categoryId: value })}
                      disabled={isLoadingCategories}
                    >
                      <SelectTrigger className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="level" className="text-lg font-semibold">
                      Level
                    </Label>
                    <Select
                      value={courseEditData.level}
                      onValueChange={(value: CourseLevel) => updateCourseData({ level: value })}
                    >
                      <SelectTrigger className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CourseLevel.BEGINNER}>Beginner</SelectItem>
                        <SelectItem value={CourseLevel.INTERMEDIATE}>Intermediate</SelectItem>
                        <SelectItem value={CourseLevel.ADVANCED}>Advanced</SelectItem>
                        <SelectItem value={CourseLevel.EXPERT}>Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="language" className="text-lg font-semibold">
                      Language
                    </Label>
                    <Select
                      value={courseEditData.language}
                      onValueChange={(value: CourseLanguage) => updateCourseData({ language: value })}
                    >
                      <SelectTrigger className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CourseLanguage.VIETNAMESE}>Tiếng Việt</SelectItem>
                        <SelectItem value={CourseLanguage.ENGLISH}>English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Outcomes */}
            <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="h-5 w-5 text-purple-600" />
                  Learning Outcomes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-lg font-semibold">What You'll Learn</Label>
                  <Textarea
                    value={courseEditData.whatYouWillLearn.join('\n')}
                    onChange={e =>
                      updateCourseData({
                        whatYouWillLearn: e.target.value
                          .split('\n')
                          .filter(item => item.trim()),
                      })
                    }
                    placeholder="Enter learning outcomes, one per line..."
                    rows={5}
                    className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Media Assets */}
            <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Image className="h-5 w-5 text-orange-600" />
                  Media Assets
                </CardTitle>
              </CardHeader>
              <CardContent>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Course Thumbnail */}
              <div>
                <Label className="text-lg font-semibold">Course Thumbnail</Label>
                <div className="mt-2 rounded-xl border-2 border-dashed border-white/30 bg-white/40 p-4 backdrop-blur-sm">
                  {courseEditData.thumbnailPreview ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={courseEditData.thumbnailPreview}
                          alt="Course thumbnail preview"
                          className="h-48 w-full rounded-lg object-cover"
                        />
                        <div className="absolute right-2 top-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              if (courseEditData.thumbnailPreview && courseEditData.thumbnailPreview !== courseEditData.thumbnailUrl) {
                                URL.revokeObjectURL(courseEditData.thumbnailPreview);
                              }
                              updateCourseData({
                                thumbnailFile: null,
                                thumbnailPreview: courseEditData.thumbnailUrl,
                              });
                            }}
                            className="bg-red-500 text-white hover:bg-red-600"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="bg-white/80"
                          onClick={() => thumbnailInputRef.current?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Change Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <Image className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                      <p className="mb-4 text-slate-600">Upload course thumbnail image</p>
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-white/80"
                        onClick={() => thumbnailInputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Choose Image
                      </Button>
                    </div>
                  )}
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Course Trailer Video */}
              <div>
                <Label className="text-lg font-semibold">Course Trailer Video</Label>
                <div className="mt-2 rounded-xl border-2 border-dashed border-white/30 bg-white/40 p-4 backdrop-blur-sm">
                  {courseEditData.trailerVideoPreview ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <video
                          src={courseEditData.trailerVideoPreview}
                          controls
                          className="h-48 w-full rounded-lg object-cover"
                        />
                        <div className="absolute right-2 top-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              if (courseEditData.trailerVideoPreview && courseEditData.trailerVideoPreview !== courseEditData.trailerVideoUrl) {
                                URL.revokeObjectURL(courseEditData.trailerVideoPreview);
                              }
                              updateCourseData({
                                trailerVideoFile: null,
                                trailerVideoPreview: courseEditData.trailerVideoUrl,
                              });
                            }}
                            className="bg-red-500 text-white hover:bg-red-600"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="bg-white/80"
                          onClick={() => trailerVideoInputRef.current?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Change Video
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <Video className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                      <p className="mb-4 text-slate-600">Upload course trailer video</p>
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-white/80"
                        onClick={() => trailerVideoInputRef.current?.click()}
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Choose Video
                      </Button>
                    </div>
                  )}
                  <input
                    ref={trailerVideoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleTrailerVideoUpload}
                    className="hidden"
                  />
                </div>
              </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'curriculum':
        return (
          <motion.div
            key="curriculum"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <CurriculumBuilder
              courseId={courseId}
              sections={courseEditData.sections}
              onSectionsChange={sections => updateCourseData({ sections })}
            />
          </motion.div>
        );

      case 'pricing':
        return (
          <motion.div
            key="pricing"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Free Course</Label>
                <Switch
                  checked={courseEditData.isFree}
                  onCheckedChange={checked =>
                    updateCourseData({
                      isFree: checked,
                      price: checked ? 0 : courseEditData.price,
                      pricingModel: checked ? CoursePricing.FREE : CoursePricing.PAID,
                    })
                  }
                />
              </div>

              {!courseEditData.isFree && (
                <div>
                  <Label htmlFor="price" className="text-lg font-semibold">
                    Course Price
                  </Label>
                  <div className="mt-2 flex space-x-2">
                    <Input
                      id="price"
                      type="number"
                      value={courseEditData.price}
                      onChange={e => updateCourseData({ price: Number(e.target.value) })}
                      placeholder="0"
                      className="border-white/20 bg-white/80 backdrop-blur-sm"
                    />
                    <Select
                      value={courseEditData.currency}
                      onValueChange={value => updateCourseData({ currency: value })}
                    >
                      <SelectTrigger className="w-24 border-white/20 bg-white/80 backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VND">VND</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="originalPrice">
                      Original Price (Optional)
                    </Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={courseEditData.originalPrice}
                      onChange={e =>
                        updateCourseData({
                          originalPrice: Number(e.target.value),
                        })
                      }
                      placeholder="Original price for discount display"
                      className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">Course Settings</Label>
              <div className="space-y-4 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowReviews">Allow Reviews</Label>
                    <p className="text-sm text-slate-500">Students can review this course</p>
                  </div>
                  <Switch
                    id="allowReviews"
                    checked={courseEditData.allowReviews}
                    onCheckedChange={checked => updateCourseData({ allowReviews: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowDiscussions">Allow Discussions</Label>
                    <p className="text-sm text-slate-500">Enable course discussion forum</p>
                  </div>
                  <Switch
                    id="allowDiscussions"
                    checked={courseEditData.allowDiscussions}
                    onCheckedChange={checked => updateCourseData({ allowDiscussions: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="hasCertificate">Certificate</Label>
                    <p className="text-sm text-slate-500">Award certificate upon completion</p>
                  </div>
                  <Switch
                    id="hasCertificate"
                    checked={courseEditData.hasCertificate}
                    onCheckedChange={checked => updateCourseData({ hasCertificate: checked })}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'features':
        return (
          <motion.div
            key="features"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Course Highlights</Label>
              <div className="space-y-4 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="featured">Featured Course</Label>
                    <p className="text-sm text-slate-500">Display this course prominently on the platform</p>
                  </div>
                  <Switch
                    id="featured"
                    checked={courseEditData.featured}
                    onCheckedChange={checked => updateCourseData({ featured: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="bestseller">Bestseller Badge</Label>
                    <p className="text-sm text-slate-500">Mark this course as a bestseller</p>
                  </div>
                  <Switch
                    id="bestseller"
                    checked={courseEditData.bestseller}
                    onCheckedChange={checked => updateCourseData({ bestseller: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isNew">New Course Badge</Label>
                    <p className="text-sm text-slate-500">Show "New" badge for this course</p>
                  </div>
                  <Switch
                    id="isNew"
                    checked={courseEditData.isNew}
                    onCheckedChange={checked => updateCourseData({ isNew: checked })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">Access Control</Label>
              <div className="space-y-4 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="lifetimeAccess">Lifetime Access</Label>
                    <p className="text-sm text-slate-500">Students get permanent access to this course</p>
                  </div>
                  <Switch
                    id="lifetimeAccess"
                    checked={courseEditData.lifetimeAccess}
                    onCheckedChange={checked => updateCourseData({ lifetimeAccess: checked })}
                  />
                </div>

                {!courseEditData.lifetimeAccess && (
                  <div>
                    <Label htmlFor="accessDuration" className="text-sm font-medium">
                      Access Duration (days)
                    </Label>
                    <Input
                      id="accessDuration"
                      type="number"
                      value={courseEditData.accessDuration}
                      onChange={e => updateCourseData({ accessDuration: Number(e.target.value) })}
                      placeholder="30"
                      className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="enrollmentLimit" className="text-sm font-medium">
                    Enrollment Limit (0 = unlimited)
                  </Label>
                  <Input
                    id="enrollmentLimit"
                    type="number"
                    value={courseEditData.enrollmentLimit}
                    onChange={e => updateCourseData({ enrollmentLimit: Number(e.target.value) })}
                    placeholder="0"
                    className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'seo':
        return (
          <motion.div
            key="seo"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Label className="text-lg font-semibold">SEO Meta Information</Label>
              <div className="space-y-4 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-sm">
                <div>
                  <Label htmlFor="seoTitle" className="text-sm font-medium">
                    SEO Title
                  </Label>
                  <Input
                    id="seoTitle"
                    value={courseEditData.seoMeta.title || ''}
                    onChange={e => updateCourseData({ 
                      seoMeta: { ...courseEditData.seoMeta, title: e.target.value } 
                    })}
                    placeholder="Optimized title for search engines"
                    className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="seoDescription" className="text-sm font-medium">
                    SEO Description
                  </Label>
                  <Textarea
                    id="seoDescription"
                    value={courseEditData.seoMeta.description || ''}
                    onChange={e => updateCourseData({ 
                      seoMeta: { ...courseEditData.seoMeta, description: e.target.value } 
                    })}
                    placeholder="Description for search engine results"
                    rows={3}
                    className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="seoKeywords" className="text-sm font-medium">
                    SEO Keywords
                  </Label>
                  <Textarea
                    id="seoKeywords"
                    value={courseEditData.seoMeta.keywords?.join(', ') || ''}
                    onChange={e => updateCourseData({ 
                      seoMeta: { 
                        ...courseEditData.seoMeta, 
                        keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                      } 
                    })}
                    placeholder="keyword1, keyword2, keyword3"
                    rows={2}
                    className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="ogImage" className="text-sm font-medium">
                    Open Graph Image URL
                  </Label>
                  <Input
                    id="ogImage"
                    value={courseEditData.seoMeta.ogImage || ''}
                    onChange={e => updateCourseData({ 
                      seoMeta: { ...courseEditData.seoMeta, ogImage: e.target.value } 
                    })}
                    placeholder="https://example.com/og-image.jpg"
                    className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">Course Availability</Label>
              <div className="space-y-4 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="availableFrom" className="text-sm font-medium">
                      Available From
                    </Label>
                    <Input
                      id="availableFrom"
                      type="datetime-local"
                      value={courseEditData.availableFrom}
                      onChange={e => updateCourseData({ availableFrom: e.target.value })}
                      className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="availableUntil" className="text-sm font-medium">
                      Available Until
                    </Label>
                    <Input
                      id="availableUntil"
                      type="datetime-local"
                      value={courseEditData.availableUntil}
                      onChange={e => updateCourseData({ availableUntil: e.target.value })}
                      className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'advanced':
        return (
          <motion.div
            key="advanced"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Course Tags</Label>
              <div className="rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-sm">
                <Textarea
                  value={courseEditData.tags.join(', ')}
                  onChange={e => updateCourseData({ 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                  })}
                  placeholder="tag1, tag2, tag3"
                  rows={2}
                  className="border-white/20 bg-white/80 backdrop-blur-sm"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Separate tags with commas. Tags help students find your course.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">Course Requirements</Label>
              <div className="rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-sm">
                <Textarea
                  value={courseEditData.requirements.join('\n')}
                  onChange={e => updateCourseData({ 
                    requirements: e.target.value.split('\n').filter(req => req.trim()) 
                  })}
                  placeholder="• Basic programming knowledge\n• Access to a computer\n• Internet connection"
                  rows={4}
                  className="border-white/20 bg-white/80 backdrop-blur-sm"
                />
                <p className="mt-2 text-xs text-slate-500">
                  List prerequisites and requirements, one per line.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">Target Audience</Label>
              <div className="rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-sm">
                <Textarea
                  value={courseEditData.targetAudience.join('\n')}
                  onChange={e => updateCourseData({ 
                    targetAudience: e.target.value.split('\n').filter(aud => aud.trim()) 
                  })}
                  placeholder="• Beginner developers\n• Students learning web development\n• Professionals switching careers"
                  rows={4}
                  className="border-white/20 bg-white/80 backdrop-blur-sm"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Describe who this course is designed for, one per line.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">Duration Settings</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-sm">
                  <Label htmlFor="durationHours" className="text-sm font-medium">
                    Duration (Hours)
                  </Label>
                  <Input
                    id="durationHours"
                    type="number"
                    value={courseEditData.durationHours}
                    onChange={e => updateCourseData({ durationHours: Number(e.target.value) })}
                    placeholder="10"
                    className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                <div className="rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-sm">
                  <Label htmlFor="durationMinutes" className="text-sm font-medium">
                    Duration (Minutes)
                  </Label>
                  <Input
                    id="durationMinutes"
                    type="number"
                    value={courseEditData.durationMinutes}
                    onChange={e => updateCourseData({ durationMinutes: Number(e.target.value) })}
                    placeholder="30"
                    className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>
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
                Back to Courses
              </Button>

              <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent" />

              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Edit Course
                  </h1>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {courseEditData.title || 'Untitled Course'}
                    </p>
                    <Badge variant={courseEditData.status === 'published' ? 'default' : 'secondary'}>
                      {courseEditData.status}
                    </Badge>
                    {isAutoSaving && (
                      <div className="flex items-center space-x-1 text-xs text-emerald-600">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                        <span>Auto-saving...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {lastAutoSave && (
                <div className="flex items-center space-x-2 rounded-lg border border-white/20 bg-white/60 px-3 py-1 backdrop-blur-sm">
                  <Clock className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-slate-600">
                    Saved {lastAutoSave.toLocaleTimeString()}
                  </span>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="border-white/20 bg-white/60 backdrop-blur-sm hover:bg-white/80"
              >
                <Eye className="mr-1 h-4 w-4" />
                Preview
              </Button>

              <Button
                onClick={handleSaveChanges}
                disabled={isUpdating || isUploading || !isDirty}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg hover:from-blue-600 hover:to-indigo-700"
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

              {courseEditData.status === 'draft' && (
                <Button
                  onClick={() => setShowPublishDialog(true)}
                  variant="outline"
                  className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200"
                >
                  <Upload className="mr-1 h-4 w-4" />
                  Publish
                </Button>
              )}
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
                <CardTitle className="text-lg">Course Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical">
                  <TabsList className="flex h-auto w-full flex-col bg-transparent">
                    <TabsTrigger 
                      value="basic-info" 
                      className="w-full justify-start rounded-xl p-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
                    >
                      <FileText className="mr-3 h-4 w-4" />
                      Basic Information
                    </TabsTrigger>
                    <TabsTrigger 
                      value="curriculum" 
                      className="w-full justify-start rounded-xl p-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
                    >
                      <BookOpen className="mr-3 h-4 w-4" />
                      Course Structure
                    </TabsTrigger>
                    <TabsTrigger 
                      value="pricing" 
                      className="w-full justify-start rounded-xl p-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white"
                    >
                      <DollarSign className="mr-3 h-4 w-4" />
                      Pricing & Settings
                    </TabsTrigger>
                    <TabsTrigger 
                      value="features" 
                      className="w-full justify-start rounded-xl p-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
                    >
                      <Star className="mr-3 h-4 w-4" />
                      Course Features
                    </TabsTrigger>
                    <TabsTrigger 
                      value="seo" 
                      className="w-full justify-start rounded-xl p-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
                    >
                      <Globe className="mr-3 h-4 w-4" />
                      SEO & Marketing
                    </TabsTrigger>
                    <TabsTrigger 
                      value="advanced" 
                      className="w-full justify-start rounded-xl p-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-gray-600 data-[state=active]:text-white"
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      Advanced Settings
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Course Management Links */}
            <Card className="mt-6 border-white/30 bg-white/80 shadow-xl backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-lg">Course Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => router.push(`/teacher/courses/${courseId}/lessons`)}
                  variant="outline"
                  className="w-full justify-start bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 hover:from-emerald-100 hover:to-green-100"
                >
                  <BookOpen className="mr-3 h-4 w-4 text-emerald-600" />
                  Manage Lessons
                </Button>
                <Button
                  onClick={() => router.push(`/teacher/courses/${courseId}/assessments`)}
                  variant="outline"
                  className="w-full justify-start bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100"
                >
                  <ClipboardList className="mr-3 h-4 w-4 text-blue-600" />
                  Manage Assessments
                </Button>
                <Button
                  onClick={() => router.push(`/teacher/courses/${courseId}/assessments/quiz-builder`)}
                  variant="outline"
                  className="w-full justify-start bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 hover:from-purple-100 hover:to-violet-100"
                >
                  <Sparkles className="mr-3 h-4 w-4 text-purple-600" />
                  Quiz Builder
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="col-span-9">
            <Card className="min-h-96 border-white/30 bg-white/80 shadow-xl backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-xl">
                  {activeTab === 'basic-info' && 'Basic Information'}
                  {activeTab === 'curriculum' && 'Course Structure'}
                  {activeTab === 'pricing' && 'Pricing & Settings'}
                  {activeTab === 'features' && 'Course Features'}
                  {activeTab === 'seo' && 'SEO & Marketing'}
                  {activeTab === 'advanced' && 'Advanced Settings'}
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

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Course</DialogTitle>
            <DialogDescription>
              Are you ready to submit your course for admin review? Make sure all content is complete and accurate.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg bg-amber-50 p-4">
              <h4 className="font-semibold text-amber-800">Before publishing:</h4>
              <ul className="mt-2 list-inside list-disc text-sm text-amber-700">
                <li>Review all course content and settings</li>
                <li>Ensure all lessons have proper content</li>
                <li>Check pricing and course information</li>
                <li>Upload course thumbnail and trailer video</li>
              </ul>
            </div>
            
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-700">
                Once submitted, your course will be reviewed by our admin team. You'll receive a notification when the review is complete.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePublishCourse} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit for Review
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}