'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Play,
  Sparkles,
  Users,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-blue-100 opacity-50 dark:bg-blue-900/20" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-100 opacity-50 dark:bg-purple-900/20" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <Badge
              variant="secondary"
              className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              AI-Powered Learning Platform
            </Badge>

            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              Transform Your Learning with{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Intelligence
              </span>
            </h1>

            <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
              Experience personalized education that adapts to your learning
              style, tracks your progress, and provides intelligent
              recommendations for optimal results.
            </p>

            {/* Stats */}
            <div className="mb-8 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                  <Users className="h-6 w-6" />
                  50K+
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active Learners
                </p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-purple-600 dark:text-purple-400">
                  <BookOpen className="h-6 w-6" />
                  1000+
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Courses
                </p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600 dark:text-green-400">
                  <TrendingUp className="h-6 w-6" />
                  95%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Success Rate
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button asChild size="lg" className="h-12 px-8">
                <Link href={ROUTES.REGISTER}>
                  Start Learning Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button variant="outline" size="lg" className="h-12 px-8">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
              ✓ Free trial • ✓ No credit card required • ✓ Cancel anytime
            </div>
          </motion.div>

          {/* Right Content - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
              {/* Mockup Dashboard */}
              <div className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-red-400"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                  <div className="h-3 w-3 rounded-full bg-green-400"></div>
                </div>

                <div className="space-y-4">
                  <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"></div>
                    <div className="h-20 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"></div>
                  </div>
                  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -right-4 -top-4 rounded-lg bg-blue-500 p-3 text-white shadow-lg"
              >
                <Sparkles className="h-6 w-6" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
                className="absolute -bottom-4 -left-4 rounded-lg bg-purple-500 p-3 text-white shadow-lg"
              >
                <TrendingUp className="h-6 w-6" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
