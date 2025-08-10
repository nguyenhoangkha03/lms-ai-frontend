'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  Eye,
  Award,
  FileText,
  PieChart,
  Activity,
  Zap,
  Brain,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  useGetPerformanceAnalyticsQuery,
  useGetCourseAnalyticsQuery,
  useGetEngagementMetricsQuery,
  useGetGradingAnalyticsQuery,
  useGetRealTimeDashboardQuery,
  useGetContentEffectivenessQuery,
  useGetAssessmentAnalyticsQuery,
  useGenerateAnalyticsReportMutation,
} from '@/lib/redux/api/teacher-analytics-api';

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

export default function TeacherAnalyticsPage() {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  // API hooks
  const { data: performanceData, isLoading: isLoadingPerformance, refetch: refetchPerformance } = 
    useGetPerformanceAnalyticsQuery({ period: selectedPeriod });
  
  const { data: courseData, isLoading: isLoadingCourse } = useGetCourseAnalyticsQuery({
    period: selectedPeriod,
    courseIds: selectedCourse !== 'all' ? [selectedCourse] : undefined,
  });

  const { data: engagementData, isLoading: isLoadingEngagement } = useGetEngagementMetricsQuery({
    period: selectedPeriod,
  });

  const { data: gradingData, isLoading: isLoadingGrading } = useGetGradingAnalyticsQuery({
    period: selectedPeriod,
  });

  const { data: realtimeData, isLoading: isLoadingRealtime } = useGetRealTimeDashboardQuery();
  
  const { data: contentData, isLoading: isLoadingContent } = useGetContentEffectivenessQuery({
    courseId: selectedCourse !== 'all' ? selectedCourse : undefined,
  });

  const { data: assessmentData, isLoading: isLoadingAssessment } = useGetAssessmentAnalyticsQuery({
    period: selectedPeriod,
  });

  const [generateReport, { isLoading: isGeneratingReport }] = useGenerateAnalyticsReportMutation();

  const handleGenerateReport = async (format: 'pdf' | 'excel' | 'csv', type: string) => {
    try {
      const blob = await generateReport({
        type: type as any,
        format,
        period: selectedPeriod as any,
        includeCharts: true,
        includeRecommendations: true,
      }).unwrap();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${type}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Report Generated',
        description: `Analytics report has been generated and downloaded.`,
      });
    } catch (error) {
      toast({
        title: 'Report Failed',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = () => {
    refetchPerformance();
    toast({
      title: 'Data Refreshed',
      description: 'Analytics data has been updated.',
    });
  };

  if (isLoadingPerformance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-8 w-8 bg-slate-200 rounded mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
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
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Analytics & Reports
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Comprehensive insights into your teaching performance and student progress
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="semester">This Semester</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-white/20">
                    <Download className="mr-2 h-4 w-4" />
                    Export Report
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleGenerateReport('pdf', 'comprehensive')}>
                    <FileText className="mr-2 h-4 w-4" />
                    PDF Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleGenerateReport('excel', 'performance')}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Excel Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleGenerateReport('csv', 'engagement')}>
                    <Activity className="mr-2 h-4 w-4" />
                    CSV Export
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="bg-white/80 backdrop-blur-sm border-white/20"
              >
                <RefreshCw className="h-4 w-4" />
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
        {/* Real-time Overview Cards */}
        {realtimeData && (
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-lg border-green-200/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Active Students</p>
                    <p className="text-2xl font-bold text-green-900">{realtimeData.activeStudents}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <Zap className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-700">Live now</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-lg border-blue-200/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Ongoing Sessions</p>
                    <p className="text-2xl font-bold text-blue-900">{realtimeData.ongoingSessions}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <Clock className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-xs text-blue-700">In progress</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/10 backdrop-blur-lg border-violet-200/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-violet-800">Completed Today</p>
                    <p className="text-2xl font-bold text-violet-900">{realtimeData.completedActivities}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20">
                    <CheckCircle className="h-6 w-6 text-violet-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <Target className="h-4 w-4 text-violet-500 mr-1" />
                  <span className="text-xs text-violet-700">Activities</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 backdrop-blur-lg border-orange-200/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-800">Recent Submissions</p>
                    <p className="text-2xl font-bold text-orange-900">{realtimeData.recentSubmissions}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <TrendingUp className="h-4 w-4 text-orange-500 mr-1" />
                  <span className="text-xs text-orange-700">Last 24h</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Alerts Section */}
        {realtimeData?.alerts && realtimeData.alerts.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                  Important Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {realtimeData.alerts.slice(0, 3).map((alert, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-amber-50/50 border border-amber-200/30">
                      <div className={`h-2 w-2 rounded-full mt-2 ${
                        alert.type === 'error' ? 'bg-red-500' :
                        alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-slate-700">{alert.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Analytics Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-lg">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="assessments">Assessments</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {performanceData && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Total Students</p>
                          <p className="text-3xl font-bold text-slate-800">{performanceData.overview.totalStudents}</p>
                          <p className="text-xs text-green-600 mt-1">Across all courses</p>
                        </div>
                        <Users className="h-8 w-8 text-slate-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Class Average</p>
                          <p className="text-3xl font-bold text-blue-600">{performanceData.overview.averageClassScore}%</p>
                          <p className="text-xs text-blue-500 mt-1">+{performanceData.overview.improvementRate}% from last period</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Completion Rate</p>
                          <p className="text-3xl font-bold text-green-600">{performanceData.overview.completionRate}%</p>
                          <Progress value={performanceData.overview.completionRate} className="mt-2" />
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Engagement Rate</p>
                          <p className="text-3xl font-bold text-violet-600">{performanceData.overview.engagementRate}%</p>
                          <div className="flex items-center mt-1">
                            <div className={`h-2 w-2 rounded-full mr-2 ${
                              performanceData.overview.engagementRate > 80 ? 'bg-green-500' :
                              performanceData.overview.engagementRate > 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <p className="text-xs text-slate-500">
                              {performanceData.overview.engagementRate > 80 ? 'Excellent' :
                               performanceData.overview.engagementRate > 60 ? 'Good' : 'Needs attention'}
                            </p>
                          </div>
                        </div>
                        <Activity className="h-8 w-8 text-violet-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Student Segments */}
              {performanceData?.studentSegments && (
                <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
                  <CardHeader>
                    <CardTitle>Student Performance Segments</CardTitle>
                    <CardDescription>Distribution of student performance levels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {performanceData.studentSegments.map((segment) => (
                        <div key={segment.segment} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium capitalize text-slate-700">{segment.segment.replace('_', ' ')}</h4>
                            <Badge variant={
                              segment.segment === 'excelling' ? 'default' :
                              segment.segment === 'on_track' ? 'secondary' :
                              segment.segment === 'at_risk' ? 'outline' : 'destructive'
                            }>
                              {segment.percentage}%
                            </Badge>
                          </div>
                          <p className="text-2xl font-bold text-slate-800 mb-2">{segment.count} students</p>
                          <div className="space-y-1">
                            {segment.characteristics.slice(0, 2).map((char, idx) => (
                              <p key={idx} className="text-xs text-slate-600">• {char}</p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              {performanceData?.coursePerformance && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {performanceData.coursePerformance.map((course) => (
                    <Card key={course.courseId} className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{course.courseName}</CardTitle>
                            <CardDescription>{course.enrolledStudents} students enrolled</CardDescription>
                          </div>
                          <Badge variant="outline" className="text-blue-600">
                            {course.averageScore}% avg
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Completion Rate</span>
                            <span className="font-medium">{course.completionRate}%</span>
                          </div>
                          <Progress value={course.completionRate} className="h-2" />
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-slate-600">Struggling</p>
                              <p className="text-2xl font-bold text-red-600">{course.strugglingStudents}</p>
                            </div>
                            <div>
                              <p className="text-slate-600">Excelling</p>
                              <p className="text-2xl font-bold text-green-600">{course.excellingStudents}</p>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-200">
                            <p className="text-sm font-medium text-slate-700 mb-2">Engagement Metrics</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>Video Watch: {course.engagementMetrics.videoWatchTime}%</div>
                              <div>Assignments: {course.engagementMetrics.assignmentSubmissionRate}%</div>
                              <div>Discussions: {course.engagementMetrics.discussionParticipation}%</div>
                              <div>Quizzes: {course.engagementMetrics.quizAttemptRate}%</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Engagement Tab */}
            <TabsContent value="engagement" className="space-y-6">
              {engagementData && (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Activity className="mr-2 h-5 w-5 text-blue-500" />
                          Overall Engagement
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-blue-600 mb-2">
                            {engagementData.totalEngagementScore}%
                          </div>
                          <div className="text-sm text-slate-600">Average across all courses</div>
                          <Progress value={engagementData.totalEngagementScore} className="mt-4" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Clock className="mr-2 h-5 w-5 text-green-500" />
                          Peak Activity Hours
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {engagementData.peakHours.slice(0, 3).map((peak, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">
                                {peak.hour}:00 - {peak.hour + 1}:00
                              </span>
                              <div className="flex items-center">
                                <div className="w-16 h-2 bg-slate-200 rounded-full mr-2 overflow-hidden">
                                  <div 
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: `${(peak.activityCount / 50) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{peak.activityCount}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                          At-Risk Students
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {engagementData.studentEngagement.filter(s => s.risk === 'high').slice(0, 3).map((student, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200">
                              <div>
                                <p className="text-sm font-medium text-slate-700">{student.studentName}</p>
                                <p className="text-xs text-slate-500">Engagement: {student.engagementScore}%</p>
                              </div>
                              <Badge variant="destructive" className="text-xs">High Risk</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
                    <CardHeader>
                      <CardTitle>Course Engagement Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {engagementData.courseEngagement.map((course, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-700">{course.courseName}</h4>
                              <div className="flex items-center mt-1">
                                <Progress value={course.engagementScore} className="flex-1 mr-4" />
                                <span className="text-sm font-medium text-slate-600">{course.engagementScore}%</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              {course.trend === 'up' && <TrendingUp className="h-5 w-5 text-green-500" />}
                              {course.trend === 'down' && <TrendingUp className="h-5 w-5 text-red-500 rotate-180" />}
                              {course.trend === 'stable' && <div className="h-5 w-5 bg-slate-400 rounded-full" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              {contentData && (
                <>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Award className="mr-2 h-5 w-5 text-green-500" />
                          Top Performing Content
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {contentData.topPerformingContent.slice(0, 5).map((content, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex-1">
                                <h4 className="font-medium text-slate-700 text-sm">{content.contentTitle}</h4>
                                <div className="flex items-center mt-1 text-xs text-slate-600">
                                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                  <span>{content.completionRate}% completion</span>
                                  <span className="mx-2">•</span>
                                  <span>{content.averageScore}% avg score</span>
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {Math.floor(content.engagementTime / 60)}m avg
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                          Content Needing Attention
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {contentData.underperformingContent.slice(0, 5).map((content, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                              <div className="flex-1">
                                <h4 className="font-medium text-slate-700 text-sm">{content.contentTitle}</h4>
                                <div className="flex items-center mt-1 text-xs text-slate-600">
                                  <TrendingUp className="h-3 w-3 mr-1 text-red-500 rotate-180" />
                                  <span>{content.dropoffRate}% drop-off rate</span>
                                </div>
                                {content.commonIssues.length > 0 && (
                                  <p className="text-xs text-amber-700 mt-1">
                                    Issues: {content.commonIssues.slice(0, 2).join(', ')}
                                  </p>
                                )}
                              </div>
                              <Badge variant="outline" className="text-xs border-amber-400 text-amber-700">
                                Needs Review
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
                    <CardHeader>
                      <CardTitle>Content Type Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {contentData.contentAnalytics.map((type, index) => (
                          <div key={index} className="p-4 bg-slate-50 rounded-lg">
                            <h4 className="font-medium text-slate-700 capitalize mb-2">{type.contentType}</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-600">Total Items:</span>
                                <span className="font-medium">{type.totalItems}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Avg Engagement:</span>
                                <span className="font-medium">{type.averageEngagement}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Completion Rate:</span>
                                <span className="font-medium">{type.completionRate}%</span>
                              </div>
                              <Progress value={type.completionRate} className="h-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Assessment Tab */}
            <TabsContent value="assessments" className="space-y-6">
              {assessmentData && (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-600">Total Assessments</p>
                            <p className="text-2xl font-bold text-slate-800">{assessmentData.totalAssessments}</p>
                          </div>
                          <FileText className="h-8 w-8 text-slate-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-600">Average Score</p>
                            <p className="text-2xl font-bold text-blue-600">{assessmentData.averageScore}%</p>
                          </div>
                          <BarChart3 className="h-8 w-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-600">Pass Rate</p>
                            <p className="text-2xl font-bold text-green-600">{assessmentData.passRate}%</p>
                          </div>
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-600">Avg Time</p>
                            <p className="text-2xl font-bold text-purple-600">{Math.floor(assessmentData.timeAnalytics.averageCompletionTime / 60)}m</p>
                          </div>
                          <Clock className="h-8 w-8 text-purple-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
                      <CardHeader>
                        <CardTitle>Question Performance Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4 max-h-64 overflow-y-auto">
                          {assessmentData.questionAnalytics.slice(0, 5).map((question, index) => (
                            <div key={index} className="p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <p className="text-sm font-medium text-slate-700 line-clamp-2">
                                  {question.questionText.length > 50 
                                    ? `${question.questionText.substring(0, 50)}...` 
                                    : question.questionText}
                                </p>
                                <Badge variant={question.correctAnswerRate > 70 ? 'secondary' : 'outline'}>
                                  {question.correctAnswerRate}%
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-xs text-slate-600">
                                <span>Avg time: {Math.floor(question.averageTimeSpent / 60)}m {question.averageTimeSpent % 60}s</span>
                                <Progress value={question.correctAnswerRate} className="w-20 h-1" />
                              </div>
                              {question.commonMistakes.length > 0 && (
                                <p className="text-xs text-red-600 mt-1">
                                  Common mistake: {question.commonMistakes[0]}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
                      <CardHeader>
                        <CardTitle>Difficulty Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {assessmentData.difficultyAnalysis.map((level, index) => (
                            <div key={index} className="p-4 bg-slate-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-slate-700 capitalize">{level.difficulty}</h4>
                                <Badge variant="outline">{level.questionCount} questions</Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Average Score:</span>
                                <div className="flex items-center">
                                  <Progress value={level.averageScore} className="w-20 h-2 mr-2" />
                                  <span className="text-sm font-medium">{level.averageScore}%</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}