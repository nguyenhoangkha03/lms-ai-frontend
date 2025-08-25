'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Edit3,
  Eye,
  Trash2,
  Video,
  FileText,
  Settings,
  ArrowLeft,
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

export default function CourseLessonsPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('order');

  // Mock lessons data - replace with actual API call
  const lessons = [
    {
      id: '1',
      title: 'Introduction to React',
      description: 'Learn the basics of React including components, props, and state',
      type: 'video',
      duration: 45,
      order: 1,
      status: 'published',
      viewCount: 156,
      completionRate: 87,
      sectionId: '1',
      sectionTitle: 'Getting Started',
    },
    {
      id: '2',
      title: 'State Management with Redux',
      description: 'Deep dive into Redux for managing application state',
      type: 'video',
      duration: 60,
      order: 2,
      status: 'published',
      viewCount: 142,
      completionRate: 79,
      sectionId: '1',
      sectionTitle: 'Getting Started',
    },
    {
      id: '3',
      title: 'Building Your First Component',
      description: 'Hands-on exercise to create a React component',
      type: 'exercise',
      duration: 30,
      order: 3,
      status: 'draft',
      viewCount: 0,
      completionRate: 0,
      sectionId: '2',
      sectionTitle: 'Practical Exercises',
    },
  ];

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'exercise':
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push(`/teacher/courses/${courseId}/edit`)}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Course Lessons
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Manage lessons for this course
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push(`/teacher/courses/${courseId}/lessons/create`)}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Lesson
              </Button>
              <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-white/20">
                <Settings className="mr-2 h-4 w-4" />
                Lesson Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-8 px-6 py-8">
        {/* Lesson Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Lessons</p>
                  <p className="text-2xl font-bold text-slate-800">{lessons.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Published</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {lessons.filter(l => l.status === 'published').length}
                  </p>
                </div>
                <PlayCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Duration</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {lessons.reduce((total, lesson) => total + lesson.duration, 0)}m
                  </p>
                </div>
                <Clock className="h-8 w-8 text-violet-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Avg. Completion</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {Math.round(lessons.reduce((total, lesson) => total + lesson.completionRate, 0) / lessons.length)}%
                  </p>
                </div>
                <Users className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search lessons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-36 bg-white/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order">Lesson Order</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="views">View Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons List */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
          <CardHeader>
            <CardTitle>Lessons ({filteredLessons.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLessons.map((lesson, index) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                        {getTypeIcon(lesson.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant="outline">Lesson {lesson.order}</Badge>
                          <Badge className={getStatusColor(lesson.status)}>
                            {lesson.status}
                          </Badge>
                          <Badge variant="secondary">{lesson.type}</Badge>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-3">
                          {lesson.description}
                        </p>
                        
                        <div className="flex items-center space-x-6 text-sm text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{lesson.duration} min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{lesson.viewCount} views</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{lesson.completionRate}% completion</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-slate-400">
                          Section: {lesson.sectionTitle}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/teacher/courses/${courseId}/lessons/${lesson.id}/edit`)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit Lesson
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}

              {filteredLessons.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">No lessons found</h3>
                  <p className="text-slate-500 mb-6">
                    {searchQuery ? 'Try adjusting your search criteria.' : 'Create your first lesson to get started.'}
                  </p>
                  <Button
                    onClick={() => router.push(`/teacher/courses/${courseId}/lessons/create`)}
                    className="bg-gradient-to-r from-emerald-500 to-green-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Lesson
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}