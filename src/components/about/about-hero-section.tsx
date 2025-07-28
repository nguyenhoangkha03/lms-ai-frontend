'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Heart, Target } from 'lucide-react';

export const AboutHeroSection: React.FC = () => {
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
            Our Story
          </Badge>

          <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
            Transforming Education with{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Innovation
            </span>
          </h1>

          <p className="mx-auto mb-12 max-w-3xl text-xl text-gray-600 dark:text-gray-300">
            We believe that every learner deserves a personalized education
            experience. Our mission is to democratize quality education through
            the power of artificial intelligence, making learning more
            effective, engaging, and accessible for everyone.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Lightbulb className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Innovation</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Pioneering AI technologies to revolutionize how people learn and
                grow.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                <Heart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Empathy</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Understanding each learner's unique needs and adapting to their
                journey.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center"
            >
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Impact</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Creating measurable improvements in learning outcomes worldwide.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
