'use client';

import { TrendingUp, Target, Award, AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export function GradebookStatsWidget() {
  // Mock data - in real implementation, this would come from API
  const stats = {
    totalStudents: 245,
    classAverage: 82.5,
    passingRate: 89.2,
    improvementRate: 15.3,
    atRiskStudents: 12,
    excellingStudents: 45,
    trends: {
      averageChange: 2.3,
      passingRateChange: 1.2,
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Performance Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Class Average */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Class Average</span>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold">{stats.classAverage}%</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs text-green-500">
                +{stats.trends.averageChange}%
              </span>
            </div>
          </div>
          <Progress value={stats.classAverage} className="h-2" />
        </div>

        {/* Passing Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Passing Rate</span>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold">{stats.passingRate}%</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs text-green-500">
                +{stats.trends.passingRateChange}%
              </span>
            </div>
          </div>
          <Progress value={stats.passingRate} className="h-2" />
        </div>

        {/* Student Distribution */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-2">
              <Award className="h-4 w-4 text-green-500" />
              <span className="text-lg font-bold">
                {stats.excellingStudents}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Excelling</span>
          </div>
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-lg font-bold">{stats.atRiskStudents}</span>
            </div>
            <span className="text-xs text-muted-foreground">At Risk</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-2 border-t pt-2">
          <div className="flex justify-between text-sm">
            <span>Total Students</span>
            <span className="font-medium">{stats.totalStudents}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Improvement Rate</span>
            <Badge variant="outline" className="text-xs">
              +{stats.improvementRate}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
