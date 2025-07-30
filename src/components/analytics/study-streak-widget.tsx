'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Calendar,
  TrendingUp,
  Award,
  Settings,
  CheckCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  StudyStreak,
  useUpdateStreakGoalMutation,
} from '@/lib/redux/api/student-analytics-api';

interface StudyStreakWidgetProps {
  data?: StudyStreak;
}

export const StudyStreakWidget: React.FC<StudyStreakWidgetProps> = ({
  data,
}) => {
  const { toast } = useToast();
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState(data?.streakGoal || 30);

  const [updateStreakGoal, { isLoading: isUpdatingGoal }] =
    useUpdateStreakGoalMutation();

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flame className="h-5 w-5" />
            <span>Study Streak</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="mb-2 h-4 w-3/4 rounded bg-muted" />
                <div className="mb-4 h-2 rounded bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleUpdateGoal = async () => {
    try {
      await updateStreakGoal({ goal: newGoal }).unwrap();
      setIsGoalDialogOpen(false);
      toast({
        title: 'Goal Updated',
        description: `Your streak goal has been set to ${newGoal} days.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update streak goal. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Calculate streak progress
  const streakProgress = (data.currentStreak / data.streakGoal) * 100;
  const isStreakGoalReached = data.currentStreak >= data.streakGoal;

  // Get recent 7 days for mini calendar
  const last7Days = data.streakHistory.slice(-7);

  // Get current week stats
  const currentWeekStats = data.weeklyStats[data.weeklyStats.length - 1];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Flame
                className={`h-5 w-5 ${data.currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`}
              />
              <span>Study Streak</span>
            </CardTitle>
            <CardDescription>Keep your learning momentum going</CardDescription>
          </div>

          <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Update Streak Goal</DialogTitle>
                <DialogDescription>
                  Set your daily study streak target.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">Streak Goal (days)</Label>
                  <Input
                    id="goal"
                    type="number"
                    value={newGoal}
                    onChange={e => setNewGoal(Number(e.target.value))}
                    min="1"
                    max="365"
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose a realistic goal that motivates you to study
                    consistently.
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsGoalDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateGoal} disabled={isUpdatingGoal}>
                    {isUpdatingGoal ? 'Updating...' : 'Update Goal'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Streak Display */}
        <div className="space-y-2 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={`inline-flex h-20 w-20 items-center justify-center rounded-full ${
              data.currentStreak > 0
                ? 'bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20'
                : 'bg-muted'
            }`}
          >
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${data.currentStreak > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}
              >
                {data.currentStreak}
              </div>
              <div className="text-xs text-muted-foreground">days</div>
            </div>
          </motion.div>

          <div className="space-y-1">
            <p className="text-lg font-semibold">
              {data.currentStreak === 0
                ? 'Start Your Streak!'
                : `${data.currentStreak} Day${data.currentStreak !== 1 ? 's' : ''} Strong!`}
            </p>
            <p className="text-sm text-muted-foreground">
              {data.todayCompleted ? (
                <span className="flex items-center justify-center space-x-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Today's goal completed</span>
                </span>
              ) : (
                "Complete today's study to continue your streak"
              )}
            </p>
          </div>
        </div>

        <Separator />

        {/* Streak Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Streak Goal Progress</span>
            <span className="text-sm text-muted-foreground">
              {data.currentStreak} / {data.streakGoal} days
            </span>
          </div>
          <Progress value={Math.min(streakProgress, 100)} className="h-2" />
          {isStreakGoalReached && (
            <div className="flex items-center justify-center space-x-1 text-green-600">
              <Award className="h-4 w-4" />
              <span className="text-sm font-medium">Goal Achieved!</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Last 7 Days Mini Calendar */}
        <div className="space-y-3">
          <h4 className="flex items-center space-x-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            <span>Last 7 Days</span>
          </h4>

          <div className="grid grid-cols-7 gap-1">
            {last7Days.map((day, index) => {
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('en', {
                weekday: 'short',
              });
              const dayNumber = date.getDate();

              return (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="mb-1 text-xs text-muted-foreground">
                    {dayName}
                  </div>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                      day.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {day.completed ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      dayNumber
                    )}
                  </div>
                  {day.studyTime > 0 && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {Math.round(day.studyTime)}m
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Stats */}
        <div className="space-y-3">
          <h4 className="flex items-center space-x-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            <span>Streak Stats</span>
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <div className="text-lg font-bold text-blue-600">
                {data.longestStreak}
              </div>
              <div className="text-xs text-muted-foreground">
                Longest Streak
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <div className="text-lg font-bold text-purple-600">
                {currentWeekStats?.daysActive || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                Days This Week
              </div>
            </div>
          </div>

          {currentWeekStats && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <div className="text-lg font-bold text-green-600">
                  {Math.round(currentWeekStats.totalTime)}h
                </div>
                <div className="text-xs text-muted-foreground">
                  Weekly Hours
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <div className="text-lg font-bold text-orange-600">
                  {Math.round(currentWeekStats.averageScore)}%
                </div>
                <div className="text-xs text-muted-foreground">Avg Score</div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Milestones */}
        <div className="space-y-3">
          <h4 className="flex items-center space-x-2 text-sm font-medium">
            <Award className="h-4 w-4" />
            <span>Streak Milestones</span>
          </h4>

          <div className="space-y-2">
            {data.milestones.map((milestone, index) => (
              <motion.div
                key={milestone.days}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between rounded-lg p-2 ${
                  milestone.achieved
                    ? 'border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      milestone.achieved
                        ? 'bg-green-500 text-white'
                        : 'bg-muted-foreground/20'
                    }`}
                  >
                    {milestone.achieved ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <span className="text-xs font-bold">
                        {milestone.days}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium">{milestone.title}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge
                    variant={milestone.achieved ? 'default' : 'outline'}
                    className="text-xs"
                  >
                    {milestone.reward}
                  </Badge>
                  {milestone.achieved && milestone.achievedAt && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(milestone.achievedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Motivation Message */}
        <div
          className={`rounded-lg p-4 text-center ${
            data.currentStreak > 0
              ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10'
              : 'bg-muted/50'
          }`}
        >
          <p className="text-sm font-medium">
            {data.currentStreak === 0 &&
              'Start your learning journey today! 🚀'}
            {data.currentStreak > 0 &&
              data.currentStreak < 7 &&
              'Great start! Keep building momentum! 💪'}
            {data.currentStreak >= 7 &&
              data.currentStreak < 30 &&
              "You're on fire! Don't break the chain! 🔥"}
            {data.currentStreak >= 30 &&
              "Incredible dedication! You're a learning champion! 🏆"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
