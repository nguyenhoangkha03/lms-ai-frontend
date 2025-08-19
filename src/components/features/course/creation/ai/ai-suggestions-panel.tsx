'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Lightbulb,
  Target,
  BookOpen,
  FileText,
  MessageSquare,
  Star,
  Brain,
  CheckCircle,
  Info,
  Wand2,
  Clock,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Import API hooks
import {
  useGetAIContentSuggestionsQuery,
  useGenerateAIContentSuggestionMutation,
  useApplyAISuggestionMutation,
} from '@/lib/redux/api/course-creation-api';
import type {
  CourseDraft,
  AIContentSuggestion,
} from '@/lib/redux/api/course-creation-api';

interface AISuggestionsPanelProps {
  courseId?: string | null;
  currentStep: string;
  courseDraft: CourseDraft;
  onApplySuggestion: (suggestion: AIContentSuggestion) => void;
  onClose: () => void;
  className?: string;
}

const SUGGESTION_TYPES = [
  {
    id: 'title',
    label: 'Course Title',
    icon: FileText,
    description: 'Generate compelling course titles',
    color: 'text-blue-600',
  },
  {
    id: 'description',
    label: 'Description',
    icon: MessageSquare,
    description: 'Create engaging course descriptions',
    color: 'text-green-600',
  },
  {
    id: 'outline',
    label: 'Course Outline',
    icon: BookOpen,
    description: 'Structure your course curriculum',
    color: 'text-purple-600',
  },
  {
    id: 'objectives',
    label: 'Learning Objectives',
    icon: Target,
    description: 'Define clear learning outcomes',
    color: 'text-orange-600',
  },
  {
    id: 'lesson_content',
    label: 'Lesson Content',
    icon: Lightbulb,
    description: 'Generate lesson ideas and content',
    color: 'text-teal-600',
  },
  {
    id: 'quiz_questions',
    label: 'Quiz Questions',
    icon: Star,
    description: 'Create assessment questions',
    color: 'text-pink-600',
  },
];

const STEP_SUGGESTIONS: Record<string, string[]> = {
  'basic-info': ['title', 'description', 'objectives'],
  curriculum: ['outline', 'lesson_content'],
  content: ['lesson_content', 'quiz_questions'],
  pricing: [],
  settings: [],
  review: ['title', 'description'],
};

