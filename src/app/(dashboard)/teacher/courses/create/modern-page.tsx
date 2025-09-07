'use client';

import React, { useState, useRef } from 'react';
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
  X,
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
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  useCreateTeacherCourseMutation,
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

interface CourseFormData {
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

  // Arrays - matches backend
  tags: string[];
  requirements: string[];
  whatYouWillLearn: string[];
  targetAudience: string[];

  // Settings - matches backend booleans
  allowReviews: boolean;
  allowDiscussions: boolean;
  hasCertificate: boolean;
  lifetimeAccess: boolean;
  accessDuration: number;

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

  // Course ID (after creation)
  courseId?: string;
}

const WIZARD_STEPS = [
  {
    id: 'basic-info',
    title: 'Course Information',
    description: 'Basic details about your course',
    icon: <FileText className="h-5 w-5" />,
    estimatedTime: 10,
  },
  {
    id: 'curriculum',
    title: 'Course Structure',
    description: 'Create sections, lessons & upload content',
    icon: <BookOpen className="h-5 w-5" />,
    estimatedTime: 45,
  },
  {
    id: 'pricing',
    title: 'Pricing & Settings',
    description: 'Set price and course settings',
    icon: <DollarSign className="h-5 w-5" />,
    estimatedTime: 15,
  },
  {
    id: 'review',
    title: 'Review & Publish',
    description: 'Final review before publishing',
    icon: <Target className="h-5 w-5" />,
    estimatedTime: 10,
  },
];

const LANGUAGES = [
  { code: CourseLanguage.VIETNAMESE, name: 'Tiếng Việt' },
  { code: CourseLanguage.ENGLISH, name: 'English' },
];

