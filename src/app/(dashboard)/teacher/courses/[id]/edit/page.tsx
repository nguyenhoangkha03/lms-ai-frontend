'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Eye,
  Settings,
  BookOpen,
  Users,
  Clock,
  DollarSign,
  Upload,
  Image,
  Video,
  FileText,
  Plus,
  Trash2,
  GripVertical,
  Edit2,
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

// Mock data - replace with actual API calls
const mockCourse = {
  id: '1',
  title: 'Advanced Mathematics',
  description: 'Comprehensive course covering advanced mathematical concepts...',
  thumbnail: '/course-thumbnail.jpg',
  category: 'mathematics',
  level: 'intermediate',
  price: 99.99,
  discountPrice: 79.99,
  isPublished: true,
  isFree: false,
  language: 'en',
  duration: 480, // minutes
  tags: ['math', 'calculus', 'algebra'],
  prerequisites: ['Basic Mathematics', 'Algebra I'],
  learningOutcomes: [
    'Master advanced calculus concepts',
    'Solve complex mathematical problems',
    'Apply mathematical theories in real-world scenarios',
  ],
  sections: [
    {
      id: '1',
      title: 'Introduction to Calculus',
      description: 'Basic concepts and fundamentals',
      order: 1,
      lessons: [
        {
          id: '1',
          title: 'What is Calculus?',
          description: 'Introduction to calculus concepts',
          type: 'video',
          duration: 15,
          isPublished: true,
          order: 1,
        },
        {
          id: '2',
          title: 'Limits and Continuity',
          description: 'Understanding limits in calculus',
          type: 'video',
          duration: 20,
          isPublished: true,
          order: 2,
        },
      ],
    },
    {
      id: '2',
      title: 'Derivatives',
      description: 'Understanding and calculating derivatives',
      order: 2,
      lessons: [
        {
          id: '3',
          title: 'Introduction to Derivatives',
          description: 'Basic derivative concepts',
          type: 'video',
          duration: 18,
          isPublished: true,
          order: 1,
        },
      ],
    },
  ],
};

