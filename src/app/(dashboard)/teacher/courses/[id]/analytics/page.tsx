'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  Eye,
  Play,
  BookOpen,
  Award,
  MessageSquare,
  Star,
  Download,
  Calendar,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Mock data - replace with actual API calls
const mockCourseAnalytics = {
  courseInfo: {
    id: '1',
    title: 'Advanced Mathematics',
    thumbnail: '/course-thumbnail.jpg',
    instructor: 'Dr. John Smith',
    totalStudents: 245,
    activeStudents: 189,
    completionRate: 68,
    averageRating: 4.7,
    totalRating: 156,
    revenue: 24500,
    createdAt: '2024-01-15',
  },
  enrollmentData: [
    { date: '2024-01-01', students: 20 },
    { date: '2024-01-15', students: 45 },
    { date: '2024-02-01', students: 78 },
    { date: '2024-02-15', students: 123 },
    { date: '2024-03-01', students: 189 },
    { date: '2024-03-15', students: 245 },
  ],
  engagementData: [
    { week: 'Week 1', views: 120, completions: 85, discussions: 24 },
    { week: 'Week 2', views: 145, completions: 102, discussions: 31 },
    { week: 'Week 3', views: 165, completions: 118, discussions: 28 },
    { week: 'Week 4', views: 189, completions: 134, discussions: 35 },
  ],
  completionRates: [
    { section: 'Introduction', completed: 92, total: 245 },
    { section: 'Calculus Basics', completed: 87, total: 245 },
    { section: 'Advanced Topics', completed: 72, total: 245 },
    { section: 'Applications', completed: 56, total: 245 },
  ],
  studentPerformance: [
    { range: '90-100%', students: 45, color: '#10b981' },
    { range: '80-89%', students: 67, color: '#3b82f6' },
    { range: '70-79%', students: 89, color: '#f59e0b' },
    { range: '60-69%', students: 32, color: '#ef4444' },
    { range: 'Below 60%', students: 12, color: '#8b5cf6' },
  ],
  topStudents: [
    { id: '1', name: 'Alice Johnson', progress: 95, score: 94, avatar: '' },
    { id: '2', name: 'Bob Smith', progress: 92, score: 91, avatar: '' },
    { id: '3', name: 'Carol Davis', progress: 89, score: 88, avatar: '' },
    { id: '4', name: 'David Wilson', progress: 87, score: 86, avatar: '' },
    { id: '5', name: 'Eva Brown', progress: 85, score: 84, avatar: '' },
  ],
  recentActivity: [
    { type: 'enrollment', student: 'John Doe', timestamp: '2 hours ago' },
    { type: 'completion', student: 'Jane Smith', lesson: 'Calculus Basics', timestamp: '3 hours ago' },
    { type: 'discussion', student: 'Mike Johnson', topic: 'Derivatives', timestamp: '5 hours ago' },
    { type: 'rating', student: 'Sarah Wilson', rating: 5, timestamp: '1 day ago' },
  ],
};

export default function CourseAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const course = mockCourseAnalytics.courseInfo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Course Analytics
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  {course.title} • {course.totalStudents} students
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 border-white/20 bg-white/80 shadow-sm backdrop-blur-sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="border-white/20 bg-white/80 shadow-sm backdrop-blur-sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              
              <Button variant="outline" className="border-white/20 bg-white/80 shadow-sm backdrop-blur-sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Enrollments</p>
                  <p className="text-3xl font-bold">{course.totalStudents}</p>
                  <div className="flex items-center space-x-1 text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-sm">+12% this month</span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-3xl font-bold">{course.completionRate}%</p>
                  <div className="flex items-center space-x-1 text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-sm">+5% this month</span>
                  </div>
                </div>
                <Award className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-3xl font-bold">{course.averageRating}</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= course.averageRating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {course.totalRating} reviews
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-3xl font-bold">${course.revenue.toLocaleString()}</p>
                  <div className="flex items-center space-x-1 text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-sm">+18% this month</span>
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="rounded-2xl border border-white/30 bg-white/80 p-2 shadow-lg backdrop-blur-xl">
            <TabsList className="grid w-full grid-cols-4 gap-1 bg-transparent">
              <TabsTrigger value="overview" className="rounded-xl">
                Overview
              </TabsTrigger>
              <TabsTrigger value="engagement" className="rounded-xl">
                Engagement
              </TabsTrigger>
              <TabsTrigger value="performance" className="rounded-xl">
                Performance
              </TabsTrigger>
              <TabsTrigger value="students" className="rounded-xl">
                Students
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Enrollment Growth</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockCourseAnalytics.enrollmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="students" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Section Completion Rates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockCourseAnalytics.completionRates.map((section, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{section.section}</span>
                          <span>{Math.round((section.completed / section.total) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(section.completed / section.total) * 100} 
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {section.completed} of {section.total} students completed
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Weekly Engagement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockCourseAnalytics.engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="views" fill="#3b82f6" name="Views" />
                      <Bar dataKey="completions" fill="#10b981" name="Completions" />
                      <Bar dataKey="discussions" fill="#f59e0b" name="Discussions" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {mockCourseAnalytics.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                          <div className={`h-2 w-2 rounded-full ${
                            activity.type === 'enrollment' ? 'bg-blue-500' :
                            activity.type === 'completion' ? 'bg-green-500' :
                            activity.type === 'discussion' ? 'bg-yellow-500' :
                            'bg-purple-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">{activity.student}</span>
                              {activity.type === 'enrollment' && ' enrolled in the course'}
                              {activity.type === 'completion' && ` completed ${activity.lesson}`}
                              {activity.type === 'discussion' && ` posted in ${activity.topic}`}
                              {activity.type === 'rating' && ` rated the course ${activity.rating} stars`}
                            </p>
                            <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Student Performance Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockCourseAnalytics.studentPerformance}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="students"
                        label={({ range, students }) => `${range}: ${students}`}
                      >
                        {mockCourseAnalytics.studentPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-4">
                    {mockCourseAnalytics.studentPerformance.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="h-4 w-4 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium">{item.range}</span>
                        </div>
                        <Badge>{item.students} students</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Top Performing Students</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCourseAnalytics.topStudents.map((student, index) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-4 rounded-lg bg-muted/30"
                    >
                      <div className="text-lg font-bold text-muted-foreground">
                        #{index + 1}
                      </div>
                      <Avatar>
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{student.name}</p>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Progress:</span>
                            <Progress value={student.progress} className="h-2 w-20" />
                            <span className="text-sm">{student.progress}%</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Score:</span>
                            <Badge variant="default">{student.score}%</Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}