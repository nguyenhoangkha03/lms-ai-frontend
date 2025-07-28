'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export const FeaturesHeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <Badge variant="outline" className="mb-6">
            Platform Features
          </Badge>

          <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
            Powerful Features for{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Modern Learning
            </span>
          </h1>

          <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
            Discover how our comprehensive suite of AI-powered tools transforms
            the way you learn, teach, and grow. From personalized
            recommendations to real-time analytics, every feature is designed
            with your success in mind.
          </p>

          <div className="mb-16 flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href={ROUTES.REGISTER}>
                Try All Features Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button variant="outline" size="lg">
              <Play className="mr-2 h-4 w-4" />
              Watch Demo
            </Button>
          </div>

          {/* Feature Categories */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
            >
              <h3 className="mb-2 text-lg font-semibold">AI-Powered</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Intelligent recommendations, adaptive learning paths, and
                personalized content delivery.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
            >
              <h3 className="mb-2 text-lg font-semibold">
                Analytics & Insights
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Comprehensive dashboards, progress tracking, and performance
                analytics for data-driven decisions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
            >
              <h3 className="mb-2 text-lg font-semibold">
                Collaboration Tools
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Virtual classrooms, peer discussions, and seamless communication
                between learners and instructors.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
