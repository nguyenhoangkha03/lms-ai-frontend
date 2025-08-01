'use client';

import { useState, useMemo } from 'react';
import {
  Clock,
  AlertTriangle,
  Edit,
  Eye,
  MessageSquare,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

import { GradeEditDialog } from '@/components/teacher/gradebook/GradeEditDialog';
import { GradeFeedbackDialog } from '@/components/teacher/gradebook/GradeFeedbackDialog';

import {
  Gradebook,
  GradebookStudent,
  GradebookAssessment,
  Grade,
} from '@/lib/types/gradebook';

interface GradebookGridProps {
  gradebook: Gradebook;
  students: GradebookStudent[];
  assessments: GradebookAssessment[];
  grades: Grade[];
  selectedGrades: string[];
  onGradeSelect: (gradeIds: string[]) => void;
  onStudentSelect: (studentId: string) => void;
  searchQuery: string;
  showUnpublishedOnly: boolean;
}

interface GradeCell {
  gradeId?: string;
  studentId: string;
  assessmentId: string;
  score?: number;
  maxScore: number;
  percentage?: number;
  status: 'graded' | 'pending' | 'missing' | 'late';
  isPublished: boolean;
  hasComments: boolean;
  letterGrade?: string;
  trend?: 'up' | 'down' | 'stable';
}

export function GradebookGrid({
  gradebook,
  students,
  assessments,
  grades,
  selectedGrades,
  onGradeSelect,
  onStudentSelect,
  searchQuery,
  showUnpublishedOnly,
}: GradebookGridProps) {
  const [editingGrade, setEditingGrade] = useState<string | null>(null);
  const [viewingFeedback, setViewingFeedback] = useState<string | null>(null);
  const [quickEditValue, setQuickEditValue] = useState<string>('');
  const [quickEditCell, setQuickEditCell] = useState<string | null>(null);

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    return students.filter(
      student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  // Create grade lookup map for efficient access
  const gradeMap = useMemo(() => {
    const map = new Map<string, Grade>();
    grades.forEach(grade => {
      const key = `${grade.studentId}-${grade.assessmentId}`;
      map.set(key, grade);
    });
    return map;
  }, [grades]);

  // Create grade cells matrix
  const gradeCells = useMemo(() => {
    const cells: GradeCell[][] = [];

    filteredStudents.forEach((student, studentIndex) => {
      const studentCells: GradeCell[] = [];

      assessments.forEach(assessment => {
        const key = `${student.id}-${assessment.id}`;
        const grade = gradeMap.get(key);

        const cell: GradeCell = {
          gradeId: grade?.id,
          studentId: student.id,
          assessmentId: assessment.id,
          maxScore: assessment.maxScore,
          status: grade ? 'graded' : 'missing',
          isPublished: grade?.isPublished || false,
          hasComments: !!(grade?.comments || grade?.overallFeedback),
          score: grade?.score,
          percentage: grade?.percentage,
          letterGrade: grade
            ? getLetterGrade(grade.percentage, gradebook.gradingScale)
            : undefined,
          trend: calculateTrend(student.id, assessment.id, grades),
        };

        // Apply filters
        if (showUnpublishedOnly && cell.isPublished) {
          return;
        }

        studentCells.push(cell);
      });

      cells.push(studentCells);
    });

    return cells;
  }, [
    filteredStudents,
    assessments,
    gradeMap,
    gradebook.gradingScale,
    showUnpublishedOnly,
    grades,
  ]);

  const getLetterGrade = (percentage: number, gradingScale: any) => {
    if (!gradingScale?.ranges) return 'N/A';

    for (const range of gradingScale.ranges) {
      if (percentage >= range.minPercent && percentage <= range.maxPercent) {
        return range.grade;
      }
    }
    return 'F';
  };

  const calculateTrend = (
    studentId: string,
    assessmentId: string,
    allGrades: Grade[]
  ) => {
    // This would implement trend calculation based on recent grades
    // For now, return stable
    return 'stable' as const;
  };

  const getCellColor = (cell: GradeCell) => {
    if (cell.status === 'missing') return 'bg-gray-50 dark:bg-gray-900';
    if (!cell.isPublished) return 'bg-yellow-50 dark:bg-yellow-900/20';

    if (cell.percentage !== undefined) {
      if (cell.percentage >= 90) return 'bg-green-50 dark:bg-green-900/20';
      if (cell.percentage >= 80) return 'bg-blue-50 dark:bg-blue-900/20';
      if (cell.percentage >= 70) return 'bg-yellow-50 dark:bg-yellow-900/20';
      if (cell.percentage >= 60) return 'bg-orange-50 dark:bg-orange-900/20';
      return 'bg-red-50 dark:bg-red-900/20';
    }

    return 'bg-white dark:bg-gray-800';
  };

  const getCellTextColor = (cell: GradeCell) => {
    if (cell.status === 'missing') return 'text-gray-400';
    if (!cell.isPublished) return 'text-yellow-700 dark:text-yellow-300';

    if (cell.percentage !== undefined) {
      if (cell.percentage >= 90) return 'text-green-700 dark:text-green-300';
      if (cell.percentage >= 80) return 'text-blue-700 dark:text-blue-300';
      if (cell.percentage >= 70) return 'text-yellow-700 dark:text-yellow-300';
      if (cell.percentage >= 60) return 'text-orange-700 dark:text-orange-300';
      return 'text-red-700 dark:text-red-300';
    }

    return 'text-gray-900 dark:text-gray-100';
  };

  const handleCellSelect = (cell: GradeCell, isSelected: boolean) => {
    if (!cell.gradeId) return;

    if (isSelected) {
      onGradeSelect([...selectedGrades, cell.gradeId]);
    } else {
      onGradeSelect(selectedGrades.filter(id => id !== cell.gradeId));
    }
  };

  const handleQuickEdit = (cell: GradeCell) => {
    if (!cell.gradeId) return;

    setQuickEditCell(cell.gradeId);
    setQuickEditValue(cell.score?.toString() || '');
  };

  const handleQuickEditSave = async () => {
    if (!quickEditCell || !quickEditValue) return;

    try {
      // This would call the API to update the grade
      // await updateGrade({ id: quickEditCell, score: parseFloat(quickEditValue) });
      setQuickEditCell(null);
      setQuickEditValue('');
    } catch (error) {
      console.error('Failed to update grade:', error);
    }
  };

  const handleQuickEditCancel = () => {
    setQuickEditCell(null);
    setQuickEditValue('');
  };

  const renderGradeCell = (
    cell: GradeCell,
    rowIndex: number,
    colIndex: number
  ) => {
    const isSelected = cell.gradeId
      ? selectedGrades.includes(cell.gradeId)
      : false;
    const isQuickEditing = quickEditCell === cell.gradeId;

    return (
      <TableCell
        key={`${cell.studentId}-${cell.assessmentId}`}
        className={`relative border-r p-2 text-center ${getCellColor(cell)} ${getCellTextColor(cell)}`}
      >
        <div className="flex min-h-[40px] items-center justify-center">
          {isQuickEditing ? (
            <div className="flex items-center gap-1">
              <Input
                value={quickEditValue}
                onChange={e => setQuickEditValue(e.target.value)}
                className="h-8 w-16 text-center text-xs"
                onKeyPress={e => {
                  if (e.key === 'Enter') handleQuickEditSave();
                  if (e.key === 'Escape') handleQuickEditCancel();
                }}
                onBlur={handleQuickEditSave}
                autoFocus
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1">
              {cell.gradeId && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={checked =>
                    handleCellSelect(cell, checked as boolean)
                  }
                  className="h-3 w-3"
                />
              )}

              <div className="flex flex-col items-center gap-1">
                {cell.status === 'missing' ? (
                  <span className="text-xs">-</span>
                ) : (
                  <>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">
                        {cell.score?.toFixed(1) || '0'}/{cell.maxScore}
                      </span>
                      {cell.trend === 'up' && (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      )}
                      {cell.trend === 'down' && (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs">
                        {cell.letterGrade} ({cell.percentage?.toFixed(1)}%)
                      </span>
                      {!cell.isPublished && (
                        <Clock className="h-3 w-3 text-yellow-500" />
                      )}
                      {cell.hasComments && (
                        <MessageSquare className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                  </>
                )}
              </div>

              {cell.gradeId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleQuickEdit(cell)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Quick Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setEditingGrade(cell.gradeId!)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Full Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setViewingFeedback(cell.gradeId!)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      View Feedback
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
      </TableCell>
    );
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Grade Grid</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {filteredStudents.length} Students
              </Badge>
              <Badge variant="outline">{assessments.length} Assessments</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-10 w-48 bg-white dark:bg-gray-800">
                    Student
                  </TableHead>
                  {assessments.map(assessment => (
                    <TableHead
                      key={assessment.id}
                      className="min-w-[120px] border-r text-center"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help">
                            <div className="truncate font-medium">
                              {assessment.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {assessment.maxScore} pts • {assessment.type}
                            </div>
                            {assessment.dueDate && (
                              <div className="text-xs text-muted-foreground">
                                Due:{' '}
                                {new Date(
                                  assessment.dueDate
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="max-w-xs">
                            <div className="font-medium">
                              {assessment.title}
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              Type: {assessment.type}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Max Score: {assessment.maxScore} points
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Weight: {assessment.weight}%
                            </div>
                            {assessment.dueDate && (
                              <div className="text-sm text-muted-foreground">
                                Due:{' '}
                                {new Date(
                                  assessment.dueDate
                                ).toLocaleDateString()}
                              </div>
                            )}
                            <div className="mt-2 text-sm text-muted-foreground">
                              Submitted: {assessment.submissionCount}/
                              {filteredStudents.length}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Graded: {assessment.gradedCount}/
                              {assessment.submissionCount}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Class Average:{' '}
                              {assessment.averageScore.toFixed(1)}%
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TableHead>
                  ))}
                  <TableHead className="w-24 border-l-2 text-center">
                    Final
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student, studentIndex) => (
                  <TableRow
                    key={student.id}
                    className="group hover:bg-muted/50"
                  >
                    <TableCell className="sticky left-0 z-10 border-r bg-white dark:bg-gray-800">
                      <div
                        className="flex cursor-pointer items-center gap-3"
                        onClick={() => onStudentSelect(student.id)}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-xs font-medium">
                            {student.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {student.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {student.email}
                          </div>
                        </div>
                        {student.riskLevel !== 'low' && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>

                    {gradeCells[studentIndex]?.map((cell, colIndex) =>
                      renderGradeCell(cell, studentIndex, colIndex)
                    )}

                    <TableCell className="border-l-2 bg-gray-50 text-center dark:bg-gray-900">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-bold">
                          {student.letterGrade}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {student.overallPercentage.toFixed(1)}%
                        </span>
                        {student.rank && (
                          <span className="text-xs text-muted-foreground">
                            #{student.rank}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Grade Edit Dialog */}
      <GradeEditDialog
        gradeId={editingGrade}
        open={!!editingGrade}
        onClose={() => setEditingGrade(null)}
        onSuccess={() => setEditingGrade(null)}
      />

      {/* Grade Feedback Dialog */}
      <GradeFeedbackDialog
        gradeId={viewingFeedback}
        open={!!viewingFeedback}
        onClose={() => setViewingFeedback(null)}
      />
    </TooltipProvider>
  );
}
