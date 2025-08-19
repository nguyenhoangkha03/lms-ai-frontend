'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Video,
  FileText,
  Image,
  Music,
  Download,
  Trash2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Eye,
  Check,
  X,
  Clock,
  File,
  Link,
  Plus,
  Folder,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  useUploadLessonVideoMutation,
  useUploadLessonFilesMutation,
  useGetLessonFilesQuery,
  useDeleteLessonFileMutation,
  Lesson,
  CourseSection,
} from '@/lib/redux/api/teacher-lessons-api';

interface ContentUploaderProps {
  courseId: string;
  sections: CourseSection[];
  onContentChange: () => void;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  lessonId?: string;
  type: 'video' | 'document' | 'image' | 'audio';
}

interface VideoUploadData {
  lessonId: string;
  title: string;
  description?: string;
  file: File;
}

export default function ContentUploader({ 
  courseId, 
  sections, 
  onContentChange 
}: ContentUploaderProps) {
  const { toast } = useToast();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [videoUploadData, setVideoUploadData] = useState<VideoUploadData | null>(null);
  const [activeTab, setActiveTab] = useState('videos');

  // API hooks
  const [uploadVideo] = useUploadLessonVideoMutation();
  const [uploadFiles] = useUploadLessonFilesMutation();
  const [deleteFile] = useDeleteLessonFileMutation();

  const getAllLessons = () => {
    return sections.flatMap(section => 
      section.lessons?.map(lesson => ({
        ...lesson,
        sectionTitle: section.title
      })) || []
    );
  };

  const getFileTypeIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
        return <Video className="h-5 w-5 text-blue-500" />;
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-5 w-5 text-purple-500" />;
      case 'mp3':
      case 'wav':
      case 'aac':
        return <Music className="h-5 w-5 text-orange-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleVideoUpload = async (lessonId: string, videoFile: File) => {
    try {
      const formData = new FormData();
      formData.append('video', videoFile);

      // Add to upload progress
      const progressId = Date.now().toString();
      setUploadProgress(prev => [...prev, {
        fileName: videoFile.name,
        progress: 0,
        status: 'uploading',
        lessonId,
        type: 'video'
      }]);

      // Simulate upload progress (replace with real upload progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => 
          prev.map(item => 
            item.fileName === videoFile.name && item.status === 'uploading'
              ? { ...item, progress: Math.min(item.progress + 10, 90) }
              : item
          )
        );
      }, 200);

      await uploadVideo({ lessonId, video: formData }).unwrap();

      clearInterval(progressInterval);
      setUploadProgress(prev => 
        prev.map(item => 
          item.fileName === videoFile.name
            ? { ...item, progress: 100, status: 'completed' }
            : item
        )
      );

      toast({
        title: 'Video uploaded successfully',
        description: `${videoFile.name} has been uploaded to the lesson.`,
      });

      onContentChange();
    } catch (error: any) {
      setUploadProgress(prev => 
        prev.map(item => 
          item.fileName === videoFile.name
            ? { ...item, status: 'error' }
            : item
        )
      );

      toast({
        title: 'Upload failed',
        description: error?.data?.message || 'Failed to upload video',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (lessonId: string, files: FileList) => {
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      // Add to upload progress
      Array.from(files).forEach(file => {
        setUploadProgress(prev => [...prev, {
          fileName: file.name,
          progress: 0,
          status: 'uploading',
          lessonId,
          type: file.type.startsWith('image/') ? 'image' : 
                file.type.startsWith('audio/') ? 'audio' : 'document'
        }]);
      });

      await uploadFiles({ lessonId, files: formData }).unwrap();

      // Update progress to completed
      setUploadProgress(prev => 
        prev.map(item => 
          Array.from(files).some(file => file.name === item.fileName)
            ? { ...item, progress: 100, status: 'completed' }
            : item
        )
      );

      toast({
        title: 'Files uploaded successfully',
        description: `${files.length} file(s) uploaded to the lesson.`,
      });

      onContentChange();
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error?.data?.message || 'Failed to upload files',
        variant: 'destructive',
      });
    }
  };

  const removeUploadProgress = (fileName: string) => {
    setUploadProgress(prev => prev.filter(item => item.fileName !== fileName));
  };

  const lessons = getAllLessons();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Course Content</h3>
          <p className="text-sm text-slate-600">
            Upload videos, documents, and other learning materials
          </p>
        </div>
      </div>

      {lessons.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No lessons available</h3>
            <p className="text-slate-500 text-center mb-6">
              Create sections and lessons first before uploading content
            </p>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Go to Curriculum Builder
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="links">External Links</TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Video className="h-5 w-5" />
                    <span>Video Content</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Lesson Selector */}
                  <div>
                    <Label htmlFor="lesson-select">Select lesson to upload video</Label>
                    <Select value={selectedLesson} onValueChange={setSelectedLesson}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose a lesson..." />
                      </SelectTrigger>
                      <SelectContent>
                        {lessons.map(lesson => (
                          <SelectItem key={lesson.id} value={lesson.id}>
                            {lesson.sectionTitle} → {lesson.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Video Upload Area */}
                  {selectedLesson && (
                    <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50">
                      <Video className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                      <h4 className="text-lg font-semibold text-blue-800 mb-2">Upload Video</h4>
                      <p className="text-blue-600 mb-4">
                        Support formats: MP4, AVI, MOV, WMV (Max: 500MB)
                      </p>
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && selectedLesson) {
                            handleVideoUpload(selectedLesson, file);
                          }
                        }}
                        className="hidden"
                      />
                      <Button 
                        onClick={() => videoInputRef.current?.click()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Video File
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Documents & Resources</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Lesson Selector */}
                  <div>
                    <Label htmlFor="lesson-select-docs">Select lesson to upload documents</Label>
                    <Select value={selectedLesson} onValueChange={setSelectedLesson}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose a lesson..." />
                      </SelectTrigger>
                      <SelectContent>
                        {lessons.map(lesson => (
                          <SelectItem key={lesson.id} value={lesson.id}>
                            {lesson.sectionTitle} → {lesson.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Document Upload Area */}
                  {selectedLesson && (
                    <div className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center bg-green-50">
                      <FileText className="mx-auto h-12 w-12 text-green-500 mb-4" />
                      <h4 className="text-lg font-semibold text-green-800 mb-2">Upload Documents</h4>
                      <p className="text-green-600 mb-4">
                        Support formats: PDF, DOC, DOCX, TXT, PPT, PPTX (Max: 10MB each)
                      </p>
                      <input
                        ref={filesInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && selectedLesson) {
                            handleFileUpload(selectedLesson, files);
                          }
                        }}
                        className="hidden"
                      />
                      <Button 
                        onClick={() => filesInputRef.current?.click()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Documents
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Image className="h-5 w-5" />
                    <span>Images & Graphics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-slate-500">
                    <Image className="mx-auto h-12 w-12 mb-4" />
                    <p>Image upload functionality coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="links" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Link className="h-5 w-5" />
                    <span>External Resources</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-slate-500">
                    <Link className="mx-auto h-12 w-12 mb-4" />
                    <p>External links functionality coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Upload Progress */}
          {uploadProgress.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Upload Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {uploadProgress.map((upload, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getFileTypeIcon(upload.fileName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {upload.fileName}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={upload.progress} 
                          className="flex-1 h-2"
                        />
                        <span className="text-xs text-slate-500 w-12">
                          {upload.progress}%
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {upload.status === 'completed' && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                      {upload.status === 'error' && (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                      {upload.status === 'uploading' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUploadProgress(upload.fileName)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Content Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Content Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Video className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-700">
                    {sections.reduce((total, section) => 
                      total + (section.lessons?.filter(l => l.lessonType === 'video').length || 0), 0
                    )}
                  </p>
                  <p className="text-xs text-blue-600">Videos</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <FileText className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-700">
                    {sections.reduce((total, section) => 
                      total + (section.lessons?.filter(l => l.lessonType === 'text').length || 0), 0
                    )}
                  </p>
                  <p className="text-xs text-green-600">Documents</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Image className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-700">0</p>
                  <p className="text-xs text-purple-600">Images</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-700">
                    {Math.round(sections.reduce((total, section) => 
                      total + (section.totalDuration || 0), 0
                    ) / 60)}
                  </p>
                  <p className="text-xs text-orange-600">Minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}