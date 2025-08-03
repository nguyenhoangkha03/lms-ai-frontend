'use client';

import React, { useState } from 'react';
import {
  Target,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Edit3,
  Trash2,
  MoreHorizontal,
  Flag,
  User,
  FileText,
  Paperclip,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { collaborativeApi } from '@/lib/redux/api/collaborative-api';

interface GroupProject {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'review' | 'completed' | 'cancelled';
  leaderId: string;
  studyGroupId: string;
  courseId?: string;
  startDate: string;
  dueDate: string;
  completedAt?: string;
  progressPercentage: number;
  objectives: string[];
  deliverables: string[];
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    dueDate: string;
    isCompleted: boolean;
    completedAt?: string;
  }>;
  members: Array<{
    id: string;
    userId: string;
    role: 'leader' | 'member' | 'reviewer';
    status: 'active' | 'inactive' | 'pending';
    contributionScore: number;
    tasksCompleted: number;
    responsibilities: string[];
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'review' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assigneeId?: string;
    dueDate?: string;
    completedAt?: string;
    estimatedHours?: number;
    actualHours?: number;
    dependencies: string[];
  }>;
  attachments: Array<{
    id: string;
    filename: string;
    fileUrl: string;
    uploadedBy: string;
    uploadedAt: string;
  }>;
  statistics: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    totalHours: number;
    efficiency: number;
  };
}

interface StudyGroupProjectsProps {
  groupId: string;
  canManage: boolean;
}

