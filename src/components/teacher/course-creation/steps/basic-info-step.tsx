'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Image as ImageIcon,
  Tag,
  Users,
  Target,
  BookOpen,
  Star,
  Plus,
  X,
  Sparkles,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Import API hooks
import {
  useGenerateAIContentSuggestionMutation,
  useUploadCourseContentMutation,
} from '@/lib/redux/api/course-creation-api';
import type { CourseDraft } from '@/lib/redux/api/course-creation-api';

interface BasicInfoStepProps {
  draft: CourseDraft;
  onUpdate: (updates: Partial<CourseDraft>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

// Mock categories - should come from API
const CATEGORIES = [
  {
    id: '1',
    name: 'Programming & Development',
    subcategories: [
      'Web Development',
      'Mobile Development',
      'Game Development',
    ],
  },
  {
    id: '2',
    name: 'Business',
    subcategories: ['Marketing', 'Finance', 'Management'],
  },
  {
    id: '3',
    name: 'Design',
    subcategories: ['Graphic Design', 'UI/UX', 'Interior Design'],
  },
  {
    id: '4',
    name: 'Data Science',
    subcategories: ['Machine Learning', 'Data Analysis', 'Statistics'],
  },
  {
    id: '5',
    name: 'Language',
    subcategories: ['English', 'Spanish', 'French'],
  },
];

const LEVELS = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'No prior knowledge required',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Some background knowledge helpful',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'Significant experience required',
  },
  {
    value: 'expert',
    label: 'Expert',
    description: 'Professional level knowledge needed',
  },
  {
    value: 'all_levels',
    label: 'All Levels',
    description: 'Suitable for everyone',
  },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
];

const POPULAR_TAGS = [
  'Programming',
  'Web Development',
  'React',
  'JavaScript',
  'Python',
  'Machine Learning',
  'Data Science',
  'Marketing',
  'Business',
  'Design',
  'UI/UX',
  'Photography',
  'Video Editing',
  'Music',
];

