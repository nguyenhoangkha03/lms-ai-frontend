'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/lib/redux/hooks';
import { useGetCourseAssessmentsQuery } from '@/lib/redux/api/assessment-api';
import { useGetUserEnrollmentsQuery } from '@/lib/redux/api/course-api';
import { AssessmentCard } from '@/components/assessment/AssessmentCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Search,
  Clock,
  Trophy,
  Target,
  Filter,
  Calendar,
  BookOpen,
  Sparkles,
  ArrowRight,
  Brain,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AssessmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [mounted, setMounted] = useState(false);

  // Get enrolled courses
  const { user } = useAppSelector(state => state.auth);

  // Get user's enrolled courses
  const { data: enrollments = [], isLoading: enrollmentsLoading } =
    useGetUserEnrollmentsQuery({});

  const [selectedCourseId, setSelectedCourseId] = useState<string>('none');

  const { data: assessmentResponse, isLoading } = useGetCourseAssessmentsQuery(
    selectedCourseId,
    { skip: selectedCourseId === 'none' || !mounted }
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Extract assessments from response and ensure it's an array
  const assessments = Array.isArray(assessmentResponse)
    ? assessmentResponse
    : Array.isArray(assessmentResponse)
      ? assessmentResponse
      : [];

  console.log('assessmentResponse', assessmentResponse);

  // Filter assessments based on search and filters
  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch =
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === 'all' || assessment.assessmentType === selectedType;

    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'available' && assessment.canTakeNow) ||
      (selectedStatus === 'completed' &&
        assessment.attemptCount &&
        assessment.attemptCount >= assessment.maxAttempts) ||
      (selectedStatus === 'unavailable' && !assessment.isAvailable);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Group assessments by status
  const availableAssessments = filteredAssessments.filter(a => a.canTakeNow);
  const completedAssessments = filteredAssessments.filter(
    a => a.attemptCount && a.attemptCount > 0
  );
  const upcomingAssessments = filteredAssessments.filter(
    a => !a.isAvailable && (!a.attemptCount || a.attemptCount < a.maxAttempts)
  );

  const getStatsCards = () => {
    const totalAssessments = assessments.length;
    const availableCount = availableAssessments.length;
    const completedCount = completedAssessments.length;
    const upcomingCount = upcomingAssessments.length;

    return [
      {
        title: 'Total Assessments',
        value: totalAssessments,
        icon: <FileText className="h-4 w-4" />,
        color: 'text-blue-600 bg-blue-50',
      },
      {
        title: 'Available',
        value: availableCount,
        icon: <Target className="h-4 w-4" />,
        color: 'text-green-600 bg-green-50',
      },
      {
        title: 'Completed',
        value: completedCount,
        icon: <Trophy className="h-4 w-4" />,
        color: 'text-purple-600 bg-purple-50',
      },
      {
        title: 'Upcoming',
        value: upcomingCount,
        icon: <Calendar className="h-4 w-4" />,
        color: 'text-orange-600 bg-orange-50',
      },
    ];
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-lg">Please login to view assessments.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    // < className="container mx-auto space-y-6 py-6">
    <div className="min-h-screen bg-gradient-to-br">
      <div className="space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

          {/* Animated background blobs */}
          <motion.div
            className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-white/10 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />

          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                className="flex cursor-pointer items-center gap-2 text-emerald-200"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Brain className="h-5 w-5" />
                </motion.div>
                <span className="text-sm font-medium">Test Your Knowledge</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                className="text-4xl font-bold leading-tight lg:text-5xl"
              >
                Ready to <br />
                <motion.span
                  className="bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  prove yourself?
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
                className="text-lg text-emerald-100"
              >
                Take assessments, track progress, and showcase your skills.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
              className="flex flex-col items-end gap-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3">
                {selectedCourseId === 'none'
                  ? // Show placeholder when no course selected
                    [
                      {
                        title: 'Total Assessments',
                        value: '-',
                        icon: <FileText className="h-4 w-4" />,
                      },
                      {
                        title: 'Available',
                        value: '-',
                        icon: <Target className="h-4 w-4" />,
                      },
                      {
                        title: 'Completed',
                        value: '-',
                        icon: <Trophy className="h-4 w-4" />,
                      },
                      {
                        title: 'Upcoming',
                        value: '-',
                        icon: <Calendar className="h-4 w-4" />,
                      },
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        className="min-w-[100px] rounded-xl bg-white/10 p-3 text-center backdrop-blur-xl"
                        whileHover={{
                          scale: 1.05,
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 200,
                          delay: 0.8 + index * 0.1,
                          duration: 0.3,
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <div className="mb-2 flex items-center justify-center text-emerald-200">
                          {stat.icon}
                        </div>
                        <motion.div
                          className="mb-1 text-xl font-bold"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: 'spring',
                            stiffness: 200,
                            delay: 0.8 + index * 0.1,
                          }}
                        >
                          {stat.value}
                        </motion.div>
                        <motion.div
                          className="text-xs text-emerald-200"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                        >
                          {stat.title}
                        </motion.div>
                      </motion.div>
                    ))
                  : getStatsCards().map((stat, index) => (
                      <motion.div
                        key={index}
                        className="min-w-[100px] rounded-xl bg-white/10 p-3 text-center backdrop-blur-xl"
                        whileHover={{
                          scale: 1.05,
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 200,
                          delay: 0.8 + index * 0.1,
                          duration: 0.3,
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <div className="mb-2 flex items-center justify-center text-emerald-200">
                          {stat.icon}
                        </div>
                        <motion.div
                          className="mb-1 text-xl font-bold"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: 'spring',
                            stiffness: 200,
                            delay: 0.8 + index * 0.1,
                          }}
                        >
                          {stat.value}
                        </motion.div>
                        <motion.div
                          className="text-xs text-emerald-200"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                        >
                          {stat.title}
                        </motion.div>
                      </motion.div>
                    ))}
              </div>

              {/* CTA Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  size="lg"
                  className="rounded-full bg-white/20 px-8 text-white backdrop-blur-sm transition-all hover:bg-white/30"
                  asChild
                >
                  <Link href="/courses">
                    <motion.div
                      className="flex items-center"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Start Testing
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </motion.div>
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All courses</SelectItem>
                  {enrollments.map(enrollment => (
                    <SelectItem
                      key={enrollment.course.id}
                      value={enrollment.course.id}
                    >
                      {enrollment.course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Assessment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Assessments Tabs */}
        {selectedCourseId === 'none' ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold">
                Select a course to view assessments
              </h3>
              <p className="mb-4 text-muted-foreground">
                {enrollmentsLoading
                  ? 'Loading course list...'
                  : enrollments.length === 0
                    ? 'You are not enrolled in any courses yet. Please enroll in a course to view assessments.'
                    : 'Please select a course from the filter above to view available assessments'}
              </p>
              {!enrollmentsLoading && enrollments.length > 0 && (
                <p className="text-sm text-gray-500">
                  💡 Tip: You can also access assessments directly from each
                  course's learning page
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="available" className="space-y-4">
            <TabsList>
              <TabsTrigger
                value="available"
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Available ({availableAssessments.length})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="flex items-center gap-2"
              >
                <Trophy className="h-4 w-4" />
                Completed ({completedAssessments.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming ({upcomingAssessments.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                All ({filteredAssessments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-4">
              {isLoading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="h-64">
                      <CardContent className="p-6">
                        <div className="animate-pulse space-y-4">
                          <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                          <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                          <div className="h-20 rounded bg-gray-200"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : availableAssessments.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {availableAssessments.map(assessment => (
                    <AssessmentCard
                      key={assessment.id}
                      assessment={assessment}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Target className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium">
                      No assessments available
                    </p>
                    <p className="text-muted-foreground">
                      Assessments will appear here when they are available
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedAssessments.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedAssessments.map(assessment => (
                    <AssessmentCard
                      key={assessment.id}
                      assessment={assessment}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium">
                      No completed assessments
                    </p>
                    <p className="text-muted-foreground">
                      Completed assessments will appear here
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingAssessments.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingAssessments.map(assessment => (
                    <AssessmentCard
                      key={assessment.id}
                      assessment={assessment}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium">
                      No upcoming assessments
                    </p>
                    <p className="text-muted-foreground">
                      Upcoming assessments will appear here
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {filteredAssessments.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredAssessments.map(assessment => (
                    <AssessmentCard
                      key={assessment.id}
                      assessment={assessment}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium">No assessments found</p>
                    <p className="text-muted-foreground">
                      Try changing the filters or search terms
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
