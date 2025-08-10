'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Copy, BarChart3 } from 'lucide-react';

import {
  useGetAssessmentsQuery,
  useArchiveAssessmentMutation,
  useDuplicateAssessmentMutation,
} from '@/lib/redux/api/assessment-creation-api';

export default function AssessmentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: assessmentsData, isLoading } = useGetAssessmentsQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    page: 1,
    limit: 20,
  });

  const [archiveAssessment] = useArchiveAssessmentMutation();
  const [duplicateAssessment] = useDuplicateAssessmentMutation();

  const handleCreateNew = () => {
    router.push('/teacher/assessments/create');
  };

  const handleEdit = (id: string) => {
    router.push(`/teacher/assessments/${id}/edit`);
  };

  const handleDuplicate = async (id: string) => {
    try {
      const result = await duplicateAssessment(id).unwrap();
      router.push(`/teacher/assessments/${result.id}/edit`);
    } catch (error) {
      console.error('Failed to duplicate assessment:', error);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveAssessment(id).unwrap();
    } catch (error) {
      console.error('Failed to archive assessment:', error);
    }
  };

  const assessments = assessmentsData?.assessments || [];

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assessments</h1>
          <p className="mt-1 text-muted-foreground">
            Create and manage your course assessments
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create Assessment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search assessments..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="survey">Survey</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assessments Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assessments.map(assessment => (
          <Card
            key={assessment.id}
            className="transition-shadow hover:shadow-md"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="line-clamp-1 text-lg">
                    {assessment.title}
                  </CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {assessment.description}
                  </CardDescription>
                </div>
                <div className="ml-2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(assessment.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicate(assessment.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Assessment Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{assessment.assessmentType}</Badge>
                    <Badge
                      variant={
                        assessment.status === 'published'
                          ? 'default'
                          : assessment.status === 'draft'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {assessment.status}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground">
                    {assessment.questions?.length || 0} questions
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{assessment.totalPoints}</div>
                    <div className="text-muted-foreground">Points</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">
                      {assessment.timeLimit ? `${assessment.timeLimit}m` : '∞'}
                    </div>
                    <div className="text-muted-foreground">Time</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{assessment.maxAttempts}</div>
                    <div className="text-muted-foreground">Attempts</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(assessment.id)}
                    className="flex-1"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/teacher/assessments/${assessment.id}/analytics`
                      )
                    }
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {assessments.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No Assessments Yet</h3>
            <p className="mb-4 text-muted-foreground">
              Start creating assessments to evaluate your students' progress
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Assessment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
