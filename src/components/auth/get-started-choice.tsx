'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Users,
  BookOpen,
  Brain,
  Award,
  TrendingUp,
  Star,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
  hover: {
    y: -5,
    transition: { duration: 0.2 },
  },
};

export const GetStartedChoice: React.FC = () => {
  const router = useRouter();

  const choices = [
    {
      id: 'student',
      title: 'Join as Student',
      subtitle: 'Start Your Learning Journey',
      description:
        'Discover new skills with AI-powered personalized learning experiences',
      icon: GraduationCap,
      color: 'blue',
      href: '/register',
      features: [
        { icon: Brain, text: 'AI-powered personalized learning' },
        { icon: BookOpen, text: 'Thousands of expert courses' },
        { icon: Award, text: 'Industry-recognized certificates' },
        { icon: TrendingUp, text: 'Track your progress & achievements' },
      ],
      cta: 'Start Learning Today',
      popular: true,
      stats: [
        { label: 'Active Learners', value: '50,000+' },
        { label: 'Course Completion Rate', value: '94%' },
        { label: 'Average Rating', value: '4.8/5' },
      ],
    },
    {
      id: 'teacher',
      title: 'Become an Instructor',
      subtitle: 'Share Your Expertise',
      description:
        'Join our community of educators and help students around the world',
      icon: Users,
      color: 'green',
      href: '/teacher-register',
      features: [
        { icon: Users, text: 'Teach thousands of students globally' },
        { icon: TrendingUp, text: 'Advanced teaching analytics' },
        { icon: BookOpen, text: 'Professional course creation tools' },
        { icon: Star, text: 'Build your reputation as an expert' },
      ],
      cta: 'Apply to Teach',
      note: 'Application review required',
      stats: [
        { label: 'Instructor Community', value: '5,000+' },
        { label: 'Average Monthly Earnings', value: '$2,500' },
        { label: 'Student Satisfaction', value: '96%' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden border-b bg-white dark:bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Choose Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}
                Learning Path
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
              Whether you want to master new skills or share your expertise with
              the world, we have the perfect platform for your journey.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Choice Cards */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-8 lg:grid-cols-2"
        >
          {choices.map(choice => {
            const Icon = choice.icon;
            return (
              <motion.div
                key={choice.id}
                variants={cardVariants}
                whileHover="hover"
                className="relative"
              >
                <Card className="relative h-full overflow-hidden border-2 shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-xl">
                  {choice.popular && (
                    <div className="absolute -right-12 top-8 rotate-45 bg-blue-600 px-12 py-1 text-xs font-semibold text-white">
                      Most Popular
                    </div>
                  )}

                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`rounded-lg p-3 bg-${choice.color}-100 dark:bg-${choice.color}-900/20`}
                      >
                        <Icon
                          className={`h-8 w-8 text-${choice.color}-600 dark:text-${choice.color}-400`}
                        />
                      </div>
                      {choice.note && (
                        <Badge variant="secondary" className="text-xs">
                          {choice.note}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <CardTitle className="text-2xl">{choice.title}</CardTitle>
                      <CardDescription className="text-lg font-medium text-muted-foreground">
                        {choice.subtitle}
                      </CardDescription>
                      <p className="text-sm text-muted-foreground">
                        {choice.description}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Features */}
                    <div className="space-y-3">
                      {choice.features.map((feature, index) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <div key={index} className="flex items-center gap-3">
                            <div
                              className={`rounded-full p-1 bg-${choice.color}-100 dark:bg-${choice.color}-900/20`}
                            >
                              <FeatureIcon
                                className={`h-4 w-4 text-${choice.color}-600 dark:text-${choice.color}-400`}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {feature.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-4">
                      {choice.stats.map((stat, index) => (
                        <div key={index} className="text-center">
                          <div className="text-lg font-bold text-foreground">
                            {stat.value}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button
                      className="group h-12 w-full text-base font-semibold"
                      size="lg"
                      onClick={() => router.push(choice.href)}
                    >
                      {choice.cta}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="mx-auto max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Already have an account?
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Sign in to continue your learning journey or manage your courses
            </p>
            <Button variant="outline" asChild className="mt-4">
              <Link href="/login">Sign In Instead</Link>
            </Button>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 border-t pt-16"
        >
          <div className="text-center">
            <h4 className="mb-8 text-lg font-semibold text-gray-900 dark:text-white">
              Trusted by learners and educators worldwide
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              {[
                '🏆 Top Learning Platform 2024',
                '⭐ 4.8/5 Average Rating',
                '🔒 SSL Secured & Privacy Protected',
                '🌍 Available in 25+ Languages',
              ].map((item, index) => (
                <div key={index} className="text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
