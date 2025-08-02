'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Calendar,
  Clock,
  CheckCircle,
  Brain,
  Zap,
  BookOpen,
  Users,
  MessageSquare,
  Settings,
  MoreHorizontal,
  Plus,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  useGetInterventionRecommendationsQuery,
  useScheduleInterventionMutation,
  useCompleteInterventionMutation,
  useGenerateInterventionsMutation,
} from '@/lib/redux/api/predictive-analytics-api';

interface InterventionRecommendationsWidgetProps {
  studentId?: string;
  courseId?: string;
  showPending?: boolean;
  allowScheduling?: boolean;
  compact?: boolean;
  className?: string;
}

interface ScheduleInterventionData {
  scheduledDate: string;
  assignedToId?: string;
  notes?: string;
}

export function InterventionRecommendationsWidget({
  studentId,
  courseId,
  showPending = false,
  allowScheduling = false,
  compact = false,
  className = '',
}: InterventionRecommendationsWidgetProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedIntervention, setSelectedIntervention] = useState<any>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState<ScheduleInterventionData>({
    scheduledDate: '',
    notes: '',
  });

  const {
    data: interventions,
    isLoading: isLoadingInterventions,
    error: interventionsError,
    refetch: refetchInterventions,
  } = useGetInterventionRecommendationsQuery({
    studentId,
    courseId,
    status: statusFilter === 'all' ? undefined : statusFilter,
    priority: priorityFilter === 'all' ? undefined : parseInt(priorityFilter),
  });

  //   const { data: pendingInterventions, isLoading: isLoadingPending } =
  //     useGetPendingInterventionsQuery(
  //       {
  //         assignedToId: studentId,
  //       },
  //       { skip: !showPending }
  //     );

  const [scheduleIntervention, { isLoading: isScheduling }] =
    useScheduleInterventionMutation();
  const [completeIntervention, { isLoading: isCompleting }] =
    useCompleteInterventionMutation();
  const [generateInterventions, { isLoading: isGenerating }] =
    useGenerateInterventionsMutation();

  const getInterventionIcon = (type: string) => {
    switch (type) {
      case 'academic_support':
        return <BookOpen className="h-4 w-4" />;
      case 'motivational':
        return <Zap className="h-4 w-4" />;
      case 'technical':
        return <Settings className="h-4 w-4" />;
      case 'time_management':
        return <Clock className="h-4 w-4" />;
      case 'content_clarification':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'scheduled':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'text-red-600';
    if (priority >= 5) return 'text-orange-600';
    return 'text-blue-600';
  };

  const handleScheduleIntervention = async (interventionId: string) => {
    try {
      await scheduleIntervention({
        interventionId,
        ...scheduleData,
      }).unwrap();

      setScheduleDialogOpen(false);
      setScheduleData({ scheduledDate: '', notes: '' });
      await refetchInterventions();
    } catch (error) {
      console.error('Failed to schedule intervention:', error);
    }
  };

  const handleCompleteIntervention = async (
    interventionId: string,
    outcome: string
  ) => {
    try {
      await completeIntervention({
        interventionId,
        outcome,
        effectivenessScore: 0.8, // This would come from a form
        feedback: 'Intervention completed successfully',
      }).unwrap();

      await refetchInterventions();
    } catch (error) {
      console.error('Failed to complete intervention:', error);
    }
  };

  const handleGenerateInterventions = async () => {
    // This would need a prediction ID in real implementation
    console.log('Generate interventions for student:', studentId);
  };

  if (isLoadingInterventions) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="mb-2 h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const allInterventions = interventions || [];
  const displayInterventions = compact
    ? allInterventions.slice(0, 3)
    : allInterventions;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Intervention Recommendations
            </CardTitle>
            <CardDescription>
              AI-suggested interventions to improve learning outcomes
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {!compact && (
              <>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="8">High (8+)</SelectItem>
                    <SelectItem value="5">Medium (5-7)</SelectItem>
                    <SelectItem value="1">Low (1-4)</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}

            <Button
              onClick={handleGenerateInterventions}
              disabled={isGenerating}
              size="sm"
            >
              {isGenerating ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {allInterventions.length === 0 ? (
          <div className="py-8 text-center">
            <Target className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">
              No intervention recommendations available
            </p>
            <Button
              onClick={handleGenerateInterventions}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-pulse" />
                  Generating Recommendations...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Generate Recommendations
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            {!compact && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {allInterventions.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {
                      allInterventions.filter(i => i.status === 'pending')
                        .length
                    }
                  </div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-lg font-bold text-yellow-600">
                    {allInterventions.filter(i => i.priority >= 7).length}
                  </div>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-lg font-bold text-green-600">
                    {Math.round(
                      (allInterventions.filter(i => i.effectiveness > 0.7)
                        .length /
                        allInterventions.length) *
                        100
                    ) || 0}
                    %
                  </div>
                  <p className="text-sm text-muted-foreground">Effective</p>
                </div>
              </div>
            )}

            {/* Interventions List */}
            <div className="space-y-3">
              <AnimatePresence>
                {displayInterventions.map((intervention, index) => (
                  <motion.div
                    key={intervention.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-muted p-2">
                          {getInterventionIcon(intervention.interventionType)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {intervention.title}
                          </h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {intervention.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className={getPriorityColor(
                                  intervention.priority
                                )}
                              >
                                P{intervention.priority}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Priority: {intervention.priority}/10</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <Badge
                          variant="outline"
                          className={getStatusColor(intervention.status)}
                        >
                          {intervention.status.replace('_', ' ')}
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {intervention.status === 'pending' &&
                              allowScheduling && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedIntervention(intervention);
                                    setScheduleDialogOpen(true);
                                  }}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Schedule
                                </DropdownMenuItem>
                              )}
                            {intervention.status === 'in_progress' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleCompleteIntervention(
                                    intervention.id,
                                    'successful'
                                  )
                                }
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark Complete
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <ArrowRight className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Intervention Details */}
                    <div className="space-y-3">
                      {/* Duration & Effectiveness */}
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{intervention.estimatedDuration} min</span>
                        </div>
                        {intervention.effectiveness > 0 && (
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span>
                              {Math.round(intervention.effectiveness * 100)}%
                              effective
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span className="capitalize">
                            {intervention.interventionType.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Success Criteria */}
                      {!compact && intervention.successCriteria?.length > 0 && (
                        <div>
                          <h5 className="mb-2 text-sm font-medium">
                            Success Criteria:
                          </h5>
                          <ul className="space-y-1">
                            {intervention.successCriteria
                              .slice(0, 2)
                              .map((criteria: string, index: number) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <CheckCircle className="mt-0.5 h-3 w-3 text-green-500" />
                                  {criteria}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}

                      {/* Progress Bar for In-Progress Interventions */}
                      {intervention.status === 'in_progress' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>60%</span>{' '}
                            {/* This would come from actual progress data */}
                          </div>
                          <Progress value={60} className="h-2" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Show More Button */}
            {compact && allInterventions.length > 3 && (
              <Button variant="outline" className="w-full">
                View All {allInterventions.length} Recommendations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </>
        )}

        {/* Schedule Intervention Dialog */}
        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Intervention</DialogTitle>
              <DialogDescription>
                Schedule "{selectedIntervention?.title}" for implementation
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={scheduleData.scheduledDate}
                  onChange={e =>
                    setScheduleData(prev => ({
                      ...prev,
                      scheduledDate: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes for the intervention..."
                  value={scheduleData.notes}
                  onChange={e =>
                    setScheduleData(prev => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setScheduleDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  selectedIntervention &&
                  handleScheduleIntervention(selectedIntervention.id)
                }
                disabled={isScheduling || !scheduleData.scheduledDate}
              >
                {isScheduling ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
