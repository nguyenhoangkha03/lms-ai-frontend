'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

export const MissionSection: React.FC = () => {
  return (
    <section className="bg-white py-24 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">
              Our Mission & Vision
            </h2>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
              We envision a world where quality education is accessible to
              everyone, regardless of their background, location, or learning
              style. Through AI-powered personalization, we're breaking down
              barriers and creating opportunities for millions of learners
              worldwide.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-xl font-semibold text-blue-600 dark:text-blue-400">
                  Democratize Education
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Making high-quality education accessible and affordable for
                  learners everywhere.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-semibold text-purple-600 dark:text-purple-400">
                  Personalize Learning
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Adapting content, pace, and methodology to each individual's
                  unique learning profile.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-semibold text-green-600 dark:text-green-400">
                  Measure Impact
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Providing actionable insights to improve learning outcomes and
                  educational effectiveness.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="border-none bg-gradient-to-br from-blue-50 to-purple-50 p-8 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardContent className="p-0">
                <blockquote className="mb-6 text-xl italic text-gray-700 dark:text-gray-300">
                  "Education is the most powerful weapon which you can use to
                  change the world. We're putting that weapon into the hands of
                  AI to amplify its impact."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-white">
                    AI
                  </div>
                  <div>
                    <p className="font-semibold">Our AI Philosophy</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Technology serving humanity
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
