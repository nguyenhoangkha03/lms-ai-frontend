'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  Headphones,
  Hand,
  BookOpen,
  Sun,
  Sunset,
  Moon,
  Coffee,
  Clock,
  Bell,
  Mail,
  Smartphone,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  X,
  Brain,
  Code,
  Palette,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  setPreferencesStep,
  updatePreferences,
} from '@/lib/redux/slices/onboarding-slice';
import {
  useSaveLearningPreferencesMutation,
  type LearningPreferences,
} from '@/lib/redux/api/onboarding-api';

interface PreferencesSetupStepProps {
  onNext: () => void;
  onBack: () => void;
}

// Learning style options
const learningStyles = [
  {
    id: 'visual',
    icon: <Eye className="h-6 w-6" />,
    title: 'Visual Learner',
    description: 'I learn best through images, diagrams, and visual content',
  },
  {
    id: 'auditory',
    icon: <Headphones className="h-6 w-6" />,
    title: 'Auditory Learner',
    description: 'I prefer listening to lectures, podcasts, and discussions',
  },
  {
    id: 'kinesthetic',
    icon: <Hand className="h-6 w-6" />,
    title: 'Kinesthetic Learner',
    description: 'I learn by doing, hands-on practice, and experimentation',
  },
  {
    id: 'reading',
    icon: <BookOpen className="h-6 w-6" />,
    title: 'Reading/Writing',
    description: 'I prefer reading materials and taking written notes',
  },
];

// Study time preferences
const studyTimes = [
  {
    id: 'morning',
    icon: <Sun className="h-6 w-6" />,
    title: 'Morning Person',
    description: '6:00 AM - 12:00 PM',
    time: "I'm most focused in the morning",
  },
  {
    id: 'afternoon',
    icon: <Coffee className="h-6 w-6" />,
    title: 'Afternoon Focus',
    description: '12:00 PM - 6:00 PM',
    time: 'Afternoon is my productive time',
  },
  {
    id: 'evening',
    icon: <Sunset className="h-6 w-6" />,
    title: 'Evening Learner',
    description: '6:00 PM - 10:00 PM',
    time: 'I study best in the evening',
  },
  {
    id: 'night',
    icon: <Moon className="h-6 w-6" />,
    title: 'Night Owl',
    description: '10:00 PM - 2:00 AM',
    time: 'Late night is my peak time',
  },
];

// Difficulty preferences
const difficultyLevels = [
  {
    id: 'beginner',
    title: 'Start Easy',
    description: 'Begin with fundamentals and build up gradually',
  },
  {
    id: 'intermediate',
    title: 'Balanced Approach',
    description: 'Mix of basic and intermediate concepts',
  },
  {
    id: 'advanced',
    title: 'Challenge Me',
    description: 'Dive into complex topics right away',
  },
  {
    id: 'mixed',
    title: 'Adaptive Difficulty',
    description: 'Let AI adjust difficulty based on my progress',
  },
];

// Common goals and interests
const commonGoals = [
  'Career Advancement',
  'Skill Development',
  'Academic Success',
  'Personal Growth',
  'Industry Certification',
  'Job Preparation',
  'Hobby Learning',
  'Professional Development',
];

const interestAreas = [
  { id: 'technology', icon: <Code className="h-4 w-4" />, label: 'Technology' },
  { id: 'design', icon: <Palette className="h-4 w-4" />, label: 'Design' },
  {
    id: 'business',
    icon: <TrendingUp className="h-4 w-4" />,
    label: 'Business',
  },
  { id: 'science', icon: <Brain className="h-4 w-4" />, label: 'Science' },
  { id: 'arts', icon: <Palette className="h-4 w-4" />, label: 'Arts' },
  { id: 'languages', icon: <Users className="h-4 w-4" />, label: 'Languages' },
  {
    id: 'health',
    icon: <Zap className="h-4 w-4" />,
    label: 'Health & Fitness',
  },
  {
    id: 'marketing',
    icon: <TrendingUp className="h-4 w-4" />,
    label: 'Marketing',
  },
];

