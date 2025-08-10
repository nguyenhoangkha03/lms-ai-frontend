'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  BookOpen,
  Clock,
  Users,
  BarChart3,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause,
  Eye,
  EyeOff,
  Star,
  Brain,
  FileQuestion,
  Settings,
  TrendingUp,
  Download,
  Upload,
  MoreHorizontal,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  useGenerateQuizMutation,
  useGetGeneratedQuizzesQuery,
  useUpdateQuizMutation,
  useCreateManualQuizMutation,
} from '@/lib/redux/api/teacher-quiz-builder-api';

// Mock data - replace with actual API
const mockQuizzes = [
  {
    id: '1',
    title: 'Calculus Fundamentals Quiz',
    description: 'Test your understanding of basic calculus concepts',
    type: 'ai-generated',
    status: 'published',
    course: 'Advanced Mathematics',
    lesson: 'Introduction to Calculus',
    questionsCount: 10,
    duration: 15, // minutes
    attempts: 87,
    averageScore: 78.5,
    passRate: 82,
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-05T14:30:00Z',
    isPublished: true,
    difficulty: 'intermediate',
    tags: ['calculus', 'derivatives', 'limits'],
  },
  {
    id: '2',
    title: 'Algebra Practice Test',
    description: 'Comprehensive algebra problem set',
    type: 'manual',
    status: 'draft',
    course: 'Basic Mathematics',
    lesson: 'Linear Equations',
    questionsCount: 15,
    duration: 20,
    attempts: 23,
    averageScore: 85.2,
    passRate: 91,
    createdAt: '2024-02-15T09:30:00Z',
    updatedAt: '2024-02-20T11:15:00Z',
    isPublished: false,
    difficulty: 'beginner',
    tags: ['algebra', 'equations', 'practice'],
  },
  {
    id: '3',
    title: 'Geometry Assessment',
    description: 'Test geometric reasoning and calculations',
    type: 'ai-generated',
    status: 'under-review',
    course: 'Geometry',
    lesson: 'Triangles and Angles',
    questionsCount: 12,
    duration: 25,
    attempts: 156,
    averageScore: 72.8,
    passRate: 74,
    createdAt: '2024-01-20T16:45:00Z',
    updatedAt: '2024-03-08T13:20:00Z',
    isPublished: true,
    difficulty: 'advanced',
    tags: ['geometry', 'triangles', 'angles'],
  },
];

