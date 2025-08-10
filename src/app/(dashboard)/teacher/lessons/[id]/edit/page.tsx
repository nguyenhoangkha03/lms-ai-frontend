'use client';

import React, { useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Eye,
  Play,
  Upload,
  FileText,
  Image,
  Video,
  Mic,
  Link,
  Plus,
  Trash2,
  Clock,
  Settings,
  BookOpen,
  Download,
  Copy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Mock data - replace with actual API calls
const mockLesson = {
  id: '1',
  title: 'Introduction to Calculus',
  description: 'Learn the fundamentals of calculus including limits, derivatives, and basic integration.',
  courseId: 'course-1',
  courseName: 'Advanced Mathematics',
  sectionId: 'section-1',
  sectionName: 'Calculus Fundamentals',
  type: 'video',
  duration: 25, // minutes
  order: 1,
  isPublished: true,
  isFree: false,
  content: {
    video: {
      url: 'https://example.com/video.mp4',
      thumbnail: '/lesson-thumbnail.jpg',
      duration: 1500, // seconds
    },
    transcript: 'Welcome to this lesson on calculus fundamentals...',
    notes: 'Key points:\n- Calculus is the study of change\n- Limits are fundamental\n- Derivatives measure rates of change',
    resources: [
      { id: '1', name: 'Calculus Basics PDF', type: 'pdf', url: '/calculus-basics.pdf', size: '2.1 MB' },
      { id: '2', name: 'Practice Problems', type: 'doc', url: '/practice-problems.doc', size: '856 KB' },
    ],
  },
  quiz: {
    id: 'quiz-1',
    title: 'Calculus Basics Quiz',
    questions: 5,
    duration: 10, // minutes
    passingScore: 70,
    isEnabled: true,
  },
  assignments: [
    {
      id: 'assignment-1',
      title: 'Derivative Calculations',
      description: 'Complete the derivative problems in the attached worksheet.',
      dueDate: '2024-03-20',
      points: 100,
    },
  ],
  analytics: {
    views: 189,
    completions: 156,
    averageWatchTime: 18.5, // minutes
    completionRate: 82.5,
  },
  settings: {
    allowDownload: false,
    allowSpeedControl: true,
    allowSkipping: false,
    showTranscript: true,
    showNotes: true,
    autoAdvance: false,
  },
};

export default function LessonEditPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const videoFileRef = useRef<HTMLInputElement>(null);
  const resourceFileRef = useRef<HTMLInputElement>(null);
  
  const [lesson, setLesson] = useState(mockLesson);
  const [activeTab, setActiveTab] = useState('content');
  const [isLoading, setIsLoading] = useState(false);
  const [showResourceDialog, setShowResourceDialog] = useState(false);

  // Handle form updates
  const updateLesson = (field: string, value: any) => {
    setLesson(prev => ({ ...prev, [field]: value }));
  };

  // Handle nested updates
  const updateNested = (parent: string, field: string, value: any) => {
    setLesson(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  // Handle save lesson
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Lesson Updated',
        description: 'Your lesson has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update lesson.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle video upload
  const handleVideoUpload = (file: File) => {
    // Mock video upload
    const videoUrl = URL.createObjectURL(file);
    updateNested('content', 'video', {
      ...lesson.content.video,
      url: videoUrl,
    });
    toast({
      title: 'Video Uploaded',
      description: 'Your video has been uploaded successfully.',
    });
  };

  // Handle add resource
  const addResource = (name: string, type: string, file: File) => {
    const newResource = {
      id: Date.now().toString(),
      name,
      type,
      url: URL.createObjectURL(file),
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    };
    
    updateNested('content', 'resources', [...lesson.content.resources, newResource]);
    setShowResourceDialog(false);
    toast({
      title: 'Resource Added',
      description: 'The resource has been added to the lesson.',
    });
  };

  // Remove resource
  const removeResource = (resourceId: string) => {
    const updatedResources = lesson.content.resources.filter(r => r.id !== resourceId);
    updateNested('content', 'resources', updatedResources);
    toast({
      title: 'Resource Removed',
      description: 'The resource has been removed from the lesson.',
    });
  };

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
                <Play className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Edit Lesson
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  {lesson.courseName} • {lesson.sectionName}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge variant={lesson.isPublished ? 'default' : 'secondary'}>
                {lesson.isPublished ? 'Published' : 'Draft'}
              </Badge>
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-indigo-600"
              >
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <div className="rounded-2xl border border-white/30 bg-white/80 p-2 shadow-lg backdrop-blur-xl">
            <TabsList className="grid w-full grid-cols-5 gap-1 bg-transparent">
              <TabsTrigger value="content" className="flex items-center gap-2 rounded-xl">
                <Video className="h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2 rounded-xl">
                <FileText className="h-4 w-4" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center gap-2 rounded-xl">
                <BookOpen className="h-4 w-4" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 rounded-xl">
                <Eye className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 rounded-xl">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content Tab */}
          <TabsContent value="content">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle>Lesson Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="title">Lesson Title</Label>
                      <Input
                        id="title"
                        value={lesson.title}
                        onChange={(e) => updateLesson('title', e.target.value)}
                        placeholder="Enter lesson title..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={lesson.description}
                        onChange={(e) => updateLesson('description', e.target.value)}
                        placeholder="Enter lesson description..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Lesson Type</Label>
                        <Select value={lesson.type} onValueChange={(value) => updateLesson('type', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="audio">Audio</SelectItem>
                            <SelectItem value="interactive">Interactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={lesson.duration}
                          onChange={(e) => updateLesson('duration', parseInt(e.target.value))}
                          placeholder="25"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Video Content */}
                <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Video className="h-5 w-5" />
                      <span>Video Content</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="aspect-video w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                      {lesson.content.video.url ? (
                        <video 
                          src={lesson.content.video.url} 
                          controls 
                          className="w-full h-full rounded-lg"
                          poster={lesson.content.video.thumbnail}
                        />
                      ) : (
                        <div className="text-center">
                          <Video className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">Upload your lesson video</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Button 
                        variant="outline" 
                        onClick={() => videoFileRef.current?.click()}
                        className="flex-1"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {lesson.content.video.url ? 'Replace Video' : 'Upload Video'}
                      </Button>
                      
                      {lesson.content.video.url && (
                        <Button variant="outline">
                          <Copy className="mr-2 h-4 w-4" />
                          Copy URL
                        </Button>
                      )}
                    </div>
                    
                    <input
                      ref={videoFileRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleVideoUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Transcript & Notes */}
                <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle>Transcript & Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="transcript">Video Transcript</Label>
                      <Textarea
                        id="transcript"
                        value={lesson.content.transcript}
                        onChange={(e) => updateNested('content', 'transcript', e.target.value)}
                        placeholder="Enter video transcript..."
                        rows={6}
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Lesson Notes</Label>
                      <Textarea
                        id="notes"
                        value={lesson.content.notes}
                        onChange={(e) => updateNested('content', 'notes', e.target.value)}
                        placeholder="Add lesson notes and key points..."
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Lesson Stats */}
                <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle>Lesson Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Views</span>
                      <Badge>{lesson.analytics.views}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completions</span>
                      <Badge>{lesson.analytics.completions}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg. Watch Time</span>
                      <Badge>{lesson.analytics.averageWatchTime}m</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completion Rate</span>
                      <Badge>{lesson.analytics.completionRate}%</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Settings */}
                <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle>Quick Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="published">Published</Label>
                      <Switch
                        id="published"
                        checked={lesson.isPublished}
                        onCheckedChange={(checked) => updateLesson('isPublished', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="free">Free Preview</Label>
                      <Switch
                        id="free"
                        checked={lesson.isFree}
                        onCheckedChange={(checked) => updateLesson('isFree', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lesson Resources</CardTitle>
                <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Resource
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Resource</DialogTitle>
                      <DialogDescription>
                        Upload a file or add a link as a lesson resource.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="resourceName">Resource Name</Label>
                        <Input id="resourceName" placeholder="Enter resource name..." />
                      </div>
                      <div>
                        <Label htmlFor="resourceFile">File</Label>
                        <Input
                          id="resourceFile"
                          type="file"
                          ref={resourceFileRef}
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowResourceDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => {
                        const nameInput = document.getElementById('resourceName') as HTMLInputElement;
                        const fileInput = resourceFileRef.current;
                        if (nameInput?.value && fileInput?.files?.[0]) {
                          const file = fileInput.files[0];
                          const fileType = file.name.split('.').pop() || 'file';
                          addResource(nameInput.value, fileType, file);
                          nameInput.value = '';
                          fileInput.value = '';
                        }
                      }}>
                        Add Resource
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lesson.content.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center space-x-4 p-4 rounded-lg border bg-white"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        {resource.type === 'pdf' ? <FileText className="h-5 w-5 text-blue-600" /> :
                         resource.type === 'doc' ? <FileText className="h-5 w-5 text-blue-600" /> :
                         <FileText className="h-5 w-5 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{resource.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {resource.type.toUpperCase()} • {resource.size}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeResource(resource.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {lesson.content.resources.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">No resources added yet</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => setShowResourceDialog(true)}
                      >
                        Add First Resource
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz">
            <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Lesson Quiz</span>
                  <Switch
                    checked={lesson.quiz.isEnabled}
                    onCheckedChange={(checked) => updateNested('quiz', 'isEnabled', checked)}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {lesson.quiz.isEnabled ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quizTitle">Quiz Title</Label>
                        <Input
                          id="quizTitle"
                          value={lesson.quiz.title}
                          onChange={(e) => updateNested('quiz', 'title', e.target.value)}
                          placeholder="Enter quiz title..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="quizDuration">Duration (minutes)</Label>
                        <Input
                          id="quizDuration"
                          type="number"
                          value={lesson.quiz.duration}
                          onChange={(e) => updateNested('quiz', 'duration', parseInt(e.target.value))}
                          placeholder="10"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="questions">Number of Questions</Label>
                        <Input
                          id="questions"
                          type="number"
                          value={lesson.quiz.questions}
                          onChange={(e) => updateNested('quiz', 'questions', parseInt(e.target.value))}
                          placeholder="5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="passingScore">Passing Score (%)</Label>
                        <Input
                          id="passingScore"
                          type="number"
                          value={lesson.quiz.passingScore}
                          onChange={(e) => updateNested('quiz', 'passingScore', parseInt(e.target.value))}
                          placeholder="70"
                        />
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button onClick={() => router.push('/teacher/quiz-builder')}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Edit Quiz Questions
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                      Enable quiz to add questions for this lesson
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Views</p>
                      <p className="text-3xl font-bold">{lesson.analytics.views}</p>
                    </div>
                    <Eye className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completions</p>
                      <p className="text-3xl font-bold">{lesson.analytics.completions}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Watch Time</p>
                      <p className="text-3xl font-bold">{lesson.analytics.averageWatchTime}m</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                      <p className="text-3xl font-bold">{lesson.analytics.completionRate}%</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Lesson Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowDownload">Allow Download</Label>
                      <p className="text-sm text-muted-foreground">
                        Let students download the lesson video
                      </p>
                    </div>
                    <Switch
                      id="allowDownload"
                      checked={lesson.settings.allowDownload}
                      onCheckedChange={(checked) => updateNested('settings', 'allowDownload', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowSpeedControl">Speed Control</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow students to change playback speed
                      </p>
                    </div>
                    <Switch
                      id="allowSpeedControl"
                      checked={lesson.settings.allowSpeedControl}
                      onCheckedChange={(checked) => updateNested('settings', 'allowSpeedControl', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowSkipping">Allow Skipping</Label>
                      <p className="text-sm text-muted-foreground">
                        Let students skip through the video
                      </p>
                    </div>
                    <Switch
                      id="allowSkipping"
                      checked={lesson.settings.allowSkipping}
                      onCheckedChange={(checked) => updateNested('settings', 'allowSkipping', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showTranscript">Show Transcript</Label>
                      <p className="text-sm text-muted-foreground">
                        Display video transcript to students
                      </p>
                    </div>
                    <Switch
                      id="showTranscript"
                      checked={lesson.settings.showTranscript}
                      onCheckedChange={(checked) => updateNested('settings', 'showTranscript', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showNotes">Show Notes</Label>
                      <p className="text-sm text-muted-foreground">
                        Display lesson notes to students
                      </p>
                    </div>
                    <Switch
                      id="showNotes"
                      checked={lesson.settings.showNotes}
                      onCheckedChange={(checked) => updateNested('settings', 'showNotes', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoAdvance">Auto Advance</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically advance to next lesson after completion
                      </p>
                    </div>
                    <Switch
                      id="autoAdvance"
                      checked={lesson.settings.autoAdvance}
                      onCheckedChange={(checked) => updateNested('settings', 'autoAdvance', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}