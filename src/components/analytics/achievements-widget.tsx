'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Award,
  Medal,
  Star,
  Target,
  Zap,
  BookOpen,
  Clock,
  Users,
  Brain,
  Gift,
  Lock,
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
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Achievement,
  useClaimAchievementMutation,
} from '@/lib/redux/api/student-analytics-api';

interface AchievementsWidgetProps {
  achievements?: Achievement[];
}

const categoryIcons = {
  completion: BookOpen,
  engagement: Users,
  performance: Target,
  consistency: Clock,
  social: Users,
  mastery: Brain,
};

const rarityColors = {
  common: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  uncommon: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
  rare: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
  epic: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
  legendary:
    'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
};

const typeIcons = {
  badge: Award,
  certificate: Medal,
  trophy: Trophy,
  milestone: Star,
  skill_unlock: Zap,
};

export const AchievementsWidget: React.FC<AchievementsWidgetProps> = ({
  achievements = [],
}) => {
  const { toast } = useToast();
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [claimAchievement, { isLoading: isClaiming }] =
    useClaimAchievementMutation();

  const filteredAchievements = achievements.filter(achievement => {
    const statusFilter =
      filter === 'all' ||
      (filter === 'unlocked' && achievement.isUnlocked) ||
      (filter === 'locked' && !achievement.isUnlocked);

    const catFilter =
      categoryFilter === 'all' || achievement.category === categoryFilter;

    return statusFilter && catFilter;
  });

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalPoints = achievements
    .filter(a => a.isUnlocked)
    .reduce((sum, a) => sum + a.points, 0);
  const readyToClaim = achievements.filter(
    a => !a.isUnlocked && a.progress.percentage >= 100
  ).length;

  const categories = Array.from(new Set(achievements.map(a => a.category)));

  const handleClaimAchievement = async (achievementId: string) => {
    try {
      await claimAchievement(achievementId).unwrap();
      toast({
        title: 'Achievement Unlocked! 🎉',
        description: 'Congratulations on your achievement!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to claim achievement. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const AchievementCard = ({
    achievement,
    index,
  }: {
    achievement: Achievement;
    index: number;
  }) => {
    const Icon = typeIcons[achievement.type] || Award;
    const CategoryIcon = categoryIcons[achievement.category] || Target;
    const isReadyToClaim =
      !achievement.isUnlocked && achievement.progress.percentage >= 100;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className="group"
      >
        <Card
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            achievement.isUnlocked
              ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 dark:border-yellow-800 dark:from-yellow-900/20 dark:to-orange-900/20'
              : isReadyToClaim
                ? 'animate-pulse border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20'
                : 'hover:bg-muted/50'
          }`}
          onClick={() => setSelectedAchievement(achievement)}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              {/* Achievement Icon */}
              <div
                className={`relative rounded-full p-3 ${rarityColors[achievement.rarity]}`}
              >
                <Icon className="h-6 w-6" />
                {achievement.isUnlocked && (
                  <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
                    <Trophy className="h-2 w-2 text-white" />
                  </div>
                )}
                {isReadyToClaim && (
                  <div className="absolute -right-1 -top-1 h-4 w-4 animate-bounce rounded-full bg-orange-500">
                    <Gift className="h-2 w-2 text-white" />
                  </div>
                )}
                {!achievement.isUnlocked &&
                  achievement.progress.percentage < 100 && (
                    <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-400">
                      <Lock className="h-2 w-2 text-white" />
                    </div>
                  )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center space-x-2">
                  <h3
                    className={`text-sm font-semibold ${!achievement.isUnlocked && achievement.progress.percentage < 100 ? 'text-muted-foreground' : ''}`}
                  >
                    {achievement.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`text-xs ${rarityColors[achievement.rarity]}`}
                  >
                    {achievement.rarity}
                  </Badge>
                </div>

                <p
                  className={`mb-2 text-xs ${!achievement.isUnlocked && achievement.progress.percentage < 100 ? 'text-muted-foreground' : ''}`}
                >
                  {achievement.description}
                </p>

                {/* Progress */}
                {!achievement.isUnlocked && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Progress</span>
                      <span>
                        {achievement.progress.current}/
                        {achievement.progress.required}
                      </span>
                    </div>
                    <Progress
                      value={achievement.progress.percentage}
                      className="h-1.5"
                    />
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <CategoryIcon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs capitalize text-muted-foreground">
                      {achievement.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs font-medium">
                      {achievement.points} pts
                    </span>
                  </div>
                </div>

                {isReadyToClaim && (
                  <Button
                    size="sm"
                    className="mt-2 w-full"
                    onClick={e => {
                      e.stopPropagation();
                      handleClaimAchievement(achievement.id);
                    }}
                    disabled={isClaiming}
                  >
                    <Gift className="mr-1 h-3 w-3" />
                    {isClaiming ? 'Claiming...' : 'Claim Reward'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Achievements</span>
          </CardTitle>
          <CardDescription>
            Track your learning milestones and unlock rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {unlockedCount}
              </p>
              <p className="text-sm text-muted-foreground">Unlocked</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {achievements.length - unlockedCount}
              </p>
              <p className="text-sm text-muted-foreground">Locked</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {readyToClaim}
              </p>
              <p className="text-sm text-muted-foreground">Ready to Claim</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {totalPoints}
              </p>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({achievements.length})
              </Button>
              <Button
                variant={filter === 'unlocked' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unlocked')}
              >
                Unlocked ({unlockedCount})
              </Button>
              <Button
                variant={filter === 'locked' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('locked')}
              >
                Locked ({achievements.length - unlockedCount})
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={categoryFilter === 'all' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setCategoryFilter('all')}
              >
                All Categories
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={categoryFilter === category ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setCategoryFilter(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredAchievements.map((achievement, index) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredAchievements.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              No Achievements Found
            </h3>
            <p className="text-center text-muted-foreground">
              {filter === 'all'
                ? 'No achievements available.'
                : `No ${filter} achievements found with the current filters.`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Achievement Detail Modal */}
      <Dialog
        open={!!selectedAchievement}
        onOpenChange={() => setSelectedAchievement(null)}
      >
        <DialogContent className="sm:max-w-md">
          {selectedAchievement && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  {React.createElement(
                    typeIcons[selectedAchievement.type] || Award,
                    {
                      className: `h-5 w-5 ${selectedAchievement.isUnlocked ? 'text-yellow-500' : 'text-muted-foreground'}`,
                    }
                  )}
                  <span>{selectedAchievement.title}</span>
                  <Badge
                    variant="outline"
                    className={rarityColors[selectedAchievement.rarity]}
                  >
                    {selectedAchievement.rarity}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  {selectedAchievement.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Achievement Icon */}
                <div className="flex justify-center">
                  <div
                    className={`rounded-full p-6 ${rarityColors[selectedAchievement.rarity]} relative`}
                  >
                    {React.createElement(
                      typeIcons[selectedAchievement.type] || Award,
                      {
                        className: 'h-12 w-12',
                      }
                    )}
                    {selectedAchievement.isUnlocked && (
                      <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                        <Trophy className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Category</span>
                    <Badge variant="secondary" className="capitalize">
                      {selectedAchievement.category}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Points Reward</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">
                        {selectedAchievement.points}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Rarity</span>
                    <Badge className={rarityColors[selectedAchievement.rarity]}>
                      {selectedAchievement.rarity}
                    </Badge>
                  </div>

                  {selectedAchievement.unlockedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Unlocked</span>
                      <span className="text-sm">
                        {new Date(
                          selectedAchievement.unlockedAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Requirements */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Requirements</h4>
                  <div className="space-y-2">
                    {selectedAchievement.requirements.map((req, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {req.type.replace('_', ' ')}{' '}
                          {req.operator === 'gte'
                            ? '≥'
                            : req.operator === 'lte'
                              ? '≤'
                              : '='}{' '}
                          {req.value}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {req.context || 'Overall'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress */}
                {!selectedAchievement.isUnlocked && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold">Progress</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Current Progress</span>
                          <span className="font-medium">
                            {selectedAchievement.progress.current} /{' '}
                            {selectedAchievement.progress.required}
                          </span>
                        </div>
                        <Progress
                          value={selectedAchievement.progress.percentage}
                          className="h-2"
                        />
                        <p className="text-center text-xs text-muted-foreground">
                          {Math.round(selectedAchievement.progress.percentage)}%
                          complete
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Claim Button */}
                {!selectedAchievement.isUnlocked &&
                  selectedAchievement.progress.percentage >= 100 && (
                    <Button
                      className="w-full"
                      onClick={() =>
                        handleClaimAchievement(selectedAchievement.id)
                      }
                      disabled={isClaiming}
                    >
                      <Gift className="mr-2 h-4 w-4" />
                      {isClaiming ? 'Claiming...' : 'Claim Achievement'}
                    </Button>
                  )}

                {selectedAchievement.isUnlocked && (
                  <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-900/20">
                    <Trophy className="mx-auto mb-2 h-8 w-8 text-green-500" />
                    <p className="font-semibold text-green-700 dark:text-green-400">
                      Achievement Unlocked!
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-500">
                      Earned on{' '}
                      {new Date(
                        selectedAchievement.unlockedAt!
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