export default function TeacherQuizzesPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newQuizType, setNewQuizType] = useState<'manual' | 'ai-generated'>('manual');

  const [generateQuiz] = useGenerateQuizMutation();
  const [createManualQuiz] = useCreateManualQuizMutation();

  // Filter quizzes based on search and filters
  const filteredQuizzes = mockQuizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quiz.status === statusFilter;
    const matchesType = typeFilter === 'all' || quiz.type === typeFilter;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'published' && quiz.isPublished) ||
                      (activeTab === 'drafts' && !quiz.isPublished) ||
                      (activeTab === 'ai-generated' && quiz.type === 'ai-generated');
    
    return matchesSearch && matchesStatus && matchesType && matchesTab;
  });

  const handleCreateQuiz = async (formData: any) => {
    try {
      if (newQuizType === 'ai-generated') {
        await generateQuiz({
          lessonId: formData.lessonId,
          difficulty: formData.difficulty,
          questionCount: formData.questionCount,
          questionTypes: formData.questionTypes,
          topics: formData.topics,
        }).unwrap();
        
        toast({
          title: 'AI Quiz Generated',
          description: 'Your quiz has been generated and is ready for review.',
        });
      } else {
        await createManualQuiz({
          title: formData.title,
          description: formData.description,
          courseId: formData.courseId,
          lessonId: formData.lessonId,
          duration: formData.duration,
          difficulty: formData.difficulty,
        }).unwrap();
        
        toast({
          title: 'Quiz Created',
          description: 'Your manual quiz has been created successfully.',
        });
      }
      
      setShowCreateDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create quiz.',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicateQuiz = (quizId: string) => {
    toast({
      title: 'Quiz Duplicated',
      description: 'A copy of the quiz has been created.',
    });
  };

  const handleDeleteQuiz = (quizId: string) => {
    toast({
      title: 'Quiz Deleted',
      description: 'The quiz has been removed.',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-700">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'under-review':
        return <Badge className="bg-yellow-100 text-yellow-700">Under Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'ai-generated' ? (
      <Brain className="h-4 w-4 text-purple-600" />
    ) : (
      <FileQuestion className="h-4 w-4 text-blue-600" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="border-b border-white/20 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Quiz Management
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Create, manage, and analyze your course quizzes
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Quiz
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Quiz</DialogTitle>
                    <DialogDescription>
                      Choose how you'd like to create your quiz.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Card 
                        className={`cursor-pointer border-2 transition-colors ${
                          newQuizType === 'manual' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200'
                        }`}
                        onClick={() => setNewQuizType('manual')}
                      >
                        <CardContent className="p-4 text-center">
                          <FileQuestion className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                          <h3 className="font-semibold">Manual Quiz</h3>
                          <p className="text-sm text-muted-foreground">Create questions yourself</p>
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className={`cursor-pointer border-2 transition-colors ${
                          newQuizType === 'ai-generated' ? 'border-purple-500 bg-purple-50/50' : 'border-gray-200'
                        }`}
                        onClick={() => setNewQuizType('ai-generated')}
                      >
                        <CardContent className="p-4 text-center">
                          <Brain className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                          <h3 className="font-semibold">AI Generated</h3>
                          <p className="text-sm text-muted-foreground">Let AI create questions</p>
                        </CardContent>
                      </Card>
                    </div>

                    {newQuizType === 'manual' ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Quiz Title</Label>
                          <Input id="title" placeholder="Enter quiz title..." />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea id="description" placeholder="Quiz description..." rows={3} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Duration (minutes)</Label>
                            <Input type="number" placeholder="30" />
                          </div>
                          <div>
                            <Label>Difficulty</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label>Select Lesson</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose lesson..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lesson-1">Introduction to Calculus</SelectItem>
                              <SelectItem value="lesson-2">Derivatives</SelectItem>
                              <SelectItem value="lesson-3">Integration</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Question Count</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5 Questions</SelectItem>
                                <SelectItem value="10">10 Questions</SelectItem>
                                <SelectItem value="15">15 Questions</SelectItem>
                                <SelectItem value="20">20 Questions</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Difficulty</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleCreateQuiz({})}>
                      {newQuizType === 'ai-generated' ? 'Generate Quiz' : 'Create Quiz'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Quizzes</p>
                  <p className="text-3xl font-bold">{mockQuizzes.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-3xl font-bold">
                    {mockQuizzes.filter(q => q.isPublished).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Attempts</p>
                  <p className="text-3xl font-bold">
                    {mockQuizzes.reduce((sum, quiz) => sum + quiz.attempts, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Score</p>
                  <p className="text-3xl font-bold">
                    {(mockQuizzes.reduce((sum, quiz) => sum + quiz.averageScore, 0) / mockQuizzes.length).toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Tabs */}
        <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="flex flex-1 items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search quizzes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="under-review">Under Review</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="ai-generated">AI Generated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="published">Published</TabsTrigger>
                  <TabsTrigger value="drafts">Drafts</TabsTrigger>
                  <TabsTrigger value="ai-generated">AI Generated</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Quiz List */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuizzes.map((quiz) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(quiz.type)}
                      <div>
                        <CardTitle className="text-lg">{quiz.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{quiz.course}</p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/teacher/quizzes/${quiz.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/teacher/quizzes/${quiz.id}/analytics`)}>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateQuiz(quiz.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{quiz.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <FileQuestion className="h-4 w-4 text-muted-foreground" />
                        <span>{quiz.questionsCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{quiz.duration}m</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{quiz.attempts}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {getStatusBadge(quiz.status)}
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {quiz.averageScore.toFixed(1)}% avg
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {quiz.passRate}% pass
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {quiz.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      Updated {new Date(quiz.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push(`/teacher/quizzes/${quiz.id}/preview`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => router.push(`/teacher/quizzes/${quiz.id}/edit`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredQuizzes.length === 0 && (
          <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No quizzes found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search or filters.' : 'Create your first quiz to get started.'}
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Quiz
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}