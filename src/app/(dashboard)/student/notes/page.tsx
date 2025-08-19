'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} from '@/lib/redux/api/learning-api';
import { useGetUserEnrollmentsQuery } from '@/lib/redux/api/course-api';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  StickyNote,
  Plus,
  Search,
  Calendar,
  BookOpen,
  Lock,
  Unlock,
  Edit3,
  Trash2,
  MoreVertical,
  Eye,
  EyeOff,
  Filter,
  Sort,
  Grid3X3,
  List,
  Star,
  StarOff,
  Tag,
  Clock,
  User,
  FileText,
  Lightbulb,
  MessageSquare,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Note {
  id: string;
  content: string;
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseName: string;
  timestamp?: number;
  isPrivate: boolean;
  isFavorite?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function StudentNotesPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form states
  const [noteContent, setNoteContent] = useState('');
  const [noteLesson, setNoteLesson] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const {
    data: enrollmentsData,
    isLoading: enrollmentsLoading,
  } = useGetUserEnrollmentsQuery({
    status: 'active',
    page: 1,
    limit: 100,
  });

  const [createNote] = useCreateNoteMutation();
  const [updateNote] = useUpdateNoteMutation();
  const [deleteNote] = useDeleteNoteMutation();

  // Mock data for demonstration
  const mockNotes: Note[] = [
    {
      id: '1',
      content: 'JavaScript hoisting là một khái niệm quan trọng. Các biến và hàm được "hoisted" lên đầu scope.',
      lessonId: 'lesson-1',
      lessonTitle: 'JavaScript Fundamentals',
      courseId: 'course-1',
      courseName: 'Lập trình JavaScript từ cơ bản đến nâng cao',
      timestamp: 300,
      isPrivate: true,
      isFavorite: true,
      tags: ['javascript', 'hoisting', 'fundamentals'],
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      content: 'CSS Grid Layout giúp tạo layout 2 chiều hiệu quả. Grid-template-areas rất hữu ích cho responsive design.',
      lessonId: 'lesson-2',
      lessonTitle: 'CSS Grid Layout',
      courseId: 'course-2',
      courseName: 'Frontend Development với HTML/CSS',
      isPrivate: false,
      isFavorite: false,
      tags: ['css', 'grid', 'layout', 'responsive'],
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-14T14:20:00Z',
    },
    {
      id: '3',
      content: 'React Hooks đã thay đổi cách chúng ta viết component. useState và useEffect là hai hooks cơ bản nhất.',
      lessonId: 'lesson-3',
      lessonTitle: 'React Hooks Introduction',
      courseId: 'course-3',
      courseName: 'React.js Complete Course',
      isPrivate: true,
      isFavorite: true,
      tags: ['react', 'hooks', 'useState', 'useEffect'],
      createdAt: '2024-01-13T09:15:00Z',
      updatedAt: '2024-01-13T09:15:00Z',
    },
  ];

  const notes = mockNotes;
  const courses = enrollmentsData?.enrollments || [];

  const handleCreateNote = async () => {
    if (!noteContent.trim() || !noteLesson) {
      toast.error('Vui lòng nhập nội dung ghi chú và chọn bài học');
      return;
    }

    try {
      await createNote({
        lessonId: noteLesson,
        content: noteContent.trim(),
        isPrivate,
      }).unwrap();

      toast.success('Đã tạo ghi chú thành công');
      setNoteContent('');
      setNoteLesson('');
      setNoteTags([]);
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi tạo ghi chú');
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !noteContent.trim()) {
      toast.error('Vui lòng nhập nội dung ghi chú');
      return;
    }

    try {
      await updateNote({
        noteId: editingNote.id,
        data: {
          content: noteContent.trim(),
          isPrivate,
        },
      }).unwrap();

      toast.success('Đã cập nhật ghi chú thành công');
      setEditingNote(null);
      setNoteContent('');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi cập nhật ghi chú');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId).unwrap();
      toast.success('Đã xóa ghi chú thành công');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi xóa ghi chú');
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteContent(note.content);
    setIsPrivate(note.isPrivate);
    setNoteTags(note.tags || []);
  };

  const addTag = () => {
    if (newTag.trim() && !noteTags.includes(newTag.trim())) {
      setNoteTags([...noteTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setNoteTags(noteTags.filter(t => t !== tag));
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCourse = !selectedCourse || note.courseId === selectedCourse;

    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'private' && note.isPrivate) ||
      (filterType === 'public' && !note.isPrivate) ||
      (filterType === 'favorites' && note.isFavorite);

    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'private' && note.isPrivate) ||
      (activeTab === 'public' && !note.isPrivate) ||
      (activeTab === 'favorites' && note.isFavorite);

    return matchesSearch && matchesCourse && matchesFilter && matchesTab;
  });

  const sortedNotes = filteredNotes.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'course':
        return a.courseName.localeCompare(b.courseName);
      case 'lesson':
        return a.lessonTitle.localeCompare(b.lessonTitle);
      default:
        return 0;
    }
  });

  const getTabCounts = () => {
    return {
      all: notes.length,
      private: notes.filter(n => n.isPrivate).length,
      public: notes.filter(n => !n.isPrivate).length,
      favorites: notes.filter(n => n.isFavorite).length,
    };
  };

  const tabCounts = getTabCounts();

  const resetForm = () => {
    setNoteContent('');
    setNoteLesson('');
    setNoteTags([]);
    setIsPrivate(true);
    setEditingNote(null);
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Ghi chú của tôi</h1>
          <p className="text-muted-foreground">
            Quản lý và tổ chức ghi chú học tập của bạn
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo ghi chú
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tạo ghi chú mới</DialogTitle>
                <DialogDescription>
                  Tạo ghi chú để lưu lại những kiến thức quan trọng
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Chọn bài học
                  </label>
                  <Select value={noteLesson} onValueChange={setNoteLesson}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn bài học để ghi chú" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course.courseId} value={course.courseId}>
                          {course.courseTitle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nội dung ghi chú
                  </label>
                  <Textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Nhập nội dung ghi chú của bạn..."
                    rows={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Thẻ tag
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Thêm tag..."
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1"
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {noteTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {noteTags.map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeTag(tag)}
                        >
                          {tag} ✕
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="isPrivate" className="text-sm">
                    Ghi chú riêng tư
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateNote}>
                  Tạo ghi chú
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-4"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng ghi chú</p>
                <p className="text-2xl font-bold">{notes.length}</p>
              </div>
              <StickyNote className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Riêng tư</p>
                <p className="text-2xl font-bold">{tabCounts.private}</p>
              </div>
              <Lock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Công khai</p>
                <p className="text-2xl font-bold">{tabCounts.public}</p>
              </div>
              <Unlock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Yêu thích</p>
                <p className="text-2xl font-bold">{tabCounts.favorites}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm ghi chú, khóa học, tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tất cả khóa học" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả khóa học</SelectItem>
                    {Array.from(new Set(notes.map(n => n.courseName))).map(courseName => (
                      <SelectItem key={courseName} value={courseName}>
                        {courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="oldest">Cũ nhất</SelectItem>
                    <SelectItem value="course">Khóa học</SelectItem>
                    <SelectItem value="lesson">Bài học</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              Tất cả
              {tabCounts.all > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.all}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="private" className="flex items-center gap-2">
              Riêng tư
              {tabCounts.private > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.private}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="public" className="flex items-center gap-2">
              Công khai
              {tabCounts.public > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.public}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              Yêu thích
              {tabCounts.favorites > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.favorites}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {sortedNotes.length === 0 ? (
              <div className="py-12 text-center">
                <StickyNote className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-600">
                  Không có ghi chú nào
                </h3>
                <p className="mb-4 text-gray-500">
                  {activeTab === 'all' 
                    ? 'Chưa có ghi chú nào được tạo'
                    : `Không có ghi chú ${activeTab}`
                  }
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo ghi chú đầu tiên
                </Button>
              </div>
            ) : (
              <div className={cn(
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
                  : 'space-y-4'
              )}>
                {sortedNotes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full transition-shadow hover:shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant={note.isPrivate ? 'default' : 'secondary'}>
                              {note.isPrivate ? (
                                <>
                                  <Lock className="mr-1 h-3 w-3" />
                                  Riêng tư
                                </>
                              ) : (
                                <>
                                  <Unlock className="mr-1 h-3 w-3" />
                                  Công khai
                                </>
                              )}
                            </Badge>
                            {note.isFavorite && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditNote(note)}>
                                <Edit3 className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/student/courses/${note.courseId}/lessons/${note.lessonId}`}>
                                  <BookOpen className="mr-2 h-4 w-4" />
                                  Đến bài học
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteNote(note.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-3">
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {note.content}
                          </p>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <BookOpen className="h-3 w-3" />
                              <span>{note.courseName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <FileText className="h-3 w-3" />
                              <span>{note.lessonTitle}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(note.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                          </div>

                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {note.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                              {note.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{note.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Edit Note Dialog */}
      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa ghi chú</DialogTitle>
            <DialogDescription>
              Cập nhật nội dung ghi chú của bạn
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nội dung ghi chú
              </label>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Nhập nội dung ghi chú của bạn..."
                rows={6}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editIsPrivate"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="editIsPrivate" className="text-sm">
                Ghi chú riêng tư
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNote(null)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateNote}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}