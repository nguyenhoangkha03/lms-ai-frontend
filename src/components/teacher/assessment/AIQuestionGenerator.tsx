'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import {
  Brain,
  Wand2,
  Target,
  BookOpen,
  Lightbulb,
  Settings,
  RefreshCw,
  CheckCircle,
  Sparkles,
  FileText,
  Star,
  TrendingUp,
  Zap,
} from 'lucide-react';

import {
  useGetCoursesQuery,
  useGetLessonsQuery,
} from '@/lib/redux/api/course-api';

interface AIQuestionGeneratorProps {
  onGenerate: (params: {
    topic: string;
    questionType: string;
    difficulty: string;
    count: number;
    context?: string;
    learningObjectives?: string[];
    customInstructions?: string;
  }) => Promise<void>;
  courseId: string;
  lessonId?: string;
  assessmentType: string;
  isLoading: boolean;
}

const QUESTION_TYPE_OPTIONS = [
  {
    value: 'multiple_choice',
    label: 'Multiple Choice',
    icon: '📝',
    description: 'Select one correct answer from options',
  },
  {
    value: 'true_false',
    label: 'True/False',
    icon: '✓',
    description: 'Binary choice questions',
  },
  {
    value: 'short_answer',
    label: 'Short Answer',
    icon: '💬',
    description: 'Brief written responses',
  },
  {
    value: 'essay',
    label: 'Essay',
    icon: '📄',
    description: 'Extended written responses',
  },
  {
    value: 'fill_in_the_blank',
    label: 'Fill in Blank',
    icon: '___',
    description: 'Complete missing text',
  },
];

const DIFFICULTY_OPTIONS = [
  {
    value: 'easy',
    label: 'Easy',
    color: 'green',
    description: 'Basic concepts and recall',
  },
  {
    value: 'medium',
    label: 'Medium',
    color: 'yellow',
    description: 'Application and analysis',
  },
  {
    value: 'hard',
    label: 'Hard',
    color: 'orange',
    description: 'Complex problem solving',
  },
  {
    value: 'expert',
    label: 'Expert',
    color: 'red',
    description: 'Advanced synthesis and evaluation',
  },
];

const BLOOM_TAXONOMY_LEVELS = [
  {
    value: 'remember',
    label: 'Remember',
    description: 'Recall facts and basic concepts',
  },
  {
    value: 'understand',
    label: 'Understand',
    description: 'Explain ideas or concepts',
  },
  {
    value: 'apply',
    label: 'Apply',
    description: 'Use information in new situations',
  },
  {
    value: 'analyze',
    label: 'Analyze',
    description: 'Draw connections among ideas',
  },
  {
    value: 'evaluate',
    label: 'Evaluate',
    description: 'Justify a stand or decision',
  },
  {
    value: 'create',
    label: 'Create',
    description: 'Produce new or original work',
  },
];

const GENERATION_PRESETS = [
  {
    name: 'Quick Assessment',
    description: '5 mixed questions for rapid evaluation',
    settings: {
      count: 5,
      questionType: 'multiple_choice',
      difficulty: 'medium',
    },
  },
  {
    name: 'Comprehensive Review',
    description: '15 varied questions covering all difficulty levels',
    settings: { count: 15, questionType: 'mixed', difficulty: 'mixed' },
  },
  {
    name: 'Concept Check',
    description: '10 focused questions on key concepts',
    settings: { count: 10, questionType: 'short_answer', difficulty: 'easy' },
  },
  {
    name: 'Deep Analysis',
    description: '8 challenging questions for critical thinking',
    settings: { count: 8, questionType: 'essay', difficulty: 'hard' },
  },
];

