'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Headphones,
  Hand,
  BookOpen,
  Sun,
  Sunset,
  Moon,
  Coffee,
  Bell,
  Mail,
  Smartphone,
  Trophy,
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
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { updatePreferences } from '@/lib/redux/slices/onboarding-slice';
import type { LearningPreferences } from '@/lib/redux/api/onboarding-api';

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
  },
  {
    id: 'afternoon',
    icon: <Coffee className="h-6 w-6" />,
    title: 'Afternoon Focus',
    description: '12:00 PM - 6:00 PM',
  },
  {
    id: 'evening',
    icon: <Sunset className="h-6 w-6" />,
    title: 'Evening Learner',
    description: '6:00 PM - 10:00 PM',
  },
  {
    id: 'night',
    icon: <Moon className="h-6 w-6" />,
    title: 'Night Owl',
    description: '10:00 PM - 2:00 AM',
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

// Common goals
const commonGoals = [
  'Career Advancement',
  'Skill Development',
  'Academic Success',
  'Personal Growth',
  'Industry Certification',
  'Job Preparation',
];

// Interest areas
const interestAreas = [
  { id: 'technology', icon: <Code className="h-4 w-4" />, label: 'Technology' },
  { id: 'design', icon: <Palette className="h-4 w-4" />, label: 'Design' },
  { id: 'business', icon: <TrendingUp className="h-4 w-4" />, label: 'Business' },
  { id: 'science', icon: <Brain className="h-4 w-4" />, label: 'Science' },
  { id: 'languages', icon: <Users className="h-4 w-4" />, label: 'Languages' },
  { id: 'health', icon: <Zap className="h-4 w-4" />, label: 'Health & Fitness' },
];

export const PreferencesSetupStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const { preferences } = useAppSelector(state => state.onboarding);
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

  // Handle preference updates
  const updatePreference = (key: keyof LearningPreferences, value: any) => {
    dispatch(updatePreferences({ [key]: value }));
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

  // Toggle goal
  const toggleGoal = (goal: string) => {
    if (currentPreferences.goals.includes(goal)) {
      removeGoal(goal);
    } else {
      updatePreference('goals', [...currentPreferences.goals, goal]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Learning Style Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">Learning Style</h3>
          <p className="text-muted-foreground">How do you learn best?</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {learningStyles.map((style) => (
            <Card
              key={style.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                currentPreferences.preferredLearningStyle === style.id
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => updatePreference('preferredLearningStyle', style.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`rounded-lg p-2 ${
                        currentPreferences.preferredLearningStyle === style.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {style.icon}
                    </div>
                    <CardTitle className="text-lg">{style.title}</CardTitle>
                  </div>
                  {currentPreferences.preferredLearningStyle === style.id && (
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
      </motion.div>

      {/* Study Schedule Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">Study Schedule</h3>
          <p className="text-muted-foreground">When and how long do you prefer to study?</p>
        </div>

        {/* Study time preference */}
        <div className="space-y-4">
          <h4 className="font-medium">When do you prefer to study?</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {studyTimes.map((time) => (
              <Card
                key={time.id}
                className={`cursor-pointer transition-all ${
                  currentPreferences.studyTimePreference === time.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => updatePreference('studyTimePreference', time.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`rounded-lg p-2 ${
                        currentPreferences.studyTimePreference === time.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {time.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{time.title}</p>
                      <p className="text-sm text-muted-foreground">{time.description}</p>
                    </div>
                    {currentPreferences.studyTimePreference === time.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Session duration and weekly hours */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Session Length</Label>
                  <Badge variant="outline">{currentPreferences.sessionDuration} minutes</Badge>
                </div>
                <Slider
                  value={[currentPreferences.sessionDuration]}
                  onValueChange={(values) => updatePreference('sessionDuration', values[0])}
                  min={15}
                  max={90}
                  step={15}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>15 min</span>
                  <span>90 min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Weekly Hours</Label>
                  <Badge variant="outline">{currentPreferences.availableHoursPerWeek} hrs/week</Badge>
                </div>
                <Slider
                  value={[currentPreferences.availableHoursPerWeek]}
                  onValueChange={(values) => updatePreference('availableHoursPerWeek', values[0])}
                  min={1}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 hour</span>
                  <span>20+ hours</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Difficulty preference */}
        <div className="space-y-4">
          <h4 className="font-medium">How challenging should the content be?</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {difficultyLevels.map((level) => (
              <Card
                key={level.id}
                className={`cursor-pointer transition-all ${
                  currentPreferences.difficultyPreference === level.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => updatePreference('difficultyPreference', level.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{level.title}</p>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                    </div>
                    {currentPreferences.difficultyPreference === level.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Goals and Interests Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">Goals & Interests</h3>
          <p className="text-muted-foreground">What are your learning objectives?</p>
        </div>

        {/* Learning goals */}
        <div className="space-y-4">
          <h4 className="font-medium">What are your learning goals?</h4>
          <div className="flex flex-wrap gap-2">
            {commonGoals.map((goal) => (
              <Badge
                key={goal}
                variant={currentPreferences.goals.includes(goal) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => toggleGoal(goal)}
              >
                {goal}
                {currentPreferences.goals.includes(goal) && (
                  <X
                    className="ml-1 h-3 w-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeGoal(goal);
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
              onChange={(e) => setCustomGoal(e.target.value)}
              placeholder="Add a custom goal..."
              onKeyPress={(e) => e.key === 'Enter' && addCustomGoal()}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={addCustomGoal}
              disabled={!customGoal.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Selected goals */}
          {currentPreferences.goals.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Your Goals:</Label>
              <div className="flex flex-wrap gap-2">
                {currentPreferences.goals.map((goal) => (
                  <Badge key={goal} variant="default" className="pr-1">
                    {goal}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-auto p-0 hover:bg-transparent"
                      onClick={() => removeGoal(goal)}
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
          <h4 className="font-medium">What topics interest you?</h4>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {interestAreas.map((area) => (
              <Card
                key={area.id}
                className={`cursor-pointer transition-all ${
                  currentPreferences.interests.includes(area.id)
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => toggleInterest(area.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`rounded-lg p-2 ${
                          currentPreferences.interests.includes(area.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {area.icon}
                      </div>
                      <span className="font-medium">{area.label}</span>
                    </div>
                    {currentPreferences.interests.includes(area.id) && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Notifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-4"
      >
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">Notifications</h3>
          <p className="text-muted-foreground">How would you like to stay updated?</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notification Preferences</span>
            </CardTitle>
            <CardDescription>
              Choose how you'd like to receive updates about your learning progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="email">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Course updates and announcements
                  </p>
                </div>
              </div>
              <Switch
                id="email"
                checked={currentPreferences.notificationPreferences.email}
                onCheckedChange={(checked) =>
                  updatePreference('notificationPreferences', {
                    ...currentPreferences.notificationPreferences,
                    email: checked,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="push">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Instant notifications on your device
                  </p>
                </div>
              </div>
              <Switch
                id="push"
                checked={currentPreferences.notificationPreferences.push}
                onCheckedChange={(checked) =>
                  updatePreference('notificationPreferences', {
                    ...currentPreferences.notificationPreferences,
                    push: checked,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Trophy className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="achievements">Achievement Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Celebrate your progress and milestones
                  </p>
                </div>
              </div>
              <Switch
                id="achievements"
                checked={currentPreferences.notificationPreferences.achievements}
                onCheckedChange={(checked) =>
                  updatePreference('notificationPreferences', {
                    ...currentPreferences.notificationPreferences,
                    achievements: checked,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};