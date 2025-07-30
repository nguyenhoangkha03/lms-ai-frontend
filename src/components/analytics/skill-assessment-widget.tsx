'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Target,
  Award,
  BookOpen,
  Zap,
  Star,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

interface SkillData {
  skillId: string;
  skillName: string;
  currentLevel: number;
  masteryPercentage: number;
  recentProgress: number;
  relatedCourses: string[];
  nextMilestone: string;
  category?: string;
  description?: string;
  prerequisites?: string[];
  assessmentScore?: number;
  timeToMaster?: number; // estimated hours
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  trending?: 'up' | 'down' | 'stable';
}

interface SkillAssessmentWidgetProps {
  skills?: SkillData[];
}

const skillCategories = {
  programming: { name: 'Programming', icon: BookOpen, color: 'blue' },
  design: { name: 'Design', icon: Award, color: 'purple' },
  analytics: { name: 'Analytics', icon: Target, color: 'green' },
  communication: { name: 'Communication', icon: Brain, color: 'orange' },
  management: { name: 'Management', icon: Star, color: 'red' },
};

export const SkillAssessmentWidget: React.FC<SkillAssessmentWidgetProps> = ({
  skills = [],
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const getLevelLabel = (level: number) => {
    if (level <= 1) return 'Beginner';
    if (level <= 2) return 'Intermediate';
    if (level <= 3) return 'Advanced';
    return 'Expert';
  };

  const getLevelColor = (level: number) => {
    if (level <= 1)
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    if (level <= 2)
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    if (level <= 3)
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'advanced':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'expert':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getTrendingIcon = (trending?: string) => {
    switch (trending) {
      case 'up':
        return <ArrowUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <ArrowDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const formatTimeToMaster = (hours?: number) => {
    if (!hours) return 'Unknown';
    if (hours < 24) return `${hours}h`;
    const days = Math.round(hours / 8); // Assuming 8 hours per day
    if (days < 30) return `${days} days`;
    const months = Math.round(days / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  };

  if (skills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Skill Assessment</span>
          </CardTitle>
          <CardDescription>
            Track your skill development and mastery levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Brain className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No Skills Assessed</h3>
            <p className="mb-4 text-muted-foreground">
              Take skill assessments to track your progress
            </p>
            <Button onClick={() => router.push('/student/assessments')}>
              <Target className="mr-2 h-4 w-4" />
              Take Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall stats
  const averageMastery = Math.round(
    skills.reduce((sum, skill) => sum + skill.masteryPercentage, 0) /
      skills.length
  );
  const averageLevel =
    Math.round(
      (skills.reduce((sum, skill) => sum + skill.currentLevel, 0) /
        skills.length) *
        10
    ) / 10;
  const totalProgress = skills.reduce(
    (sum, skill) => sum + skill.recentProgress,
    0
  );
  const masteredSkills = skills.filter(
    skill => skill.masteryPercentage >= 90
  ).length;

  // Group skills by category
  const groupedSkills = skills.reduce(
    (acc, skill) => {
      const category = skill.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    },
    {} as Record<string, SkillData[]>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span>Skill Assessment</span>
        </CardTitle>
        <CardDescription>
          Your mastery levels across {skills.length} skill
          {skills.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <div className="text-lg font-bold text-blue-600">
              {averageMastery}%
            </div>
            <div className="text-xs text-muted-foreground">Avg Mastery</div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <div className="text-lg font-bold text-green-600">
              {averageLevel}
            </div>
            <div className="text-xs text-muted-foreground">Avg Level</div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <div className="text-lg font-bold text-purple-600">
              +{totalProgress}%
            </div>
            <div className="text-xs text-muted-foreground">Recent Progress</div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <div className="text-lg font-bold text-orange-600">
              {masteredSkills}
            </div>
            <div className="text-xs text-muted-foreground">Mastered</div>
          </div>
        </div>

        <Separator />

        {/* Skills Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">By Category</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {skills.slice(0, 6).map((skill, index) => (
              <motion.div
                key={skill.skillId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer rounded-lg border p-4 transition-all duration-200 hover:bg-muted/50"
                onClick={() => router.push(`/student/skills/${skill.skillId}`)}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center space-x-2">
                      <h4 className="text-sm font-medium">{skill.skillName}</h4>
                      <Badge className={getLevelColor(skill.currentLevel)}>
                        {getLevelLabel(skill.currentLevel)}
                      </Badge>
                      {skill.difficulty && (
                        <Badge variant="outline" className="text-xs">
                          {skill.difficulty}
                        </Badge>
                      )}
                    </div>

                    <div className="mb-2 flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Target className="h-3 w-3" />
                        <span>{skill.assessmentScore || 0}% last score</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{skill.relatedCourses.length} courses</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getTrendingIcon(skill.trending)}
                        <span>+{skill.recentProgress}% recent</span>
                      </div>
                    </div>
                  </div>

                  <div className="opacity-0 transition-opacity group-hover:opacity-100">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Mastery Progress</span>
                    <span className="font-medium">
                      {Math.round(skill.masteryPercentage)}%
                    </span>
                  </div>
                  <Progress value={skill.masteryPercentage} className="h-2" />
                </div>

                {/* Next Milestone */}
                {skill.nextMilestone && (
                  <div className="flex items-start space-x-2">
                    <Zap className="mt-0.5 h-3 w-3 flex-shrink-0 text-yellow-500" />
                    <div className="flex-1">
                      <span className="text-xs font-medium text-yellow-600">
                        Next milestone:
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        {skill.nextMilestone}
                      </span>
                      {skill.timeToMaster && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (~{formatTimeToMaster(skill.timeToMaster)})
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {skills.length > 6 && (
              <div className="pt-2 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/student/skills')}
                >
                  View All Skills ({skills.length})
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => {
              const categoryInfo =
                skillCategories[category as keyof typeof skillCategories];
              const Icon = categoryInfo?.icon || Brain;

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <Icon
                      className={`h-4 w-4 text-${categoryInfo?.color || 'gray'}-500`}
                    />
                    <h4 className="font-semibold capitalize">
                      {categoryInfo?.name || category}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {categorySkills.length} skill
                      {categorySkills.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {categorySkills.map(skill => (
                      <div
                        key={skill.skillId}
                        className="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted/50"
                        onClick={() =>
                          router.push(`/student/skills/${skill.skillId}`)
                        }
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {skill.skillName}
                          </span>
                          <Badge
                            className={getLevelColor(skill.currentLevel)}
                            variant="outline"
                          >
                            L{skill.currentLevel}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Progress</span>
                            <span>{Math.round(skill.masteryPercentage)}%</span>
                          </div>
                          <Progress
                            value={skill.masteryPercentage}
                            className="h-1.5"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/student/assessments')}
          >
            <Target className="mr-2 h-4 w-4" />
            Take Assessment
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/student/skills')}
          >
            <Brain className="mr-2 h-4 w-4" />
            All Skills
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/student/recommendations')}
          >
            <Zap className="mr-2 h-4 w-4" />
            Get Recommendations
          </Button>
        </div>

        {/* Improvement Suggestions */}
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <h4 className="mb-2 font-semibold text-blue-800 dark:text-blue-400">
            Skill Development Tips
          </h4>
          <div className="space-y-1">
            <div className="flex items-start space-x-2">
              <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Focus on skills with high mastery potential for faster progress
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Practice consistently to maintain skill levels and build
                expertise
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Take regular assessments to track your improvement over time
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
