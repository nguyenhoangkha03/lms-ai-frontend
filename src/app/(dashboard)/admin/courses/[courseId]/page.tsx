'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  GripVertical,
  Play,
  FileText,
  Video,
  Image,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Star,
  DollarSign,
  Save,
  RefreshCw,
  Eye,
  Settings,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Link from 'next/link';

// Mock data - replace with actual API calls
const mockCourse = {
  id: '1',
  title: 'Complete React Development Course',
  description: 'Learn React from beginner to advanced level with hands-on projects',
  instructor: {
    id: '1',
    name: 'John Doe',
    avatar: '',
  },
  category: {
    id: '1',
    name: 'Web Development',
    color: '#3b82f6',
  },
  status: 'published',
  price: 99.99,
  rating: 4.8,
  enrollments: 1234,
  duration: 3600 * 24, // 24 hours
  level: 'Intermediate',
  language: 'English',
  thumbnail: '',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-20T00:00:00Z',
  sections: [
    {
      id: '1',
      title: 'Introduction to React',
      description: 'Get started with React fundamentals',
      orderIndex: 0,
      isActive: true,
      isRequired: true,
      totalLessons: 5,
      totalDuration: 3600 * 2, // 2 hours
      lessons: [
        {
          id: '1',
          title: 'What is React?',
          description: 'Introduction to React library',
          type: 'video',
          duration: 600,
          orderIndex: 0,
          isActive: true,
        },
        {
          id: '2',
          title: 'Setting up Development Environment',
          description: 'Install Node.js, npm, and create-react-app',
          type: 'video',
          duration: 900,
          orderIndex: 1,
          isActive: true,
        },
      ],
    },
    {
      id: '2',
      title: 'React Components',
      description: 'Understanding components and JSX',
      orderIndex: 1,
      isActive: true,
      isRequired: true,
      totalLessons: 8,
      totalDuration: 3600 * 4, // 4 hours
      lessons: [],
    },
  ],
};

interface Section {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  isActive: boolean;
  isRequired: boolean;
  totalLessons: number;
  totalDuration: number;
  lessons?: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration: number;
  orderIndex: number;
  isActive: boolean;
}

interface SectionFormData {
  title: string;
  description: string;
  orderIndex: number;
  isActive: boolean;
  isRequired: boolean;
}

