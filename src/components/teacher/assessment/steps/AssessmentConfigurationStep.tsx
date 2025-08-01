'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import {
  Settings,
  Clock,
  RotateCcw,
  Target,
  Calendar,
  Eye,
  Shuffle,
  Award,
  AlertCircle,
  Info,
  Zap,
  CheckCircle,
} from 'lucide-react';

interface AssessmentConfigurationStepProps {
  data: {
    timeLimit?: number;
    maxAttempts: number;
    passingScore: number;
    weight: number;
    availableFrom?: string;
    availableUntil?: string;
    randomizeQuestions: boolean;
    randomizeAnswers: boolean;
    showResults: boolean;
    showCorrectAnswers: boolean;
    isMandatory: boolean;
    isProctored: boolean;
    gradingMethod: string;
  };
  onUpdate: (data: any) => void;
  errors: Record<string, string>;
}

const GRADING_METHODS = [
  {
    value: 'automatic',
    label: 'Automatic',
    description: 'System grades automatically based on correct answers',
    icon: '⚡',
    features: ['Instant results', 'Objective questions', 'Consistent scoring'],
    recommended: ['quiz', 'practice'],
  },
  {
    value: 'manual',
    label: 'Manual',
    description: 'Instructor reviews and grades each submission',
    icon: '👨‍🏫',
    features: [
      'Subjective assessment',
      'Detailed feedback',
      'Flexible scoring',
    ],
    recommended: ['assignment', 'essay'],
  },
  {
    value: 'hybrid',
    label: 'Hybrid',
    description: 'Combination of automatic and manual grading',
    icon: '🔄',
    features: [
      'Mixed question types',
      'Partial automation',
      'Balanced approach',
    ],
    recommended: ['exam', 'final_exam'],
  },
  {
    value: 'peer_review',
    label: 'Peer Review',
    description: 'Students grade each other with instructor oversight',
    icon: '👥',
    features: ['Collaborative learning', 'Multiple perspectives', 'Engagement'],
    recommended: ['assignment', 'project'],
  },
];

const CONFIGURATION_PRESETS = [
  {
    id: 'quick_quiz',
    name: 'Quick Quiz',
    description: 'Short, low-stakes assessment',
    settings: {
      timeLimit: 15,
      maxAttempts: 3,
      passingScore: 70,
      weight: 0.5,
      randomizeQuestions: true,
      randomizeAnswers: true,
      showResults: true,
      showCorrectAnswers: true,
      isMandatory: false,
      isProctored: false,
      gradingMethod: 'automatic',
    },
  },
  {
    id: 'formal_exam',
    name: 'Formal Exam',
    description: 'High-stakes, secure assessment',
    settings: {
      timeLimit: 120,
      maxAttempts: 1,
      passingScore: 80,
      weight: 3,
      randomizeQuestions: true,
      randomizeAnswers: false,
      showResults: false,
      showCorrectAnswers: false,
      isMandatory: true,
      isProctored: true,
      gradingMethod: 'hybrid',
    },
  },
  {
    id: 'practice_test',
    name: 'Practice Test',
    description: 'Learning-focused with unlimited attempts',
    settings: {
      timeLimit: undefined,
      maxAttempts: 99,
      passingScore: 60,
      weight: 0,
      randomizeQuestions: false,
      randomizeAnswers: false,
      showResults: true,
      showCorrectAnswers: true,
      isMandatory: false,
      isProctored: false,
      gradingMethod: 'automatic',
    },
  },
  {
    id: 'assignment',
    name: 'Assignment',
    description: 'Extended project with manual grading',
    settings: {
      timeLimit: undefined,
      maxAttempts: 1,
      passingScore: 75,
      weight: 2,
      randomizeQuestions: false,
      randomizeAnswers: false,
      showResults: false,
      showCorrectAnswers: false,
      isMandatory: true,
      isProctored: false,
      gradingMethod: 'manual',
    },
  },
];

export const AssessmentConfigurationStep: React.FC<
  AssessmentConfigurationStepProps
