'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Medal, Star } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AchievementsWidget } from '@/components/analytics/achievements-widget';
import {
  useGetAchievementsQuery,
  useGetAchievementProgressQuery,
} from '@/lib/redux/api/student-analytics-api';

export default function StudentAchievementsPage() {
  const { data: achievements, isLoading: isLoadingAchievements } =
    useGetAchievementsQuery({});
  const { data: progressData, isLoading: isLoadingProgress } =
    useGetAchievementProgressQuery();

  if (isLoadingAchievements || isLoadingProgress) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="animate-pulse">
          <div className="mb-2 h-8 w-64 rounded bg-muted" />
          <div className="h-4 w-96 rounded bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-12 w-12 rounded-full bg-muted" />
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto space-y-6 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Your Achievements</h1>
          <p className="text-muted-foreground">
            Celebrate your learning milestones and track your progress
          </p>
        </div>
      </motion.div>

      {/* Achievements Widget */}
      <AchievementsWidget achievements={achievements} />
    </motion.div>
  );
}
