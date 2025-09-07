'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  MessageSquare,
  HelpCircle,
  Megaphone,
  ArrowLeft,
  Save,
  Eye,
  Settings,
  Users,
  AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import PostEditor from './PostEditor';
import { ForumCategory } from '@/lib/types/forum';
import { forumApi } from '@/lib/redux/api/forum-api';
import { useAuth } from '@/hooks/use-auth';

// Thread creation schema
const threadSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  categoryId: z.string().min(1, 'Please select a category'),
  type: z.enum(['thread', 'question', 'announcement']).default('thread'),
  summary: z.string().max(500, 'Summary must be less than 500 characters').optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  isPinned: z.boolean().default(false),
  isLocked: z.boolean().default(false),
  requiresApproval: z.boolean().default(false),
  allowAnonymous: z.boolean().default(false),
  isAnonymous: z.boolean().default(false),
});

type ThreadFormData = z.infer<typeof threadSchema>;

interface ThreadCreatorProps {
  categoryId?: string;
  onSuccess?: (threadId: string) => void;
  onCancel?: () => void;
  showBackButton?: boolean;
}

const ThreadTypeSelector = ({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void; 
}) => {
  const threadTypes = [
    {
      value: 'thread',
      label: 'Discussion',
      description: 'Start a general discussion or conversation',
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
    },
    {
      value: 'question',
      label: 'Question',
      description: 'Ask a question and get answers from the community',
      icon: <HelpCircle className="h-5 w-5" />,
      color: 'bg-green-50 border-green-200 text-green-700',
    },
    {
      value: 'announcement',
      label: 'Announcement',
      description: 'Make an important announcement',
      icon: <Megaphone className="h-5 w-5" />,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
    },
  ];

  return (
    <div className="space-y-3">
      <Label>Thread Type</Label>
      <RadioGroup value={value} onValueChange={onChange}>
        {threadTypes.map((type) => (
          <div key={type.value} className="flex items-center space-x-2">
            <RadioGroupItem value={type.value} id={type.value} />
            <Label htmlFor={type.value} className="flex-1 cursor-pointer">
              <div className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-colors ${
                value === type.value ? type.color : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex-shrink-0 mt-0.5">
                  {type.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {type.description}
                  </div>
                </div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

const ThreadCreator: React.FC<ThreadCreatorProps> = ({
  categoryId,
  onSuccess,
  onCancel,
  showBackButton = true,
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<'type' | 'details' | 'content'>('type');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // API hooks
  const { data: categories = [], isLoading: categoriesLoading } = forumApi.useGetCategoriesQuery();
  const { data: availableTags = [] } = forumApi.useGetTagsQuery({ popular: true });
  const [createThread, { isLoading: isCreating }] = forumApi.useCreateThreadMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<ThreadFormData>({
    resolver: zodResolver(threadSchema),
    defaultValues: {
      type: 'thread',
      categoryId: categoryId || '',
      tags: [],
      isPinned: false,
      isLocked: false,
      requiresApproval: false,
      allowAnonymous: false,
      isAnonymous: false,
    },
    mode: 'onChange',
  });

  const watchedType = watch('type');
  const watchedTitle = watch('title');
  const watchedContent = watch('content');
  const watchedCategoryId = watch('categoryId');

  const handleBack = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const handleSaveDraft = async (data: Partial<ThreadFormData>) => {
    try {
      // Save to localStorage or API
      const draftKey = `forum_thread_draft_${Date.now()}`;
      localStorage.setItem(draftKey, JSON.stringify(data));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const onSubmit = async (data: ThreadFormData & { attachments?: File[] }) => {
    console.log('Submitting thread data:', data);
    console.log('Title value:', data.title, 'Length:', data.title?.length);
    console.log('Authentication status:', { isAuthenticated, user });
    
    // Check authentication
    if (!isAuthenticated || !user) {
      alert('You must be logged in to create a thread. Please log in and try again.');
      router.push('/login');
      return;
    }
    
    // The token will be handled automatically by the baseApi with AdvancedTokenManager
    // No need to manually check token here since RTK Query will handle it
    
    // Validate required fields
    if (!data.title || data.title.length < 5) {
      console.error('Title validation failed:', { title: data.title, length: data.title?.length });
      alert(`Title must be at least 5 characters long. Current: "${data.title}" (${data.title?.length} chars)`);
      return;
    }
    
    if (!data.categoryId && (!categories || categories.length === 0)) {
      alert('Please select a category or wait for categories to load');
      return;
    }
    
    try {
      // Clean payload to match backend expectations
      const payload = {
        title: data.title,
        content: data.content,
        categoryId: data.categoryId || categories[0]?.id,
        type: data.type,
        tags: data.tags || [],
        summary: data.summary,
        // Remove fields that backend doesn't expect
        // isAnonymous, attachments, attachmentUrls are not sent
      };
      
      console.log('Thread creation payload:', payload);
      
      const result = await createThread(payload).unwrap();

      // Clear any saved draft
      const draftKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('forum_thread_draft_')
      );
      draftKeys.forEach(key => localStorage.removeItem(key));

      if (onSuccess) {
        onSuccess(result.id);
      } else {
        router.push(`/forum/threads/${result.slug}`);
      }
    } catch (error: any) {
      console.error('Failed to create thread:', error);
      
      let errorMessage = 'Failed to create thread. ';
      if (error?.data?.message) {
        errorMessage += error.data.message;
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please check the console for details and try again.';
      }
      
      // Handle error - show error message and stay on form
      alert(errorMessage);
    }
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'type': return 33;
      case 'details': return 66;
      case 'content': return 100;
      default: return 0;
    }
  };

  const canProceedToDetails = watchedType;
  const canProceedToContent = canProceedToDetails && watchedTitle && watchedCategoryId;

  if (categoriesLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-pulse">Loading categories...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Thread</h1>
            <p className="text-gray-600">Share your thoughts with the community</p>
          </div>
        </div>

        {draftSaved && (
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            <Save className="h-3 w-3 mr-1" />
            Draft Saved
          </Badge>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${getStepProgress()}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-8">
          {[
            { key: 'type', label: 'Type', icon: MessageSquare },
            { key: 'details', label: 'Details', icon: Settings },
            { key: 'content', label: 'Content', icon: Eye },
          ].map(({ key, label, icon: Icon }) => (
            <div 
              key={key}
              className={`flex items-center gap-2 ${
                currentStep === key ? 'text-blue-600' : 
                ['type', 'details'].includes(key) && currentStep === 'content' ? 'text-green-600' :
                'text-gray-400'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Thread Type */}
        {currentStep === 'type' && (
          <Card>
            <CardHeader>
              <CardTitle>What type of thread do you want to create?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ThreadTypeSelector
                value={watchedType}
                onChange={(value) => setValue('type', value as any)}
              />

              <div className="flex justify-end">
                <Button 
                  type="button"
                  onClick={() => setCurrentStep('details')}
                  disabled={!canProceedToDetails}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Thread Details */}
        {currentStep === 'details' && (
          <Card>
            <CardHeader>
              <CardTitle>Thread Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder={
                    watchedType === 'question' ? 'What is your question?' :
                    watchedType === 'announcement' ? 'Announcement title' :
                    'Enter your thread title'
                  }
                  className="mt-1"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watchedCategoryId}
                  onValueChange={(value) => setValue('categoryId', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: ForumCategory) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-sm text-red-600 mt-1">{errors.categoryId.message}</p>
                )}
              </div>

              {/* Summary */}
              <div>
                <Label htmlFor="summary">Summary (optional)</Label>
                <Textarea
                  id="summary"
                  {...register('summary')}
                  placeholder="Brief summary of your thread (helps with search and discovery)"
                  className="mt-1"
                  rows={2}
                />
                {errors.summary && (
                  <p className="text-sm text-red-600 mt-1">{errors.summary.message}</p>
                )}
              </div>

              {/* Advanced Options */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-medium">Advanced Options</Label>
                  <Switch
                    checked={showAdvancedOptions}
                    onCheckedChange={setShowAdvancedOptions}
                  />
                </div>

                {showAdvancedOptions && (
                  <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="anonymous"
                        checked={watch('isAnonymous')}
                        onCheckedChange={(checked) => setValue('isAnonymous', checked)}
                      />
                      <Label htmlFor="anonymous">Post anonymously</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="approval"
                        checked={watch('requiresApproval')}
                        onCheckedChange={(checked) => setValue('requiresApproval', checked)}
                      />
                      <Label htmlFor="approval">Require approval for replies</Label>
                    </div>

                    {/* Moderator options */}
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Pinning and locking options are available to moderators after creation.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('type')}
                >
                  Back
                </Button>
                <Button 
                  type="button"
                  onClick={() => setCurrentStep('content')}
                  disabled={!canProceedToContent}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Content Editor */}
        {currentStep === 'content' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Write Your {watchedType === 'question' ? 'Question' : watchedType === 'announcement' ? 'Announcement' : 'Thread'}</h3>
                <p className="text-gray-600 text-sm">
                  {watchedTitle && `"${watchedTitle}"`}
                </p>
              </div>
              <Button 
                type="button"
                variant="outline"
                onClick={() => setCurrentStep('details')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            </div>

            <PostEditor
              postType={watchedType as any}
              initialTitle={watchedTitle} // Pass title from previous step
              showTitle={false} // Title already set in previous step
              showCategory={false} // Category already set
              showTags={true}
              showTypeSelector={false}
              placeholder={`Write your ${watchedType === 'question' ? 'question' : watchedType === 'announcement' ? 'announcement' : 'thread'} content here...`}
              categories={categories.map(c => ({ id: c.id, name: c.name }))}
              availableTags={availableTags}
              onSubmit={(data) => {
                // Merge data with ThreadCreator form state
                const threadData = {
                  ...data,
                  title: watchedTitle, // Use title from ThreadCreator form
                  categoryId: watchedCategoryId, // Use category from ThreadCreator form
                  type: watchedType, // Use type from ThreadCreator form
                  summary: watch('summary'), // Use summary from ThreadCreator form
                };
                onSubmit(threadData);
              }}
              onCancel={handleBack}
              onSaveDraft={handleSaveDraft}
              isSubmitting={isCreating}
            />
          </div>
        )}
      </form>
    </div>
  );
};

export default ThreadCreator;