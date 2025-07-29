'use client';

import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  TrendingUp,
  CheckCircle,
  Clock,
  Target,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressTrackerProps {
  currentLesson: number;
  totalLessons: number;
  progress: number;
  timeSpent?: number;
  estimatedTimeRemaining?: number;
  completionRate?: number;
  streak?: number;
  achievements?: Array<{
    id: string;
    title: string;
    description: string;
    earned: boolean;
  }>;
  className?: string;
}

export function ProgressTracker({
  currentLesson,
  totalLessons,
  progress,
  timeSpent = 0,
  estimatedTimeRemaining = 0,
  completionRate = 0,
  streak = 0,
  achievements = [],
  className,
}: ProgressTrackerProps) {
  const [expanded, setExpanded] = useState(false);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-blue-600';
    if (progress >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getProgressMessage = (progress: number) => {
    if (progress >= 100) return 'Hoàn thành xuất sắc!';
    if (progress >= 80) return 'Sắp hoàn thành rồi!';
    if (progress >= 60) return 'Tiến độ tốt!';
    if (progress >= 40) return 'Đang tiến bộ';
    if (progress >= 20) return 'Bắt đầu tốt';
    return 'Bắt đầu học thôi!';
  };

  const earnedAchievements = achievements.filter(a => a.earned);
  const nextAchievement = achievements.find(a => !a.earned);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Compact Progress Display */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Bài {currentLesson} / {totalLessons}
                </span>
                <span
                  className={cn(
                    'text-sm font-semibold',
                    getProgressColor(progress)
                  )}
                >
                  {Math.round(progress)}%
                </span>
              </div>

              <Progress value={progress} className="h-2" />

              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{getProgressMessage(progress)}</span>
                {expanded && timeSpent > 0 && (
                  <span>Đã học {formatTime(timeSpent)}</span>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="ml-3"
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expanded Details */}
      {expanded && (
        <div className="space-y-3">
          {/* Learning Stats */}
          <Card>
            <CardContent className="p-4">
              <h4 className="mb-3 flex items-center gap-2 font-medium">
                <TrendingUp className="h-4 w-4" />
                Thống kê học tập
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-blue-50 p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(progress)}%
                  </div>
                  <div className="text-sm text-gray-600">Tiến độ</div>
                </div>

                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {currentLesson}
                  </div>
                  <div className="text-sm text-gray-600">Bài đã học</div>
                </div>

                {timeSpent > 0 && (
                  <div className="rounded-lg bg-purple-50 p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatTime(timeSpent)}
                    </div>
                    <div className="text-sm text-gray-600">Thời gian</div>
                  </div>
                )}

                {streak > 0 && (
                  <div className="rounded-lg bg-orange-50 p-3 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {streak}
                    </div>
                    <div className="text-sm text-gray-600">Ngày liên tiếp</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Time Estimation */}
          {estimatedTimeRemaining > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="mb-3 flex items-center gap-2 font-medium">
                  <Clock className="h-4 w-4" />
                  Ước tính thời gian
                </h4>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Còn lại</div>
                    <div className="font-semibold">
                      {formatTime(estimatedTimeRemaining)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      Dự kiến hoàn thành
                    </div>
                    <div className="font-semibold">
                      {new Date(
                        Date.now() + estimatedTimeRemaining * 60000
                      ).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Achievements */}
          {achievements.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="mb-3 flex items-center gap-2 font-medium">
                  <Award className="h-4 w-4" />
                  Thành tích ({earnedAchievements.length}/{achievements.length})
                </h4>

                <div className="space-y-2">
                  {earnedAchievements.slice(0, 3).map(achievement => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-2"
                    >
                      <Award className="h-5 w-5 text-yellow-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {achievement.title}
                        </div>
                        <div className="text-xs text-gray-600">
                          {achievement.description}
                        </div>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  ))}

                  {nextAchievement && (
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-2">
                      <Target className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-700">
                          {nextAchievement.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {nextAchievement.description}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Tiếp theo
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completion Rate */}
          {completionRate > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="mb-3 font-medium">Tỷ lệ hoàn thành</h4>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tỷ lệ hoàn thành bài học</span>
                    <span className="font-medium">
                      {Math.round(completionRate)}%
                    </span>
                  </div>
                  <Progress value={completionRate} className="h-2" />

                  <div className="text-xs text-gray-600">
                    {completionRate >= 90 &&
                      'Xuất sắc! Bạn rất tập trung trong học tập.'}
                    {completionRate >= 70 &&
                      completionRate < 90 &&
                      'Tốt! Hãy duy trì nhịp độ này.'}
                    {completionRate >= 50 &&
                      completionRate < 70 &&
                      'Cần cải thiện tính kiên trì.'}
                    {completionRate < 50 &&
                      'Hãy cố gắng hoàn thành đầy đủ các bài học.'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Motivational Message */}
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-4 text-center">
              <div className="mb-2">
                {progress >= 100 && '🎉 Chúc mừng! Bạn đã hoàn thành khóa học!'}
                {progress >= 80 &&
                  progress < 100 &&
                  '🔥 Tuyệt vời! Bạn sắp hoàn thành rồi!'}
                {progress >= 60 &&
                  progress < 80 &&
                  '💪 Tiếp tục cố gắng! Bạn đang làm rất tốt!'}
                {progress >= 40 &&
                  progress < 60 &&
                  '📚 Hãy duy trì nhịp độ học tập đều đặn!'}
                {progress >= 20 &&
                  progress < 40 &&
                  '🌱 Mỗi bước đi đều là tiến bộ!'}
                {progress < 20 && '🚀 Hành trình học tập bắt đầu từ đây!'}
              </div>

              <div className="text-sm text-gray-600">
                {totalLessons - currentLesson > 0 &&
                  `Còn ${totalLessons - currentLesson} bài học nữa để hoàn thành khóa học`}
                {totalLessons - currentLesson === 0 &&
                  'Bạn đã hoàn thành tất cả bài học!'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
