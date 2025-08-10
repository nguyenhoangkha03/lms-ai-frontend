'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  MessageSquare,
  Phone,
  Calendar,
  Clock,
  TrendingDown,
  BookOpen,
  Target,
  Activity,
  RefreshCw,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  MoreHorizontal,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Import API hooks
import {
  useGetAtRiskStudentsQuery,
  useContactStudentMutation,
} from '@/lib/redux/api/teacher-dashboard-api';

interface AtRiskStudentsWidgetProps {
  students?: any[];
  isLoading?: boolean;
  className?: string;
}

const getRiskLevelColor = (level: string) => {
  switch (level) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getRiskIcon = (level: string) => {
  switch (level) {
    case 'critical':
      return <XCircle className="h-4 w-4" />;
    case 'high':
      return <AlertTriangle className="h-4 w-4" />;
    case 'medium':
      return <TrendingDown className="h-4 w-4" />;
    case 'low':
      return <Activity className="h-4 w-4" />;
    default:
      return <CheckCircle className="h-4 w-4" />;
  }
};

export function AtRiskStudentsWidget({
  students: propStudents,
  isLoading: propLoading,
  className,
}: AtRiskStudentsWidgetProps) {
  const { toast } = useToast();
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubject, setContactSubject] = useState('');

  // API calls
  const {
    data: apiStudents,
    isLoading: apiLoading,
    error,
    refetch,
  } = useGetAtRiskStudentsQuery({
    riskLevel: riskFilter !== 'all' ? riskFilter : undefined,
    limit: 20,
  });

  const [contactStudent, { isLoading: isContacting }] =
    useContactStudentMutation();

  // Use prop data if provided, otherwise use API data
  const students = propStudents || apiStudents || [];
  const isLoading = propLoading || apiLoading;

  const handleContactStudent = async () => {
    if (!selectedStudent || !contactMessage.trim() || !contactSubject.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in both subject and message fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await contactStudent({
        studentId: selectedStudent.studentId,
        message: contactMessage,
        subject: contactSubject,
      }).unwrap();

      toast({
        title: 'Message Sent',
        description: `Your message has been sent to ${selectedStudent.studentName}.`,
      });

      setContactDialogOpen(false);
      setContactMessage('');
      setContactSubject('');
      setSelectedStudent(null);
    } catch (error) {
      toast({
        title: 'Failed to Send',
        description: 'Unable to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const openContactDialog = (student: any) => {
    setSelectedStudent(student);
    setContactSubject(
      `Follow-up regarding ${student.coursesAffected[0]?.courseName || 'your progress'}`
    );
    setContactDialogOpen(true);
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            At-Risk Students
          </CardTitle>
          <CardDescription>
            Failed to load at-risk students data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                At-Risk Students
                {students.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {students.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Students who may need additional support or intervention
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={refetch} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {students.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
              <h3 className="mb-2 text-lg font-medium text-green-900">
                Great News!
              </h3>
              <p className="text-green-600">
                No students are currently at risk. All students are performing
                well.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {students.map(student => (
                <motion.div
                  key={student.studentId}
                  layout
                  className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start gap-4">
                    {/* Student Avatar and Basic Info */}
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={student.avatar}
                        alt={student.studentName}
                      />
                      <AvatarFallback>
                        {student.studentName
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold">
                            {student.studentName}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {student.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`border ${getRiskLevelColor(student.riskLevel)}`}
                            variant="outline"
                          >
                            {getRiskIcon(student.riskLevel)}
                            <span className="ml-1 capitalize">
                              {student.riskLevel} Risk
                            </span>
                          </Badge>
                          <div className="text-right">
                            <p className="text-lg font-bold text-orange-600">
                              {student.riskScore}/100
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Risk Score
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Risk Factors */}
                      <div className="mb-3">
                        <p className="mb-2 text-sm font-medium">
                          Primary Risk Factors:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {student.riskFactors
                            .slice(0, 3)
                            .map((factor: any, index: any) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className={`text-xs ${
                                  factor.severity === 'high'
                                    ? 'border-red-200 text-red-700'
                                    : factor.severity === 'medium'
                                      ? 'border-yellow-200 text-yellow-700'
                                      : 'border-blue-200 text-blue-700'
                                }`}
                              >
                                {factor.factor}
                              </Badge>
                            ))}
                          {student.riskFactors.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{student.riskFactors.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Affected Courses */}
                      <div className="mb-3">
                        <p className="mb-2 text-sm font-medium">
                          Affected Courses:
                        </p>
                        <div className="space-y-2">
                          {student.coursesAffected
                            .slice(0, 2)
                            .map((course: any) => (
                              <div
                                key={course.courseId}
                                className="flex items-center gap-2"
                              >
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {course.courseName}
                                </span>
                                <Progress
                                  value={course.progress}
                                  className="h-2 max-w-24 flex-1"
                                />
                                <span className="text-xs text-muted-foreground">
                                  {course.progress}%
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatLastActivity(course.lastActivity)}
                                </span>
                              </div>
                            ))}
                          {student.coursesAffected.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{student.coursesAffected.length - 2} more courses
                              affected
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Recommended Actions */}
                      <div className="mb-4">
                        <p className="mb-2 text-sm font-medium">
                          Recommended Actions:
                        </p>
                        <div className="space-y-1">
                          {student.recommendedActions
                            .slice(0, 2)
                            .map((action: any, index: any) => (
                              <div
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <Target className="mt-0.5 h-3 w-3 flex-shrink-0 text-blue-500" />
                                <div className="text-sm">
                                  <span className="font-medium">
                                    {action.action}
                                  </span>
                                  <p className="text-xs text-muted-foreground">
                                    {action.description}
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`ml-auto text-xs ${
                                    action.priority === 'immediate'
                                      ? 'border-red-200 text-red-700'
                                      : action.priority === 'urgent'
                                        ? 'border-orange-200 text-orange-700'
                                        : 'border-yellow-200 text-yellow-700'
                                  }`}
                                >
                                  {action.priority}
                                </Badge>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Last Contact & Actions */}
                      <div className="flex items-center justify-between border-t pt-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Last contact:{' '}
                            {student.lastContactDate
                              ? formatLastActivity(student.lastContactDate)
                              : 'Never'}
                          </div>
                          {student.interventionHistory?.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {student.interventionHistory.length} interventions
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => openContactDialog(student)}
                            size="sm"
                            variant="outline"
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Contact
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>
                                Quick Actions
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Phone className="mr-2 h-4 w-4" />
                                Schedule Call
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                Create Meeting
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Contacted
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Student Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Student</DialogTitle>
            <DialogDescription>
              Send a message to {selectedStudent?.studentName} regarding their
              academic progress.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={contactSubject}
                onChange={e => setContactSubject(e.target.value)}
                placeholder="Enter message subject"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={contactMessage}
                onChange={e => setContactMessage(e.target.value)}
                placeholder="Write your message here..."
                rows={6}
                className="mt-1"
              />
            </div>

            {selectedStudent && (
              <div className="rounded-lg bg-muted p-4">
                <h4 className="mb-2 font-medium">Student Context:</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Risk Level:</span>{' '}
                    <Badge
                      className={getRiskLevelColor(selectedStudent.riskLevel)}
                      variant="outline"
                    >
                      {selectedStudent.riskLevel}
                    </Badge>
                  </p>
                  <p>
                    <span className="font-medium">Primary Issues:</span>{' '}
                    {selectedStudent.riskFactors
                      .slice(0, 2)
                      .map((f: any) => f.factor)
                      .join(', ')}
                  </p>
                  <p>
                    <span className="font-medium">Courses Affected:</span>{' '}
                    {selectedStudent.coursesAffected.length} courses
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setContactDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleContactStudent}
              disabled={
                isContacting || !contactMessage.trim() || !contactSubject.trim()
              }
            >
              {isContacting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
