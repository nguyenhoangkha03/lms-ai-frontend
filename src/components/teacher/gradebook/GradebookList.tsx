'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Calculator,
  Archive,
  Settings,
  FileText,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

import { Gradebook } from '@/lib/types/gradebook';

interface GradebookListProps {
  gradebooks: Gradebook[];
  onExport: (gradebookId: string, format: string) => void;
  onRefresh: () => void;
}

export function GradebookList({
  gradebooks,
  onExport,
  onRefresh,
}: GradebookListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedGradebook, setSelectedGradebook] = useState<string | null>(
    null
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'finalized':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 80) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (percentage >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleViewGradebook = (gradebookId: string) => {
    router.push(`/teacher/gradebook/${gradebookId}`);
  };

  const handleEditGradebook = (gradebookId: string) => {
    router.push(`/teacher/gradebook/${gradebookId}/settings`);
  };

  const handleCalculateGrades = async (gradebookId: string) => {
    try {
      // This would call the API to recalculate grades
      toast({
        title: 'Calculating Grades',
        description: 'Grade calculation has been started.',
      });
      onRefresh();
    } catch (error) {
      toast({
        title: 'Calculation Failed',
        description: 'Failed to calculate grades. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleArchiveGradebook = async (gradebookId: string) => {
    try {
      // This would call the API to archive the gradebook
      toast({
        title: 'Gradebook Archived',
        description: 'Gradebook has been archived successfully.',
      });
      onRefresh();
    } catch (error) {
      toast({
        title: 'Archive Failed',
        description: 'Failed to archive gradebook. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (gradebooks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No Gradebooks Found</h3>
          <p className="mb-4 text-center text-muted-foreground">
            Create your first gradebook to start managing student grades.
          </p>
          <Button onClick={() => router.push('/teacher/gradebook/create')}>
            Create Gradebook
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {gradebooks.map(gradebook => (
        <Card key={gradebook.id} className="transition-shadow hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-1">
                <CardTitle className="line-clamp-2 text-base">
                  {gradebook.name}
                </CardTitle>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {gradebook.description || 'No description'}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleViewGradebook(gradebook.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Gradebook
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleEditGradebook(gradebook.id)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleCalculateGrades(gradebook.id)}
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    Recalculate Grades
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onExport(gradebook.id, 'xlsx')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onExport(gradebook.id, 'csv')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {gradebook.status !== 'archived' && (
                    <DropdownMenuItem
                      onClick={() => handleArchiveGradebook(gradebook.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className={getStatusColor(gradebook.status)}
              >
                {gradebook.status.charAt(0).toUpperCase() +
                  gradebook.status.slice(1)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Updated {new Date(gradebook.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {gradebook.totalStudents}
                </div>
                <div className="text-xs text-muted-foreground">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {gradebook.totalAssessments}
                </div>
                <div className="text-xs text-muted-foreground">Assessments</div>
              </div>
            </div>

            {/* Class Average */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Class Average</span>
                <span
                  className={`text-sm font-semibold ${getGradeColor(gradebook.classAverage)}`}
                >
                  {gradebook.classAverage.toFixed(1)}%
                </span>
              </div>
              <Progress value={gradebook.classAverage} className="h-2" />
            </div>

            {/* Grading Scale Preview */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Grading Scale</span>
              <div className="flex items-center gap-1">
                {gradebook.gradingScale.ranges
                  .slice(0, 4)
                  .map((range: any, index: any) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {range.grade}
                    </Badge>
                  ))}
                {gradebook.gradingScale.ranges.length > 4 && (
                  <span className="text-xs text-muted-foreground">
                    +{gradebook.gradingScale.ranges.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => handleViewGradebook(gradebook.id)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditGradebook(gradebook.id)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {/* Last Calculation Info */}
            {gradebook.lastCalculatedAt && (
              <div className="border-t pt-2 text-center text-xs text-muted-foreground">
                Last calculated{' '}
                {new Date(gradebook.lastCalculatedAt).toLocaleDateString()}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