export function AISuggestionsPanel({
  courseId,
  currentStep,
  courseDraft,
  onApplySuggestion,
  onClose,
  className,
}: AISuggestionsPanelProps) {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>('title');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(
    new Set()
  );

  // API hooks
  const {
    data: suggestions,
    isLoading: isLoadingSuggestions,
    refetch: refetchSuggestions,
  } = useGetAIContentSuggestionsQuery({
    courseId: courseId || undefined,
    type: selectedType,
    limit: 5,
  });

  const [generateSuggestion] = useGenerateAIContentSuggestionMutation();
  const [applySuggestion] = useApplyAISuggestionMutation();

  // Get relevant suggestion types for current step
  const relevantTypes = STEP_SUGGESTIONS[currentStep] || [];
  const displayTypes =
    relevantTypes.length > 0
      ? SUGGESTION_TYPES.filter(type => relevantTypes.includes(type.id))
      : SUGGESTION_TYPES;

  // Set default selected type based on current step
  useEffect(() => {
    if (relevantTypes.length > 0 && !relevantTypes.includes(selectedType)) {
      setSelectedType(relevantTypes[0]);
    }
  }, [currentStep, relevantTypes, selectedType]);

  // Generate new suggestion
  const handleGenerateSuggestion = async () => {
    setIsGenerating(true);
    try {
      const context = buildContextForType(selectedType);
      const result = await generateSuggestion({
        type: selectedType,
        context,
        courseData: courseDraft,
        customPrompt: customPrompt || undefined,
      }).unwrap();

      toast({
        title: 'AI Suggestion Generated',
        description:
          'New suggestion has been created based on your course content.',
      });

      // Refetch suggestions to include the new one
      refetchSuggestions();
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Unable to generate suggestion. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Build context based on suggestion type
  const buildContextForType = (type: string): string => {
    const { basicInfo, curriculum } = courseDraft;

    switch (type) {
      case 'title':
        return `Course about: ${basicInfo.description || 'Course creation'}. Level: ${basicInfo.level}. Category: ${basicInfo.categoryId}`;

      case 'description':
        return `Course title: ${basicInfo.title}. Level: ${basicInfo.level}. Duration: ${basicInfo.duration.hours}h ${basicInfo.duration.minutes}m. Learning outcomes: ${basicInfo.whatYouWillLearn.join(', ')}`;

      case 'outline':
        return `Course: ${basicInfo.title}. Description: ${basicInfo.description}. Level: ${basicInfo.level}. Learning outcomes: ${basicInfo.whatYouWillLearn.join(', ')}`;

      case 'objectives':
        return `Course: ${basicInfo.title}. Description: ${basicInfo.description}. Level: ${basicInfo.level}`;

      case 'lesson_content':
        return `Course: ${basicInfo.title}. Level: ${basicInfo.level}. Current sections: ${curriculum.sections.map(s => s.title).join(', ')}`;

      case 'quiz_questions':
        return `Course: ${basicInfo.title}. Level: ${basicInfo.level}. Topics covered: ${curriculum.sections.map(s => s.title).join(', ')}`;

      default:
        return `Course: ${basicInfo.title || 'Untitled'}. Level: ${basicInfo.level}`;
    }
  };

  // Apply suggestion
  const handleApplySuggestion = async (suggestion: AIContentSuggestion) => {
    if (!courseId) {
      // Local application
      onApplySuggestion(suggestion);
      setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
      return;
    }

    try {
      await applySuggestion({
        suggestionId: suggestion.id,
        courseId,
        fieldPath: getFieldPathForType(suggestion.type),
        feedback: { isHelpful: true },
      }).unwrap();

      onApplySuggestion(suggestion);
      setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));

      toast({
        title: 'Suggestion Applied',
        description: 'The AI suggestion has been applied to your course.',
      });
    } catch (error) {
      toast({
        title: 'Application Failed',
        description: 'Unable to apply suggestion. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Get field path for suggestion type
  const getFieldPathForType = (type: string): string => {
    switch (type) {
      case 'title':
        return 'basicInfo.title';
      case 'description':
        return 'basicInfo.description';
      case 'objectives':
        return 'basicInfo.whatYouWillLearn';
      default:
        return 'content';
    }
  };

  // Copy to clipboard
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to Clipboard',
      description: 'Content has been copied to your clipboard.',
    });
  };

  // Get suggestion icon
  const getSuggestionIcon = (type: string) => {
    const suggestionType = SUGGESTION_TYPES.find(t => t.id === type);
    return suggestionType ? suggestionType.icon : Lightbulb;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={cn('w-full max-w-sm', className)}
    >
      <Card className="sticky top-4 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-1.5">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Assistant</CardTitle>
                <CardDescription className="text-xs">
                  Smart suggestions for your course
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Current Step Indicator */}
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-blue-50 p-2">
            <Info className="h-4 w-4 text-blue-600" />
            <span className="text-xs capitalize text-blue-700">
              Suggestions for: {currentStep.replace('-', ' ')}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs value={selectedType} onValueChange={setSelectedType}>
            {/* Suggestion Type Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600">
                Suggestion Type
              </Label>
              <TabsList className="grid h-auto grid-cols-2 gap-1 p-1">
                {displayTypes.slice(0, 4).map(type => {
                  const Icon = type.icon;
                  return (
                    <TabsTrigger
                      key={type.id}
                      value={type.id}
                      className="flex h-auto flex-col gap-1 px-1 py-2 text-xs"
                    >
                      <Icon className={cn('h-3 w-3', type.color)} />
                      <span className="truncate">{type.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Additional types as buttons */}
              {displayTypes.length > 4 && (
                <div className="flex flex-wrap gap-1">
                  {displayTypes.slice(4).map(type => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.id}
                        variant={
                          selectedType === type.id ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setSelectedType(type.id)}
                        className="h-7 text-xs"
                      >
                        <Icon className="mr-1 h-3 w-3" />
                        {type.label}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Custom Prompt */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600">
                Custom Request (Optional)
              </Label>
              <Textarea
                placeholder="Describe what you want the AI to focus on..."
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                rows={2}
                className="resize-none text-xs"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateSuggestion}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="sm"
            >
              {isGenerating ? (
                <>
                  <div className="mr-2 h-3 w-3 animate-spin rounded-full border-b-2 border-white" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-3 w-3" />
                  Generate Suggestions
                </>
              )}
            </Button>

            {/* Suggestions Content */}
            <div className="max-h-96 space-y-3 overflow-y-auto">
              {displayTypes.map(type => (
                <TabsContent
                  key={type.id}
                  value={type.id}
                  className="mt-0 space-y-3"
                >
                  {/* Type Description */}
                  <div className="rounded-lg bg-gray-50 p-2">
                    <div className="mb-1 flex items-center gap-2">
                      <type.icon className={cn('h-4 w-4', type.color)} />
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                    <p className="text-xs text-gray-600">{type.description}</p>
                  </div>

                  {/* Loading State */}
                  {isLoadingSuggestions && (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="h-20 animate-pulse rounded-lg bg-gray-100"
                        />
                      ))}
                    </div>
                  )}

                  {/* Suggestions List */}
                  <AnimatePresence>
                    {suggestions?.map(suggestion => {
                      const Icon = getSuggestionIcon(suggestion.type);
                      const isApplied = appliedSuggestions.has(suggestion.id);

                      return (
                        <motion.div
                          key={suggestion.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={cn(
                            'space-y-2 rounded-lg border p-3 transition-all',
                            isApplied
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50'
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-purple-600" />
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-xs',
                                  suggestion.confidence >= 0.8
                                    ? 'border-green-200 text-green-700'
                                    : suggestion.confidence >= 0.6
                                      ? 'border-yellow-200 text-yellow-700'
                                      : 'border-red-200 text-red-700'
                                )}
                              >
                                {Math.round(suggestion.confidence * 100)}%
                              </Badge>
                            </div>
                            {isApplied && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>

                          <div className="text-sm leading-relaxed">
                            {suggestion.content}
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Brain className="h-3 w-3" />
                            <span>{suggestion.source.replace('_', ' ')}</span>
                            <Separator orientation="vertical" className="h-3" />
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(
                                suggestion.metadata.generatedAt
                              ).toLocaleTimeString()}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-1 pt-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleCopyToClipboard(suggestion.content)
                                    }
                                    className="h-7 px-2"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copy to clipboard</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApplySuggestion(suggestion)}
                              disabled={isApplied}
                              className={cn(
                                'h-7 flex-1 px-3',
                                isApplied
                                  ? 'border-green-200 bg-green-100 text-green-700'
                                  : 'hover:border-purple-200 hover:bg-purple-50'
                              )}
                            >
                              {isApplied ? (
                                <>
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Applied
                                </>
                              ) : (
                                <>
                                  <Zap className="mr-1 h-3 w-3" />
                                  Apply
                                </>
                              )}
                            </Button>
                          </div>

                          {/* Feedback Buttons */}
                          {!isApplied && (
                            <div className="flex gap-1 border-t pt-1">
                              <span className="flex-1 text-xs text-gray-500">
                                Was this helpful?
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-green-600 hover:bg-green-50"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-red-600 hover:bg-red-50"
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* Empty State */}
                  {!isLoadingSuggestions &&
                    (!suggestions || suggestions.length === 0) && (
                      <div className="py-6 text-center">
                        <Wand2 className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                        <p className="mb-3 text-sm text-gray-500">
                          No suggestions yet
                        </p>
                        <Button
                          onClick={handleGenerateSuggestion}
                          size="sm"
                          variant="outline"
                          className="border-purple-200 text-purple-600 hover:bg-purple-50"
                        >
                          <Sparkles className="mr-2 h-3 w-3" />
                          Generate First Suggestion
                        </Button>
                      </div>
                    )}
                </TabsContent>
              ))}
            </div>
          </Tabs>

          <Separator />

          {/* AI Tips */}
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">AI Tips</span>
            </div>
            <ul className="space-y-1 text-xs text-blue-700">
              <li>• Be specific in your custom requests</li>
              <li>• Higher confidence scores are more reliable</li>
              <li>• You can always edit applied suggestions</li>
              <li>• Try different suggestion types for variety</li>
            </ul>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded bg-gray-50 p-2">
              <p className="text-lg font-bold text-gray-900">
                {appliedSuggestions.size}
              </p>
              <p className="text-xs text-gray-600">Applied</p>
            </div>
            <div className="rounded bg-gray-50 p-2">
              <p className="text-lg font-bold text-gray-900">
                {suggestions?.length || 0}
              </p>
              <p className="text-xs text-gray-600">Generated</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
