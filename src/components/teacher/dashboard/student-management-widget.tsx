'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Mail,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  GraduationCap,
  MessageSquare,
  MoreHorizontal,
  Eye,
  BookOpen,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  useGetStudentOverviewQuery,
  useContactStudentMutation,
  useBulkStudentActionMutation,
} from '@/lib/redux/api/teacher-dashboard-api';

interface StudentManagementWidgetProps {
  timeFilter: string;
}

export const StudentManagementWidget: React.FC<
  StudentManagementWidgetProps
> = ({ timeFilter }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    studentId: '',
  });

  // API queries
  const {
    data: students = [],
    isLoading,
    error,
  } = useGetStudentOverviewQuery({
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: 50,
  });

  const [contactStudent, { isLoading: isContacting }] =
    useContactStudentMutation();
  const [bulkStudentAction, { isLoading: isBulkProcessing }] =
    useBulkStudentActionMutation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'at_risk':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'excelling':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatLastActivity = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleContactStudent = async () => {
    try {
      await contactStudent({
        studentId: contactForm.studentId,
        subject: contactForm.subject,
        message: contactForm.message,
      }).unwrap();

      setIsContactDialogOpen(false);
      setContactForm({ subject: '', message: '', studentId: '' });
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent to the student.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'No Students Selected',
        description: 'Please select students before performing bulk actions.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await bulkStudentAction({
        studentIds: selectedStudents,
        action: action as any,
        data: {},
      }).unwrap();

      setSelectedStudents([]);
      toast({
        title: 'Bulk Action Completed',
        description: `Action "${action}" has been applied to ${selectedStudents.length} students.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to perform bulk action. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Student Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="flex animate-pulse items-center space-x-4"
              >
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
                <div className="h-8 w-20 rounded bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold">
            Unable to Load Students
          </h3>
          <p className="text-muted-foreground">
            There was an error loading student data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Student Management</span>
          </CardTitle>
          <CardDescription>
            Manage your students, track progress, and identify those who need
            support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
                <SelectItem value="excelling">Excelling</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedStudents.length > 0 && (
            <div className="mb-4 flex items-center space-x-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <span className="text-sm font-medium">
                {selectedStudents.length} student
                {selectedStudents.length !== 1 ? 's' : ''} selected
              </span>
              <Separator orientation="vertical" className="h-4" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('send_reminder')}
                disabled={isBulkProcessing}
              >
                Send Reminder
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('provide_additional_resources')}
                disabled={isBulkProcessing}
              >
                Send Resources
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedStudents([])}
              >
                Clear Selection
              </Button>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <div className="text-lg font-bold text-green-600">
                {students.filter(s => s.status === 'active').length}
              </div>
              <div className="text-xs text-muted-foreground">
                Active Students
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <div className="text-lg font-bold text-orange-600">
                {students.filter(s => s.status === 'at_risk').length}
              </div>
              <div className="text-xs text-muted-foreground">At Risk</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <div className="text-lg font-bold text-blue-600">
                {students.filter(s => s.status === 'excelling').length}
              </div>
              <div className="text-xs text-muted-foreground">Excelling</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <div className="text-lg font-bold text-purple-600">
                {Math.round(
                  students.reduce((sum, s) => sum + s.averageScore, 0) /
                    students.length || 0
                )}
                %
              </div>
              <div className="text-xs text-muted-foreground">Avg Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardContent className="p-0">
          <div className="space-y-0">
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.studentId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b p-6 transition-colors last:border-b-0 hover:bg-muted/50"
              >
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedStudents.includes(student.studentId)}
                    onCheckedChange={checked => {
                      if (checked) {
                        setSelectedStudents([
                          ...selectedStudents,
                          student.studentId,
                        ]);
                      } else {
                        setSelectedStudents(
                          selectedStudents.filter(
                            id => id !== student.studentId
                          )
                        );
                      }
                    }}
                  />

                  <Avatar className="h-12 w-12">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback>
                      {student.studentName
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center space-x-2">
                      <h3 className="truncate text-sm font-semibold">
                        {student.studentName}
                      </h3>
                      <Badge className={getStatusColor(student.status)}>
                        {student.status.replace('_', ' ')}
                      </Badge>
                      {student.achievements > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <GraduationCap className="mr-1 h-3 w-3" />
                          {student.achievements}
                        </Badge>
                      )}
                    </div>

                    <div className="mb-2 flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{student.email}</span>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{student.enrolledCourses} courses</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          Last active:{' '}
                          {formatLastActivity(student.lastActivity)}
                        </span>
                      </div>
                    </div>

                    {/* Progress and Score */}
                    <div className="flex items-center space-x-6">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span>Overall Progress</span>
                          <span className="font-medium">
                            {Math.round(student.overallProgress)}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-1.5 rounded-full bg-blue-500"
                            style={{ width: `${student.overallProgress}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm font-semibold">
                          {Math.round(student.averageScore)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Avg Score
                        </div>
                      </div>
                    </div>

                    {/* Risk Factors */}
                    {student.riskFactors && student.riskFactors.length > 0 && (
                      <div className="mt-2 flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                        <span className="text-xs text-orange-600">
                          Risk factors:{' '}
                          {student.riskFactors.slice(0, 2).join(', ')}
                          {student.riskFactors.length > 2 &&
                            ` +${student.riskFactors.length - 2} more`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setContactForm({
                          ...contactForm,
                          studentId: student.studentId,
                          subject: `Follow up - ${student.studentName}`,
                        });
                        setIsContactDialogOpen(true);
                      }}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/teacher/students/${student.studentId}`
                            )
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/teacher/students/${student.studentId}/progress`
                            )
                          }
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          View Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Course Progress Details */}
                {student.coursesData && student.coursesData.length > 0 && (
                  <div className="mt-4 pl-16">
                    <div className="mb-2 text-xs font-medium text-muted-foreground">
                      Course Progress:
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {student.coursesData.slice(0, 3).map(course => (
                        <div
                          key={course.courseId}
                          className="rounded bg-muted/30 p-2 text-xs"
                        >
                          <div className="truncate font-medium">
                            {course.courseName}
                          </div>
                          <div className="flex items-center justify-between">
                            <span>{Math.round(course.progress)}% progress</span>
                            <span>{Math.round(course.score)}% score</span>
                          </div>
                        </div>
                      ))}
                      {student.coursesData.length > 3 && (
                        <div className="flex items-center justify-center rounded bg-muted/30 p-2 text-xs">
                          +{student.coursesData.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No Students Found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? `No students match "${searchTerm}"`
                  : `No students found with the current filters`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Student Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Student</DialogTitle>
            <DialogDescription>
              Send a message to the selected student.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={contactForm.subject}
                onChange={e =>
                  setContactForm({ ...contactForm, subject: e.target.value })
                }
                placeholder="Enter message subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={contactForm.message}
                onChange={e =>
                  setContactForm({ ...contactForm, message: e.target.value })
                }
                placeholder="Enter your message"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsContactDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleContactStudent}
                disabled={
                  isContacting || !contactForm.subject || !contactForm.message
                }
              >
                {isContacting ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