export const PreferencesSetupStep: React.FC<PreferencesSetupStepProps> = ({
  onNext,
  onBack,
}) => {
  const dispatch = useAppDispatch();
  const { preferencesStep, preferences } = useAppSelector(
    state => state.onboarding
  );
  const [savePreferences, { isLoading }] = useSaveLearningPreferencesMutation();

  const [customGoal, setCustomGoal] = useState('');

  // Initialize preferences with defaults
  const currentPreferences: LearningPreferences = {
    preferredLearningStyle: 'visual',
    studyTimePreference: 'morning',
    sessionDuration: 30,
    difficultyPreference: 'beginner',
    notificationPreferences: {
      email: true,
      push: true,
      reminders: true,
      achievements: true,
    },
    goals: [],
    interests: [],
    availableHoursPerWeek: 5,
    ...preferences,
  };

  // Get current step info
  const steps = [
    {
      id: 'learning-style',
      title: 'Learning Style',
      description: 'How do you learn best?',
    },
    {
      id: 'schedule',
      title: 'Study Schedule',
      description: 'When and how long do you prefer to study?',
    },
    {
      id: 'goals',
      title: 'Goals & Interests',
      description: 'What are your learning objectives?',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'How would you like to stay updated?',
    },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === preferencesStep);
  const currentStepInfo = steps[currentStepIndex];

  // Handle preference updates
  const updatePreference = (key: keyof LearningPreferences, value: any) => {
    dispatch(updatePreferences({ [key]: value }));
  };

  // Handle next step
  const handleNext = async () => {
    if (preferencesStep === 'notifications') {
      // Save preferences and move to next onboarding step
      try {
        await savePreferences(currentPreferences).unwrap();
        onNext();
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
    } else {
      // Move to next preferences step
      const nextStepIndex = Math.min(currentStepIndex + 1, steps.length - 1);
      dispatch(setPreferencesStep(steps[nextStepIndex].id as any));
    }
  };

  // Handle previous step
  const handleBack = () => {
    if (preferencesStep === 'learning-style') {
      onBack();
    } else {
      const prevStepIndex = Math.max(currentStepIndex - 1, 0);
      dispatch(setPreferencesStep(steps[prevStepIndex].id as any));
    }
  };

  // Add custom goal
  const addCustomGoal = () => {
    if (
      customGoal.trim() &&
      !currentPreferences.goals.includes(customGoal.trim())
    ) {
      updatePreference('goals', [
        ...currentPreferences.goals,
        customGoal.trim(),
      ]);
      setCustomGoal('');
    }
  };

  // Remove goal
  const removeGoal = (goal: string) => {
    updatePreference(
      'goals',
      currentPreferences.goals.filter(g => g !== goal)
    );
  };

  // Toggle interest
  const toggleInterest = (interest: string) => {
    const interests = currentPreferences.interests.includes(interest)
      ? currentPreferences.interests.filter(i => i !== interest)
      : [...currentPreferences.interests, interest];
    updatePreference('interests', interests);
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Preferences Setup</span>
          <span>
            {currentStepIndex + 1} of {steps.length}
          </span>
        </div>
        <Progress
          value={((currentStepIndex + 1) / steps.length) * 100}
          className="h-2"
        />
      </div>

      {/* Step header */}
      <div className="space-y-2 text-center">
        <h3 className="text-2xl font-bold">{currentStepInfo.title}</h3>
        <p className="text-muted-foreground">{currentStepInfo.description}</p>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={preferencesStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {preferencesStep === 'learning-style' && (
            <LearningStyleStep
              selected={currentPreferences.preferredLearningStyle}
              onSelect={style =>
                updatePreference('preferredLearningStyle', style)
              }
            />
          )}

          {preferencesStep === 'schedule' && (
            <ScheduleStep
              studyTime={currentPreferences.studyTimePreference}
              sessionDuration={currentPreferences.sessionDuration}
              availableHours={currentPreferences.availableHoursPerWeek}
              difficulty={currentPreferences.difficultyPreference}
              onStudyTimeChange={time =>
                updatePreference('studyTimePreference', time)
              }
              onSessionDurationChange={duration =>
                updatePreference('sessionDuration', duration)
              }
              onAvailableHoursChange={hours =>
                updatePreference('availableHoursPerWeek', hours)
              }
              onDifficultyChange={difficulty =>
                updatePreference('difficultyPreference', difficulty)
              }
            />
          )}

          {preferencesStep === 'goals' && (
            <GoalsStep
              goals={currentPreferences.goals}
              interests={currentPreferences.interests}
              customGoal={customGoal}
              onCustomGoalChange={setCustomGoal}
              onAddCustomGoal={addCustomGoal}
              onRemoveGoal={removeGoal}
              onToggleInterest={toggleInterest}
            />
          )}

          {preferencesStep === 'notifications' && (
            <NotificationsStep
              preferences={currentPreferences.notificationPreferences}
              onUpdate={prefs =>
                updatePreference('notificationPreferences', prefs)
              }
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button onClick={handleNext} disabled={isLoading}>
          {isLoading ? (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : preferencesStep === 'notifications' ? (
            'Save Preferences'
          ) : (
            <>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Learning Style Step Component
const LearningStyleStep: React.FC<{
  selected: string;
  onSelect: (style: string) => void;
}> = ({ selected, onSelect }) => (
  <div className="grid gap-4 md:grid-cols-2">
    {learningStyles.map(style => (
      <Card
        key={style.id}
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          selected === style.id
            ? 'border-primary bg-primary/5 shadow-md'
            : 'hover:border-primary/50'
        }`}
        onClick={() => onSelect(style.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`rounded-lg p-2 ${
                  selected === style.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {style.icon}
              </div>
              <CardTitle className="text-lg">{style.title}</CardTitle>
            </div>
            {selected === style.id && (
              <Check className="h-5 w-5 text-primary" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription>{style.description}</CardDescription>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Schedule Step Component
const ScheduleStep: React.FC<{
  studyTime: string;
  sessionDuration: number;
  availableHours: number;
  difficulty: string;
  onStudyTimeChange: (time: string) => void;
  onSessionDurationChange: (duration: number) => void;
  onAvailableHoursChange: (hours: number) => void;
  onDifficultyChange: (difficulty: string) => void;
}> = ({
  studyTime,
  sessionDuration,
  availableHours,
  difficulty,
  onStudyTimeChange,
  onSessionDurationChange,
  onAvailableHoursChange,
  onDifficultyChange,
}) => (
  <div className="space-y-8">
    {/* Study time preference */}
    <div className="space-y-4">
      <h4 className="text-lg font-medium">When do you prefer to study?</h4>
      <div className="grid gap-3 md:grid-cols-2">
        {studyTimes.map(time => (
          <Card
            key={time.id}
            className={`cursor-pointer transition-all ${
              studyTime === time.id
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onStudyTimeChange(time.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`rounded-lg p-2 ${
                    studyTime === time.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {time.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{time.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {time.description}
                  </p>
                </div>
                {studyTime === time.id && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>

    {/* Session duration */}
    <div className="space-y-4">
      <h4 className="text-lg font-medium">Preferred session duration</h4>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Session Length</Label>
              <Badge variant="outline">{sessionDuration} minutes</Badge>
            </div>
            <Slider
              value={[sessionDuration]}
              onValueChange={values => onSessionDurationChange(values[0])}
              min={15}
              max={90}
              step={15}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>15 min</span>
              <span>45 min</span>
              <span>90 min</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Available hours per week */}
    <div className="space-y-4">
      <h4 className="text-lg font-medium">
        How many hours can you dedicate weekly?
      </h4>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Weekly Hours</Label>
              <Badge variant="outline">{availableHours} hours/week</Badge>
            </div>
            <Slider
              value={[availableHours]}
              onValueChange={values => onAvailableHoursChange(values[0])}
              min={1}
              max={20}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>1 hour</span>
              <span>10 hours</span>
              <span>20+ hours</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Difficulty preference */}
    <div className="space-y-4">
      <h4 className="text-lg font-medium">
        How challenging should the content be?
      </h4>
      <div className="grid gap-3 md:grid-cols-2">
        {difficultyLevels.map(level => (
          <Card
            key={level.id}
            className={`cursor-pointer transition-all ${
              difficulty === level.id
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onDifficultyChange(level.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{level.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {level.description}
                  </p>
                </div>
                {difficulty === level.id && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

// Goals Step Component
const GoalsStep: React.FC<{
  goals: string[];
  interests: string[];
  customGoal: string;
  onCustomGoalChange: (goal: string) => void;
  onAddCustomGoal: () => void;
  onRemoveGoal: (goal: string) => void;
  onToggleInterest: (interest: string) => void;
}> = ({
  goals,
  interests,
  customGoal,
  onCustomGoalChange,
  onAddCustomGoal,
  onRemoveGoal,
  onToggleInterest,
}) => (
  <div className="space-y-8">
    {/* Learning goals */}
    <div className="space-y-4">
      <h4 className="text-lg font-medium">What are your learning goals?</h4>
      <div className="flex flex-wrap gap-2">
        {commonGoals.map(goal => (
          <Badge
            key={goal}
            variant={goals.includes(goal) ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary/80"
            onClick={() => {
              if (goals.includes(goal)) {
                onRemoveGoal(goal);
              } else {
                onAddCustomGoal();
                onCustomGoalChange(goal);
                setTimeout(() => onAddCustomGoal(), 0);
              }
            }}
          >
            {goal}
            {goals.includes(goal) && (
              <X
                className="ml-1 h-3 w-3"
                onClick={e => {
                  e.stopPropagation();
                  onRemoveGoal(goal);
                }}
              />
            )}
          </Badge>
        ))}
      </div>

      {/* Custom goal input */}
      <div className="flex space-x-2">
        <Input
          value={customGoal}
          onChange={e => onCustomGoalChange(e.target.value)}
          placeholder="Add a custom goal..."
          onKeyPress={e => e.key === 'Enter' && onAddCustomGoal()}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={onAddCustomGoal}
          disabled={!customGoal.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Selected goals */}
      {goals.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Your Goals:</Label>
          <div className="flex flex-wrap gap-2">
            {goals.map(goal => (
              <Badge key={goal} variant="default" className="pr-1">
                {goal}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-auto p-0 hover:bg-transparent"
                  onClick={() => onRemoveGoal(goal)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* Interest areas */}
    <div className="space-y-4">
      <h4 className="text-lg font-medium">What topics interest you?</h4>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {interestAreas.map(area => (
          <Card
            key={area.id}
            className={`cursor-pointer transition-all ${
              interests.includes(area.id)
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onToggleInterest(area.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`rounded-lg p-2 ${
                      interests.includes(area.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {area.icon}
                  </div>
                  <span className="font-medium">{area.label}</span>
                </div>
                {interests.includes(area.id) && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

// Notifications Step Component
const NotificationsStep: React.FC<{
  preferences: LearningPreferences['notificationPreferences'];
  onUpdate: (prefs: LearningPreferences['notificationPreferences']) => void;
}> = ({ preferences, onUpdate }) => {
  const updatePref = (key: keyof typeof preferences, value: boolean) => {
    onUpdate({ ...preferences, [key]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Preferences</span>
          </CardTitle>
          <CardDescription>
            Choose how you'd like to receive updates and reminders about your
            learning progress.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="email">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive course updates and important announcements via email
                </p>
              </div>
            </div>
            <Switch
              id="email"
              checked={preferences.email}
              onCheckedChange={checked => updatePref('email', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="push">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get instant notifications on your device
                </p>
              </div>
            </div>
            <Switch
              id="push"
              checked={preferences.push}
              onCheckedChange={checked => updatePref('push', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="reminders">Study Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Gentle reminders to help you stay on track with your learning
                  schedule
                </p>
              </div>
            </div>
            <Switch
              id="reminders"
              checked={preferences.reminders}
              onCheckedChange={checked => updatePref('reminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="achievements">Achievement Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Celebrate your progress with achievement notifications
                </p>
              </div>
            </div>
            <Switch
              id="achievements"
              checked={preferences.achievements}
              onCheckedChange={checked => updatePref('achievements', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
