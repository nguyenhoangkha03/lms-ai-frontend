'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  User,
  BookOpen,
  Star,
  ArrowUpDown,
  MoreHorizontal,
  GraduationCap,
  BarChart3,
  RefreshCw,
  FileCheck,
  MessageSquare,
  Upload,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  useGetAllTeacherSubmissionsQuery,
  useGetSubmissionStatisticsQuery,
  TeacherSubmission,
} from '@/lib/redux/api/teacher-submissions-api';

// Remove mock data - will use real API data

export default function SubmissionsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState('all');
  const [sortField, setSortField] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState('all');
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  // API hooks
  const {
    data: submissionsData,
    isLoading,
    isError,
    refetch,
  } = useGetAllTeacherSubmissionsQuery({
    courseId: selectedCourse === 'all' ? undefined : selectedCourse,
    assignmentId: selectedAssignment === 'all' ? undefined : selectedAssignment,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    limit,
    offset,
  });

  const {
    data: statisticsData,
    isLoading: isLoadingStats,
  } = useGetSubmissionStatisticsQuery();

  // Get submissions from API
  const submissions = submissionsData?.submissions || [];
  
  // Client-side filtering for search (since API handles main filters)
  const filteredSubmissions = submissions.filter(submission => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return submission.student.name.toLowerCase().includes(searchLower) ||
           submission.assignmentTitle.toLowerCase().includes(searchLower) ||
           submission.student.email.toLowerCase().includes(searchLower);
  });

  // Client-side sorting
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    let aValue: any = a[sortField as keyof TeacherSubmission];
    let bValue: any = b[sortField as keyof TeacherSubmission];
    
    if (sortField === 'student.name') {
      aValue = a.student.name;
      bValue = b.student.name;
    }
    
    if (typeof aValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800';
      case 'graded':
        return 'bg-emerald-100 text-emerald-800';
      case 'needs_revision':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Clock className="h-4 w-4" />;
      case 'in_review':
        return <Eye className="h-4 w-4" />;
      case 'graded':
        return <CheckCircle className="h-4 w-4" />;
      case 'needs_revision':
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleGradeSubmission = (submissionId: string, assignmentId: string) => {
    router.push(`/teacher/assignments/${assignmentId}/grade?submissionId=${submissionId}`);
  };

  const handleViewSubmission = (submissionId: string) => {
    toast({
      title: 'View Submission',
      description: `Opening submission ${submissionId}...`,
    });
  };

  const handleDownloadAll = (submissionId: string) => {
    toast({
      title: 'Download Started',
      description: 'All files are being downloaded...',
    });
  };

  // Statistics from API or fallback calculations
  const stats = statisticsData || {
    total: submissions.length,
    pendingReview: submissions.filter(s => s.status === 'pending_review').length,
    inReview: submissions.filter(s => s.status === 'in_review').length,
    graded: submissions.filter(s => s.status === 'graded').length,
    needsRevision: submissions.filter(s => s.status === 'needs_revision').length,
    lateSubmissions: submissions.filter(s => s.isLate).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg">
                <FileCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Submissions Management
                </h1>
                <p className="text-slate-600">
                  Review and grade student submissions across all courses
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                className="bg-white/60 backdrop-blur-sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Loading...' : 'Refresh'}
              </Button>
              <Button variant="outline" className="bg-white/60 backdrop-blur-sm">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {isLoadingStats ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                <CardContent className="p-4 text-center">
                  <div className="h-8 bg-slate-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
                  <div className="text-sm text-slate-600">Total</div>
                </CardContent>
              </Card>
          
          <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingReview}</div>
              <div className="text-sm text-slate-600">Pending</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.inReview}</div>
              <div className="text-sm text-slate-600">In Review</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{stats.graded}</div>
              <div className="text-sm text-slate-600">Graded</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.needsRevision}</div>
              <div className="text-sm text-slate-600">Revision</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">{stats.lateSubmissions}</div>
              <div className="text-sm text-slate-600">Late</div>
            </CardContent>
          </Card>
            </>
          )}
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search students, assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="course_1">Machine Learning</SelectItem>
                  <SelectItem value="course_2">Data Science</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Assignments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignments</SelectItem>
                  <SelectItem value="assign_1">Linear Regression</SelectItem>
                  <SelectItem value="assign_2">Neural Network</SelectItem>
                  <SelectItem value="assign_3">Data Preprocessing</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="graded">Graded</SelectItem>
                  <SelectItem value="needs_revision">Needs Revision</SelectItem>
                </SelectContent>
              </Select>

              <Select value={`${sortField}_${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('_');
                setSortField(field);
                setSortOrder(order as 'asc' | 'desc');
              }}>
                <SelectTrigger>
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submittedAt_desc">Latest First</SelectItem>
                  <SelectItem value="submittedAt_asc">Oldest First</SelectItem>
                  <SelectItem value="student.name_asc">Student A-Z</SelectItem>
                  <SelectItem value="student.name_desc">Student Z-A</SelectItem>
                  <SelectItem value="dueDate_asc">Due Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table */}
        <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Submissions ({sortedSubmissions.length})</span>
              </div>
              <div className="text-sm text-slate-600">
                {sortedSubmissions.filter(s => s.status === 'pending_review' || s.status === 'in_review').length} need review
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isError ? (
              <div className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Error loading submissions</h3>
                <p className="text-slate-500 mb-4">Unable to load submissions data. Please try again.</p>
                <Button onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>AI Check</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSubmissions.map((submission) => (
                    <TableRow key={submission.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={submission.student.avatar || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white text-xs">
                              {submission.student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-800">{submission.student.name}</p>
                            <p className="text-xs text-slate-600">{submission.student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-800">{submission.assignmentTitle}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Attempt {submission.attempt}/{submission.maxAttempts}
                            </Badge>
                            {submission.isLate && (
                              <Badge className="bg-red-100 text-red-800 text-xs">Late</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-700">{submission.courseName}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <p className="text-sm text-slate-800">{formatDate(submission.submittedAt)}</p>
                          <p className="text-xs text-slate-500">Due: {formatDate(submission.dueDate)}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={`${getStatusColor(submission.status)} flex items-center space-x-1`}>
                          {getStatusIcon(submission.status)}
                          <span className="capitalize">
                            {submission.status.replace('_', ' ')}
                          </span>
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        {submission.currentGrade !== null ? (
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-amber-500" />
                            <span className="font-semibold">
                              {submission.currentGrade}/{submission.maxScore}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">Not graded</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <span className="text-xs">Orig: {submission.aiCheck.plagiarismScore}%</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs">Quality: {submission.aiCheck.qualityScore}%</span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewSubmission(submission.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Submission
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleGradeSubmission(submission.id, submission.assignmentId)}>
                              <Star className="mr-2 h-4 w-4" />
                              Grade Assignment
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadAll(submission.id)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download Files
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Message Student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {isLoading && (
                <div className="p-8 text-center">
                  <RefreshCw className="h-8 w-8 text-slate-400 mx-auto mb-4 animate-spin" />
                  <p className="text-slate-500">Loading submissions...</p>
                </div>
              )}
              
              {!isLoading && sortedSubmissions.length === 0 && (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">No submissions found</h3>
                  <p className="text-slate-500">Try adjusting your filters to see more results.</p>
                </div>
              )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}