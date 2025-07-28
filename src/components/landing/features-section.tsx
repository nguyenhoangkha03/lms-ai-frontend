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
  Shield,
  Clock,
  Zap,
  Target,
  Users,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Personalization',
    description:
      'Adaptive learning algorithms that adjust to your pace and learning style in real-time.',
    badge: 'Core Feature',
    color: 'blue',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description:
      'Comprehensive insights into your learning progress with detailed performance metrics.',
    badge: 'Analytics',
    color: 'purple',
  },
  {
    icon: MessageSquare,
    title: '24/7 AI Tutor',
    description:
      'Get instant answers and explanations from our intelligent chatbot tutor.',
    badge: 'AI Assistant',
    color: 'green',
  },
  {
    icon: Video,
    title: 'Interactive Content',
    description:
      'Engaging video lessons, quizzes, and hands-on exercises for better retention.',
    badge: 'Content',
    color: 'orange',
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description:
      'Learn at your own pace with personalized schedules that fit your lifestyle.',
    badge: 'Flexibility',
    color: 'cyan',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description:
      'Enterprise-grade security with complete privacy protection for your data.',
    badge: 'Security',
    color: 'red',
  },
  {
    icon: Zap,
    title: 'Instant Feedback',
    description:
      'Receive immediate feedback on assignments and quizzes to accelerate learning.',
    badge: 'Performance',
    color: 'yellow',
  },
  {
    icon: Target,
    title: 'Goal Tracking',
    description:
      'Set and track learning goals with milestone celebrations and achievements.',
    badge: 'Motivation',
    color: 'indigo',
  },
  {
    icon: Users,
    title: 'Collaborative Learning',
    description:
      'Connect with peers, join study groups, and learn together in virtual classrooms.',
    badge: 'Community',
    color: 'pink',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="bg-gray-50 py-24 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <Badge variant="outline" className="mb-4">
            Platform Features
          </Badge>
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Everything You Need for{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Effective Learning
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">
            Our comprehensive platform combines cutting-edge AI technology with
            proven educational methodologies to deliver an unparalleled learning
            experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full transition-shadow duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <div
                      className={`rounded-lg p-2 bg-${feature.color}-100 dark:bg-${feature.color}-900/20`}
                    >
                      <feature.icon
                        className={`h-6 w-6 text-${feature.color}-600 dark:text-${feature.color}-400`}
                      />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
