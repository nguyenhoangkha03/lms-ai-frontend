'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  Flag,
  Play,
  Pause,
  MoreHorizontal,
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  LearningGoal,
  useCreateLearningGoalMutation,
  useUpdateLearningGoalMutation,
  useDeleteLearningGoalMutation,
} from '@/lib/redux/api/student-analytics-api';

interface LearningGoalsWidgetProps {
  goals?: LearningGoal[];
}

interface GoalFormData {
  title: string;
  description: string;
  category: string;
  targetValue: number;
  unit: string;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
}

const initialFormData: GoalFormData = {
  title: '',
  description: '',
  category: 'course_completion',
  targetValue: 1,
  unit: 'courses',
  targetDate: '',
  priority: 'medium',
};

const categoryOptions = [
  { value: 'course_completion', label: 'Course Completion', unit: 'courses' },
  { value: 'study_hours', label: 'Study Hours', unit: 'hours' },
  { value: 'skill_mastery', label: 'Skill Mastery', unit: 'skills' },
  { value: 'assessment_score', label: 'Assessment Score', unit: '%' },
  { value: 'streak_maintenance', label: 'Study Streak', unit: 'days' },
];

export const LearningGoalsWidget: React.FC<LearningGoalsWidgetProps> = ({
  goals = [],
}) => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<GoalFormData>(initialFormData);
  const [editingGoal, setEditingGoal] = useState<LearningGoal | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const [createGoal, { isLoading: isCreating }] =
    useCreateLearningGoalMutation();
  const [updateGoal, { isLoading: isUpdating }] =
    useUpdateLearningGoalMutation();
  const [deleteGoal, { isLoading: isDeleting }] =
    useDeleteLearningGoalMutation();

  const filteredGoals = goals.filter(goal => {
    switch (filter) {
      case 'active':
        return goal.status === 'active';
      case 'completed':
        return goal.status === 'completed';
      default:
        return true;
    }
  });

  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const activeGoals = goals.filter(g => g.status === 'active').length;

  const handleCreateGoal = async () => {
    try {
      await createGoal(formData as Partial<LearningGoal>).unwrap();
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
      toast({
        title: 'Goal Created',
        description: 'Your learning goal has been created successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create goal. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditGoal = (goal: LearningGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      targetValue: goal.targetValue,
      unit: goal.unit,
      targetDate: goal.targetDate.split('T')[0],
      priority: goal.priority,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateGoal = async () => {
    if (!editingGoal) return;

    try {
      await updateGoal({
        id: editingGoal.id,
        updates: formData as Partial<LearningGoal>,
      }).unwrap();
      setIsEditDialogOpen(false);
      setEditingGoal(null);
      setFormData(initialFormData);
      toast({
        title: 'Goal Updated',
        description: 'Your learning goal has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update goal. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteGoal(goalId).unwrap();
      toast({
        title: 'Goal Deleted',
        description: 'Your learning goal has been deleted.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete goal. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleStatusToggle = async (goal: LearningGoal) => {
    const newStatus = goal.status === 'active' ? 'paused' : 'active';
    try {
      await updateGoal({
        id: goal.id,
        updates: { status: newStatus },
      }).unwrap();
      toast({
        title: 'Goal Status Updated',
        description: `Goal has been ${newStatus === 'active' ? 'activated' : 'paused'}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update goal status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'course_completion':
        return CheckCircle;
      case 'study_hours':
        return Clock;
      case 'skill_mastery':
        return TrendingUp;
      case 'assessment_score':
        return Target;
      case 'streak_maintenance':
        return Flag;
      default:
        return Target;
    }
  };

  const formatTimeRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day left';
    if (diffDays < 7) return `${diffDays} days left`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks left`;
    return `${Math.ceil(diffDays / 30)} months left`;
  };

  const GoalForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Goal Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter your learning goal"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={e =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Describe your goal in detail"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={value => {
              const category = categoryOptions.find(c => c.value === value);
              setFormData({
                ...formData,
                category: value,
                unit: category?.unit || 'items',
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: 'low' | 'medium' | 'high') =>
              setFormData({ ...formData, priority: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetValue">Target Value</Label>
          <Input
            id="targetValue"
            type="number"
            value={formData.targetValue}
            onChange={e =>
              setFormData({ ...formData, targetValue: Number(e.target.value) })
            }
            min="1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetDate">Target Date</Label>
          <Input
            id="targetDate"
            type="date"
            value={formData.targetDate}
            onChange={e =>
              setFormData({ ...formData, targetDate: e.target.value })
            }
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          variant="outline"
          onClick={() => {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setFormData(initialFormData);
            setEditingGoal(null);
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={isEdit ? handleUpdateGoal : handleCreateGoal}
          disabled={isCreating || isUpdating}
        >
          {isCreating || isUpdating
            ? 'Saving...'
            : isEdit
              ? 'Update Goal'
              : 'Create Goal'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Learning Goals</span>
              </CardTitle>
              <CardDescription>
                Set and track your learning objectives
              </CardDescription>
            </div>

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Learning Goal</DialogTitle>
                  <DialogDescription>
                    Set a new learning goal to track your progress.
                  </DialogDescription>
                </DialogHeader>
                <GoalForm />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {completedGoals}
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{activeGoals}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{goals.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-4 flex space-x-1">
            {(['all', 'active', 'completed'] as const).map(filterType => (
              <Button
                key={filterType}
                variant={filter === filterType ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(filterType)}
                className="capitalize"
              >
                {filterType}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredGoals.map((goal, index) => {
            const Icon = getCategoryIcon(goal.category);
            const progressPercentage =
              (goal.currentProgress / goal.targetValue) * 100;
            const isCompleted = goal.status === 'completed';
            const isPaused = goal.status === 'paused';

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`${isCompleted ? 'bg-green-50 dark:bg-green-900/10' : ''} ${isPaused ? 'opacity-60' : ''}`}
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`rounded-full p-2 ${isCompleted ? 'bg-green-100 dark:bg-green-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}
                        >
                          <Icon
                            className={`h-4 w-4 ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">
                            {goal.title}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {goal.description}
                          </p>
                          <div className="mt-2 flex items-center space-x-4">
                            <Badge variant={getPriorityColor(goal.priority)}>
                              {goal.priority}
                            </Badge>
                            <Badge variant="outline">
                              {
                                categoryOptions.find(
                                  c => c.value === goal.category
                                )?.label
                              }
                            </Badge>
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {formatTimeRemaining(goal.targetDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleEditGoal(goal)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusToggle(goal)}
                          >
                            {goal.status === 'active' ? (
                              <>
                                <Pause className="mr-2 h-4 w-4" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Resume
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">
                          {goal.currentProgress} / {goal.targetValue}{' '}
                          {goal.unit}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(progressPercentage, 100)}
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        {Math.round(progressPercentage)}% complete
                      </p>
                    </div>

                    {/* Milestones */}
                    {goal.milestones && goal.milestones.length > 0 && (
                      <div className="mt-4">
                        <Separator className="mb-3" />
                        <h4 className="mb-2 text-sm font-medium">Milestones</h4>
                        <div className="space-y-2">
                          {goal.milestones.map(milestone => (
                            <div
                              key={milestone.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center space-x-2">
                                <CheckCircle
                                  className={`h-4 w-4 ${
                                    milestone.isCompleted
                                      ? 'text-green-500'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                                <span
                                  className={
                                    milestone.isCompleted ? 'line-through' : ''
                                  }
                                >
                                  {milestone.title}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {milestone.targetValue} {goal.unit}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredGoals.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No Goals Found</h3>
              <p className="mb-4 text-center text-muted-foreground">
                {filter === 'all'
                  ? "You haven't set any learning goals yet."
                  : `No ${filter} goals found.`}
              </p>
              {filter === 'all' && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Goal
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Learning Goal</DialogTitle>
            <DialogDescription>
              Update your learning goal details.
            </DialogDescription>
          </DialogHeader>
          <GoalForm isEdit />
        </DialogContent>
      </Dialog>
    </div>
  );
};