> = ({ data, onUpdate, errors }) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Handle form updates
  const handleUpdate = (field: string, value: any) => {
    onUpdate({
      ...data,
      [field]: value,
    });
    setSelectedPreset(''); // Clear preset when manually editing
  };

  // Apply preset
  const applyPreset = (preset: (typeof CONFIGURATION_PRESETS)[0]) => {
    onUpdate({
      ...data,
      ...preset.settings,
    });
    setSelectedPreset(preset.id);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    onUpdate({
      timeLimit: undefined,
      maxAttempts: 1,
      passingScore: 70,
      weight: 1,
      availableFrom: undefined,
      availableUntil: undefined,
      randomizeQuestions: false,
      randomizeAnswers: false,
      showResults: true,
      showCorrectAnswers: true,
      isMandatory: false,
      isProctored: false,
      gradingMethod: 'automatic',
    });
    setSelectedPreset('');
  };

  // Calculate configuration score
  const getConfigurationComplexity = () => {
    let score = 0;
    if (data.timeLimit) score += 1;
    if (data.maxAttempts === 1) score += 2;
    if (data.passingScore > 75) score += 1;
    if (data.randomizeQuestions) score += 1;
    if (data.isProctored) score += 3;
    if (!data.showCorrectAnswers) score += 1;
    if (data.gradingMethod === 'manual') score += 2;

    if (score >= 8)
      return {
        level: 'High',
        color: 'red',
        description: 'Secure, high-stakes assessment',
      };
    if (score >= 5)
      return {
        level: 'Medium',
        color: 'yellow',
        description: 'Standard formal assessment',
      };
    return {
      level: 'Low',
      color: 'green',
      description: 'Relaxed, learning-focused',
    };
  };

  const complexity = getConfigurationComplexity();

  return (
    <div className="space-y-6">
      {/* Header with Complexity Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Assessment Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure timing, attempts, and grading options
          </p>
        </div>

        <div className="text-right">
          <div className="mb-1 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">Complexity</span>
          </div>
          <Badge
            variant="outline"
            className={`text-${complexity.color}-600 border-${complexity.color}-200`}
          >
            {complexity.level}
          </Badge>
          <p className="mt-1 text-xs text-muted-foreground">
            {complexity.description}
          </p>
        </div>
      </div>

      {/* Configuration Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Setup Presets
          </CardTitle>
          <CardDescription>
            Choose a preset configuration or customize your own settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {CONFIGURATION_PRESETS.map(preset => {
              const isSelected = selectedPreset === preset.id;

              return (
                <Card
                  key={preset.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? 'bg-primary/5 ring-2 ring-primary'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => applyPreset(preset)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium">{preset.name}</h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {preset.description}
                        </p>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span>Time:</span>
                          <span>
                            {preset.settings.timeLimit
                              ? `${preset.settings.timeLimit}min`
                              : 'Unlimited'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Attempts:</span>
                          <span>
                            {preset.settings.maxAttempts === 99
                              ? 'Unlimited'
                              : preset.settings.maxAttempts}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Passing:</span>
                          <span>{preset.settings.passingScore}%</span>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle className="mx-auto h-4 w-4 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={resetToDefaults}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timing and Attempts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timing & Attempts
          </CardTitle>
          <CardDescription>
            Control how long students have and how many times they can attempt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Time Limit */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Time Limit</Label>
                <Switch
                  checked={!!data.timeLimit}
                  onCheckedChange={checked =>
                    handleUpdate('timeLimit', checked ? 60 : undefined)
                  }
                />
              </div>

              {data.timeLimit && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      Duration: {data.timeLimit} minutes
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {Math.floor(data.timeLimit / 60)}h {data.timeLimit % 60}m
                    </Badge>
                  </div>
                  <Slider
                    value={[data.timeLimit]}
                    onValueChange={value => handleUpdate('timeLimit', value[0])}
                    max={300}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5min</span>
                    <span>1hr</span>
                    <span>3hrs</span>
                    <span>5hrs</span>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {data.timeLimit
                  ? 'Students must complete within the time limit'
                  : 'No time restriction - students can take as long as needed'}
              </p>
            </div>

            {/* Max Attempts */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Maximum Attempts</Label>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {data.maxAttempts === 99
                      ? 'Unlimited attempts'
                      : `${data.maxAttempts} attempt${data.maxAttempts === 1 ? '' : 's'}`}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {data.maxAttempts === 99 ? '∞' : data.maxAttempts}
                  </Badge>
                </div>
                <Slider
                  value={[data.maxAttempts === 99 ? 10 : data.maxAttempts]}
                  onValueChange={value =>
                    handleUpdate('maxAttempts', value[0] === 10 ? 99 : value[0])
                  }
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1</span>
                  <span>3</span>
                  <span>5</span>
                  <span>Unlimited</span>
                </div>
              </div>

              {errors['configuration.maxAttempts'] && (
                <p className="text-sm text-red-600">
                  {errors['configuration.maxAttempts']}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                {data.maxAttempts === 1
                  ? 'High-stakes: students get only one chance'
                  : data.maxAttempts === 99
                    ? 'Learning-focused: students can practice repeatedly'
                    : 'Balanced: allows for mistakes while maintaining stakes'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring and Grading */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Scoring & Grading
          </CardTitle>
          <CardDescription>
            Configure how the assessment is scored and weighted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Passing Score */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Passing Score: {data.passingScore}%
              </Label>

              <div className="space-y-2">
                <Slider
                  value={[data.passingScore]}
                  onValueChange={value =>
                    handleUpdate('passingScore', value[0])
                  }
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              {errors['configuration.passingScore'] && (
                <p className="text-sm text-red-600">
                  {errors['configuration.passingScore']}
                </p>
              )}

              <div className="rounded-lg bg-gray-50 p-2">
                <p className="text-xs text-muted-foreground">
                  {data.passingScore >= 80
                    ? '🎯 High standard - challenging but achievable'
                    : data.passingScore >= 70
                      ? '📊 Standard requirement - balanced expectation'
                      : data.passingScore >= 60
                        ? '📈 Moderate requirement - encouraging learning'
                        : '🎯 Low barrier - focus on participation'}
                </p>
              </div>
            </div>

            {/* Weight */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Grade Weight: {data.weight}x
              </Label>

              <div className="space-y-2">
                <Slider
                  value={[data.weight]}
                  onValueChange={value => handleUpdate('weight', value[0])}
                  max={5}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0x</span>
                  <span>1x</span>
                  <span>3x</span>
                  <span>5x</span>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-2">
                <p className="text-xs text-muted-foreground">
                  {data.weight === 0
                    ? '📚 Practice only - no grade impact'
                    : data.weight < 1
                      ? '📝 Low impact - minor grade contribution'
                      : data.weight === 1
                        ? '📊 Standard weight - normal grade impact'
                        : data.weight <= 2
                          ? '📈 Important - significant grade impact'
                          : '🏆 High stakes - major grade impact'}
                </p>
              </div>
            </div>
          </div>

          {/* Grading Method */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Grading Method</Label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {GRADING_METHODS.map(method => (
                <Card
                  key={method.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    data.gradingMethod === method.value
                      ? 'bg-primary/5 ring-2 ring-primary'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleUpdate('gradingMethod', method.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-lg">{method.icon}</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{method.label}</h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {method.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {method.features.map((feature, index) => (
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
                      {data.gradingMethod === method.value && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Availability Schedule
          </CardTitle>
          <CardDescription>
            Set when students can access this assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Available From */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Available From</Label>
                <Switch
                  checked={!!data.availableFrom}
                  onCheckedChange={checked =>
                    handleUpdate(
                      'availableFrom',
                      checked ? new Date().toISOString() : undefined
                    )
                  }
                />
              </div>

              {data.availableFrom && (
                <DateTimePicker
                  value={data.availableFrom}
                  onChange={(value: string) =>
                    handleUpdate('availableFrom', value)
                  }
                />
              )}

              <p className="text-xs text-muted-foreground">
                {data.availableFrom
                  ? 'Assessment will become available at the specified time'
                  : 'Available immediately after publishing'}
              </p>
            </div>

            {/* Available Until */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Available Until</Label>
                <Switch
                  checked={!!data.availableUntil}
                  onCheckedChange={checked =>
                    handleUpdate(
                      'availableUntil',
                      checked
                        ? new Date(
                            Date.now() + 7 * 24 * 60 * 60 * 1000
                          ).toISOString()
                        : undefined
                    )
                  }
                />
              </div>

              {data.availableUntil && (
                <DateTimePicker
                  value={data.availableUntil}
                  onChange={(value: string) =>
                    handleUpdate('availableUntil', value)
                  }
                />
              )}

              <p className="text-xs text-muted-foreground">
                {data.availableUntil
                  ? 'Assessment will close at the specified time'
                  : 'No closing date - available indefinitely'}
              </p>
            </div>
          </div>

          {/* Schedule Summary */}
          {(data.availableFrom || data.availableUntil) && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Schedule Summary
                </span>
              </div>
              <div className="text-sm text-blue-700">
                {data.availableFrom && (
                  <p>Opens: {new Date(data.availableFrom).toLocaleString()}</p>
                )}
                {data.availableUntil && (
                  <p>
                    Closes: {new Date(data.availableUntil).toLocaleString()}
                  </p>
                )}
                {data.availableFrom && data.availableUntil && (
                  <p className="mt-1 font-medium">
                    Duration:{' '}
                    {Math.round(
                      (new Date(data.availableUntil).getTime() -
                        new Date(data.availableFrom).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    days
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Display and Behavior Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Display & Behavior
              </CardTitle>
              <CardDescription>
                Control how the assessment appears and behaves for students
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            >
              {showAdvancedSettings ? 'Hide Advanced' : 'Show Advanced'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Settings */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Show Results</Label>
                  <p className="text-xs text-muted-foreground">
                    Display scores to students after submission
                  </p>
                </div>
                <Switch
                  checked={data.showResults}
                  onCheckedChange={value => handleUpdate('showResults', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    Show Correct Answers
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Reveal correct answers after completion
                  </p>
                </div>
                <Switch
                  checked={data.showCorrectAnswers}
                  onCheckedChange={value =>
                    handleUpdate('showCorrectAnswers', value)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    Mandatory Assessment
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Students must complete to progress
                  </p>
                </div>
                <Switch
                  checked={data.isMandatory}
                  onCheckedChange={value => handleUpdate('isMandatory', value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    Randomize Questions
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show questions in random order
                  </p>
                </div>
                <Switch
                  checked={data.randomizeQuestions}
                  onCheckedChange={value =>
                    handleUpdate('randomizeQuestions', value)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    Randomize Answers
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Shuffle answer options for each question
                  </p>
                </div>
                <Switch
                  checked={data.randomizeAnswers}
                  onCheckedChange={value =>
                    handleUpdate('randomizeAnswers', value)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    Enable Proctoring
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Use anti-cheat and monitoring features
                  </p>
                </div>
                <Switch
                  checked={data.isProctored}
                  onCheckedChange={value => handleUpdate('isProctored', value)}
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          {showAdvancedSettings && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-medium">
                  <Settings className="h-4 w-4" />
                  Advanced Configuration
                </h4>

                {/* Placeholder for additional advanced settings */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-center text-sm text-muted-foreground">
                    Additional advanced settings will be configured in the next
                    steps: Anti-cheat measures, detailed grading rubrics, and
                    security options.
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Configuration Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">
                Time Limit
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {data.timeLimit ? `${data.timeLimit} min` : 'Unlimited'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">Attempts</div>
              <div className="flex items-center gap-1">
                <RotateCcw className="h-3 w-3" />
                {data.maxAttempts === 99 ? 'Unlimited' : data.maxAttempts}
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">
                Passing Score
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {data.passingScore}%
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">
                Grade Weight
              </div>
              <div className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                {data.weight}x
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex flex-wrap gap-2">
            {data.randomizeQuestions && (
              <Badge variant="secondary">
                <Shuffle className="mr-1 h-3 w-3" />
                Random Questions
              </Badge>
            )}
            {data.randomizeAnswers && (
              <Badge variant="secondary">
                <Shuffle className="mr-1 h-3 w-3" />
                Random Answers
              </Badge>
            )}
            {data.showResults && (
              <Badge variant="secondary">
                <Eye className="mr-1 h-3 w-3" />
                Show Results
              </Badge>
            )}
            {data.showCorrectAnswers && (
              <Badge variant="secondary">
                <CheckCircle className="mr-1 h-3 w-3" />
                Show Answers
              </Badge>
            )}
            {data.isMandatory && (
              <Badge variant="secondary">
                <AlertCircle className="mr-1 h-3 w-3" />
                Mandatory
              </Badge>
            )}
            {data.isProctored && (
              <Badge variant="secondary">
                <Eye className="mr-1 h-3 w-3" />
                Proctored
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
