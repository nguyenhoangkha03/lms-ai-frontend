'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Settings,
  Download,
  Calculator,
  Filter,
  Search,
  Eye,
  EyeOff,
  ChevronLeft,
  Users,
  TrendingUp,
  FileText,
  MoreHorizontal,
  Plus,
  Send,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';

import { GradebookGrid } from '@/components/teacher/gradebook/GradebookGrid';
import { GradebookStatistics } from '@/components/teacher/gradebook/GradebookStatistics';
import { StudentGradeDetails } from '@/components/teacher/gradebook/StudentGradeDetails';
import { BulkGradingDialog } from '@/components/teacher/gradebook/BulkGradingDialog';
import { GradePublishingDialog } from '@/components/teacher/gradebook/GradePublishingDialog';

import {
  useGetGradebookDataQuery,
  useGetGradebookSummaryQuery,
  useCalculateGradesMutation,
  useExportGradebookMutation,
} from '@/lib/redux/api/gradebook-api';

export default function GradebookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const gradebookId = params.id as string;

  // Local state
  const [activeTab, setActiveTab] = useState('grades');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [showUnpublishedOnly, setShowUnpublishedOnly] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  // API queries
  const {
    data: gradebookData,
    isLoading,
    refetch,
  } = useGetGradebookDataQuery({
    id: gradebookId,
    filters: {
      search: searchQuery,
      unpublishedOnly: showUnpublishedOnly,
    },
  });

  const { data: summaryData } = useGetGradebookSummaryQuery(gradebookId);

  // Mutations
  const [calculateGrades, { isLoading: isCalculating }] =
    useCalculateGradesMutation();
  const [exportGradebook, { isLoading: isExporting }] =
    useExportGradebookMutation();

  const handleCalculateGrades = async () => {
    try {
      await calculateGrades(gradebookId).unwrap();
      toast({
        title: 'Grades Calculated',
        description: 'All grades have been recalculated successfully.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Calculation Failed',
        description: 'Failed to calculate grades. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async (format: string) => {
    try {
      const blob = await exportGradebook({
        id: gradebookId,
        format,
        options: {
          includeComments: true,
          includeStatistics: true,
          includeTimestamps: true,
        },
      }).unwrap();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gradebook-${gradebookData?.gradebook?.name || 'export'}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export Successful',
        description: 'Gradebook has been exported successfully.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export gradebook. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBulkPublish = () => {
    if (selectedGrades.length === 0) {
      toast({
        title: 'No Grades Selected',
        description: 'Please select grades to publish.',
        variant: 'destructive',
      });
      return;
    }
    setShowPublishDialog(true);
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudent(studentId);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!gradebookData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold">Gradebook Not Found</h2>
          <p className="mb-4 text-muted-foreground">
            The gradebook you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button onClick={() => router.push('/teacher/gradebook')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Gradebooks
          </Button>
        </div>
      </div>
    );
  }

  const { gradebook, students, assessments, grades } = gradebookData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/teacher/gradebook')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {gradebook.name}
            </h1>
            <p className="text-muted-foreground">
              {gradebook.description ||
                'Gradebook for course grades and assessment tracking'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isExporting}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Export as PDF Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCalculateGrades}
            disabled={isCalculating}
          >
            <Calculator className="mr-2 h-4 w-4" />
            {isCalculating ? 'Calculating...' : 'Recalculate'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/teacher/gradebook/${gradebookId}/settings`)
            }
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradebook.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled in course</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gradebook.totalAssessments}
            </div>
            <p className="text-xs text-muted-foreground">Total assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gradebook.classAverage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Current performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Badge
              variant={gradebook.status === 'active' ? 'default' : 'secondary'}
            >
              {gradebook.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm">Last calculated</div>
            <p className="text-xs text-muted-foreground">
              {gradebook.lastCalculatedAt
                ? new Date(gradebook.lastCalculatedAt).toLocaleDateString()
                : 'Never'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="grades">Grade Grid</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            {/* Search and Filters */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>

              <Button
                variant={showUnpublishedOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowUnpublishedOnly(!showUnpublishedOnly)}
              >
                {showUnpublishedOnly ? (
                  <Eye className="mr-2 h-4 w-4" />
                ) : (
                  <EyeOff className="mr-2 h-4 w-4" />
                )}
                {showUnpublishedOnly ? 'Show All' : 'Unpublished Only'}
              </Button>
            </div>

            {/* Bulk Actions */}
            {selectedGrades.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedGrades.length} selected
                </span>
                <Button size="sm" onClick={handleBulkPublish}>
                  <Send className="mr-2 h-4 w-4" />
                  Publish Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkDialog(true)}
                >
                  <MoreHorizontal className="mr-2 h-4 w-4" />
                  Bulk Actions
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Grade Grid Tab */}
        <TabsContent value="grades">
          <GradebookGrid
            gradebook={gradebook}
            students={students}
            assessments={assessments}
            grades={grades}
            selectedGrades={selectedGrades}
            onGradeSelect={setSelectedGrades}
            onStudentSelect={handleStudentSelect}
            searchQuery={searchQuery}
            showUnpublishedOnly={showUnpublishedOnly}
          />
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students">
          <div className="grid gap-6">
            {selectedStudent ? (
              <StudentGradeDetails
                studentId={selectedStudent}
                gradebookId={gradebookId}
                onBack={() => setSelectedStudent(null)}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {students.map(student => (
                  <Card
                    key={student.id}
                    className="cursor-pointer transition-shadow hover:shadow-lg"
                  >
                    <CardHeader
                      className="pb-3"
                      onClick={() => handleStudentSelect(student.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-sm font-medium">
                            {student.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">
                            {student.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Overall Grade:
                          </span>
                          <Badge
                            variant={
                              student.overallPercentage >= 70
                                ? 'default'
                                : 'destructive'
                            }
                          >
                            {student.letterGrade} (
                            {student.overallPercentage.toFixed(1)}%)
                          </Badge>
                        </div>

                        {student.rank && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Class Rank:</span>
                            <span className="text-sm font-medium">
                              #{student.rank}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-sm">Last Activity:</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(
                              student.lastActivity
                            ).toLocaleDateString()}
                          </span>
                        </div>

                        {student.riskLevel !== 'low' && (
                          <Badge
                            variant="destructive"
                            className="w-full justify-center"
                          >
                            {student.riskLevel.charAt(0).toUpperCase() +
                              student.riskLevel.slice(1)}{' '}
                            Risk
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics">
          <GradebookStatistics
            gradebook={gradebook}
            statistics={summaryData}
            students={students}
            assessments={assessments}
            grades={grades}
          />
        </TabsContent>
      </Tabs>

      {/* Bulk Grading Dialog */}
      <BulkGradingDialog
        open={showBulkDialog}
        onClose={() => setShowBulkDialog(false)}
        selectedGrades={selectedGrades}
        onSuccess={() => {
          setShowBulkDialog(false);
          setSelectedGrades([]);
          refetch();
        }}
      />

      {/* Grade Publishing Dialog */}
      <GradePublishingDialog
        open={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
        selectedGrades={selectedGrades}
        onSuccess={() => {
          setShowPublishDialog(false);
          setSelectedGrades([]);
          refetch();
        }}
      />
    </div>
  );
}
