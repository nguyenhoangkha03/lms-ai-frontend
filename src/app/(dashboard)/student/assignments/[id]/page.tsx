'use client';

import React, { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  useGetStudentAssignmentQuery,
  useGetSubmissionQuery,
  useCreateSubmissionMutation,
  useUpdateSubmissionMutation,
  useDeleteSubmissionFileMutation,
  useDownloadAssignmentFileMutation,
  useGetSubmissionHistoryQuery,
} from '@/lib/redux/api/student-assignments-api';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Download,
  Upload,
  Trash2,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Paperclip,
  Award,
  BookOpen,
  Target,
  User,
  MessageSquare,
  History,
  Info,
  Send,
  Save,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const assignmentId = params.id as string;

  const [textSubmission, setTextSubmission] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: assignmentData,
    isLoading,
    error,
    refetch,
  } = useGetStudentAssignmentQuery(assignmentId);

  const {
    data: submission,
    isLoading: submissionLoading,
    refetch: refetchSubmission,
  } = useGetSubmissionQuery(assignmentId);

  const {
    data: submissionHistory,
    isLoading: historyLoading,
  } = useGetSubmissionHistoryQuery(assignmentId);

  const [createSubmission] = useCreateSubmissionMutation();
  const [updateSubmission] = useUpdateSubmissionMutation();
  const [deleteSubmissionFile] = useDeleteSubmissionFileMutation();
  const [downloadAssignmentFile] = useDownloadAssignmentFileMutation();

  React.useEffect(() => {
    if (submission?.textSubmission) {
      setTextSubmission(submission.textSubmission);
    }
  }, [submission]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitAssignment = async () => {
    if (!textSubmission.trim() && selectedFiles.length === 0) {
      toast.error('Vui lòng nhập nội dung hoặc tải lên file');
      return;
    }

    setIsSubmitting(true);
    try {
      if (submission) {
        await updateSubmission({
          assignmentId,
          data: {
            textSubmission: textSubmission.trim(),
            files: selectedFiles,
          },
        }).unwrap();
        toast.success('Đã cập nhật bài nộp thành công');
      } else {
        await createSubmission({
          assignmentId,
          textSubmission: textSubmission.trim(),
          files: selectedFiles,
        }).unwrap();
        toast.success('Đã nộp bài thành công');
      }
      
      setSelectedFiles([]);
      refetchSubmission();
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi nộp bài');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      const blob = await downloadAssignmentFile({
        assignmentId,
        fileId,
      }).unwrap();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Đã tải file thành công');
    } catch (error) {
      toast.error('Không thể tải file');
    }
  };

  const handleDeleteSubmissionFile = async (fileId: string) => {
    try {
      await deleteSubmissionFile({
        assignmentId,
        fileId,
      }).unwrap();
      
      toast.success('Đã xóa file thành công');
      refetchSubmission();
    } catch (error) {
      toast.error('Không thể xóa file');
    }
  };

  const getStatusBadge = (assignment: any, submission?: any) => {
    if (!submission) {
      const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();
      return isOverdue ? (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="mr-1 h-3 w-3" />
          Quá hạn
        </Badge>
      ) : (
        <Badge className="bg-yellow-100 text-yellow-800">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Chưa nộp
        </Badge>
      );
    }

    switch (submission.status) {
      case 'submitted':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Upload className="mr-1 h-3 w-3" />
            Đã nộp
          </Badge>
        );
      case 'graded':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Đã chấm
          </Badge>
        );
      case 'late':
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Nộp trễ
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <FileText className="mr-1 h-3 w-3" />
            Chưa rõ
          </Badge>
        );
    }
  };

  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Đã quá hạn';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) return `Còn ${diffDays} ngày`;
    if (diffHours > 0) return `Còn ${diffHours} giờ`;
    return 'Sắp hết hạn';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-red-600">
            Không thể tải bài tập
          </h2>
          <p className="mb-4 text-gray-600">
            Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
          </p>
          <Button onClick={() => refetch()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const assignment = assignmentData!;
  const requirements = assignment.requirements ? JSON.parse(assignment.requirements) : [];
  const attachments = assignment.attachments ? JSON.parse(assignment.attachments) : [];
  const canSubmit = assignment.canSubmit && new Date(assignment.dueDate || '') > new Date();

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{assignment.title}</h1>
            {getStatusBadge(assignment, submission)}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {assignment.courseName}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {assignment.instructorName}
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              {assignment.maxPoints} điểm
            </span>
            {assignment.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          {assignment.dueDate && (
            <div className={cn(
              "text-lg font-semibold",
              new Date(assignment.dueDate) < new Date() ? "text-red-600" :
              assignment.timeRemaining && assignment.timeRemaining < 86400000 ? "text-orange-600" :
              "text-gray-600"
            )}>
              {getTimeRemaining(assignment.dueDate)}
            </div>
          )}
          {submission?.score !== undefined && (
            <div className="flex items-center gap-2 mt-1">
              <Award className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">
                {submission.score}/{assignment.maxPoints}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Chi tiết</TabsTrigger>
              <TabsTrigger value="submission">Nộp bài</TabsTrigger>
              <TabsTrigger value="feedback">Phản hồi</TabsTrigger>
              <TabsTrigger value="history">Lịch sử</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Mô tả bài tập
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {assignment.description ? (
                      <p className="whitespace-pre-wrap">{assignment.description}</p>
                    ) : (
                      <p className="text-gray-500 italic">Không có mô tả</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              {assignment.instructions && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Hướng dẫn làm bài
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap">{assignment.instructions}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Requirements */}
              {requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Yêu cầu nộp bài
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {requirements.map((req: any, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>{req.description}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Attachments */}
              {attachments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Paperclip className="h-5 w-5" />
                      Tài liệu đính kèm
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {attachments.map((file: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadFile(file.id, file.name)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Tải về
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="submission" className="space-y-6">
              {canSubmit ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      {submission ? 'Cập nhật bài nộp' : 'Nộp bài tập'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Text Submission */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Nội dung bài làm
                      </label>
                      <Textarea
                        value={textSubmission}
                        onChange={(e) => setTextSubmission(e.target.value)}
                        placeholder="Nhập nội dung bài làm của bạn..."
                        rows={8}
                        className="w-full"
                      />
                    </div>

                    {/* File Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Tải lên file
                      </label>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Paperclip className="h-4 w-4 mr-2" />
                            Chọn file
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <span className="text-sm text-gray-500">
                            Hỗ trợ tất cả định dạng file
                          </span>
                        </div>

                        {/* Selected Files */}
                        {selectedFiles.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium">File đã chọn:</h4>
                            {selectedFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 border rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  <span className="text-sm">{file.name}</span>
                                  <span className="text-xs text-gray-500">
                                    ({formatFileSize(file.size)})
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveFile(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Current Submission Files */}
                        {submission?.files && submission.files.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium">File đã nộp:</h4>
                            {submission.files.map((file: any) => (
                              <div
                                key={file.id}
                                className="flex items-center justify-between p-2 border rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  <span className="text-sm">{file.name}</span>
                                  <span className="text-xs text-gray-500">
                                    ({formatFileSize(file.size)})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownloadFile(file.id, file.name)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Bạn có chắc chắn muốn xóa file "{file.name}"?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteSubmissionFile(file.id)}
                                        >
                                          Xóa
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setTextSubmission(submission?.textSubmission || '');
                          setSelectedFiles([]);
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Khôi phục
                      </Button>
                      <Button
                        onClick={handleSubmitAssignment}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        {submission ? 'Cập nhật bài nộp' : 'Nộp bài'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <XCircle className="mx-auto mb-4 h-16 w-16 text-red-400" />
                    <h3 className="mb-2 text-xl font-semibold">
                      Không thể nộp bài
                    </h3>
                    <p className="text-gray-600">
                      {assignment.dueDate && new Date(assignment.dueDate) < new Date()
                        ? 'Bài tập đã quá hạn nộp'
                        : 'Bài tập chưa được mở cho phép nộp'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="feedback" className="space-y-6">
              {submission?.status === 'graded' ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Phản hồi từ giảng viên
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Award className="h-8 w-8 text-yellow-500" />
                        <div>
                          <p className="font-semibold">Điểm số</p>
                          <p className="text-2xl font-bold text-green-600">
                            {submission.score}/{assignment.maxPoints}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Phần trăm</p>
                        <p className="text-lg font-semibold">
                          {Math.round((submission.score! / assignment.maxPoints) * 100)}%
                        </p>
                      </div>
                    </div>

                    {submission.feedback && (
                      <div>
                        <h4 className="font-semibold mb-2">Nhận xét chi tiết</h4>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="whitespace-pre-wrap">{submission.feedback}</p>
                        </div>
                      </div>
                    )}

                    {submission.rubricScores && submission.rubricScores.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Chi tiết chấm điểm</h4>
                        <div className="space-y-2">
                          {submission.rubricScores.map((score: any, index: number) => (
                            <div key={index} className="flex justify-between p-2 border rounded">
                              <span>Tiêu chí {index + 1}</span>
                              <span className="font-semibold">{score.points} điểm</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                    <h3 className="mb-2 text-xl font-semibold">
                      Chưa có phản hồi
                    </h3>
                    <p className="text-gray-600">
                      Bài tập chưa được chấm điểm. Vui lòng chờ giảng viên đánh giá.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Lịch sử nộp bài
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8" />
                          <div className="space-y-1 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : submissionHistory && submissionHistory.length > 0 ? (
                    <div className="space-y-4">
                      {submissionHistory.map((historyItem: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="flex-shrink-0">
                            {historyItem.status === 'graded' ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : historyItem.status === 'submitted' ? (
                              <Upload className="h-5 w-5 text-blue-500" />
                            ) : (
                              <Clock className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">
                              {historyItem.status === 'graded' ? 'Đã chấm điểm' :
                               historyItem.status === 'submitted' ? 'Đã nộp bài' :
                               'Đã cập nhật'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(historyItem.submittedAt || historyItem.updatedAt).toLocaleString('vi-VN')}
                            </p>
                            {historyItem.score !== undefined && (
                              <p className="text-sm">
                                Điểm: <span className="font-semibold">{historyItem.score}/{assignment.maxPoints}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <History className="mx-auto mb-2 h-8 w-8" />
                      <p>Chưa có lịch sử nộp bài</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Trạng thái</span>
                {getStatusBadge(assignment, submission)}
              </div>
              
              {assignment.dueDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hạn nộp</span>
                  <span className="text-sm font-medium">
                    {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Điểm tối đa</span>
                <span className="text-sm font-medium">{assignment.maxPoints}</span>
              </div>
              
              {submission?.submittedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Đã nộp lúc</span>
                  <span className="text-sm font-medium">
                    {new Date(submission.submittedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress */}
          {submission && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tiến độ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Hoàn thành</span>
                    <span>
                      {submission.status === 'graded' ? '100%' : 
                       submission.status === 'submitted' ? '90%' : '50%'}
                    </span>
                  </div>
                  <Progress 
                    value={
                      submission.status === 'graded' ? 100 : 
                      submission.status === 'submitted' ? 90 : 50
                    } 
                    className="h-2" 
                  />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Đã xem đề bài</span>
                  </div>
                  {submission.status !== 'not_submitted' && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Đã nộp bài</span>
                    </div>
                  )}
                  {submission.status === 'graded' && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Đã nhận phản hồi</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/student/courses/${assignment.courseId}`}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Đến khóa học
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/student/assignments">
                  <FileText className="mr-2 h-4 w-4" />
                  Tất cả bài tập
                </Link>
              </Button>
              
              {attachments.length > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    attachments.forEach((file: any) => {
                      handleDownloadFile(file.id, file.name);
                    });
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Tải tất cả file
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}