export default function ModernCourseCreationPage() {
  const router = useRouter();
  const { toast } = useToast();

  // File input refs
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const trailerVideoInputRef = useRef<HTMLInputElement>(null);

  // API mutations
  const [createCourse, { isLoading: isCreating }] =
    useCreateTeacherCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] =
    useUpdateTeacherCourseMutation();
  const [submitForReview, { isLoading: isSubmitting }] =
    useSubmitCourseForReviewMutation();

  // Direct S3 Upload hook
  const { uploadFile, uploadProgress, uploadStatus, isUploading } =
    useDirectUpload();

  // Fetch categories from API
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useGetCategoriesQuery();

  // Ensure categories is always an array
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState<CourseFormData>({
    // Basic info
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

    // Arrays
    tags: [],
    requirements: [],
    whatYouWillLearn: [],
    targetAudience: [],

    // Settings
    allowReviews: true,
    allowDiscussions: true,
    hasCertificate: false,
    lifetimeAccess: true,
    accessDuration: 0,

    // Dates
    availableFrom: '',
    availableUntil: '',

    // Files
    thumbnailFile: null,
    trailerVideoFile: null,

    // Preview URLs
    thumbnailPreview: '',
    trailerVideoPreview: '',

    // Course structure
    sections: [],
  });

  const updateFormData = (updates: Partial<CourseFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Simulate auto-save
    setIsAutoSaving(true);
    setTimeout(() => {
      setIsAutoSaving(false);
      setLastAutoSave(new Date());
    }, 1000);
  };

  const handleThumbnailUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      // Clean up previous preview URL
      if (formData.thumbnailPreview) {
        URL.revokeObjectURL(formData.thumbnailPreview);
      }

      updateFormData({
        thumbnailFile: file,
        thumbnailPreview: previewUrl,
      });

      toast({
        title: 'Image selected',
        description: `${file.name} selected as course thumbnail`,
      });
    }
  };

  const handleTrailerVideoUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a video file',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a video smaller than 100MB',
          variant: 'destructive',
        });
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      // Clean up previous preview URL
      if (formData.trailerVideoPreview) {
        URL.revokeObjectURL(formData.trailerVideoPreview);
      }

      updateFormData({
        trailerVideoFile: file,
        trailerVideoPreview: previewUrl,
      });

      toast({
        title: 'Video selected',
        description: `${file.name} selected as course trailer`,
      });
    }
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const isStepCompleted = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Basic Info
        return !!(
          formData.title &&
          formData.description &&
          formData.categoryId &&
          formData.whatYouWillLearn.length > 0
        );
      case 1: // Curriculum (includes content upload)
        return (
          formData.sections.length > 0 &&
          formData.sections.some(
            section => section.lessons && section.lessons.length > 0
          )
        );
      case 2: // Pricing
        return formData.price >= 0;
      case 3: // Review
        return false; // Never completed until published
      default:
        return false;
    }
  };

  const progressPercentage = ((currentStep + 1) / WIZARD_STEPS.length) * 100;
  const currentStepData = WIZARD_STEPS[currentStep];

  const prepareCourseDataForUpdate = () => {
    // For update - exclude slug and other non-updatable fields
    const data = prepareCourseData();
    const { slug, ...updateData } = data;
    return updateData;
  };

  const prepareCourseData = () => {
    // Generate slug from title if not provided
    const slug =
      formData.slug ||
      formData.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

    // Ensure description meets minimum length requirement
    let description = formData.description.trim();
    if (description.length < 20) {
      if (description.length === 0) {
        description =
          'Khóa học đang được xây dựng. Mô tả chi tiết sẽ được cập nhật sớm.';
      } else {
        description = description + ' Khóa học đang được phát triển.';
      }
    }

    // Provide default URLs if empty (to pass validation)
    const thumbnailUrl =
      formData.thumbnailUrl.trim() || 'https://picsum.photos/800/400';
    const trailerVideoUrl =
      formData.trailerVideoUrl.trim() ||
      'https://www.youtube.com/watch?v=placeholder';

    // Prepare course data for API (matching CreateCourseDto)
    return {
      title: formData.title,
      slug: slug,
      description: description,
      shortDescription: formData.shortDescription,
      thumbnailUrl: thumbnailUrl,
      trailerVideoUrl: trailerVideoUrl,
      categoryId: formData.categoryId,
      level: formData.level,
      language: formData.language,
      durationHours: formData.durationHours,
      durationMinutes: formData.durationMinutes,
      price: formData.price,
      currency: formData.currency,
      originalPrice: formData.originalPrice,
      isFree: formData.isFree,
      pricingModel: formData.pricingModel,
      enrollmentLimit: formData.enrollmentLimit || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      requirements:
        formData.requirements.length > 0 ? formData.requirements : undefined,
      whatYouWillLearn:
        formData.whatYouWillLearn.length > 0
          ? formData.whatYouWillLearn
          : undefined,
      targetAudience:
        formData.targetAudience.length > 0
          ? formData.targetAudience
          : undefined,
      allowReviews: formData.allowReviews,
      allowDiscussions: formData.allowDiscussions,
      hasCertificate: formData.hasCertificate,
      lifetimeAccess: formData.lifetimeAccess,
      accessDuration: formData.accessDuration || undefined,
      availableFrom: formData.availableFrom || undefined,
      availableUntil: formData.availableUntil || undefined,
    };
  };

  const validateBasicInfo = () => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push('Tiêu đề khóa học không được để trống');
    }

    if (formData.description.trim().length < 20) {
      errors.push('Mô tả khóa học phải có ít nhất 20 ký tự');
    }

    return errors;
  };

  const handleSaveDraft = async () => {
    try {
      // Validate first
      const validationErrors = validateBasicInfo();
      if (validationErrors.length > 0) {
        toast({
          title: 'Lỗi validation',
          description: validationErrors.join(', '),
          variant: 'destructive',
        });
        return;
      }

      const courseData = prepareCourseData();
      console.log('💾 Saving course draft:', courseData);

      const result = await createCourse(courseData).unwrap();
      const courseId = result.id;

      updateFormData({ courseId });

      const uploadPromises = [];

      if (formData.thumbnailFile) {
        const thumbnailPromise = uploadFile(
          courseId,
          formData.thumbnailFile,
          'promotional'
        )
          .then(result => {
            if (result.success && result.fileRecord) {
              updateFormData({ thumbnailUrl: result.fileRecord.fileUrl });
              toast({
                title: 'Thumbnail uploaded',
                description:
                  'Course thumbnail uploaded successfully via Direct S3',
              });
            }
          })
          .catch(error => {
            console.error('Failed to upload thumbnail:', error);
            toast({
              title: 'Thumbnail upload failed',
              description: 'Course saved but thumbnail upload failed',
              variant: 'destructive',
            });
          });
        uploadPromises.push(thumbnailPromise);
      }

      if (formData.trailerVideoFile) {
        const trailerPromise = uploadFile(
          courseId,
          formData.trailerVideoFile,
          'trailer'
        )
          .then(result => {
            if (result.success && result.fileRecord) {
              updateFormData({ trailerVideoUrl: result.fileRecord.fileUrl });
              toast({
                title: 'Trailer video uploaded',
                description:
                  'Course trailer video uploaded successfully via Direct S3',
              });
            }
          })
          .catch(error => {
            console.error('Failed to upload trailer video:', error);
            toast({
              title: 'Trailer video upload failed',
              description: 'Course saved but trailer video upload failed',
              variant: 'destructive',
            });
          });
        uploadPromises.push(trailerPromise);
      }

      // Wait for file uploads to complete
      if (uploadPromises.length > 0) {
        await Promise.allSettled(uploadPromises);
      }

      toast({
        title: 'Draft saved!',
        description:
          'Course draft created successfully. You can now build your curriculum.',
      });
    } catch (error: any) {
      console.error('❌ Course draft save failed:', error);
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to save course draft',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitForReview = async () => {
    try {
      const updateData = prepareCourseDataForUpdate();
      console.log('🔄 Updating existing course with data:', updateData);
      console.log('iddddddd' + formData.courseId);
      console.log(
        '🔄 Updating existing course with pricing/settings:',
        updateData
      );
      try {
        await updateCourse({
          id: formData.courseId!,
          data: updateData,
        }).unwrap();
        console.log('✅ Course updated successfully');
      } catch (updateError: any) {
        console.error(
          '❌ Failed to update course before submission:',
          updateError
        );
        toast({
          title: 'Update Failed',
          description:
            updateError?.data?.message ||
            'Could not save latest changes before submitting. Please try again.',
          variant: 'destructive',
        });
        return; // Stop the submission process if update fails
      }

      await submitForReview(formData.courseId!).unwrap();

      toast({
        title: 'Success!',
        description:
          'Course submitted for review! Admin will review and approve your course. 📋',
      });

      router.push(`/teacher/courses`);
    } catch (error: any) {
      console.error('❌ Course submission failed:', error);
      toast({
        title: 'Error',
        description:
          error?.data?.message || 'Failed to submit course for review',
        variant: 'destructive',
      });
    }
  };

  const handlePreviewCourse = () => {
    // Validate basic requirements for preview
    if (!formData.title.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Course title is required for preview',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.categoryId) {
      toast({
        title: 'Missing Information',
        description: 'Course category is required for preview',
        variant: 'destructive',
      });
      return;
    }

    // Show preview overlay
    setShowPreview(true);

    toast({
      title: 'Preview Mode',
      description: 'Course preview is now displayed',
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <motion.div
            key="basic-info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="title" className="text-lg font-semibold">
                Course Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => updateFormData({ title: e.target.value })}
                placeholder="Enter course title..."
                className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div>
              <Label
                htmlFor="shortDescription"
                className="text-lg font-semibold"
              >
                Short Description
              </Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={e =>
                  updateFormData({ shortDescription: e.target.value })
                }
                placeholder="Brief summary of your course..."
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
                value={formData.description}
                onChange={e => updateFormData({ description: e.target.value })}
                placeholder="Detailed description of what students will learn..."
                rows={6}
                className={`mt-2 border-white/20 bg-white/80 backdrop-blur-sm ${
                  formData.description.trim().length < 20 &&
                  formData.description.trim().length > 0
                    ? 'border-red-300 focus:border-red-500'
                    : ''
                }`}
              />
              <div className="mt-1 flex items-center justify-between">
                <p
                  className={`text-sm ${
                    formData.description.trim().length < 20
                      ? 'text-red-500'
                      : 'text-slate-500'
                  }`}
                >
                  {formData.description.trim().length < 20
                    ? `Cần thêm ${20 - formData.description.trim().length} ký tự nữa`
                    : 'Mô tả đạt yêu cầu ✓'}
                </p>
                <span
                  className={`text-xs ${
                    formData.description.trim().length < 20
                      ? 'text-red-500'
                      : 'text-slate-400'
                  }`}
                >
                  {formData.description.trim().length}/20
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoryId" className="text-lg font-semibold">
                  Category
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={value => updateFormData({ categoryId: value })}
                  disabled={isLoadingCategories}
                >
                  <SelectTrigger className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm">
                    <SelectValue
                      placeholder={
                        isLoadingCategories
                          ? 'Loading categories...'
                          : categoriesError
                            ? 'Error loading categories'
                            : 'Select category'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {isLoadingCategories ? (
                      <SelectItem value="_loading" disabled>
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading categories...
                        </div>
                      </SelectItem>
                    ) : categoriesError ? (
                      <SelectItem value="_error" disabled>
                        <div className="flex items-center text-red-500">
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Failed to load categories
                        </div>
                      </SelectItem>
                    ) : categories.length === 0 ? (
                      <SelectItem value="_empty" disabled>
                        No categories available
                      </SelectItem>
                    ) : (
                      categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center">
                            {category.iconUrl && (
                              <img
                                src={category.iconUrl}
                                alt={category.name}
                                className="mr-2 h-4 w-4 rounded"
                                onError={e => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            {category.name}
                            {category.courseCount > 0 && (
                              <span className="ml-auto text-xs text-muted-foreground">
                                ({category.courseCount})
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {categoriesError && (
                  <p className="mt-1 text-xs text-red-500">
                    Failed to load categories. Please try refreshing the page.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="level" className="text-lg font-semibold">
                  Level
                </Label>
                <Select
                  value={formData.level}
                  onValueChange={(value: CourseLevel) =>
                    updateFormData({ level: value })
                  }
                >
                  <SelectTrigger className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CourseLevel.BEGINNER}>
                      Beginner
                    </SelectItem>
                    <SelectItem value={CourseLevel.INTERMEDIATE}>
                      Intermediate
                    </SelectItem>
                    <SelectItem value={CourseLevel.ADVANCED}>
                      Advanced
                    </SelectItem>
                    <SelectItem value={CourseLevel.EXPERT}>Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="language" className="text-lg font-semibold">
                Language
              </Label>
              <Select
                value={formData.language}
                onValueChange={(value: CourseLanguage) =>
                  updateFormData({ language: value })
                }
              >
                <SelectTrigger className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CourseLanguage.VIETNAMESE}>
                    Tiếng Việt
                  </SelectItem>
                  <SelectItem value={CourseLanguage.ENGLISH}>
                    English
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="durationHours">Duration (Hours)</Label>
                <Input
                  id="durationHours"
                  type="number"
                  value={formData.durationHours}
                  onChange={e =>
                    updateFormData({ durationHours: Number(e.target.value) })
                  }
                  placeholder="0"
                  className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                />
              </div>
              <div>
                <Label htmlFor="durationMinutes">Duration (Minutes)</Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  value={formData.durationMinutes}
                  onChange={e =>
                    updateFormData({ durationMinutes: Number(e.target.value) })
                  }
                  placeholder="0"
                  className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-lg font-semibold">Tags (Optional)</Label>
              <div className="mt-2 space-y-3">
                {/* Tag Input */}
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && tagInput.trim()) {
                      e.preventDefault();
                      const newTag = tagInput.trim();
                      if (!formData.tags.includes(newTag)) {
                        updateFormData({
                          tags: [...formData.tags, newTag],
                        });
                      }
                      setTagInput('');
                    }
                  }}
                  placeholder="Type a tag and press Enter to add"
                  className="border-white/20 bg-white/80 backdrop-blur-sm"
                />

                {/* Tags Display */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 bg-blue-100 px-3 py-1 text-blue-800 hover:bg-blue-200"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newTags = formData.tags.filter(
                              (_, i) => i !== index
                            );
                            updateFormData({ tags: newTags });
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

            <div>
              <Label className="text-lg font-semibold">
                Prerequisites/Requirements (Optional)
              </Label>
              <Textarea
                value={formData.requirements.join('\n')}
                onChange={e =>
                  updateFormData({
                    requirements: e.target.value.split('\n'),
                  })
                }
                placeholder="Enter each requirement on a new line&#10;• Basic programming knowledge&#10;• Computer with internet connection&#10;• Willingness to learn"
                rows={4}
                className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
              />
              <p className="mt-1 text-sm text-slate-500">
                Press Enter to create new lines. Empty lines will be removed
                when saving.
              </p>
            </div>

            <div>
              <Label className="text-lg font-semibold">What You'll Learn</Label>
              <Textarea
                value={formData.whatYouWillLearn.join('\n')}
                onChange={e =>
                  updateFormData({
                    whatYouWillLearn: e.target.value.split('\n'),
                  })
                }
                placeholder="Enter learning outcomes, one per line:&#10;• Build responsive websites&#10;• Master modern JavaScript&#10;• Deploy applications to production"
                rows={5}
                className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
              />
              <p className="mt-1 text-sm text-slate-500">
                Press Enter to create new lines. Empty lines will be removed
                when saving.
              </p>
            </div>

            <div>
              <Label className="text-lg font-semibold">
                Target Audience (Optional)
              </Label>
              <Textarea
                value={formData.targetAudience.join('\n')}
                onChange={e =>
                  updateFormData({
                    targetAudience: e.target.value.split('\n'),
                  })
                }
                placeholder="Who is this course for? One per line:&#10;• Beginners to web development&#10;• Students wanting to learn programming&#10;• Career changers into tech"
                rows={4}
                className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
              />
              <p className="mt-1 text-sm text-slate-500">
                Press Enter to create new lines. Empty lines will be removed
                when saving.
              </p>
            </div>

            <div>
              <Label className="text-lg font-semibold">Course Thumbnail</Label>
              <div className="mt-2 rounded-xl border-2 border-dashed border-white/30 bg-white/40 p-4 backdrop-blur-sm">
                {formData.thumbnailPreview ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={formData.thumbnailPreview}
                        alt="Course thumbnail preview"
                        className="h-48 w-full rounded-lg object-cover"
                      />
                      <div className="absolute right-2 top-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            if (formData.thumbnailPreview) {
                              URL.revokeObjectURL(formData.thumbnailPreview);
                            }
                            updateFormData({
                              thumbnailFile: null,
                              thumbnailPreview: '',
                            });
                          }}
                          className="bg-red-500 text-white hover:bg-red-600"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="mb-2 text-sm text-slate-600">
                        {formData.thumbnailFile?.name}
                      </p>
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
                    <p className="mb-4 text-slate-600">
                      Upload course thumbnail image
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-white/80"
                      onClick={() => thumbnailInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose Image
                    </Button>
                    <p className="mt-2 text-xs text-slate-500">
                      Max size: 5MB. Recommended: 1200x600px
                      <br />
                      {/* <span className="text-emerald-600">
                        ✓ Direct S3 Upload - No server memory usage
                      </span> */}
                    </p>
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

            <div>
              <Label className="text-lg font-semibold">
                Course Trailer Video (Optional)
              </Label>
              <div className="mt-2 rounded-xl border-2 border-dashed border-white/30 bg-white/40 p-4 backdrop-blur-sm">
                {formData.trailerVideoPreview ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <video
                        src={formData.trailerVideoPreview}
                        controls
                        className="h-48 w-full rounded-lg bg-black object-cover"
                      >
                        Your browser does not support the video tag.
                      </video>
                      <div className="absolute right-2 top-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            if (formData.trailerVideoPreview) {
                              URL.revokeObjectURL(formData.trailerVideoPreview);
                            }
                            updateFormData({
                              trailerVideoFile: null,
                              trailerVideoPreview: '',
                            });
                          }}
                          className="bg-red-500 text-white hover:bg-red-600"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="mb-2 text-sm text-slate-600">
                        {formData.trailerVideoFile?.name}
                      </p>
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
                    <p className="mb-4 text-slate-600">
                      Upload course trailer video
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-white/80"
                      onClick={() => trailerVideoInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose Video
                    </Button>
                    <p className="mt-2 text-xs text-slate-500">
                      Max size: 100MB. Recommended formats: MP4, WebM
                      <br />
                      {/* <span className="text-emerald-600">
                        ✓ Direct S3 Upload - No server memory usage
                      </span> */}
                    </p>
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

            {/* Upload Progress Indicator */}
            {isUploading && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-semibold text-blue-800">
                    Uploading to S3...
                  </h4>
                  <span className="text-sm text-blue-600">
                    {uploadProgress}%
                  </span>
                </div>
                <Progress value={uploadProgress} className="h-2 bg-blue-100" />
                <p className="mt-1 text-xs text-blue-600">
                  Status: {uploadStatus} • Using Direct S3 Upload (No server
                  memory usage)
                </p>
              </div>
            )}

            {/* Save Draft Button */}
            {!formData.courseId &&
              formData.title &&
              formData.description &&
              formData.categoryId && (
                <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-800">
                        Ready to save your course?
                      </h4>
                      <p className="text-sm text-green-700">
                        Save your course draft to start building the curriculum
                        • Files upload directly to S3
                      </p>
                    </div>
                    <Button
                      onClick={handleSaveDraft}
                      disabled={
                        isCreating || isUpdating || isSubmitting || isUploading
                      }
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      {isCreating ||
                      isUpdating ||
                      isSubmitting ||
                      isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isCreating
                            ? 'Saving...'
                            : 'Uploading via Direct S3...'}
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Draft
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

            {formData.courseId && (
              <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-blue-800">
                      Course saved successfully!
                    </h4>
                    <p className="text-sm text-blue-700">
                      You can now proceed to build your curriculum
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        );

      case 1: // Curriculum
        return (
          <motion.div
            key="curriculum"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {formData.courseId ? (
              <CurriculumBuilder
                courseId={formData.courseId}
                sections={formData.sections}
                onSectionsChange={sections => updateFormData({ sections })}
              />
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 py-12 text-center">
                <AlertCircle className="mx-auto mb-4 h-16 w-16 text-amber-500" />
                <h3 className="mb-2 text-lg font-semibold text-amber-800">
                  Course Must Be Created First
                </h3>
                <p className="mb-6 text-amber-700">
                  Please complete the basic course information in Step 1 and
                  save your course before building the curriculum.
                </p>
                <Button
                  onClick={() => setCurrentStep(0)}
                  className="bg-amber-500 text-white hover:bg-amber-600"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Go Back to Course Info
                </Button>
              </div>
            )}
          </motion.div>
        );

      case 2: // Pricing
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
                  checked={formData.isFree}
                  onCheckedChange={checked =>
                    updateFormData({
                      isFree: checked,
                      price: checked ? 0 : formData.price,
                      pricingModel: checked
                        ? CoursePricing.FREE
                        : CoursePricing.PAID,
                    })
                  }
                />
              </div>

              {!formData.isFree && (
                <div>
                  <Label htmlFor="price" className="text-lg font-semibold">
                    Course Price
                  </Label>
                  <div className="mt-2 flex space-x-2">
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={e =>
                        updateFormData({ price: Number(e.target.value) })
                      }
                      placeholder="0"
                      className="border-white/20 bg-white/80 backdrop-blur-sm"
                    />
                    <Select
                      value={formData.currency}
                      onValueChange={value =>
                        updateFormData({ currency: value })
                      }
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
                      value={formData.originalPrice}
                      onChange={e =>
                        updateFormData({
                          originalPrice: Number(e.target.value),
                        })
                      }
                      placeholder="Original price for discount display"
                      className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="enrollmentLimit">
                  Enrollment Limit (Optional)
                </Label>
                <Input
                  id="enrollmentLimit"
                  type="number"
                  value={formData.enrollmentLimit}
                  onChange={e =>
                    updateFormData({ enrollmentLimit: Number(e.target.value) })
                  }
                  placeholder="Maximum number of students (0 = unlimited)"
                  className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                />
              </div>

              {!formData.lifetimeAccess && (
                <div>
                  <Label htmlFor="accessDuration">Access Duration (Days)</Label>
                  <Input
                    id="accessDuration"
                    type="number"
                    value={formData.accessDuration}
                    onChange={e =>
                      updateFormData({ accessDuration: Number(e.target.value) })
                    }
                    placeholder="Number of days students have access"
                    className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">Course Settings</Label>

              <div className="space-y-4 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowReviews">Allow Reviews</Label>
                    <p className="text-sm text-slate-500">
                      Students can review this course
                    </p>
                  </div>
                  <Switch
                    id="allowReviews"
                    checked={formData.allowReviews}
                    onCheckedChange={checked =>
                      updateFormData({ allowReviews: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowDiscussions">Allow Discussions</Label>
                    <p className="text-sm text-slate-500">
                      Enable course discussion forum
                    </p>
                  </div>
                  <Switch
                    id="allowDiscussions"
                    checked={formData.allowDiscussions}
                    onCheckedChange={checked =>
                      updateFormData({ allowDiscussions: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="hasCertificate">Certificate</Label>
                    <p className="text-sm text-slate-500">
                      Award certificate upon completion
                    </p>
                  </div>
                  <Switch
                    id="hasCertificate"
                    checked={formData.hasCertificate}
                    onCheckedChange={checked =>
                      updateFormData({ hasCertificate: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="lifetimeAccess">Lifetime Access</Label>
                    <p className="text-sm text-slate-500">
                      Students have lifetime access to course
                    </p>
                  </div>
                  <Switch
                    id="lifetimeAccess"
                    checked={formData.lifetimeAccess}
                    onCheckedChange={checked =>
                      updateFormData({ lifetimeAccess: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Course Availability */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">
                Course Availability
              </Label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="availableFrom">
                    Available From (Optional)
                  </Label>
                  <Input
                    id="availableFrom"
                    type="datetime-local"
                    value={formData.availableFrom}
                    onChange={e =>
                      updateFormData({ availableFrom: e.target.value })
                    }
                    className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    When this course becomes available to students
                  </p>
                </div>

                <div>
                  <Label htmlFor="availableUntil">
                    Available Until (Optional)
                  </Label>
                  <Input
                    id="availableUntil"
                    type="datetime-local"
                    value={formData.availableUntil}
                    onChange={e =>
                      updateFormData({ availableUntil: e.target.value })
                    }
                    className="mt-2 border-white/20 bg-white/80 backdrop-blur-sm"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    When this course expires (leave empty for permanent)
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3: // Review
        return (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Award className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
              <h3 className="mb-2 text-xl font-semibold text-slate-700">
                Ready for Review!
              </h3>
              <p className="mb-6 text-slate-500">
                Review your course details before submitting to admin
              </p>
            </div>

            <Card className="border-white/30 bg-white/60 backdrop-blur-lg">
              <CardHeader>
                <CardTitle>Course Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <strong>Title:</strong> {formData.title || 'Untitled Course'}
                </div>
                <div>
                  <strong>Category:</strong>{' '}
                  {formData.categoryId
                    ? categories.find(cat => cat.id === formData.categoryId)
                        ?.name || 'Unknown category'
                    : 'Not selected'}
                </div>
                <div>
                  <strong>Level:</strong> {formData.level}
                </div>
                <div>
                  <strong>Price:</strong>{' '}
                  {formData.price === 0
                    ? 'Free'
                    : `${formData.price} ${formData.currency}`}
                </div>
                <div>
                  <strong>Language:</strong>{' '}
                  {LANGUAGES.find(l => l.code === formData.language)?.name}
                </div>
                <div>
                  <strong>Duration:</strong> {formData.durationHours}h{' '}
                  {formData.durationMinutes}m
                </div>
                {formData.tags.length > 0 && (
                  <div>
                    <strong>Tags:</strong> {formData.tags.join(', ')}
                  </div>
                )}
                {formData.whatYouWillLearn.length > 0 && (
                  <div>
                    <strong>Learning Outcomes:</strong>
                    <ul className="mt-1 list-inside list-disc text-sm text-slate-600">
                      {formData.whatYouWillLearn
                        .slice(0, 3)
                        .map((outcome, index) => (
                          <li key={index}>{outcome}</li>
                        ))}
                      {formData.whatYouWillLearn.length > 3 && (
                        <li>
                          ... and {formData.whatYouWillLearn.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completion Status */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                  <h4 className="mb-2 text-lg font-semibold text-green-800">
                    Course Ready for Admin Review! 📋
                  </h4>
                  <p className="text-green-700">
                    Your course is complete and ready for admin approval. Click
                    "Submit for Review" below to send it for review.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Enhanced Header */}
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Create New Course
                  </h1>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Step {currentStep + 1} of {WIZARD_STEPS.length}:{' '}
                      {currentStepData.title}
                    </p>
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
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className={`border-white/20 bg-white/60 backdrop-blur-sm transition-all duration-200 ${
                  showAIAssistant
                    ? 'border-purple-200 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-700'
                    : 'hover:bg-white/80'
                }`}
              >
                <Sparkles className="mr-1 h-4 w-4" />
                AI Assistant
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreviewCourse()}
                disabled={!formData.title.trim() || !formData.categoryId}
                className="border-white/20 bg-white/60 backdrop-blur-sm hover:bg-white/80 disabled:opacity-50"
              >
                <Eye className="mr-1 h-4 w-4" />
                Preview
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSaveDraft()}
                disabled={
                  isCreating ||
                  isUpdating ||
                  !formData.title.trim() ||
                  !formData.categoryId
                }
                className="border-white/20 bg-white/60 backdrop-blur-sm hover:bg-white/80 disabled:opacity-50"
              >
                {isCreating || isUpdating ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-1 h-4 w-4" />
                )}
                Save Draft
              </Button>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-slate-700">
                  Progress: {Math.round(progressPercentage)}%
                </span>
                <Badge
                  variant="secondary"
                  className="bg-white/60 text-slate-600"
                >
                  {
                    WIZARD_STEPS.filter((_, index) => isStepCompleted(index))
                      .length
                  }{' '}
                  of {WIZARD_STEPS.length} completed
                </Badge>
              </div>
              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                <span>~{currentStepData.estimatedTime} min for this step</span>
              </div>
            </div>
            <div className="relative">
              <Progress
                value={progressPercentage}
                className="h-3 border border-white/20 bg-white/40 backdrop-blur-sm"
              />
              <div
                className="absolute left-0 top-0 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 shadow-sm transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto overflow-visible px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Step Navigation */}
          <div className="col-span-3">
            <Card className="sticky top-32 border-white/30 bg-white/80 shadow-xl backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-lg">Course Creation Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {WIZARD_STEPS.map((step, index) => (
                  <motion.button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    className={`w-full rounded-xl p-3 text-left transition-all duration-200 ${
                      index === currentStep
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                        : isStepCompleted(index)
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'text-slate-600 hover:bg-white/60'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          index === currentStep
                            ? 'bg-white/20'
                            : isStepCompleted(index)
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isStepCompleted(index) ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{step.title}</p>
                        <p
                          className={`text-xs ${index === currentStep ? 'text-white/80' : 'text-slate-500'}`}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-6">
            <Card className="min-h-96 border-white/30 bg-white/80 shadow-xl backdrop-blur-lg">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                    {currentStepData.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {currentStepData.title}
                    </CardTitle>
                    <p className="text-slate-600">
                      {currentStepData.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {renderStepContent()}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="mt-8 flex items-center justify-between border-t border-white/20 pt-6">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="border-white/20 bg-white/60 backdrop-blur-sm"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>

                  {currentStep === WIZARD_STEPS.length - 1 ? (
                    <Button
                      onClick={handleSubmitForReview}
                      disabled={
                        isCreating || isUpdating || isSubmitting || isUploading
                      }
                      className="bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg hover:from-emerald-600 hover:to-green-700"
                    >
                      {isCreating ||
                      isUpdating ||
                      isSubmitting ||
                      isUploading ? (
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
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg hover:from-blue-600 hover:to-indigo-700"
                    >
                      Next Step
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Assistant Panel */}
          {showAIAssistant && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="col-span-3"
            >
              <Card className="sticky top-32 border-purple-200/30 bg-gradient-to-br from-purple-50/80 to-indigo-50/80 shadow-xl backdrop-blur-lg">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg text-purple-700">
                      AI Course Assistant
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-purple-600">
                    💡 <strong>Tip for this step:</strong>
                    <p className="mt-1 text-purple-700">
                      {currentStep === 0 &&
                        "Make sure to fill in learning outcomes - this helps students understand what they'll achieve. Use clear, engaging titles with relevant keywords. Don't forget to save your draft!"}
                      {currentStep === 1 &&
                        'Create a logical course structure with sections and lessons. Upload videos, audio, thumbnails and documents directly within each lesson. High-quality content with good audio is essential for engagement.'}
                      {currentStep === 2 &&
                        'Consider your pricing strategy carefully. Free courses get more students but paid courses show higher completion rates.'}
                      {currentStep === 3 &&
                        'Double-check all information before submitting. Admin will review and approve your course.'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">
                      Suggested improvements:
                    </p>
                    <div className="space-y-1">
                      {formData.title && (
                        <Badge
                          variant="outline"
                          className="border-green-200 bg-green-50 text-xs text-green-700"
                        >
                          ✓ Title added
                        </Badge>
                      )}
                      {formData.description && (
                        <Badge
                          variant="outline"
                          className="border-green-200 bg-green-50 text-xs text-green-700"
                        >
                          ✓ Description added
                        </Badge>
                      )}
                      {formData.categoryId ? (
                        <Badge
                          variant="outline"
                          className="border-green-200 bg-green-50 text-xs text-green-700"
                        >
                          ✓ Category selected
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-amber-200 bg-amber-50 text-xs text-amber-700"
                        >
                          Select a category
                        </Badge>
                      )}
                      {formData.whatYouWillLearn.length > 0 ? (
                        <Badge
                          variant="outline"
                          className="border-green-200 bg-green-50 text-xs text-green-700"
                        >
                          ✓ Learning outcomes added
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-amber-200 bg-amber-50 text-xs text-amber-700"
                        >
                          Add learning outcomes
                        </Badge>
                      )}
                      {formData.tags.length > 0 && (
                        <Badge
                          variant="outline"
                          className="border-green-200 bg-green-50 text-xs text-green-700"
                        >
                          ✓ Tags added
                        </Badge>
                      )}
                      {formData.courseId ? (
                        <Badge
                          variant="outline"
                          className="border-green-200 bg-green-50 text-xs text-green-700"
                        >
                          ✓ Course saved
                        </Badge>
                      ) : formData.title &&
                        formData.description &&
                        formData.categoryId ? (
                        <Badge
                          variant="outline"
                          className="border-blue-200 bg-blue-50 text-xs text-blue-700"
                        >
                          Ready to save draft
                        </Badge>
                      ) : null}
                      {formData.sections.length > 0 && (
                        <Badge
                          variant="outline"
                          className="border-green-200 bg-green-50 text-xs text-green-700"
                        >
                          ✓ {formData.sections.length} sections created
                        </Badge>
                      )}
                      {formData.sections.some(
                        s => s.lessons && s.lessons.length > 0
                      ) && (
                        <Badge
                          variant="outline"
                          className="border-green-200 bg-green-50 text-xs text-green-700"
                        >
                          ✓ Lessons & content created
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get AI Suggestions
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