export function StudyGroupProjects({
  groupId,
  canManage,
}: StudyGroupProjectsProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    | 'all'
    | 'active'
    | 'completed'
    | 'overdue'
    | 'pinned'
    | 'cancelled'
    | 'planning'
    | 'review'
  >('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<GroupProject | null>(
    null
  );

  // Create project form state
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    courseId: '',
    startDate: new Date(),
    dueDate: new Date(),
    objectives: [''],
    deliverables: [''],
    memberIds: [] as string[],
  });

  // RTK Query hooks
  const { data: projects, isLoading } =
    collaborativeApi.useGetGroupProjectsQuery({
      studyGroupId: groupId,
      search: searchQuery,
      status: filterStatus !== 'all' ? filterStatus : undefined,
    });
  const { data: groupMembers } =
    collaborativeApi.useGetStudyGroupMembersQuery(groupId);

  const [createProject] = collaborativeApi.useCreateGroupProjectMutation();
  const [updateProject] = collaborativeApi.useUpdateGroupProjectMutation();
  const [deleteProject] = collaborativeApi.useDeleteGroupProjectMutation();
  const [assignMember] = collaborativeApi.useAssignProjectMemberMutation();

  const handleCreateProject = async () => {
    if (!newProject.name.trim() || !newProject.description.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide both name and description.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createProject({
        ...newProject,
        studyGroupId: groupId,
        objectives: newProject.objectives.filter(Boolean),
        deliverables: newProject.deliverables.filter(Boolean),
        startDate: newProject.startDate.toISOString(),
        dueDate: newProject.dueDate.toISOString(),
      }).unwrap();

      toast({
        title: 'Project created',
        description: 'Your group project has been created successfully.',
      });

      setShowCreateDialog(false);
      setNewProject({
        name: '',
        description: '',
        courseId: '',
        startDate: new Date(),
        dueDate: new Date(),
        objectives: [''],
        deliverables: [''],
        memberIds: [],
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to create project.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject({ projectId }).unwrap();
      toast({
        title: 'Project deleted',
        description: 'The project has been deleted.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to delete project.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-gray-100 text-gray-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-orange-600';
      case 'urgent':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'completed';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-2xl font-bold">Group Projects</h2>
          <p className="text-gray-600">
            Collaborate on projects with task management and progress tracking
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filterStatus}
                onValueChange={value => setFilterStatus(value as any)}
              >
                <SelectTrigger className="w-32">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-40 rounded bg-gray-200"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects?.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium">No projects found</h3>
            <p className="mb-4 text-gray-600">
              {searchQuery
                ? 'No projects match your search criteria.'
                : 'Start your first group project to collaborate with members.'}
            </p>
            {canManage && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {projects?.map(project => (
            <Card
              key={project.id}
              className={`transition-shadow hover:shadow-md ${
                isOverdue(project.dueDate, project.status)
                  ? 'border-red-200'
                  : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                      {isOverdue(project.dueDate, project.status) && (
                        <Badge variant="destructive">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Overdue
                        </Badge>
                      )}
                    </div>

                    <Link
                      href={`/projects/${project.id}`}
                      className="hover:text-blue-600"
                    >
                      <h3 className="mb-1 text-lg font-bold">{project.name}</h3>
                    </Link>
                    <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                      {project.description}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/projects/${project.id}`}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      {canManage && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href={`/projects/${project.id}/edit`}>
                              <Edit3 className="mr-2 h-4 w-4" />
                              Edit Project
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{project.progressPercentage}%</span>
                  </div>
                  <Progress
                    value={project.progressPercentage}
                    className="h-2"
                  />
                </div>

                {/* Stats */}
                <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>
                      {project.statistics.completedTasks}/
                      {project.statistics.totalTasks} tasks
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>
                      Due {new Date(project.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span>{project.members.length} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                    <span>{project.statistics.efficiency}% efficiency</span>
                  </div>
                </div>

                {/* Team Members */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 4).map(member => (
                      <Avatar
                        key={member.id}
                        className="h-8 w-8 border-2 border-white"
                      >
                        <AvatarImage src={member.user.avatar} />
                        <AvatarFallback>
                          {member.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {project.members.length > 4 && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200">
                        <span className="text-xs text-gray-600">
                          +{project.members.length - 4}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    Led by{' '}
                    {project.members.find(m => m.role === 'leader')?.user.name}
                  </div>
                </div>

                {/* Recent Tasks */}
                {project.tasks.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="mb-2 text-sm font-medium">Recent Tasks</h4>
                    <div className="space-y-2">
                      {project.tasks.slice(0, 2).map(task => (
                        <div
                          key={task.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div
                            className={`h-2 w-2 rounded-full ${
                              task.status === 'completed'
                                ? 'bg-green-500'
                                : task.status === 'in_progress'
                                  ? 'bg-blue-500'
                                  : task.status === 'review'
                                    ? 'bg-yellow-500'
                                    : 'bg-gray-300'
                            }`}
                          ></div>
                          <span className="flex-1 truncate">{task.title}</span>
                          <Flag
                            className={`h-3 w-3 ${getPriorityColor(task.priority)}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Group Project</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Project Name *
                </Label>
                <Input
                  value={newProject.name}
                  onChange={e =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  placeholder="Enter project name..."
                />
              </div>

              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Description *
                </Label>
                <Textarea
                  value={newProject.description}
                  onChange={e =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your project..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    Start Date
                  </Label>
                  <DatePicker
                    date={newProject.startDate}
                    onDateChange={date =>
                      setNewProject({
                        ...newProject,
                        startDate: date || new Date(),
                      })
                    }
                  />
                </div>

                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    Due Date
                  </Label>
                  <DatePicker
                    date={newProject.dueDate}
                    onDateChange={date =>
                      setNewProject({
                        ...newProject,
                        dueDate: date || new Date(),
                      })
                    }
                    minDate={newProject.startDate}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Objectives */}
            <div className="space-y-4">
              <h4 className="font-medium">Project Objectives</h4>
              {newProject.objectives.map((objective, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={objective}
                    onChange={e => {
                      const newObjectives = [...newProject.objectives];
                      newObjectives[index] = e.target.value;
                      setNewProject({
                        ...newProject,
                        objectives: newObjectives,
                      });
                    }}
                    placeholder="Enter an objective..."
                  />
                  {newProject.objectives.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newObjectives = newProject.objectives.filter(
                          (_, i) => i !== index
                        );
                        setNewProject({
                          ...newProject,
                          objectives: newObjectives,
                        });
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setNewProject({
                    ...newProject,
                    objectives: [...newProject.objectives, ''],
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Objective
              </Button>
            </div>

            <Separator />

            {/* Deliverables */}
            <div className="space-y-4">
              <h4 className="font-medium">Deliverables</h4>
              {newProject.deliverables.map((deliverable, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={deliverable}
                    onChange={e => {
                      const newDeliverables = [...newProject.deliverables];
                      newDeliverables[index] = e.target.value;
                      setNewProject({
                        ...newProject,
                        deliverables: newDeliverables,
                      });
                    }}
                    placeholder="Enter a deliverable..."
                  />
                  {newProject.deliverables.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newDeliverables = newProject.deliverables.filter(
                          (_, i) => i !== index
                        );
                        setNewProject({
                          ...newProject,
                          deliverables: newDeliverables,
                        });
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setNewProject({
                    ...newProject,
                    deliverables: [...newProject.deliverables, ''],
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Deliverable
              </Button>
            </div>

            <Separator />

            {/* Team Members */}
            <div className="space-y-4">
              <h4 className="font-medium">Team Members</h4>
              <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto">
                {groupMembers?.map(member => (
                  <label
                    key={member.id}
                    className="flex items-center gap-2 rounded p-2 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={newProject.memberIds.includes(member.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setNewProject({
                            ...newProject,
                            memberIds: [...newProject.memberIds, member.id],
                          });
                        } else {
                          setNewProject({
                            ...newProject,
                            memberIds: newProject.memberIds.filter(
                              id => id !== member.id
                            ),
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.user.avatar} />
                      <AvatarFallback>
                        {member.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{member.user.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!newProject.name || !newProject.description}
            >
              Create Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
