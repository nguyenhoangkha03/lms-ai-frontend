'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Edit,
  Eye,
  Copy,
  Share,
  Archive,
  Trash2,
  Download,
  BarChart3,
  Play,
  Pause,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  useGetTeacherAssignmentsQuery,
  useGetAssignmentStatisticsQuery,
  useDeleteAssignmentMutation,
  useDuplicateAssignmentMutation,
  usePublishAssignmentMutation,
  Assignment,
} from '@/lib/redux/api/teacher-assignments-api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function TeacherAssignmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  // API hooks
  const {
    data: assignments = [],
    isLoading: isLoadingAssignments,
    error: assignmentsError,
  } = useGetTeacherAssignmentsQuery({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const {
    data: statistics,
    isLoading: isLoadingStats,
  } = useGetAssignmentStatisticsQuery();

  const [deleteAssignment] = useDeleteAssignmentMutation();
  const [duplicateAssignment] = useDuplicateAssignmentMutation();
  const [publishAssignment] = usePublishAssignmentMutation();

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || assignment.courseId === courseFilter;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && assignment.status === 'active') ||
                      (activeTab === 'draft' && assignment.status === 'draft') ||
                      (activeTab === 'completed' && assignment.status === 'completed') ||
                      (activeTab === 'grading' && assignment.pendingSubmissions > 0);
    
    return matchesSearch && matchesStatus && matchesCourse && matchesTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'draft':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'archived':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4" />;
      case 'draft':
        return <FileText className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'archived':
        return <Archive className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) {
      return `Overdue by ${Math.abs(diffInDays)} days`;
    } else if (diffInDays === 0) {
      return 'Due today';
    } else if (diffInDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffInDays} days`;
    }
  };

  const handleDelete = async (assignmentId: string) => {
    try {
      await deleteAssignment(assignmentId).unwrap();
      toast({
        title: 'Assignment Deleted',
        description: 'Assignment has been successfully deleted.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete assignment.',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async (assignmentId: string) => {
    try {
      await duplicateAssignment(assignmentId).unwrap();
      toast({
        title: 'Assignment Duplicated',
        description: 'Assignment has been successfully duplicated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate assignment.',
        variant: 'destructive',
      });
    }
  };

  const handlePublish = async (assignmentId: string) => {
    try {
      await publishAssignment(assignmentId).unwrap();
      toast({
        title: 'Assignment Published',
        description: 'Assignment is now active and visible to students.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish assignment.',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingAssignments) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Assignments
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Create and manage course assignments
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push('/teacher/assignments/create')}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Assignment
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/teacher/assignments/analytics')}
                className="bg-white/80 backdrop-blur-sm border-white/20"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="container mx-auto space-y-8 px-6 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Statistics Cards */}
        {!isLoadingStats && statistics && (
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 md:grid-cols-5">
            <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Assignments</p>
                    <p className="text-2xl font-bold text-slate-800">{statistics.totalAssignments}</p>
                  </div>
                  <ClipboardList className="h-8 w-8 text-slate-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active</p>
                    <p className="text-2xl font-bold text-emerald-600">{statistics.activeAssignments}</p>
                  </div>
                  <Play className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Pending Grading</p>
                    <p className="text-2xl font-bold text-orange-600">{statistics.pendingGrading}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Avg Score</p>
                    <p className="text-2xl font-bold text-blue-600">{statistics.averageScore}%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Avg Grading Time</p>
                    <p className="text-2xl font-bold text-violet-600">{statistics.averageGradingTime}m</p>
                  </div>
                  <Clock className="h-8 w-8 text-violet-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Filters and Search */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 items-center space-x-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search assignments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32 bg-white/80">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-36 bg-white/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dueDate">Due Date</SelectItem>
                      <SelectItem value="created">Created Date</SelectItem>
                      <SelectItem value="submissions">Submissions</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Assignment Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/30">
              <TabsList className="grid w-full grid-cols-5 bg-transparent gap-1">
                <TabsTrigger value="all" className="rounded-xl">All Assignments</TabsTrigger>
                <TabsTrigger value="active" className="rounded-xl">Active</TabsTrigger>
                <TabsTrigger value="draft" className="rounded-xl">Draft</TabsTrigger>
                <TabsTrigger value="grading" className="rounded-xl">Need Grading</TabsTrigger>
                <TabsTrigger value="completed" className="rounded-xl">Completed</TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-6">
              <TabsContent value={activeTab} className="mt-0">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                  {filteredAssignments.map((assignment, index) => (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="group bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <Badge className={getStatusColor(assignment.status)}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(assignment.status)}
                                <span className="capitalize">{assignment.status}</span>
                              </div>
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.push(`/teacher/assignments/${assignment.id}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/teacher/assignments/${assignment.id}/edit`)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Assignment
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/teacher/assignments/${assignment.id}/submissions`)}>
                                  <Users className="mr-2 h-4 w-4" />
                                  View Submissions
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {assignment.status === 'draft' && (
                                  <DropdownMenuItem onClick={() => handlePublish(assignment.id)}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Publish
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleDuplicate(assignment.id)}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Export Data
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(assignment.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <CardTitle className="text-lg line-clamp-2 text-slate-800">
                            {assignment.title}
                          </CardTitle>
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {assignment.description}
                          </p>
                          <p className="text-xs text-slate-500">
                            {assignment.courseName}
                          </p>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4 text-orange-500" />
                              <span className="text-orange-600 font-medium">
                                {formatDate(assignment.dueDate)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="font-medium">{assignment.maxScore} pts</span>
                            </div>
                          </div>

                          {assignment.status === 'active' && (
                            <>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-1">
                                  <Users className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium">{assignment.totalSubmissions}</span>
                                  <span className="text-slate-500">submissions</span>
                                </div>
                                {assignment.pendingSubmissions > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    <span className="font-medium text-amber-600">
                                      {assignment.pendingSubmissions} pending
                                    </span>
                                  </div>
                                )}
                              </div>

                              {assignment.gradedSubmissions > 0 && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Grading Progress</span>
                                    <span className="font-medium">
                                      {Math.round((assignment.gradedSubmissions / assignment.totalSubmissions) * 100)}%
                                    </span>
                                  </div>
                                  <Progress 
                                    value={(assignment.gradedSubmissions / assignment.totalSubmissions) * 100} 
                                    className="h-2"
                                  />
                                  {assignment.averageScore > 0 && (
                                    <p className="text-sm text-slate-600">
                                      Avg Score: <span className="font-semibold">{assignment.averageScore}%</span>
                                    </p>
                                  )}
                                </div>
                              )}
                            </>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-white/20">
                            <span className="text-xs text-slate-500">
                              Created {new Date(assignment.createdAt).toLocaleDateString()}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => router.push(`/teacher/assignments/${assignment.id}`)}
                              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                            >
                              Manage
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {filteredAssignments.length === 0 && (
                  <div className="text-center py-12">
                    <ClipboardList className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">No assignments found</h3>
                    <p className="text-slate-500 mb-6">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria.'
                        : 'Create your first assignment to get started.'
                      }
                    </p>
                    <Button
                      onClick={() => router.push('/teacher/assignments/create')}
                      className="bg-gradient-to-r from-orange-500 to-red-600"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Assignment
                    </Button>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}