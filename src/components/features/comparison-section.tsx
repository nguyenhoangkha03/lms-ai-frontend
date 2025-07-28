'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

const comparisonData = {
  features: [
    'AI-Powered Personalization',
    'Adaptive Learning Paths',
    'Real-time Analytics',
    '24/7 AI Tutor Support',
    'Interactive Content',
    'Mobile App',
    'Offline Access',
    'Live Virtual Classrooms',
    'Advanced Assessments',
    'Progress Tracking',
    'Certification Programs',
    'Enterprise Integration',
    'Custom Branding',
    'API Access',
    'Dedicated Support',
  ],
  platforms: [
    {
      name: 'Our Platform',
      isOurs: true,
      features: [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
      ],
    },
    {
      name: 'Traditional LMS',
      isOurs: false,
      features: [
        false,
        false,
        true,
        false,
        true,
        true,
        false,
        false,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
      ],
    },
    {
      name: 'Other AI Platforms',
      isOurs: false,
      features: [
        true,
        true,
        true,
        true,
        false,
        true,
        false,
        false,
        true,
        true,
        false,
        false,
        false,
        true,
        false,
      ],
    },
  ],
};

export const ComparisonSection: React.FC = () => {
  return (
    <section className="bg-gray-50 py-24 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <Badge variant="outline" className="mb-4">
            Platform Comparison
          </Badge>
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            See How We Compare
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">
            Discover why our AI-powered platform stands out from traditional
            learning management systems and other competitors.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-center">Feature Comparison</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left font-medium">Features</th>
                      {comparisonData.platforms.map(platform => (
                        <th
                          key={platform.name}
                          className="min-w-[150px] p-4 text-center font-medium"
                        >
                          <div className="flex flex-col items-center gap-2">
                            {platform.name}
                            {platform.isOurs && (
                              <Badge variant="default" className="text-xs">
                                Our Solution
                              </Badge>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.features.map((feature, index) => (
                      <motion.tr
                        key={feature}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        viewport={{ once: true }}
                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="p-4 font-medium">{feature}</td>
                        {comparisonData.platforms.map(
                          (platform, platformIndex) => (
                            <td key={platformIndex} className="p-4 text-center">
                              {platform.features[index] ? (
                                <Check
                                  className={`mx-auto h-5 w-5 ${
                                    platform.isOurs
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-gray-500'
                                  }`}
                                />
                              ) : (
                                <X className="mx-auto h-5 w-5 text-red-500" />
                              )}
                            </td>
                          )
                        )}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