export default function AdminCourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  
  const [course, setCourse] = useState(mockCourse);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateSectionDialog, setShowCreateSectionDialog] = useState(false);
  const [showEditSectionDialog, setShowEditSectionDialog] = useState(false);
  const [showDeleteSectionDialog, setShowDeleteSectionDialog] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['1']));

  const [sectionFormData, setSectionFormData] = useState<SectionFormData>({
    title: '',
    description: '',
    orderIndex: 0,
    isActive: true,
    isRequired: false,
  });

  const handleCreateSection = async () => {
    try {
      // TODO: API call to create section
      const newSection: Section = {
        id: Date.now().toString(),
        title: sectionFormData.title,
        description: sectionFormData.description,
        orderIndex: sectionFormData.orderIndex,
        isActive: sectionFormData.isActive,
        isRequired: sectionFormData.isRequired,
        totalLessons: 0,
        totalDuration: 0,
        lessons: [],
      };

      setCourse(prev => ({
        ...prev,
        sections: [...prev.sections, newSection].sort((a, b) => a.orderIndex - b.orderIndex),
      }));

      toast.success('Section created successfully');
      setShowCreateSectionDialog(false);
      resetSectionForm();
    } catch (error: any) {
      toast.error('Failed to create section');
    }
  };

  const handleUpdateSection = async () => {
    if (!selectedSection) return;

    try {
      // TODO: API call to update section
      setCourse(prev => ({
        ...prev,
        sections: prev.sections.map(section =>
          section.id === selectedSection.id
            ? { ...section, ...sectionFormData }
            : section
        ),
      }));

      toast.success('Section updated successfully');
      setShowEditSectionDialog(false);
      setSelectedSection(null);
      resetSectionForm();
    } catch (error: any) {
      toast.error('Failed to update section');
    }
  };

  const handleDeleteSection = async () => {
    if (!selectedSection) return;

    try {
      // TODO: API call to delete section
      setCourse(prev => ({
        ...prev,
        sections: prev.sections.filter(section => section.id !== selectedSection.id),
      }));

      toast.success('Section deleted successfully');
      setShowDeleteSectionDialog(false);
      setSelectedSection(null);
    } catch (error: any) {
      toast.error('Failed to delete section');
    }
  };

  const resetSectionForm = () => {
    setSectionFormData({
      title: '',
      description: '',
      orderIndex: course.sections.length,
      isActive: true,
      isRequired: false,
    });
  };

  const openCreateSectionDialog = () => {
    resetSectionForm();
    setSectionFormData(prev => ({ ...prev, orderIndex: course.sections.length }));
    setShowCreateSectionDialog(true);
  };

  const openEditSectionDialog = (section: Section) => {
    setSelectedSection(section);
    setSectionFormData({
      title: section.title,
      description: section.description || '',
      orderIndex: section.orderIndex,
      isActive: section.isActive,
      isRequired: section.isRequired,
    });
    setShowEditSectionDialog(true);
  };

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600 bg-green-100';
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      case 'pending_review':
        return 'text-yellow-600 bg-yellow-100';
      case 'archived':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return CheckCircle;
      case 'draft':
        return Edit;
      case 'pending_review':
        return Clock;
      case 'archived':
        return XCircle;
      default:
        return XCircle;
    }
  };

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'text':
        return FileText;
      case 'quiz':
        return CheckCircle;
      case 'assignment':
        return Edit;
      default:
        return FileText;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/courses">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <span>by {course.instructor.name}</span>
              <span>•</span>
              <span>{course.category.name}</span>
              <span>•</span>
              <Badge className={cn('text-xs', getStatusColor(course.status))}>
                {course.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Course Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enrollments</p>
                <p className="text-2xl font-bold">{course.enrollments.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rating</p>
                <p className="text-2xl font-bold">{course.rating}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">${(course.enrollments * course.price).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sections</p>
                <p className="text-2xl font-bold">{course.sections.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sections">Course Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Title</Label>
                  <p className="text-sm text-muted-foreground mt-1">{course.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div
                      className="h-3 w-3 rounded"
                      style={{ backgroundColor: course.category.color }}
                    />
                    <span className="text-sm text-muted-foreground">{course.category.name}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Level</Label>
                  <p className="text-sm text-muted-foreground mt-1">{course.level}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Language</Label>
                  <p className="text-sm text-muted-foreground mt-1">{course.language}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Price</Label>
                  <p className="text-sm text-muted-foreground mt-1">${course.price}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <p className="text-sm text-muted-foreground mt-1">{formatDuration(course.duration)}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Course Sections</CardTitle>
                <Button onClick={openCreateSectionDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {course.sections.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No sections found</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={openCreateSectionDialog}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Section
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {course.sections.map((section, index) => (
                    <div key={section.id} className="border rounded-lg">
                      {/* Section Header */}
                      <div className="p-4 border-b bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => toggleSectionExpansion(section.id)}
                            >
                              {expandedSections.has(section.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold">
                                  {index + 1}. {section.title}
                                </h3>
                                {section.isRequired && (
                                  <Badge variant="outline" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                                {!section.isActive && (
                                  <Badge variant="secondary" className="text-xs">
                                    Inactive
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>{section.totalLessons} lessons</span>
                                <span>{formatDuration(section.totalDuration)}</span>
                                {section.description && (
                                  <span className="truncate max-w-60">{section.description}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditSectionDialog(section)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add Lesson
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedSection(section);
                                    setShowDeleteSectionDialog(true);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Section
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>

                      {/* Section Lessons */}
                      {expandedSections.has(section.id) && (
                        <div className="p-4">
                          {section.lessons && section.lessons.length > 0 ? (
                            <div className="space-y-2">
                              {section.lessons.map((lesson, lessonIndex) => {
                                const LessonIcon = getLessonTypeIcon(lesson.type);
                                return (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center space-x-3 p-3 bg-white rounded border"
                                  >
                                    <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                                    <LessonIcon className="h-4 w-4 text-blue-600" />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2">
                                        <span className="font-medium">
                                          {lessonIndex + 1}. {lesson.title}
                                        </span>
                                        {!lesson.isActive && (
                                          <Badge variant="secondary" className="text-xs">
                                            Inactive
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                        <span className="capitalize">{lesson.type}</span>
                                        <span>{formatDuration(lesson.duration)}</span>
                                        {lesson.description && (
                                          <span className="truncate">{lesson.description}</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Button variant="ghost" size="sm">
                                        <Play className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <FileText className="mx-auto h-8 w-8 mb-2" />
                              <p>No lessons in this section</p>
                              <Button variant="outline" size="sm" className="mt-2">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Lesson
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Course Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Course settings will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Course Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Course analytics will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Section Dialog */}
      <Dialog open={showCreateSectionDialog} onOpenChange={setShowCreateSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Section</DialogTitle>
            <DialogDescription>
              Add a new section to organize your course content
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sectionTitle">Title *</Label>
              <Input
                id="sectionTitle"
                value={sectionFormData.title}
                onChange={(e) => setSectionFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Section title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sectionDescription">Description</Label>
              <Textarea
                id="sectionDescription"
                value={sectionFormData.description}
                onChange={(e) => setSectionFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Section description (optional)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sectionOrder">Order Index</Label>
              <Input
                id="sectionOrder"
                type="number"
                value={sectionFormData.orderIndex}
                onChange={(e) => setSectionFormData(prev => ({ ...prev, orderIndex: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="sectionActive"
                  checked={sectionFormData.isActive}
                  onCheckedChange={(checked) => setSectionFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="sectionActive">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="sectionRequired"
                  checked={sectionFormData.isRequired}
                  onCheckedChange={(checked) => setSectionFormData(prev => ({ ...prev, isRequired: checked }))}
                />
                <Label htmlFor="sectionRequired">Required</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateSectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSection}>Create Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog open={showEditSectionDialog} onOpenChange={setShowEditSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Update section information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editSectionTitle">Title *</Label>
              <Input
                id="editSectionTitle"
                value={sectionFormData.title}
                onChange={(e) => setSectionFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Section title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editSectionDescription">Description</Label>
              <Textarea
                id="editSectionDescription"
                value={sectionFormData.description}
                onChange={(e) => setSectionFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Section description (optional)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editSectionOrder">Order Index</Label>
              <Input
                id="editSectionOrder"
                type="number"
                value={sectionFormData.orderIndex}
                onChange={(e) => setSectionFormData(prev => ({ ...prev, orderIndex: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="editSectionActive"
                  checked={sectionFormData.isActive}
                  onCheckedChange={(checked) => setSectionFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="editSectionActive">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="editSectionRequired"
                  checked={sectionFormData.isRequired}
                  onCheckedChange={(checked) => setSectionFormData(prev => ({ ...prev, isRequired: checked }))}
                />
                <Label htmlFor="editSectionRequired">Required</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditSectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSection}>Update Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Section Confirmation Dialog */}
      <Dialog open={showDeleteSectionDialog} onOpenChange={setShowDeleteSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedSection?.title}"? This will also delete all lessons in this section. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteSectionDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSection}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}