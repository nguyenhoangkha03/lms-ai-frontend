'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Plus,
  Download,
  Filter,
  Search,
  TrendingUp,
  Users,
  BookOpen,
  Award,
  FileText,
  Calculator,
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

import { GradebookList } from '@/components/teacher/gradebook/GradebookList';
import { GradebookCreationDialog } from '@/components/teacher/gradebook/GradebookCreationDialog';
import { GradingQueueWidget } from '@/components/teacher/gradebook/GradingQueueWidget';
import { GradebookStatsWidget } from '@/components/teacher/gradebook/GradebookStatsWidget';
import { RecentGradingActivity } from '@/components/teacher/gradebook/RecentGradingActivity';
import { GradingAnalyticsWidget } from '@/components/teacher/gradebook/GradingAnalyticsWidget';

import {
  useGetGradebooksQuery,
  useGetManualGradingStatisticsQuery,
  useExportGradebookMutation,
} from '@/lib/redux/api/gradebook-api';
import { Gradebook, GradebookData } from '@/lib/types/gradebook';

interface GradebookOverviewStats {
  totalGradebooks: number;
  totalStudents: number;
  pendingGrades: number;
  avgClassPerformance: number;
  thisWeekGraded: number;
  improvementRate: number;
}

export default function GradebookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // API queries
  const {
    data: gradebooksData,
    isLoading: isLoadingGradebooks,
    refetch: refetchGradebooks,
  } = useGetGradebooksQuery({
    search: searchQuery,
    courseId: selectedCourse!,
    status: filterStatus !== 'all' ? filterStatus : undefined,
  });

  const { data: gradingStats } = useGetManualGradingStatisticsQuery();

  // Mutations
  const [exportGradebook, { isLoading: isExporting }] =
    useExportGradebookMutation();

  // Calculate overview stats
  const overviewStats: GradebookOverviewStats = {
    totalGradebooks: gradebooksData?.gradebooks?.length || 0,
    totalStudents:
      gradebooksData?.gradebooks?.reduce(
        (sum: number, gb: Gradebook) => sum + gb.totalStudents,
        0
      ) || 0,
    pendingGrades: gradingStats?.totalPending || 0,
    avgClassPerformance:
      gradebooksData && gradebooksData.gradebooks
        ? gradebooksData.gradebooks.reduce(
            (sum: number, gb: Gradebook) => sum + gb.classAverage,
            0
          ) / Math.max(gradebooksData.gradebooks.length, 1)
        : 0,
    thisWeekGraded: 0, // This would come from API
    improvementRate: 0, // This would come from API
  };

  const handleExportGradebook = async (gradebookId: string, format: string) => {
    try {
      const blob = await exportGradebook({
        id: gradebookId,
        format,
        options: {
          includeComments: true,
          includeStatistics: true,
        },
      }).unwrap();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gradebook-${gradebookId}.${format}`;
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

  const handleCreateGradebook = () => {
    setShowCreateDialog(true);
  };

  const handleGradebookCreated = () => {
    setShowCreateDialog(false);
    refetchGradebooks();
    toast({
      title: 'Gradebook Created',
      description: 'New gradebook has been created successfully.',
    });
  };

  if (isLoadingGradebooks) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gradebook</h1>
          <p className="text-muted-foreground">
            Manage grades, track student progress, and generate reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/teacher/manual-grading')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Manual Grading
          </Button>
          <Button onClick={handleCreateGradebook}>
            <Plus className="mr-2 h-4 w-4" />
            New Gradebook
          </Button>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Gradebooks
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewStats.totalGradebooks}
            </div>
            <p className="text-xs text-muted-foreground">
              Active across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewStats.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Grades
            </CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewStats.pendingGrades}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting grading</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewStats.avgClassPerformance.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gradebooks">Gradebooks</TabsTrigger>
          <TabsTrigger value="grading-queue">Grading Queue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Grading Queue Widget */}
            <GradingQueueWidget />

            {/* Recent Activity */}
            <RecentGradingActivity />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Gradebook Stats */}
            <GradebookStatsWidget />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/teacher/manual-grading')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Review Pending Submissions
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/teacher/assessments')}
                >
                  <Award className="mr-2 h-4 w-4" />
                  Create New Assessment
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('analytics')}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Grade Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gradebooks Tab */}
        <TabsContent value="gradebooks" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search gradebooks..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                    {filterStatus !== 'all' && (
                      <Badge variant="secondary" className="ml-2">
                        {filterStatus}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilterStatus('finalized')}
                  >
                    Finalized
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('archived')}>
                    Archived
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isExporting}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => handleExportGradebook('all', 'csv')}
                  >
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleExportGradebook('all', 'xlsx')}
                  >
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleExportGradebook('all', 'pdf')}
                  >
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Gradebooks List */}
          <GradebookList
            gradebooks={gradebooksData?.gradebooks || []}
            onExport={handleExportGradebook}
            onRefresh={refetchGradebooks}
          />
        </TabsContent>

        {/* Grading Queue Tab */}
        <TabsContent value="grading-queue" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Manual Grading Queue</h3>
              <p className="text-sm text-muted-foreground">
                Submissions requiring manual review and grading
              </p>
            </div>
            <Button onClick={() => router.push('/teacher/manual-grading')}>
              View Full Queue
            </Button>
          </div>

          <GradingQueueWidget showFullView />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Grading Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Insights into grading patterns and student performance
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/teacher/analytics')}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Detailed Analytics
            </Button>
          </div>

          <GradingAnalyticsWidget />
        </TabsContent>
      </Tabs>

      {/* Gradebook Creation Dialog */}
      <GradebookCreationDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleGradebookCreated}
      />
    </div>
  );
}