export const AIQuestionGenerator: React.FC<AIQuestionGeneratorProps> = ({
  onGenerate,
  courseId,
  lessonId,
  assessmentType,
  isLoading,
}) => {
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    topic: '',
    questionType: 'multiple_choice',
    difficulty: 'medium',
    count: 5,
    context: '',
    learningObjectives: [''],
    customInstructions: '',
    bloomLevel: 'understand',
    includeExplanations: true,
    includeHints: false,
    generateImages: false,
    creativityLevel: 0.7,
    focusAreas: [] as string[],
  });

  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');

  // API hooks
  const { data: courseData } = useGetCoursesQuery({ limit: 1, id: courseId });
  const { data: lessonData } = useGetLessonsQuery({ courseId, lessonId });

  // Auto-populate context from course/lesson data
  useEffect(() => {
    if (courseData?.courses?.[0] && !formData.context) {
      const course = courseData.courses[0];
      let context = `Course: ${course.title}\n`;
      if (course.description) {
        context += `Description: ${course.description}\n`;
      }
      if (lessonData?.lessons?.[0]) {
        const lesson = lessonData.lessons[0];
        context += `Current Lesson: ${lesson.title}\n`;
        if (lesson.content) {
          context += `Lesson Content: ${lesson.content.substring(0, 500)}...\n`;
        }
      }
      setFormData(prev => ({ ...prev, context }));
    }
  }, [courseData, lessonData, formData.context]);

  // Handle preset selection
  const applyPreset = (preset: (typeof GENERATION_PRESETS)[0]) => {
    setFormData(prev => ({
      ...prev,
      count: preset.settings.count,
      questionType: preset.settings.questionType,
      difficulty: preset.settings.difficulty,
    }));
    setSelectedPreset(preset.name);
    toast({
      title: 'Preset Applied',
      description: `${preset.name} settings have been applied.`,
    });
  };

  // Handle form updates
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSelectedPreset(''); // Clear preset when manually editing
  };

  // Handle learning objectives
  const addLearningObjective = () => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, ''],
    }));
  };

  const updateLearningObjective = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.map((obj, i) =>
        i === index ? value : obj
      ),
    }));
  };

  const removeLearningObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter((_, i) => i !== index),
    }));
  };

  // Handle focus areas
  const toggleFocusArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area],
    }));
  };

  // Validation
  const validateForm = (): string | null => {
    if (!formData.topic.trim()) {
      return 'Topic is required';
    }
    if (formData.count < 1 || formData.count > 50) {
      return 'Question count must be between 1 and 50';
    }
    if (formData.learningObjectives.every(obj => !obj.trim())) {
      return 'At least one learning objective is required';
    }
    return null;
  };

  // Handle generation
  const handleGenerate = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    // Simulate progress steps
    const steps = [
      'Analyzing content context...',
      'Processing learning objectives...',
      'Generating question structure...',
      'Creating question content...',
      'Optimizing difficulty levels...',
      'Finalizing questions...',
    ];

    try {
      // Show progress
      setGenerationProgress(0);
      for (let i = 0; i < steps.length; i++) {
        setGenerationStep(steps[i]);
        setGenerationProgress(((i + 1) / steps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      await onGenerate({
        topic: formData.topic,
        questionType: formData.questionType,
        difficulty: formData.difficulty,
        count: formData.count,
        context: formData.context,
        learningObjectives: formData.learningObjectives.filter(obj =>
          obj.trim()
        ),
        customInstructions: formData.customInstructions,
      });

      setGenerationProgress(0);
      setGenerationStep('');
    } catch (error) {
      setGenerationProgress(0);
      setGenerationStep('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                AI Question Generator
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-700"
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  Powered by AI
                </Badge>
              </CardTitle>
              <CardDescription>
                Generate high-quality questions automatically using advanced AI
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Generation Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Start Presets
          </CardTitle>
          <CardDescription>
            Choose a preset to get started quickly, or customize your own
            settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {GENERATION_PRESETS.map(preset => (
              <Card
                key={preset.name}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedPreset === preset.name
                    ? 'bg-primary/5 ring-2 ring-primary'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => applyPreset(preset)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium">{preset.name}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {preset.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {preset.settings.count} questions
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {preset.settings.difficulty}
                        </Badge>
                      </div>
                    </div>
                    {selectedPreset === preset.name && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Generation Settings
          </CardTitle>
          <CardDescription>
            Configure the AI to generate questions that match your needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Settings */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="topic" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Topic *
              </Label>
              <Input
                id="topic"
                placeholder="e.g., Machine Learning Fundamentals"
                value={formData.topic}
                onChange={e => updateFormData('topic', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The main subject or concept for question generation
              </p>
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <Label htmlFor="count" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Number of Questions
              </Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[formData.count]}
                  onValueChange={value => updateFormData('count', value[0])}
                  max={50}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <div className="w-12 text-center font-medium">
                  {formData.count}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum 50 questions per generation
              </p>
            </div>

            {/* Question Type */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Question Type
              </Label>
              <Select
                value={formData.questionType}
                onValueChange={value => updateFormData('questionType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPE_OPTIONS.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Difficulty Level
              </Label>
              <Select
                value={formData.difficulty}
                onValueChange={value => updateFormData('difficulty', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map(diff => (
                    <SelectItem key={diff.value} value={diff.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full bg-${diff.color}-500`}
                        />
                        <div>
                          <div className="font-medium">{diff.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {diff.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Learning Objectives *
            </Label>
            <div className="space-y-2">
              {formData.learningObjectives.map((objective, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Learning objective ${index + 1}`}
                    value={objective}
                    onChange={e =>
                      updateLearningObjective(index, e.target.value)
                    }
                  />
                  {formData.learningObjectives.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeLearningObjective(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addLearningObjective}
                disabled={formData.learningObjectives.length >= 10}
              >
                Add Objective
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Define what students should achieve after answering these
              questions
            </p>
          </div>

          {/* Context Information */}
          <div className="space-y-2">
            <Label htmlFor="context" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Context Information
            </Label>
            <Textarea
              id="context"
              placeholder="Provide relevant context, course materials, or background information..."
              value={formData.context}
              onChange={e => updateFormData('context', e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Additional context helps AI generate more relevant and accurate
              questions
            </p>
          </div>

          {/* Advanced Options Toggle */}
          <div className="flex items-center justify-between py-2">
            <Label className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Advanced Options
            </Label>
            <Switch
              checked={showAdvancedOptions}
              onCheckedChange={setShowAdvancedOptions}
            />
          </div>

          {/* Advanced Options */}
          {showAdvancedOptions && (
            <div className="space-y-6 border-t pt-4">
              {/* Bloom's Taxonomy Level */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Bloom's Taxonomy Level
                </Label>
                <Select
                  value={formData.bloomLevel}
                  onValueChange={value => updateFormData('bloomLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOM_TAXONOMY_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {level.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Generation Options */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Include Explanations</Label>
                  <Switch
                    checked={formData.includeExplanations}
                    onCheckedChange={value =>
                      updateFormData('includeExplanations', value)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Include Hints</Label>
                  <Switch
                    checked={formData.includeHints}
                    onCheckedChange={value =>
                      updateFormData('includeHints', value)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Generate Images</Label>
                  <Switch
                    checked={formData.generateImages}
                    onCheckedChange={value =>
                      updateFormData('generateImages', value)
                    }
                  />
                </div>
              </div>

              {/* Creativity Level */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Creativity Level: {Math.round(formData.creativityLevel * 100)}
                  %
                </Label>
                <Slider
                  value={[formData.creativityLevel]}
                  onValueChange={value =>
                    updateFormData('creativityLevel', value[0])
                  }
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Conservative</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>

              {/* Custom Instructions */}
              <div className="space-y-2">
                <Label
                  htmlFor="instructions"
                  className="flex items-center gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  Custom Instructions
                </Label>
                <Textarea
                  id="instructions"
                  placeholder="Provide specific instructions for question generation..."
                  value={formData.customInstructions}
                  onChange={e =>
                    updateFormData('customInstructions', e.target.value)
                  }
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Additional requirements or preferences for question generation
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generation Progress */}
      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                <Brain className="h-6 w-6 animate-pulse text-white" />
              </div>
              <div>
                <h3 className="font-medium">Generating Questions...</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {generationStep || 'Preparing AI generation...'}
                </p>
              </div>
              <div className="space-y-2">
                <Progress value={generationProgress} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  {Math.round(generationProgress)}% complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {formData.count} questions will be generated
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setFormData({
                topic: '',
                questionType: 'multiple_choice',
                difficulty: 'medium',
                count: 5,
                context: '',
                learningObjectives: [''],
                customInstructions: '',
                bloomLevel: 'understand',
                includeExplanations: true,
                includeHints: false,
                generateImages: false,
                creativityLevel: 0.7,
                focusAreas: [],
              });
              setSelectedPreset('');
            }}
          >
            Reset
          </Button>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !formData.topic.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Questions
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
