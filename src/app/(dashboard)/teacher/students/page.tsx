'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  MessageSquare,
  UserCheck,
  UserX,
  Eye,
  Download,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle,
  Plus,
  Calendar,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { useGetStudentOverviewQuery, StudentOverview } from '@/lib/redux/api/teacher-dashboard-api';

// Removed mock data - now using real API data

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

export default function TeacherStudentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [sortBy, setSortBy] = useState('lastActivity');

  // API call to get students data
  const {
    data: students = [],
    isLoading,
    isError,
    refetch,
  } = useGetStudentOverviewQuery({
    status: statusFilter === 'all' ? undefined : statusFilter,
    courseId: courseFilter === 'all' ? undefined : courseFilter,
    limit: 50,
    offset: 0,
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && student.status === 'active') ||
                      (activeTab === 'at_risk' && student.status === 'at_risk') ||
                      (activeTab === 'excelling' && student.status === 'excelling') ||
                      (activeTab === 'inactive' && student.status === 'inactive');
    
    return matchesSearch && matchesTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'at_risk':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'excelling':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'inactive':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'at_risk':
        return <AlertTriangle className="h-4 w-4" />;
      case 'excelling':
        return <Star className="h-4 w-4" />;
      case 'inactive':
        return <Clock className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const atRiskStudents = students.filter(s => s.status === 'at_risk').length;
  const excellingStudents = students.filter(s => s.status === 'excelling').length;
  const averageProgress = totalStudents > 0 ? Math.round(students.reduce((sum, s) => sum + s.overallProgress, 0) / totalStudents) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Student Management
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Monitor and manage your students' progress
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="bg-white/80 backdrop-blur-sm border-white/20"
                disabled={isLoading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Loading...' : 'Refresh'}
              </Button>
              <Button
                onClick={() => {}}
                variant="outline"
                className="bg-white/80 backdrop-blur-sm border-white/20"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button
                onClick={() => {}}
                variant="outline"
                className="bg-white/80 backdrop-blur-sm border-white/20"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Invite Students
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
        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 md:grid-cols-5">
          <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Students</p>
                  <p className="text-2xl font-bold text-slate-800">{totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-slate-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active</p>
                  <p className="text-2xl font-bold text-blue-600">{activeStudents}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">At Risk</p>
                  <p className="text-2xl font-bold text-red-600">{atRiskStudents}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Excelling</p>
                  <p className="text-2xl font-bold text-emerald-600">{excellingStudents}</p>
                </div>
                <Star className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-violet-600">{averageProgress}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-violet-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 items-center space-x-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search students..."
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
                      <SelectItem value="at_risk">At Risk</SelectItem>
                      <SelectItem value="excelling">Excelling</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-36 bg-white/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lastActivity">Last Activity</SelectItem>
                      <SelectItem value="progress">Progress</SelectItem>
                      <SelectItem value="score">Average Score</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="joinDate">Join Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Student Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/30">
              <TabsList className="grid w-full grid-cols-5 bg-transparent gap-1">
                <TabsTrigger value="all" className="rounded-xl">All Students</TabsTrigger>
                <TabsTrigger value="active" className="rounded-xl">Active</TabsTrigger>
                <TabsTrigger value="at_risk" className="rounded-xl">At Risk</TabsTrigger>
                <TabsTrigger value="excelling" className="rounded-xl">Excelling</TabsTrigger>
                <TabsTrigger value="inactive" className="rounded-xl">Inactive</TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-6">
              <TabsContent value={activeTab} className="mt-0">
                <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
                  <CardContent className="p-0">
                    {isError ? (
                      <div className="p-8 text-center">
                        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">Error loading students</h3>
                        <p className="text-slate-500 mb-4">Unable to load students data. Please try again.</p>
                        <Button onClick={() => refetch()}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Table>
                          <TableHeader>
                            <TableRow className="border-white/20">
                              <TableHead className="font-semibold">Student</TableHead>
                              <TableHead className="font-semibold">Status</TableHead>
                              <TableHead className="font-semibold">Progress</TableHead>
                              <TableHead className="font-semibold">Avg Score</TableHead>
                              <TableHead className="font-semibold">Courses</TableHead>
                              <TableHead className="font-semibold">Last Activity</TableHead>
                              <TableHead className="font-semibold">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {isLoading ? (
                              Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index} className="border-white/10">
                                  <TableCell className="py-4">
                                    <div className="flex items-center space-x-3">
                                      <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse"></div>
                                      <div>
                                        <div className="h-4 bg-slate-200 rounded animate-pulse mb-1 w-32"></div>
                                        <div className="h-3 bg-slate-200 rounded animate-pulse w-40"></div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell><div className="h-6 bg-slate-200 rounded animate-pulse w-16"></div></TableCell>
                                  <TableCell><div className="h-2 bg-slate-200 rounded animate-pulse w-20"></div></TableCell>
                                  <TableCell><div className="h-4 bg-slate-200 rounded animate-pulse w-12"></div></TableCell>
                                  <TableCell><div className="h-4 bg-slate-200 rounded animate-pulse w-16"></div></TableCell>
                                  <TableCell><div className="h-4 bg-slate-200 rounded animate-pulse w-14"></div></TableCell>
                                  <TableCell><div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div></TableCell>
                                </TableRow>
                              ))
                            ) : (
                              filteredStudents.map((student, index) => (
                                <motion.tr
                                  key={student.studentId}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="border-white/10 hover:bg-white/40 transition-colors"
                                >
                            <TableCell className="py-4">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={student.avatar || undefined} />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
                                    {student.studentName.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-slate-800">
                                    {student.studentName}
                                  </p>
                                  <p className="text-sm text-slate-500">{student.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(student.status)}>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(student.status)}
                                  <span className="capitalize">{student.status.replace('_', ' ')}</span>
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Progress value={student.overallProgress} className="w-16 h-2" />
                                <span className="text-sm font-medium text-slate-700">
                                  {student.overallProgress}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-amber-500" />
                                <span className="font-medium text-slate-700">
                                  {student.averageScore}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="font-medium text-slate-700">
                                  {student.enrolledCourses} enrolled
                                </p>
                                <p className="text-slate-500">
                                  {student.coursesData.filter(c => c.progress === 100).length} completed
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="font-medium text-slate-700">
                                  {formatLastActivity(student.lastActivity)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => router.push(`/teacher/students/${student.studentId}`)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Send Message
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Award className="mr-2 h-4 w-4" />
                                    Grant Certificate
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              </TableCell>
                            </motion.tr>
                          ))
                          )}
                          </TableBody>
                        </Table>

                        {!isLoading && filteredStudents.length === 0 && (
                          <div className="text-center py-12">
                            <Users className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-600 mb-2">No students found</h3>
                            <p className="text-slate-500 mb-6">
                              {searchTerm || statusFilter !== 'all' 
                                ? 'Try adjusting your search or filter criteria.'
                                : 'No students have enrolled in your courses yet.'
                              }
                            </p>
                            <Button className="bg-gradient-to-r from-purple-500 to-violet-600">
                              <Plus className="mr-2 h-4 w-4" />
                              Invite Students
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}