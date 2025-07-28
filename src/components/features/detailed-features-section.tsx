'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  BarChart3,
  MessageSquare,
  Video,
  Users,
  Target,
  Zap,
  Smartphone,
  Database,
} from 'lucide-react';

const featureCategories = [
  {
    title: 'AI-Powered Learning',
    description: 'Intelligent algorithms that adapt to your learning style',
    features: [
      {
        icon: Brain,
        title: 'Adaptive Learning Paths',
        description:
          'Personalized curriculum that adjusts based on your progress and performance',
        details: [
          'Real-time difficulty adjustment',
          'Learning style recognition',
          'Optimal pacing algorithms',
          'Knowledge gap identification',
        ],
      },
      {
        icon: Target,
        title: 'Smart Recommendations',
        description:
          'AI-driven suggestions for courses, resources, and study materials',
        details: [
          'Content recommendation engine',
          'Skill-based suggestions',
          'Career path guidance',
          'Peer comparison insights',
        ],
      },
      {
        icon: MessageSquare,
        title: 'AI Tutor Assistant',
        description:
          '24/7 intelligent tutoring with natural language processing',
        details: [
          'Instant question answering',
          'Concept explanation',
          'Practice problem generation',
          'Study plan optimization',
        ],
      },
    ],
  },
  {
    title: 'Advanced Analytics',
    description:
      'Comprehensive insights into learning progress and performance',
    features: [
      {
        icon: BarChart3,
        title: 'Learning Analytics',
        description:
          'Detailed tracking of learning progress with actionable insights',
        details: [
          'Progress visualization',
          'Performance trends',
          'Time spent analysis',
          'Engagement metrics',
        ],
      },
      {
        icon: Zap,
        title: 'Real-time Feedback',
        description: 'Instant performance feedback and improvement suggestions',
        details: [
          'Immediate quiz results',
          'Mistake pattern analysis',
          'Improvement recommendations',
          'Achievement tracking',
        ],
      },
      {
        icon: Database,
        title: 'Data-Driven Insights',
        description: 'Advanced analytics to optimize learning outcomes',
        details: [
          'Learning effectiveness metrics',
          'Predictive performance modeling',
          'Comparative benchmarking',
          'Custom reporting dashboards',
        ],
      },
    ],
  },
  {
    title: 'Interactive Learning',
    description: 'Engaging content delivery and collaboration tools',
    features: [
      {
        icon: Video,
        title: 'Interactive Content',
        description: 'Rich multimedia content with interactive elements',
        details: [
          'HD video streaming',
          'Interactive simulations',
          'Gamified learning modules',
          'Virtual labs and experiments',
        ],
      },
      {
        icon: Users,
        title: 'Collaborative Learning',
        description: 'Connect and learn with peers in virtual environments',
        details: [
          'Study groups and forums',
          'Peer-to-peer learning',
          'Live virtual classrooms',
          'Project collaboration tools',
        ],
      },
      {
        icon: Smartphone,
        title: 'Multi-Platform Access',
        description: 'Learn anywhere, anytime across all your devices',
        details: [
          'Mobile app optimization',
          'Offline content access',
          'Cross-device synchronization',
          'Progressive web app support',
        ],
      },
    ],
  },
];

export const DetailedFeaturesSection: React.FC = () => {
  return (
    <section className="bg-white py-24 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Deep Dive into Our Features
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">
            Explore the comprehensive suite of tools and technologies that power
            our AI-driven learning platform.
          </p>
        </motion.div>

        <div className="space-y-24">
          {featureCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="mb-12 text-center">
                <Badge variant="outline" className="mb-4">
                  {category.title}
                </Badge>
                <h3 className="mb-4 text-2xl font-bold md:text-3xl">
                  {category.title}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {category.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {category.features.map((feature, featureIndex) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: featureIndex * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full transition-shadow duration-300 hover:shadow-lg">
                      <CardHeader>
                        <div className="mb-4 flex items-center gap-4">
                          <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
                            <feature.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <CardTitle className="text-xl">
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {feature.details.map((detail, detailIndex) => (
                            <li
                              key={detailIndex}
                              className="flex items-center gap-2 text-sm"
                            >
                              <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
