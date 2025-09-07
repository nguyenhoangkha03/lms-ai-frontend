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
import { useToast } from '@/hooks/use-toast';
import {
  BookOpen,
  Target,
  FileText,
  Lightbulb,
  Wand2,
  RefreshCw,
  Info,
  Sparkles,
} from 'lucide-react';

import { useGetCoursesQuery } from '@/lib/redux/api/course-api';
import { useGetLessonsQuery } from '@/lib/redux/api/teacher-lessons-api';

import { useGenerateAIContentSuggestionMutation } from '@/lib/redux/api/course-creation-api';

interface AssessmentBasicInfoStepProps {
  data: {
    title: string;
    description: string;
    instructions: string;
    assessmentType: string;
    courseId: string;
    lessonId?: string;
  };
  onUpdate: (data: any) => void;
  errors: Record<string, string>;
}

const ASSESSMENT_TYPES = [
  {
    value: 'quiz',
    label: 'Quiz',
    description: 'Short assessment with immediate feedback',
    icon: '📝',
    features: ['Quick completion', 'Auto-grading', 'Immediate results'],
  },
  {
    value: 'exam',
    label: 'Exam',
    description: 'Formal examination with time limits',
    icon: '📋',
    features: ['Time-limited', 'Proctoring support', 'Secure environment'],
  },
  {
    value: 'assignment',
    label: 'Assignment',
    description: 'Project-based assessment with file submissions',
    icon: '📄',
    features: ['File uploads', 'Manual grading', 'Extended deadlines'],
  },
  {
    value: 'survey',
    label: 'Survey',
    description: 'Feedback collection without scoring',
    icon: '📊',
    features: ['No scoring', 'Anonymous options', 'Data collection'],
  },
  {
    value: 'practice',
    label: 'Practice',
    description: 'Self-paced learning assessment',
    icon: '🎯',
    features: ['Unlimited attempts', 'Learning focused', 'Progress tracking'],
  },
  {
    value: 'final_exam',
    label: 'Final Exam',
    description: 'Comprehensive course assessment',
    icon: '🏆',
    features: ['High security', 'Single attempt', 'Comprehensive coverage'],
  },
];

const INSTRUCTION_TEMPLATES = [
  {
    type: 'quiz',
    template: `Welcome to this quiz! Please read each question carefully and select the best answer.

Instructions:
• Answer all questions to the best of your ability
• You have [TIME_LIMIT] minutes to complete this quiz
• Each question has only one correct answer
• Your responses will be saved automatically
• You can review your answers before submitting

Good luck!`,
  },
  {
    type: 'exam',
    template: `This is a formal examination. Please read all instructions carefully before beginning.

Exam Guidelines:
• This exam must be completed in [TIME_LIMIT] minutes
• You have [MAX_ATTEMPTS] attempt(s) to complete this exam
• Ensure you have a stable internet connection
• Do not refresh your browser during the exam
• Academic integrity policies apply

Begin when you are ready.`,
  },
  {
    type: 'assignment',
    template: `This assignment allows you to demonstrate your understanding through practical application.

Assignment Requirements:
• Submit all required files before the deadline
• Follow the specified format and guidelines
• Original work is required - plagiarism will not be tolerated
• Late submissions may result in point deductions
• Contact your instructor if you have questions

Submission deadline: [DEADLINE]`,
  },
];

export const AssessmentBasicInfoStep: React.FC<
  AssessmentBasicInfoStepProps
