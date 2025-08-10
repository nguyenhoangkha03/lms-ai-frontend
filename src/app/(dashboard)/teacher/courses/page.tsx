'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  PlayCircle,
  Clock,
  Star,
  TrendingUp,
  Edit3,
  Eye,
  Copy,
  Archive,
  Trash2,
  BarChart3,
  Calendar,
  FileText,
  Settings,
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
import { useRouter } from 'next/navigation';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  status: 'draft' | 'published' | 'archived';
  category: string;
  price: number;
  studentsCount: number;
  lessonsCount: number;
  completionRate: number;
  rating: number;
  reviewsCount: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Machine Learning Fundamentals',
    description: 'Complete introduction to machine learning concepts and algorithms',
    status: 'published',
    category: 'Technology',
    price: 199000,
    studentsCount: 156,
    lessonsCount: 24,
    completionRate: 78,
    rating: 4.8,
    reviewsCount: 45,
    revenue: 31044000,
    createdAt: '2024-01-15',
    updatedAt: '2024-03-10',
  },
  {
    id: '2',
    title: 'Advanced Python Programming',
    description: 'Deep dive into advanced Python concepts and best practices',
    status: 'published',
    category: 'Programming',
    price: 299000,
    studentsCount: 89,
    lessonsCount: 18,
    completionRate: 65,
    rating: 4.6,
    reviewsCount: 32,
    revenue: 26611000,
    createdAt: '2024-02-20',
    updatedAt: '2024-03-15',
  },
  {
    id: '3',
    title: 'Data Science Bootcamp',
    description: 'Comprehensive data science course with hands-on projects',
    status: 'draft',
    category: 'Data Science',
    price: 399000,
    studentsCount: 0,
    lessonsCount: 32,
    completionRate: 0,
    rating: 0,
    reviewsCount: 0,
    revenue: 0,
    createdAt: '2024-03-01',
    updatedAt: '2024-03-20',
  },
];

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

export default function TeacherCoursesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'published' && course.status === 'published') ||
                      (activeTab === 'draft' && course.status === 'draft') ||
                      (activeTab === 'archived' && course.status === 'archived');
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'draft':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'archived':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Course Management
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Create, manage, and analyze your courses
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push('/teacher/courses/create')}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Button>
              <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-white/20">
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
        {/* Course Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Courses</p>
                  <p className="text-2xl font-bold text-slate-800">{mockCourses.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Students</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {mockCourses.reduce((sum, course) => sum + course.studentsCount, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {formatCurrency(mockCourses.reduce((sum, course) => sum + course.revenue, 0))}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-violet-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Avg. Rating</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {(mockCourses.reduce((sum, course) => sum + course.rating, 0) / mockCourses.length).toFixed(1)}
                  </p>
                </div>
                <Star className="h-8 w-8 text-amber-500" />
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
                      placeholder="Search courses..."
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
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-36 bg-white/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="updated">Last Updated</SelectItem>
                      <SelectItem value="created">Created Date</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Course Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/30">
              <TabsList className="grid w-full grid-cols-4 bg-transparent gap-1">
                <TabsTrigger value="all" className="rounded-xl">All Courses</TabsTrigger>
                <TabsTrigger value="published" className="rounded-xl">Published</TabsTrigger>
                <TabsTrigger value="draft" className="rounded-xl">Draft</TabsTrigger>
                <TabsTrigger value="archived" className="rounded-xl">Archived</TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-6">
              <TabsContent value={activeTab} className="space-y-6 mt-0">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                  {filteredCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="group bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <Badge className={getStatusColor(course.status)}>
                              {course.status}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.push(`/teacher/courses/${course.id}/edit`)}>
                                  <Edit3 className="mr-2 h-4 w-4" />
                                  Edit Course
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <BarChart3 className="mr-2 h-4 w-4" />
                                  Analytics
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Archive className="mr-2 h-4 w-4" />
                                  Archive
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <CardTitle className="text-lg line-clamp-2 text-slate-800">
                            {course.title}
                          </CardTitle>
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {course.description}
                          </p>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">{course.studentsCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <PlayCircle className="h-4 w-4 text-emerald-500" />
                              <span className="font-medium">{course.lessonsCount} lessons</span>
                            </div>
                          </div>

                          {course.status === 'published' && (
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-amber-500" />
                                <span className="font-medium">{course.rating}</span>
                                <span className="text-slate-500">({course.reviewsCount})</span>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-emerald-600">
                                  {formatCurrency(course.revenue)}
                                </p>
                                <p className="text-xs text-slate-500">Revenue</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-white/20">
                            <span className="text-xs text-slate-500">
                              Updated {new Date(course.updatedAt).toLocaleDateString()}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => router.push(`/teacher/courses/${course.id}/edit`)}
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                            >
                              Manage
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {filteredCourses.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">No courses found</h3>
                    <p className="text-slate-500 mb-6">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria.'
                        : 'Create your first course to get started.'
                      }
                    </p>
                    <Button
                      onClick={() => router.push('/teacher/courses/create')}
                      className="bg-gradient-to-r from-emerald-500 to-green-600"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Course
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