export function BasicInfoStep({
  draft,
  onUpdate,
  onNext,
  onPrevious,
  isLoading,
  errors = {},
}: BasicInfoStepProps) {
  const { toast } = useToast();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newLearningOutcome, setNewLearningOutcome] = useState('');
  const [newTargetAudience, setNewTargetAudience] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [generateAISuggestion] = useGenerateAIContentSuggestionMutation();
  const [uploadContent] = useUploadCourseContentMutation();

  // Get selected category
  const selectedCategory = CATEGORIES.find(
    cat => cat.id === draft.basicInfo.categoryId
  );

  // Handle thumbnail upload
  const handleThumbnailUpload = async (file: File) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);

      // Upload file
      const result = await uploadContent({
        file,
        type: 'thumbnail',
        courseId: draft.id,
      }).unwrap();

      onUpdate({
        content: {
          ...draft.content,
          thumbnail: result.url,
        },
      });

      toast({
        title: 'Thumbnail Uploaded',
        description: 'Course thumbnail has been uploaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload thumbnail. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // AI content generation
  const generateAIContent = async (
    type: 'title' | 'description' | 'objectives'
  ) => {
    setIsGeneratingAI(true);
    try {
      const context = `Course: ${draft.basicInfo.title}\nCategory: ${selectedCategory?.name}\nLevel: ${draft.basicInfo.level}`;

      const result = await generateAISuggestion({
        type,
        context,
        courseData: draft,
      }).unwrap();

      if (type === 'title') {
        onUpdate({
          basicInfo: {
            ...draft.basicInfo,
            title: result.content,
          },
        });
      } else if (type === 'description') {
        onUpdate({
          basicInfo: {
            ...draft.basicInfo,
            description: result.content,
          },
        });
      } else if (type === 'objectives') {
        const objectives = result.content
          .split('\n')
          .filter(line => line.trim());
        onUpdate({
          basicInfo: {
            ...draft.basicInfo,
            whatYouWillLearn: objectives,
          },
        });
      }

      toast({
        title: 'AI Suggestion Applied',
        description: `Generated ${type} using AI`,
      });
    } catch (error) {
      toast({
        title: 'AI Generation Failed',
        description: 'Unable to generate content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Array management helpers
  const addTag = () => {
    if (newTag.trim() && !draft.basicInfo.tags.includes(newTag.trim())) {
      onUpdate({
        basicInfo: {
          ...draft.basicInfo,
          tags: [...draft.basicInfo.tags, newTag.trim()],
        },
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onUpdate({
      basicInfo: {
        ...draft.basicInfo,
        tags: draft.basicInfo.tags.filter(tag => tag !== tagToRemove),
      },
    });
  };

  const addPopularTag = (tag: string) => {
    if (!draft.basicInfo.tags.includes(tag)) {
      onUpdate({
        basicInfo: {
          ...draft.basicInfo,
          tags: [...draft.basicInfo.tags, tag],
        },
      });
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      onUpdate({
        basicInfo: {
          ...draft.basicInfo,
          requirements: [
            ...draft.basicInfo.requirements,
            newRequirement.trim(),
          ],
        },
      });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    onUpdate({
      basicInfo: {
        ...draft.basicInfo,
        requirements: draft.basicInfo.requirements.filter(
          (_, i) => i !== index
        ),
      },
    });
  };

  const addLearningOutcome = () => {
    if (newLearningOutcome.trim()) {
      onUpdate({
        basicInfo: {
          ...draft.basicInfo,
          whatYouWillLearn: [
            ...draft.basicInfo.whatYouWillLearn,
            newLearningOutcome.trim(),
          ],
        },
      });
      setNewLearningOutcome('');
    }
  };

  const removeLearningOutcome = (index: number) => {
    onUpdate({
      basicInfo: {
        ...draft.basicInfo,
        whatYouWillLearn: draft.basicInfo.whatYouWillLearn.filter(
          (_, i) => i !== index
        ),
      },
    });
  };

  const addTargetAudience = () => {
    if (newTargetAudience.trim()) {
      onUpdate({
        basicInfo: {
          ...draft.basicInfo,
          targetAudience: [
            ...draft.basicInfo.targetAudience,
            newTargetAudience.trim(),
          ],
        },
      });
      setNewTargetAudience('');
    }
  };

  const removeTargetAudience = (index: number) => {
    onUpdate({
      basicInfo: {
        ...draft.basicInfo,
        targetAudience: draft.basicInfo.targetAudience.filter(
          (_, i) => i !== index
        ),
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Course Title & Subtitle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Title & Description
            </CardTitle>
            <CardDescription>
              Create an engaging title and description that clearly explains
              what your course offers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title">Course Title *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => generateAIContent('title')}
                  disabled={isGeneratingAI}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isGeneratingAI ? 'Generating...' : 'AI Suggest'}
                </Button>
              </div>
              <Input
                id="title"
                value={draft.basicInfo.title}
                onChange={e =>
                  onUpdate({
                    basicInfo: { ...draft.basicInfo, title: e.target.value },
                  })
                }
                placeholder="e.g., Complete React Development Bootcamp"
                className={cn(errors.title && 'border-red-500')}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
              <p className="text-sm text-gray-500">
                {draft.basicInfo.title.length}/100 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Course Subtitle</Label>
              <Input
                id="subtitle"
                value={draft.basicInfo.subtitle}
                onChange={e =>
                  onUpdate({
                    basicInfo: { ...draft.basicInfo, subtitle: e.target.value },
                  })
                }
                placeholder="e.g., Learn React, Redux, and modern JavaScript from scratch"
              />
              <p className="text-sm text-gray-500">
                {draft.basicInfo.subtitle.length}/120 characters
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Course Description *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => generateAIContent('description')}
                  disabled={isGeneratingAI}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Suggest
                </Button>
              </div>
              <Textarea
                id="description"
                value={draft.basicInfo.description}
                onChange={e =>
                  onUpdate({
                    basicInfo: {
                      ...draft.basicInfo,
                      description: e.target.value,
                    },
                  })
                }
                placeholder="Describe what students will learn in your course..."
                rows={6}
                className={cn(errors.description && 'border-red-500')}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
              <p className="text-sm text-gray-500">
                {draft.basicInfo.description.length}/1000 characters recommended
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Course Image */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Course Thumbnail
            </CardTitle>
            <CardDescription>
              Upload an eye-catching thumbnail image (1280x720 recommended)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-gray-400">
              {thumbnailPreview ? (
                <div className="space-y-4">
                  <img
                    src={thumbnailPreview}
                    alt="Course thumbnail"
                    className="mx-auto h-48 max-w-full rounded-lg object-cover"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setThumbnailPreview(null);
                      onUpdate({
                        content: { ...draft.content, thumbnail: undefined },
                      });
                    }}
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <h3 className="text-lg font-medium">
                      Upload Course Thumbnail
                    </h3>
                    <p className="text-gray-500">
                      PNG, JPG up to 5MB (1280x720 recommended)
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleThumbnailUpload(file);
                    }}
                    className="mx-auto max-w-xs"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category & Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Category & Course Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={draft.basicInfo.categoryId}
                  onValueChange={value =>
                    onUpdate({
                      basicInfo: { ...draft.basicInfo, categoryId: value },
                    })
                  }
                >
                  <SelectTrigger
                    className={cn(errors.categoryId && 'border-red-500')}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-sm text-red-500">{errors.categoryId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Course Level</Label>
                <Select
                  value={draft.basicInfo.level}
                  onValueChange={(value: any) =>
                    onUpdate({
                      basicInfo: { ...draft.basicInfo, level: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-sm text-gray-500">
                            {level.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Primary Language</Label>
                <Select
                  value={draft.basicInfo.language}
                  onValueChange={value =>
                    onUpdate({
                      basicInfo: { ...draft.basicInfo, language: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estimated Duration</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={draft.basicInfo.duration.hours}
                      onChange={e =>
                        onUpdate({
                          basicInfo: {
                            ...draft.basicInfo,
                            duration: {
                              ...draft.basicInfo.duration,
                              hours: parseInt(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      placeholder="Hours"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={draft.basicInfo.duration.minutes}
                      onChange={e =>
                        onUpdate({
                          basicInfo: {
                            ...draft.basicInfo,
                            duration: {
                              ...draft.basicInfo.duration,
                              minutes: parseInt(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      placeholder="Minutes"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Estimated total course duration
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Course Tags
            </CardTitle>
            <CardDescription>
              Add relevant tags to help students find your course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={e => e.key === 'Enter' && addTag()}
              />
              <Button type="button" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Popular Tags */}
            <div>
              <Label className="mb-2 block text-sm text-gray-600">
                Popular tags:
              </Label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TAGS.map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => addPopularTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Selected Tags */}
            {draft.basicInfo.tags.length > 0 && (
              <div>
                <Label className="mb-2 block text-sm text-gray-600">
                  Selected tags:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {draft.basicInfo.tags.map(tag => (
                    <Badge key={tag} className="bg-blue-100 text-blue-800">
                      {tag}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Outcomes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              What You'll Learn
            </CardTitle>
            <CardDescription>
              List the key skills and knowledge students will gain
            </CardDescription>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => generateAIContent('objectives')}
              disabled={isGeneratingAI}
              className="self-start border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI Generate
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newLearningOutcome}
                onChange={e => setNewLearningOutcome(e.target.value)}
                placeholder="e.g., Build modern React applications"
                onKeyPress={e => e.key === 'Enter' && addLearningOutcome()}
              />
              <Button type="button" onClick={addLearningOutcome}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {draft.basicInfo.whatYouWillLearn.length > 0 && (
              <div className="space-y-2">
                {draft.basicInfo.whatYouWillLearn.map((outcome, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-lg bg-green-50 p-2"
                  >
                    <Star className="h-4 w-4 flex-shrink-0 text-green-600" />
                    <span className="flex-1">{outcome}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLearningOutcome(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {draft.basicInfo.whatYouWillLearn.length === 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Add at least 3-5 learning outcomes to help students understand
                  what they'll achieve.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Course Requirements
            </CardTitle>
            <CardDescription>
              List any prerequisites or requirements for this course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newRequirement}
                onChange={e => setNewRequirement(e.target.value)}
                placeholder="e.g., Basic HTML and CSS knowledge"
                onKeyPress={e => e.key === 'Enter' && addRequirement()}
              />
              <Button type="button" onClick={addRequirement}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {draft.basicInfo.requirements.length > 0 && (
              <div className="space-y-2">
                {draft.basicInfo.requirements.map((requirement, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-lg bg-orange-50 p-2"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-orange-600" />
                    <span className="flex-1">{requirement}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRequirement(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Target Audience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Target Audience
            </CardTitle>
            <CardDescription>
              Describe who this course is designed for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTargetAudience}
                onChange={e => setNewTargetAudience(e.target.value)}
                placeholder="e.g., Beginner web developers"
                onKeyPress={e => e.key === 'Enter' && addTargetAudience()}
              />
              <Button type="button" onClick={addTargetAudience}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {draft.basicInfo.targetAudience.length > 0 && (
              <div className="space-y-2">
                {draft.basicInfo.targetAudience.map((audience, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-lg bg-blue-50 p-2"
                  >
                    <Users className="h-4 w-4 flex-shrink-0 text-blue-600" />
                    <span className="flex-1">{audience}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTargetAudience(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completion Tips */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Tips for a great course:</strong>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                Use clear, engaging titles that highlight the main benefit
              </li>
              <li>
                Write descriptions that focus on outcomes, not just topics
              </li>
              <li>
                Choose appropriate difficulty level for your target audience
              </li>
              <li>Add relevant tags to improve discoverability</li>
              <li>Be specific about what students will learn and achieve</li>
            </ul>
          </AlertDescription>
        </Alert>
      </motion.div>
    </div>
  );
}
