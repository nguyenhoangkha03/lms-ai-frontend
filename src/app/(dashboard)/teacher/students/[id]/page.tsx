'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Mail,
  MessageSquare,
  Phone,
  Calendar,
  Clock,
  BookOpen,
  Star,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  CheckCircle,
  Eye,
  Download,
  Edit,
  Users,
  BarChart3,
  Play,
  FileText,
  Target,
  Activity,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useGetDetailedStudentInfoQuery, StudentOverview } from '@/lib/redux/api/teacher-dashboard-api';

// Removed mock data - now using real API data

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Get student ID from URL params
  const studentId = params.id as string;

  // API call to get detailed student information
  const {
    data: student,
    isLoading,
    isError,
    refetch,
  } = useGetDetailedStudentInfoQuery(studentId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800';
      case 'at_risk':
        return 'bg-red-100 text-red-800';
      case 'excelling':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const handleSendMessage = () => {
    if (student) {
      toast({
        title: 'Message Sent',
        description: `Message sent to ${student.studentName}`,
      });
    }
  };

  const handleSendEmail = () => {
    if (student) {
      toast({
        title: 'Email Sent',
        description: `Email sent to ${student.email}`,
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Loading student details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Student not found</h3>
          <p className="text-slate-500 mb-4">Unable to load student details. Please try again.</p>
          <div className="space-x-2">
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-slate-600 hover:text-slate-900"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Students
              </Button>
              
              <div className="h-6 w-px bg-slate-300" />
              
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={student.avatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white text-lg">
                    {student.studentName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    {student.studentName}
                  </h1>
                  <div className="flex items-center space-x-3">
                    <p className="text-slate-600">{student.email}</p>
                    <Badge className={getStatusColor(student.status)}>
                      {student.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendEmail}
                className="bg-white/60 backdrop-blur-sm"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendMessage}
                className="bg-white/60 backdrop-blur-sm"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-violet-600">
                <Edit className="h-4 w-4 mr-2" />
                Edit Student
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Student Info Sidebar */}
          <div className="col-span-4">
            <div className="space-y-6">
              {/* Basic Info Card */}
              <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Student Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Email</label>
                    <p className="text-slate-800">{student.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Student ID</label>
                    <p className="text-slate-800">{student.studentId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Enrolled Courses</label>
                    <p className="text-slate-800">{student.enrolledCourses} courses</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Last Activity</label>
                    <p className="text-slate-800">{formatLastActivity(student.lastActivity)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Quick Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Enrolled Courses</span>
                    <Badge variant="secondary">{student.enrolledCourses}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Average Score</span>
                    <span className="font-semibold text-slate-800">{student.averageScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Overall Progress</span>
                    <span className="font-semibold text-slate-800">{student.overallProgress}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Achievements</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="font-semibold text-slate-800">{student.achievements}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/30 mb-6">
                <TabsList className="grid w-full grid-cols-4 bg-transparent gap-1">
                  <TabsTrigger value="overview" className="rounded-xl">Overview</TabsTrigger>
                  <TabsTrigger value="courses" className="rounded-xl">Courses</TabsTrigger>
                  <TabsTrigger value="activity" className="rounded-xl">Activity</TabsTrigger>
                  <TabsTrigger value="analytics" className="rounded-xl">Analytics</TabsTrigger>
                </TabsList>
              </div>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Progress Overview */}
                <div className="grid grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Overall Progress</p>
                          <p className="text-2xl font-bold text-emerald-600">{student.overallProgress}%</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-emerald-500" />
                      </div>
                      <Progress value={student.overallProgress} className="mt-4" />
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Average Score</p>
                          <p className="text-2xl font-bold text-blue-600">{student.averageScore}%</p>
                        </div>
                        <Star className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        Above class average
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Completion Rate</p>
                          <p className="text-2xl font-bold text-violet-600">
                            {student.enrolledCourses > 0 ? Math.round((student.coursesData.filter(c => c.progress === 100).length / student.enrolledCourses) * 100) : 0}%
                          </p>
                        </div>
                        <Target className="h-8 w-8 text-violet-500" />
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        {student.coursesData.filter(c => c.progress === 100).length} of {student.enrolledCourses} courses
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Course Progress Summary */}
                <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                  <CardHeader>
                    <CardTitle>Course Progress Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {student.coursesData.map((course) => (
                        <div key={course.courseId} className="flex items-center justify-between p-4 rounded-xl bg-white/40">
                          <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800">{course.courseName}</h4>
                              <p className="text-sm text-slate-600">
                                Last accessed: {formatLastActivity(course.lastAccessed)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-700">Progress</p>
                              <div className="flex items-center space-x-2">
                                <Progress value={course.progress} className="w-20 h-2" />
                                <span className="text-sm font-bold text-slate-700">{course.progress}%</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-700">Score</p>
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-amber-500" />
                                <span className="text-sm font-bold text-slate-700">{course.score}%</span>
                              </div>
                            </div>
                            <Badge className={course.progress === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}>
                              {course.progress === 100 ? 'Completed' : 'In Progress'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Courses Tab */}
              <TabsContent value="courses" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                  <CardHeader>
                    <CardTitle>Enrolled Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Assignments</TableHead>
                          <TableHead>Quizzes</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {student.coursesData.map((course) => (
                          <TableRow key={course.courseId}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{course.courseName}</p>
                                <p className="text-sm text-slate-500">
                                  Last accessed: {formatLastActivity(course.lastAccessed)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Progress value={course.progress} className="w-16 h-2" />
                                <span className="text-sm font-medium">{course.progress}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-amber-500" />
                                <span className="font-medium">{course.score}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="text-slate-500">No data</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="text-slate-500">No data</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={course.progress === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}>
                                {course.progress === 100 ? 'Completed' : 'In Progress'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                  <CardHeader>
                    <CardTitle>Course Activity Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {student.coursesData.map((course) => (
                        <div key={course.courseId} className="flex items-start space-x-3 p-4 rounded-xl bg-white/40">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-800">{course.courseName}</p>
                            <p className="text-sm text-slate-600">Course Progress: {course.progress}%</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span className="text-xs text-slate-500">
                                Last accessed: {formatLastActivity(course.lastAccessed)}
                              </span>
                              <Star className="h-3 w-3 text-amber-500" />
                              <span className="text-xs font-medium text-slate-600">
                                Score: {course.score}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                    <CardHeader>
                      <CardTitle>Learning Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Overall Progress</span>
                        <span className="font-medium">{student.overallProgress}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Average Score</span>
                        <span className="font-medium">{student.averageScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Enrolled Courses</span>
                        <span className="font-medium">{student.enrolledCourses}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Completed Courses</span>
                        <span className="font-medium">{student.coursesData.filter(c => c.progress === 100).length}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                    <CardHeader>
                      <CardTitle>Performance Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-slate-700 mb-2">Status & Risk Factors</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getStatusColor(student.status)}>
                            {student.status}
                          </Badge>
                          {student.riskFactors?.map((risk, index) => (
                            <Badge key={index} className="bg-amber-100 text-amber-800">
                              {risk}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-700 mb-2">Achievements</h4>
                        <div className="flex items-center space-x-2">
                          <Star className="h-5 w-5 text-amber-500" />
                          <span className="text-lg font-semibold">{student.achievements}</span>
                          <span className="text-slate-600">achievements earned</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}