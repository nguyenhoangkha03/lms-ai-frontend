'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  FileText,
  Video,
  Calendar,
  Brain,
  Clock,
  ArrowRight,
  Zap,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
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
import {
  useGetQuickActionsQuery,
  useCompleteQuickActionMutation,
} from '@/lib/redux/api/student-dashboard-api';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  toggleQuickActionsExpanded,
  completeAction,
} from '@/lib/redux/slices/dashboard-slice';
import { useRouter } from 'next/navigation';

const actionIcons = {
  continue_learning: Play,
  take_quiz: FileText,
  join_session: Video,
  view_assignment: FileText,
  ai_tutor: Brain,
};

const priorityColors = {
  high: 'border-red-200 bg-red-50 text-red-800',
  medium: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  low: 'border-green-200 bg-green-50 text-green-800',
};

const priorityLabels = {
  high: 'Urgent',
  medium: 'Important',
  low: 'Optional',
};

export const QuickActionsPanel: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: actions = [], isLoading } = useGetQuickActionsQuery();
  const [completeActionMutation] = useCompleteQuickActionMutation();
  const { quickActionsExpanded, completedActions } = useAppSelector(
    state => state.dashboard
  );

  const availableActions = actions.filter(
    action => !completedActions.includes(action.id)
  );
  const highPriorityActions = availableActions.filter(
    action => action.priority === 'high'
  );
  const otherActions = availableActions.filter(
    action => action.priority !== 'high'
  );
  const displayActions = quickActionsExpanded
    ? availableActions
    : availableActions.slice(0, 3);

  const handleActionClick = async (action: any) => {
    // Navigate to the action
    router.push(action.href);

    // Mark as completed if it's a one-time action
    if (['take_quiz', 'view_assignment'].includes(action.type)) {
      try {
        await completeActionMutation({ actionId: action.id }).unwrap();
        dispatch(completeAction(action.id));
      } catch (error) {
        console.error('Failed to complete action:', error);
      }
    }
  };

  const formatEstimatedTime = (minutes?: number) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-16 rounded-lg bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Quick Actions</span>
              {highPriorityActions.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {highPriorityActions.length} urgent
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Jump into your next learning activity
            </CardDescription>
          </div>

          {availableActions.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(toggleQuickActionsExpanded())}
            >
              {quickActionsExpanded ? (
                <>
                  Show Less
                  <ChevronUp className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Show All ({availableActions.length})
                  <ChevronDown className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {availableActions.length === 0 ? (
          <div className="py-8 text-center">
            <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 text-muted-foreground">All caught up!</p>
            <p className="text-sm text-muted-foreground">
              No urgent actions at the moment. Keep up the great work!
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/student/courses')}
            >
              Explore More Content
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayActions.map((action, index) => {
              const IconComponent = actionIcons[action.type] || Play;
              const isHighPriority = action.priority === 'high';

              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`group relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md ${
                    isHighPriority
                      ? 'border-red-200 bg-red-50/50 hover:bg-red-50'
                      : 'border-border bg-card hover:bg-muted/50'
                  }`}
                  onClick={() => handleActionClick(action)}
                >
                  {/* Priority indicator */}
                  {isHighPriority && (
                    <div className="absolute -right-2 -top-2">
                      <div className="flex items-center rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Urgent
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-4">
                    {/* Action icon */}
                    <div
                      className={`rounded-lg p-3 ${
                        isHighPriority
                          ? 'bg-red-100 text-red-600'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>

                    {/* Action content */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h4
                            className={`font-medium transition-colors group-hover:text-primary ${
                              isHighPriority ? 'text-red-900' : ''
                            }`}
                          >
                            {action.title}
                          </h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>

                        {action.isNew && (
                          <Badge className="bg-green-100 text-xs text-green-800">
                            New
                          </Badge>
                        )}
                      </div>

                      {/* Action metadata */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                          {action.estimatedTime && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {formatEstimatedTime(action.estimatedTime)}
                              </span>
                            </div>
                          )}

                          {action.metadata?.dueDate && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Due{' '}
                                {new Date(
                                  action.metadata.dueDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          {!isHighPriority && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${priorityColors[action.priority]}`}
                            >
                              {priorityLabels[action.priority]}
                            </Badge>
                          )}
                        </div>

                        {/* Action button */}
                        <div className="opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Summary for collapsed view */}
            {!quickActionsExpanded && availableActions.length > 3 && (
              <div className="pt-2 text-center">
                <p className="text-sm text-muted-foreground">
                  {availableActions.length - 3} more actions available
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick stats footer */}
        {availableActions.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-red-600">
                  {highPriorityActions.length}
                </div>
                <div className="text-xs text-muted-foreground">Urgent</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">
                  {availableActions.filter(a => a.priority === 'medium').length}
                </div>
                <div className="text-xs text-muted-foreground">Important</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {availableActions.filter(a => a.priority === 'low').length}
                </div>
                <div className="text-xs text-muted-foreground">Optional</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
