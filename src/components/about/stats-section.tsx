'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Users, BookOpen, Award, Globe, TrendingUp, Clock } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '50,000+',
    label: 'Active Learners',
    description: 'Students and professionals worldwide',
    color: 'blue',
  },
  {
    icon: BookOpen,
    value: '1,000+',
    label: 'Courses Available',
    description: 'Across multiple disciplines and skill levels',
    color: 'green',
  },
  {
    icon: Award,
    value: '25,000+',
    label: 'Certificates Issued',
    description: 'Industry-recognized credentials earned',
    color: 'purple',
  },
  {
    icon: Globe,
    value: '120+',
    label: 'Countries Served',
    description: 'Global reach across all continents',
    color: 'orange',
  },
  {
    icon: TrendingUp,
    value: '95%',
    label: 'Completion Rate',
    description: 'Higher than industry average',
    color: 'cyan',
  },
  {
    icon: Clock,
    value: '2M+',
    label: 'Learning Hours',
    description: 'Total time spent on our platform',
    color: 'red',
  },
];

const achievements = [
  {
    year: '2020',
    title: 'Company Founded',
    description: 'Started with a vision to democratize AI-powered education',
  },
  {
    year: '2021',
    title: 'First 1,000 Users',
    description: 'Reached our first milestone with early adopters',
  },
  {
    year: '2022',
    title: 'Series A Funding',
    description: 'Raised $10M to accelerate product development',
  },
  {
    year: '2023',
    title: 'AI Breakthrough',
    description: 'Launched revolutionary adaptive learning algorithms',
  },
  {
    year: '2024',
    title: 'Global Expansion',
    description: 'Expanded to serve learners in 120+ countries',
  },
];

export const StatsSection: React.FC = () => {
  return (
    <section className="bg-white py-24 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="mb-12 text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">
              Our Impact in Numbers
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
              See how we're transforming education and empowering learners
              worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center transition-shadow duration-300 hover:shadow-lg">
                  <CardContent className="p-8">
                    <div
                      className={`inline-flex h-16 w-16 items-center justify-center bg-${stat.color}-100 dark:bg-${stat.color}-900/20 mb-4 rounded-full`}
                    >
                      <stat.icon
                        className={`h-8 w-8 text-${stat.color}-600 dark:text-${stat.color}-400`}
                      />
                    </div>
                    <div className="mb-2 text-3xl font-bold">{stat.value}</div>
                    <div className="mb-2 text-lg font-semibold">
                      {stat.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.description}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="mb-12 text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">Our Journey</h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
              From a small startup to a global platform, here's how we've grown.
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 hidden h-full w-0.5 -translate-x-1/2 transform bg-gray-300 dark:bg-gray-600 md:block" />

            <div className="space-y-12">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className={`flex items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex-col gap-8`}
                >
                  <div className="w-full md:w-1/2">
                    <Card>
                      <CardContent className="p-6">
                        <div className="mb-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {achievement.year}
                        </div>
                        <h3 className="mb-2 text-xl font-semibold">
                          {achievement.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {achievement.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Timeline Dot */}
                  <div className="relative">
                    <div className="hidden h-4 w-4 rounded-full border-4 border-white bg-blue-600 shadow-lg dark:border-gray-900 md:block" />
                  </div>

                  <div className="w-full md:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
