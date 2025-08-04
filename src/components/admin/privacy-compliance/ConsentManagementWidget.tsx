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
import { UserCheck, XCircle, Clock, TrendingUp } from 'lucide-react';

interface ConsentStats {
  totalConsents: number;
  activeConsents: number;
  withdrawnConsents: number;
  pendingConsents: number;
  consentRate: number;
  recentActivities: Array<{
    type: 'given' | 'withdrawn' | 'expired';
    count: number;
    timeframe: string;
  }>;
}

interface ConsentManagementWidgetProps {
  stats: ConsentStats;
}

export function ConsentManagementWidget({
  stats,
}: ConsentManagementWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Consent Management</CardTitle>
        <CardDescription>
          Overview of user consent status and trends
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-3 text-center">
            <UserCheck className="mx-auto mb-2 h-8 w-8 text-green-500" />
            <div className="text-2xl font-bold text-green-600">
              {stats.activeConsents}
            </div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>

          <div className="rounded-lg border p-3 text-center">
            <XCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
            <div className="text-2xl font-bold text-red-600">
              {stats.withdrawnConsents}
            </div>
            <div className="text-xs text-muted-foreground">Withdrawn</div>
          </div>

          <div className="rounded-lg border p-3 text-center">
            <Clock className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingConsents}
            </div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>

          <div className="rounded-lg border p-3 text-center">
            <TrendingUp className="mx-auto mb-2 h-8 w-8 text-blue-500" />
            <div className="text-2xl font-bold text-blue-600">
              {stats.consentRate}%
            </div>
            <div className="text-xs text-muted-foreground">Rate</div>
          </div>
        </div>

        {/* Consent Rate Progress */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Overall Consent Rate</span>
            <span className="text-sm text-muted-foreground">
              {stats.consentRate}%
            </span>
          </div>
          <Progress value={stats.consentRate} className="h-2" />
        </div>

        {/* Recent Activities */}
        <div>
          <h4 className="mb-3 font-medium">Recent Activities</h4>
          <div className="space-y-2">
            {stats.recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      activity.type === 'given'
                        ? 'bg-green-500'
                        : activity.type === 'withdrawn'
                          ? 'bg-red-500'
                          : 'bg-yellow-500'
                    }`}
                  />
                  <span className="capitalize">{activity.type} consents</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{activity.count}</Badge>
                  <span className="text-muted-foreground">
                    {activity.timeframe}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="outline" size="sm">
            View All Consents
          </Button>
          <Button size="sm">Audit Consents</Button>
        </div>
      </CardContent>
    </Card>
  );
}