> = ({ data, onUpdate, errors }) => {
  const { toast } = useToast();
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  // API hooks
  const { data: coursesData, isLoading: isLoadingCourses } = useGetCoursesQuery(
    {
      limit: 100,
    }
  );

  const { data: lessonsData, isLoading: isLoadingLessons } = useGetLessonsQuery(
    {
      courseId: data.courseId,
      limit: 100, // Get all lessons, not just the default limit
    },
    {
      skip: !data.courseId,
    }
  );

  const [generateAISuggestion, { isLoading: isLoadingAI }] =
    useGenerateAIContentSuggestionMutation();

  // Update selected course when courseId changes
  useEffect(() => {
    if (coursesData?.data && data.courseId) {
      const course = coursesData.data.find((c: any) => c.id === data.courseId);
      setSelectedCourse(course || null);
    }
  }, [coursesData, data.courseId]);

  // Update selected lesson when lessonId changes
  useEffect(() => {
    if (!data.lessonId) {
      setSelectedLesson(null);
      return;
    }

    if (lessonsData?.lessons && data.lessonId) {
      const lesson = lessonsData.lessons.find(
        (l: any) => l.id === data.lessonId
      );
      setSelectedLesson(lesson || null);
    }
  }, [lessonsData, data.lessonId]);

  // Handle form updates
  const handleUpdate = (field: string, value: any) => {
    onUpdate({
      ...data,
      [field]: value,
    });
  };

  // Handle assessment type change
  const handleAssessmentTypeChange = (type: string) => {
    handleUpdate('assessmentType', type);

    // Auto-populate instructions template
    const template = INSTRUCTION_TEMPLATES.find(t => t.type === type);
    if (template && !data.instructions.trim()) {
      handleUpdate('instructions', template.template);
    }
  };

  // Generate AI suggestions
  const generateAIContent = async (
    type: 'title' | 'description' | 'instructions'
  ) => {
    if (!selectedCourse) {
      toast({
        title: 'Course Required',
        description: 'Please select a course first to generate AI suggestions.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingAI(true);
    try {
      const context = `Course: ${selectedCourse.title}\nCourse Description: ${selectedCourse.description}\n${
        selectedLesson
          ? `Lesson: ${selectedLesson.title}\nLesson Content: ${selectedLesson.content?.substring(0, 500)}`
          : ''
      }`;

      const result = await generateAISuggestion({
        type,
        context,
        assessmentType: data.assessmentType,
      }).unwrap();

      handleUpdate(type, result.content);

      toast({
        title: 'AI Suggestion Applied',
        description: `Generated ${type} using AI based on course content.`,
      });
    } catch (error: any) {
      toast({
        title: 'AI Generation Failed',
        description:
          error.message || 'Unable to generate content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Get selected assessment type details
  const selectedAssessmentType = ASSESSMENT_TYPES.find(
    type => type.value === data.assessmentType
  );

  return (
    <div className="space-y-6">
      {/* Course and Lesson Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Assessment Context
          </CardTitle>
          <CardDescription>
            Select the course and optionally a specific lesson for this
            assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
            {/* Course Selection */}
            <div className="space-y-2">
              <Label htmlFor="courseId">Course *</Label>
              <Select
                value={data.courseId}
                onValueChange={value => {
                  handleUpdate('courseId', value);
                  handleUpdate('lessonId', ''); // Reset lesson when course changes
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCourses ? (
                    <SelectItem value="loading" disabled>
                      Loading courses...
                    </SelectItem>
                  ) : (
                    coursesData?.data?.map((course: any) => (
                      <SelectItem key={course.id} value={course.id}>
                        <div className="flex items-center gap-2">
                          <span>{course.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {course.level}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors['basicInfo.courseId'] && (
                <p className="text-sm text-red-600">
                  {errors['basicInfo.courseId']}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
            {/* Lesson Selection */}
            <div className="space-y-2">
              <Label htmlFor="lessonId">Lesson (Optional)</Label>
              <Select
                value={data.lessonId || 'none'}
                onValueChange={value =>
                  handleUpdate('lessonId', value === 'none' ? undefined : value)
                }
                disabled={!data.courseId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a lesson" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific lesson</SelectItem>
                  {isLoadingLessons ? (
                    <SelectItem value="loading" disabled>
                      Loading lessons...
                    </SelectItem>
                  ) : (
                    lessonsData?.lessons?.map((lesson: any) => (
                      <SelectItem key={lesson.id} value={lesson.id}>
                        {lesson.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected Course/Lesson Info */}
          {selectedCourse && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-start gap-3">
                <BookOpen className="mt-0.5 h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">
                    {selectedCourse.title}
                  </h4>
                  <p className="mt-1 text-sm text-blue-700">
                    {selectedCourse.description}
                  </p>
                  {selectedLesson && (
                    <div className="mt-2 border-t border-blue-200 pt-2">
                      <p className="text-sm font-medium text-blue-800">
                        Lesson: {selectedLesson.title}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Assessment Type
          </CardTitle>
          <CardDescription>
            Choose the type of assessment that best fits your learning
            objectives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ASSESSMENT_TYPES.map(type => (
              <Card
                key={type.value}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  data.assessmentType === type.value
                    ? 'bg-primary/5 ring-2 ring-primary'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleAssessmentTypeChange(type.value)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3 text-center">
                    <div className="text-2xl">{type.icon}</div>
                    <div>
                      <h4 className="font-medium">{type.label}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {type.description}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {type.features.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Type Summary */}
          {selectedAssessmentType && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedAssessmentType.icon}</span>
                <div>
                  <h4 className="font-medium text-green-900">
                    {selectedAssessmentType.label} Selected
                  </h4>
                  <p className="text-sm text-green-700">
                    {selectedAssessmentType.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Provide the essential details for your assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title">Assessment Title *</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateAIContent('title')}
                disabled={isGeneratingAI || !selectedCourse}
              >
                {isGeneratingAI ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                AI Suggest
              </Button>
            </div>
            <Input
              id="title"
              placeholder="Enter a clear, descriptive title for your assessment"
              value={data.title}
              onChange={e => handleUpdate('title', e.target.value)}
            />
            {errors['basicInfo.title'] && (
              <p className="text-sm text-red-600">
                {errors['basicInfo.title']}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              A good title clearly indicates what students will be assessed on
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description *</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateAIContent('description')}
                disabled={isGeneratingAI || !selectedCourse}
              >
                {isGeneratingAI ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                AI Suggest
              </Button>
            </div>
            <Textarea
              id="description"
              placeholder="Describe what this assessment covers and its learning objectives"
              value={data.description}
              onChange={e => handleUpdate('description', e.target.value)}
              rows={4}
            />
            {errors['basicInfo.description'] && (
              <p className="text-sm text-red-600">
                {errors['basicInfo.description']}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Help students understand the purpose and scope of this assessment
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="instructions">Instructions</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const template = INSTRUCTION_TEMPLATES.find(
                      t => t.type === data.assessmentType
                    );
                    if (template) {
                      handleUpdate('instructions', template.template);
                    }
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Use Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateAIContent('instructions')}
                  disabled={isGeneratingAI || !selectedCourse}
                >
                  {isGeneratingAI ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  AI Suggest
                </Button>
              </div>
            </div>
            <Textarea
              id="instructions"
              placeholder="Provide clear instructions for students taking this assessment"
              value={data.instructions}
              onChange={e => handleUpdate('instructions', e.target.value)}
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Clear instructions help students understand expectations and
              reduce confusion
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Enhancement Suggestions */}
      {selectedCourse && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                <Lightbulb className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="mb-2 font-medium text-purple-900">
                  AI Enhancement Available
                </h4>
                <p className="mb-3 text-sm text-purple-700">
                  Use AI to generate contextually relevant content based on your
                  course materials and learning objectives.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateAIContent('title')}
                    disabled={isGeneratingAI}
                    className="bg-white"
                  >
                    <Wand2 className="mr-1 h-3 w-3" />
                    Enhance Title
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateAIContent('description')}
                    disabled={isGeneratingAI}
                    className="bg-white"
                  >
                    <Wand2 className="mr-1 h-3 w-3" />
                    Enhance Description
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateAIContent('instructions')}
                    disabled={isGeneratingAI}
                    className="bg-white"
                  >
                    <Wand2 className="mr-1 h-3 w-3" />
                    Enhance Instructions
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              Step 1 of 5: Basic Information
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${data.title ? 'bg-green-500' : 'bg-gray-300'}`}
                />
                <span
                  className={data.title ? 'text-green-700' : 'text-gray-500'}
                >
                  Title
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${data.description ? 'bg-green-500' : 'bg-gray-300'}`}
                />
                <span
                  className={
                    data.description ? 'text-green-700' : 'text-gray-500'
                  }
                >
                  Description
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${data.courseId ? 'bg-green-500' : 'bg-gray-300'}`}
                />
                <span
                  className={data.courseId ? 'text-green-700' : 'text-gray-500'}
                >
                  Course
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
