'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Brain,
  Users,
  Trophy,
  BookOpen,
  Sparkles,
  Star,
  Clock,
  Target,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/lib/redux/hooks';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: string;
}

const features: Feature[] = [
  {
    icon: <Brain className="h-6 w-6" />,
    title: 'AI-Powered Learning',
    description:
      'Get personalized recommendations and adaptive learning paths tailored to your needs.',
    highlight: 'Smart',
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: 'Interactive Lessons',
    description:
      'Engage with dynamic content, quizzes, and hands-on exercises for better retention.',
    highlight: 'Engaging',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Expert Instructors',
    description: 'Learn from industry professionals and experienced educators.',
    highlight: 'Quality',
  },
  {
    icon: <Trophy className="h-6 w-6" />,
    title: 'Achievements & Certificates',
    description:
      'Track your progress and earn recognized certificates upon completion.',
    highlight: 'Rewarding',
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: 'Flexible Schedule',
    description:
      'Learn at your own pace with 24/7 access to all course materials.',
    highlight: 'Flexible',
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: 'Goal-Oriented Learning',
    description:
      'Set and achieve your learning goals with our structured approach.',
    highlight: 'Focused',
  },
];

export const WelcomeStep: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4 text-center"
      >
        <div className="relative inline-flex items-center justify-center p-4">
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-primary/20 to-secondary/20" />
          <GraduationCap className="relative z-10 h-16 w-16 text-primary" />
          <Sparkles className="absolute -right-2 -top-2 h-6 w-6 animate-bounce text-yellow-500" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold">
            Welcome to LMS AI Platform, {user?.firstName || 'Student'}! 👋
          </h3>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            We're excited to help you embark on your personalized learning
            journey. Let's set up your profile to create the perfect learning
            experience for you.
          </p>
        </div>

        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span>Join over 50,000+ learners worldwide</span>
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        </div>
      </motion.div>

      {/* Features grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {features.map((feature, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className="group h-full transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                      {feature.icon}
                    </div>
                    {feature.highlight && (
                      <Badge variant="secondary" className="text-xs">
                        {feature.highlight}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Next steps preview */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>What's Next?</span>
            </CardTitle>
            <CardDescription>
              Here's what we'll help you set up in the next few steps:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium">Skill Assessment</p>
                  <p className="text-sm text-muted-foreground">
                    A quick quiz to understand your current knowledge level
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">Learning Preferences</p>
                  <p className="text-sm text-muted-foreground">
                    Set your study schedule, goals, and learning style
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium">Learning Path</p>
                  <p className="text-sm text-muted-foreground">
                    Choose your personalized learning journey
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Call to action */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="space-y-4 text-center"
      >
        <p className="text-sm text-muted-foreground">
          This setup will take approximately 5-10 minutes to complete.
        </p>

        <div className="text-sm text-muted-foreground">
          Ready to personalize your learning experience? Let's begin!
        </div>

        <p className="text-xs text-muted-foreground">
          You can always modify these settings later in your profile.
        </p>
      </motion.div>
    </div>
  );
};
