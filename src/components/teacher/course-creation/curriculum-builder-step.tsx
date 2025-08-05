'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  GripVertical,
  BookOpen,
  Video,
  FileText,
  Clock,
  Edit2,
  ChevronDown,
  ChevronRight,
  Link,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import type {
  CourseDraft,
  CourseSection,
} from '@/lib/redux/api/course-creation-api';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface CurriculumSection {
  id: string;
  title: string;
  description?: string;
  lessons: CurriculumLesson[];
  isExpanded: boolean;
  order: number;
}

interface CurriculumLesson {
  id: string;
  title: string;
  description?: string;
  type: 'video' | 'text' | 'quiz' | 'assignment' | 'resource';
  duration: number; // in minutes
  isPreview: boolean;
  content?: {
    videoUrl?: string;
    textContent?: string;
    resourceUrl?: string;
  };
  order: number;
}

// interface CourseDraft {
//   curriculum: {
//     sections: CurriculumSection[];
//     totalLessons: number;
//     totalDuration: number;
//   };
//   [key: string]: any;
// }

interface CurriculumBuilderStepProps {
  draft: CourseDraft;
  onUpdate: (updates: Partial<CourseDraft>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

const LESSON_TYPES = [
  { value: 'video', label: 'Video Lesson', icon: Video },
  { value: 'text', label: 'Text Lesson', icon: FileText },
  { value: 'quiz', label: 'Quiz', icon: CheckCircle },
  { value: 'assignment', label: 'Assignment', icon: Edit2 },
  { value: 'resource', label: 'Resource', icon: Link },
];

export const CurriculumBuilderStep: React.FC<CurriculumBuilderStepProps> = ({
  draft,
  onUpdate,
  onNext,
  onPrevious,
  isLoading,
  errors,
}) => {
  const { toast } = useToast();
  const [sections, setSections] = useState(draft.curriculum.sections || []);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [showAddSectionDialog, setShowAddSectionDialog] = useState(false);
  const [showAddLessonDialog, setShowAddLessonDialog] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  // Create new section
  const handleAddSection = (title: string, description?: string) => {
    const newSection: CurriculumSection = {
      id: `section_${Date.now()}`,
      title,
      description,
      lessons: [],
      isExpanded: true,
      order: sections.length,
    };

    const updatedSections = [...sections, newSection];
    setSections(updatedSections as CourseSection[]);
    updateCurriculum(updatedSections as CurriculumSection[]);
    setShowAddSectionDialog(false);
  };

  // Create new lesson
  const handleAddLesson = (
    sectionId: string,
    title: string,
    type: CurriculumLesson['type'],
    duration: number,
    description?: string
  ) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        const newLesson: CurriculumLesson = {
          id: `lesson_${Date.now()}`,
          title,
          description,
          type,
          duration,
          isPreview: false,
          order: section.lessons.length,
        };

        return {
          ...section,
          lessons: [...section.lessons, newLesson],
        };
      }
      return section;
    });

    setSections(updatedSections as CourseSection[]);
    updateCurriculum(updatedSections as any);
    setShowAddLessonDialog(false);
  };

  // Delete section
  const handleDeleteSection = (sectionId: string) => {
    const updatedSections = sections.filter(
      section => section.id !== sectionId
    );
    setSections(updatedSections as CourseSection[]);
    updateCurriculum(updatedSections as any);
  };

  // Delete lesson
  const handleDeleteLesson = (sectionId: string, lessonId: string) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          lessons: section.lessons.filter(lesson => lesson.id !== lessonId),
        };
      }
      return section;
    });

    setSections(updatedSections as CourseSection[]);
    updateCurriculum(updatedSections as any);
  };

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return { ...section, isExpanded: !section.isExpanded };
      }
      return section;
    });
    setSections(updatedSections);
  };

  // Update lesson
  const handleUpdateLesson = (
    sectionId: string,
    lessonId: string,
    updates: Partial<CurriculumLesson>
  ) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          lessons: section.lessons.map(lesson => {
            if (lesson.id === lessonId) {
              return { ...lesson, ...updates };
            }
            return lesson;
          }),
        };
      }
      return section;
    });

    setSections(updatedSections as any);
    updateCurriculum(updatedSections as any);
  };

  // Update section
  const handleUpdateSection = (
    sectionId: string,
    updates: Partial<CurriculumSection>
  ) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return { ...section, ...updates };
      }
      return section;
    });

    setSections(updatedSections as any);
    updateCurriculum(updatedSections as any);
  };

  // Update curriculum in draft
  const updateCurriculum = (updatedSections: CurriculumSection[]) => {
    const totalLessons = updatedSections.reduce(
      (total, section) => total + section.lessons.length,
      0
    );
    const totalDuration = updatedSections.reduce(
      (total, section) =>
        total +
        section.lessons.reduce(
          (lessonTotal, lesson) => lessonTotal + lesson.duration,
          0
        ),
      0
    );

    // onUpdate({
    //   curriculum: {
    //     sections: updatedSections,
    //     totalLessons,
    //     totalDuration,
    //   },
    // });
  };

  // Get lesson type icon
  const getLessonTypeIcon = (type: CurriculumLesson['type']) => {
    const lessonType = LESSON_TYPES.find(t => t.value === type);
    return lessonType ? lessonType.icon : FileText;
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Build Your Curriculum</h3>
          <p className="text-sm text-muted-foreground">
            Organize your course content into sections and lessons
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {sections.reduce(
              (total, section) => total + section.lessons.length,
              0
            )}{' '}
            lessons •{' '}
            {formatDuration(
              sections.reduce(
                (total, section) =>
                  total +
                  section.lessons.reduce(
                    (lessonTotal, lesson) =>
                      lessonTotal + lesson.estimatedDuration,
                    0
                  ),
                0
              )
            )}
          </div>
          <Button onClick={() => setShowAddSectionDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
        </div>
      </div>

      {/* Curriculum Structure */}
      <div className="space-y-4">
        {sections.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No sections yet</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Start building your curriculum by adding your first section
              </p>
              <Button
                onClick={() => setShowAddSectionDialog(true)}
                className="mt-4"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Section
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {sections.map((section, sectionIndex) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          {sectionIndex + 1}
                        </div>
                        <div className="flex-1">
                          {editingSection === section.id ? (
                            <div className="space-y-2">
                              <Input
                                value={section.title}
                                onChange={e =>
                                  handleUpdateSection(section.id as string, {
                                    title: e.target.value,
                                  })
                                }
                                placeholder="Section title"
                                className="font-medium"
                              />
                              <Textarea
                                value={section.description || ''}
                                onChange={e =>
                                  handleUpdateSection(section.id as string, {
                                    description: e.target.value,
                                  })
                                }
                                placeholder="Section description (optional)"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => setEditingSection(null)}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingSection(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{section.title}</h4>
                                <Badge variant="secondary">
                                  {section.lessons.length} lessons
                                </Badge>
                              </div>
                              {section.description && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {section.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleSection(section.id as string)}
                        >
                          {section.isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setEditingSection(section.id as string)
                          }
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleDeleteSection(section.id as string)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <AnimatePresence>
                    {section.isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            {section.lessons.map((lesson, lessonIndex) => {
                              const IconComponent = getLessonTypeIcon(
                                lesson.lessonType as any
                              );
                              return (
                                <div
                                  key={lesson.id}
                                  className="flex items-center gap-3 rounded-lg border p-3"
                                >
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100">
                                    <IconComponent className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        {lesson.title}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {lesson.type}
                                      </Badge>
                                      {lesson.isPreview && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          Preview
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDuration(
                                          lesson.estimatedDuration
                                        )}
                                      </span>
                                      {lesson.description && (
                                        <span>{lesson.description}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        handleUpdateLesson(
                                          section.id as string,
                                          lesson.id as string,
                                          {
                                            isPreview: !lesson.isPreview,
                                          }
                                        )
                                      }
                                    >
                                      Preview
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        setEditingLesson(lesson.id as string)
                                      }
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        handleDeleteLesson(
                                          section.id as string,
                                          lesson.id as string
                                        )
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}

                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => {
                                setSelectedSectionId(section.id as string);
                                setShowAddLessonDialog(true);
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Lesson
                            </Button>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Add Section Dialog */}
      <AddSectionDialog
        open={showAddSectionDialog}
        onOpenChange={setShowAddSectionDialog}
        onAdd={handleAddSection}
      />

      {/* Add Lesson Dialog */}
      <AddLessonDialog
        open={showAddLessonDialog}
        onOpenChange={setShowAddLessonDialog}
        onAdd={(title, type, duration, description) =>
          handleAddLesson(selectedSectionId, title, type, duration, description)
        }
      />

      {/* Summary */}
      {sections.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">
                  {sections.reduce(
                    (total, section) => total + section.lessons.length,
                    0
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Lessons
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {formatDuration(
                    sections.reduce(
                      (total, section) =>
                        total +
                        section.lessons.reduce(
                          (lessonTotal, lesson) =>
                            (lessonTotal + lesson.estimatedDuration) as number,
                          0
                        ),
                      0
                    )
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Duration
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">{sections.length}</div>
                <div className="text-sm text-muted-foreground">Sections</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Add Section Dialog Component
interface AddSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (title: string, description?: string) => void;
}

const AddSectionDialog: React.FC<AddSectionDialogProps> = ({
  open,
  onOpenChange,
  onAdd,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (title.trim()) {
      onAdd(title.trim(), description.trim() || undefined);
      setTitle('');
      setDescription('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
          <DialogDescription>
            Create a new section to organize your lessons
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="section-title">Section Title *</Label>
            <Input
              id="section-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Introduction to React"
            />
          </div>
          <div>
            <Label htmlFor="section-description">Description (Optional)</Label>
            <Textarea
              id="section-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of what this section covers"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            Add Section
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Add Lesson Dialog Component
interface AddLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (
    title: string,
    type: CurriculumLesson['type'],
    duration: number,
    description?: string
  ) => void;
}

const AddLessonDialog: React.FC<AddLessonDialogProps> = ({
  open,
  onOpenChange,
  onAdd,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CurriculumLesson['type']>('video');
  const [duration, setDuration] = useState(10);
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (title.trim()) {
      onAdd(title.trim(), type, duration, description.trim() || undefined);
      setTitle('');
      setType('video');
      setDuration(10);
      setDescription('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Lesson</DialogTitle>
          <DialogDescription>
            Create a new lesson for this section
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="lesson-title">Lesson Title *</Label>
            <Input
              id="lesson-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Setting up your development environment"
            />
          </div>
          <div>
            <Label htmlFor="lesson-type">Lesson Type</Label>
            <Select
              value={type}
              onValueChange={(value: CurriculumLesson['type']) =>
                setType(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LESSON_TYPES.map(lessonType => {
                  const IconComponent = lessonType.icon;
                  return (
                    <SelectItem key={lessonType.value} value={lessonType.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {lessonType.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="lesson-duration">Duration (minutes)</Label>
            <Input
              id="lesson-duration"
              type="number"
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              min="1"
              max="300"
            />
          </div>
          <div>
            <Label htmlFor="lesson-description">Description (Optional)</Label>
            <Textarea
              id="lesson-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of the lesson content"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            Add Lesson
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
