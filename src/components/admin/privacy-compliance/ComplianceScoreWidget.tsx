'use client';

import React from 'react';
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
import { Shield, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface ComplianceArea {
  area: string;
  score: number;
  status: 'compliant' | 'partially_compliant' | 'non_compliant';
  trend: 'up' | 'down' | 'stable';
  issues: number;
}

interface ComplianceScoreWidgetProps {
  overallScore: number;
  areas: ComplianceArea[];
  lastAuditDate: string;
  nextAuditDue: string;
}

export function ComplianceScoreWidget({
  overallScore,
  areas,
  lastAuditDate,
  nextAuditDue,
}: ComplianceScoreWidgetProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'partially_compliant':
        return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>GDPR Compliance Score</span>
        </CardTitle>
        <CardDescription>
          Overall compliance status and area breakdown
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className="mb-2 text-4xl font-bold text-green-600">
            {overallScore}%
          </div>
          <Progress value={overallScore} className="mb-2 h-3" />
          <div className="text-sm text-muted-foreground">
            Last audit: {new Date(lastAuditDate).toLocaleDateString()}
          </div>
        </div>

        {/* Compliance Areas */}
        <div className="space-y-3">
          <h4 className="font-medium">Compliance Areas</h4>
          {areas.slice(0, 4).map((area, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm">{area.area}</span>
                {getTrendIcon(area.trend)}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{area.score}%</span>
                <Badge
                  className={getStatusColor(area.status)}
                  variant="secondary"
                >
                  {area.status === 'compliant'
                    ? '✓'
                    : area.status === 'partially_compliant'
                      ? '!'
                      : '✗'}
                </Badge>
                {area.issues > 0 && (
                  <Badge variant="outline" className="text-orange-600">
                    {area.issues}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Next Audit */}
        <div className="rounded-lg bg-muted p-3">
          <div className="mb-1 flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Next Audit Due</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(nextAuditDue).toLocaleDateString()}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="outline" size="sm">
            View Details
          </Button>
          <Button size="sm">Run Audit</Button>
        </div>
      </CardContent>
    </Card>
  );
}
