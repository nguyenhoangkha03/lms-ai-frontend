'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Award,
  PlayCircle,
  Calendar,
  MessageCircle,
  Target,
  Bell,
  Settings,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function StudentDashboardPage() {
  console.log('📱 Student Dashboard Page Loaded');
  
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const verified = searchParams.get('verified');
  const message = searchParams.get('message');

  useEffect(() => {
    if (verified === 'true' && message) {
      toast({
        title: 'Welcome to LMS!',
        description: decodeURIComponent(message),
      });
      
      // Clean up URL after showing toast
      if (window.history.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.delete('verified');
        url.searchParams.delete('message');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [verified, message, toast]);
  
  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Success Alert for Email Verification */}
      {verified === 'true' && message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>Welcome to LMS!</strong> {decodeURIComponent(message)}. You can now access all features of your dashboard.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center"
      >
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Student!</h1>
          <p className="text-muted-foreground">Ready to continue your learning journey?</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            <Calendar className="mr-1 h-3 w-3" />
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'short', 
              day: 'numeric' 
            })}
          </Badge>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Courses</p>
                <p className="text-2xl font-bold">5</p>
                <p className="text-xs text-green-600">+2 this month</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Study Time</p>
                <p className="text-2xl font-bold">24h</p>
                <p className="text-xs text-green-600">This week</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                <p className="text-2xl font-bold">78%</p>
                <Progress value={78} className="mt-1 h-1" />
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-purple-600">3 new badges</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Continue Learning - Takes 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-blue-600" />
                Continue Learning
              </CardTitle>
              <CardDescription>Pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-accent transition-colors">
                <div className="h-12 w-12 rounded bg-blue-100 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold">React Advanced Concepts</h4>
                  <p className="text-sm text-muted-foreground">Lesson 5: Context API & State Management</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <Progress value={75} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground">75%</span>
                  </div>
                </div>
                <Button size="sm">Continue</Button>
              </div>

              <div className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-accent transition-colors">
                <div className="h-12 w-12 rounded bg-green-100 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold">JavaScript Fundamentals</h4>
                  <p className="text-sm text-muted-foreground">Lesson 8: Async/Await & Promises</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <Progress value={50} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground">50%</span>
                  </div>
                </div>
                <Button size="sm">Continue</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/courses">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Courses
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/student/ai-tutor">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  AI Tutor Chat
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/student/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                View Schedule
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Award className="mr-2 h-4 w-4" />
                Achievements
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest learning activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <PlayCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Completed lesson: React Hooks</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Award className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Earned badge: JavaScript Master</p>
                  <p className="text-sm text-muted-foreground">1 day ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Asked AI tutor about async programming</p>
                  <p className="text-sm text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}