export default function CourseEditPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const [course, setCourse] = useState(mockCourse);
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);

  // Handle form updates
  const updateCourse = (field: string, value: any) => {
    setCourse(prev => ({ ...prev, [field]: value }));
  };

  // Handle save course
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Course Updated',
        description: 'Your course has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update course.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle add section
  const addSection = () => {
    const newSection = {
      id: Date.now().toString(),
      title: 'New Section',
      description: '',
      order: course.sections.length + 1,
      lessons: [],
    };
    setCourse(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  // Handle add lesson
  const addLesson = (sectionId: string) => {
    setCourse(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          const newLesson = {
            id: Date.now().toString(),
            title: 'New Lesson',
            description: '',
            type: 'video',
            duration: 10,
            isPublished: false,
            order: section.lessons.length + 1,
          };
          return {
            ...section,
            lessons: [...section.lessons, newLesson],
          };
        }
        return section;
      }),
    }));
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
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Edit Course
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  {course.title} • ID: {params.id}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => router.push(`/teacher/courses/${params.id}/analytics`)}>
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
            <TabsList className="grid w-full grid-cols-4 gap-1 bg-transparent">
              <TabsTrigger value="basic" className="flex items-center gap-2 rounded-xl">
                <Settings className="h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2 rounded-xl">
                <BookOpen className="h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2 rounded-xl">
                <DollarSign className="h-4 w-4" />
                Pricing
              </TabsTrigger>
              <TabsTrigger value="publish" className="flex items-center gap-2 rounded-xl">
                <Eye className="h-4 w-4" />
                Publish
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle>Course Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="title">Course Title</Label>
                      <Input
                        id="title"
                        value={course.title}
                        onChange={(e) => updateCourse('title', e.target.value)}
                        placeholder="Enter course title..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={course.description}
                        onChange={(e) => updateCourse('description', e.target.value)}
                        placeholder="Enter course description..."
                        rows={6}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={course.category} onValueChange={(value) => updateCourse('category', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mathematics">Mathematics</SelectItem>
                            <SelectItem value="science">Science</SelectItem>
                            <SelectItem value="programming">Programming</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="arts">Arts</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="level">Level</Label>
                        <Select value={course.level} onValueChange={(value) => updateCourse('level', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        value={course.tags.join(', ')}
                        onChange={(e) => updateCourse('tags', e.target.value.split(',').map(tag => tag.trim()))}
                        placeholder="math, calculus, algebra..."
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle>Learning Outcomes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {course.learningOutcomes.map((outcome, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={outcome}
                            onChange={(e) => {
                              const newOutcomes = [...course.learningOutcomes];
                              newOutcomes[index] = e.target.value;
                              updateCourse('learningOutcomes', newOutcomes);
                            }}
                            placeholder="Learning outcome..."
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newOutcomes = course.learningOutcomes.filter((_, i) => i !== index);
                              updateCourse('learningOutcomes', newOutcomes);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newOutcomes = [...course.learningOutcomes, 'New learning outcome'];
                          updateCourse('learningOutcomes', newOutcomes);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Outcome
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle>Course Thumbnail</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="aspect-video w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                        <div className="text-center">
                          <Image className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">Upload thumbnail</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        <Upload className="mr-2 h-4 w-4" />
                        Choose File
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle>Course Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Sections</span>
                      <Badge>{course.sections.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Lessons</span>
                      <Badge>{course.sections.reduce((acc, section) => acc + section.lessons.length, 0)}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Duration</span>
                      <Badge>{Math.floor(course.duration / 60)}h {course.duration % 60}m</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Course Content</CardTitle>
                <Button onClick={addSection}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {course.sections.map((section, sectionIndex) => (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            <div className="flex-1">
                              <Input
                                value={section.title}
                                onChange={(e) => {
                                  const newSections = [...course.sections];
                                  newSections[sectionIndex].title = e.target.value;
                                  setCourse(prev => ({ ...prev, sections: newSections }));
                                }}
                                className="font-semibold"
                                placeholder="Section title..."
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addLesson(section.id)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newSections = course.sections.filter(s => s.id !== section.id);
                                setCourse(prev => ({ ...prev, sections: newSections }));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 ml-6">
                          {section.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="flex items-center space-x-3 rounded-lg border bg-gray-50 p-3"
                            >
                              <GripVertical className="h-4 w-4 text-gray-400" />
                              <div className="flex-1">
                                <Input
                                  value={lesson.title}
                                  onChange={(e) => {
                                    const newSections = [...course.sections];
                                    newSections[sectionIndex].lessons[lessonIndex].title = e.target.value;
                                    setCourse(prev => ({ ...prev, sections: newSections }));
                                  }}
                                  placeholder="Lesson title..."
                                />
                              </div>
                              <Badge variant={lesson.type === 'video' ? 'default' : 'secondary'}>
                                {lesson.type}
                              </Badge>
                              <Badge variant={lesson.isPublished ? 'default' : 'secondary'}>
                                {lesson.isPublished ? 'Published' : 'Draft'}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/teacher/lessons/${lesson.id}/edit`)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing">
            <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Pricing Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isFree">Free Course</Label>
                  <Switch
                    id="isFree"
                    checked={course.isFree}
                    onCheckedChange={(checked) => updateCourse('isFree', checked)}
                  />
                </div>

                {!course.isFree && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Regular Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={course.price}
                        onChange={(e) => updateCourse('price', parseFloat(e.target.value))}
                        placeholder="99.99"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discountPrice">Discount Price ($)</Label>
                      <Input
                        id="discountPrice"
                        type="number"
                        value={course.discountPrice || ''}
                        onChange={(e) => updateCourse('discountPrice', parseFloat(e.target.value))}
                        placeholder="79.99"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Publish Tab */}
          <TabsContent value="publish">
            <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Publish Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isPublished">Publish Course</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this course visible to students
                    </p>
                  </div>
                  <Switch
                    id="isPublished"
                    checked={course.isPublished}
                    onCheckedChange={(checked) => updateCourse('isPublished', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Publishing Checklist</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm">Course title and description completed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm">At least one section with lessons</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span className="text-sm">Course thumbnail uploaded</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm">Pricing settings configured</span>
                    </div>
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