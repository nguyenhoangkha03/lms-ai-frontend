'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Calendar,
  Users,
  BarChart3,
  TrendingUp,
  Filter,
  Settings,
  RefreshCw,
  FileSpreadsheet,
  FileImage,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  useGenerateAnalyticsReportMutation,
  useGetPerformanceAnalyticsQuery,
} from '@/lib/redux/api/teacher-analytics-api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'performance' | 'engagement' | 'progress' | 'comprehensive';
  icon: React.ReactNode;
  estimatedTime: string;
  features: string[];
  popular?: boolean;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'performance-summary',
    name: 'Performance Summary',
    description: 'Comprehensive overview of student performance across all courses',
    type: 'performance',
    icon: <BarChart3 className="h-6 w-6 text-blue-500" />,
    estimatedTime: '2-3 minutes',
    features: ['Grade distributions', 'Class averages', 'Improvement trends', 'Top performers'],
    popular: true,
  },
  {
    id: 'engagement-analysis',
    name: 'Engagement Analysis',
    description: 'Detailed analysis of student engagement patterns and participation',
    type: 'engagement',
    icon: <TrendingUp className="h-6 w-6 text-green-500" />,
    estimatedTime: '3-4 minutes',
    features: ['Activity patterns', 'Participation rates', 'Peak hours', 'At-risk students'],
  },
  {
    id: 'progress-tracking',
    name: 'Progress Tracking',
    description: 'Individual and class progress towards learning objectives',
    type: 'progress',
    icon: <CheckCircle className="h-6 w-6 text-purple-500" />,
    estimatedTime: '4-5 minutes',
    features: ['Learning outcomes', 'Milestone completion', 'Progress charts', 'Recommendations'],
  },
  {
    id: 'comprehensive-report',
    name: 'Comprehensive Report',
    description: 'Complete analytics package with all insights and recommendations',
    type: 'comprehensive',
    icon: <FileText className="h-6 w-6 text-orange-500" />,
    estimatedTime: '5-7 minutes',
    features: ['All analytics', 'Detailed insights', 'Action plans', 'Export ready'],
    popular: true,
  },
];

const recentReports = [
  {
    id: '1',
    name: 'Monthly Performance Report - March 2024',
    type: 'Performance Summary',
    generatedAt: '2024-03-15T10:30:00Z',
    size: '2.4 MB',
    format: 'PDF',
    status: 'completed',
  },
  {
    id: '2',
    name: 'Student Engagement Analysis - Week 10',
    type: 'Engagement Analysis',
    generatedAt: '2024-03-12T14:15:00Z',
    size: '1.8 MB',
    format: 'Excel',
    status: 'completed',
  },
  {
    id: '3',
    name: 'Comprehensive Course Report - CS 101',
    type: 'Comprehensive Report',
    generatedAt: '2024-03-10T09:00:00Z',
    size: '5.2 MB',
    format: 'PDF',
    status: 'completed',
  },
];

export default function TeacherReportsPage() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customReportConfig, setCustomReportConfig] = useState({
    title: '',
    description: '',
    period: 'month',
    format: 'pdf',
    includeCharts: true,
    includeRecommendations: true,
    includeStudentDetails: false,
    coursesSelected: [] as string[],
    sectionsIncluded: {
      overview: true,
      performance: true,
      engagement: true,
      content: false,
      assessments: false,
    },
  });

  const { data: analyticsData } = useGetPerformanceAnalyticsQuery({ period: 'month' });
  const [generateReport] = useGenerateAnalyticsReportMutation();

  const handleGenerateTemplate = async (template: ReportTemplate) => {
    setIsGenerating(true);
    try {
      const blob = await generateReport({
        type: template.type,
        format: 'pdf',
        period: 'month',
        includeCharts: true,
        includeRecommendations: true,
      }).unwrap();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Report Generated Successfully',
        description: `${template.name} has been generated and downloaded.`,
      });
    } catch (error) {
      toast({
        title: 'Report Generation Failed',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCustomReport = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateReport({
        type: 'comprehensive',
        format: customReportConfig.format as any,
        period: customReportConfig.period as any,
        includeCharts: customReportConfig.includeCharts,
        includeRecommendations: customReportConfig.includeRecommendations,
      }).unwrap();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${customReportConfig.title || 'custom-report'}-${Date.now()}.${customReportConfig.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Custom Report Generated',
        description: 'Your custom report has been generated and downloaded.',
      });
      setShowCustomDialog(false);
    } catch (error) {
      toast({
        title: 'Report Generation Failed',
        description: 'Failed to generate custom report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Reports & Analytics
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Generate comprehensive reports and export analytics data
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg">
                    <Settings className="mr-2 h-4 w-4" />
                    Custom Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Custom Report</DialogTitle>
                    <DialogDescription>
                      Customize your report with specific data and formatting options
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Report Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter report title..."
                        value={customReportConfig.title}
                        onChange={(e) => setCustomReportConfig(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of the report purpose..."
                        value={customReportConfig.description}
                        onChange={(e) => setCustomReportConfig(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Time Period</Label>
                        <Select
                          value={customReportConfig.period}
                          onValueChange={(value) => setCustomReportConfig(prev => ({ ...prev, period: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="semester">This Semester</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Export Format</Label>
                        <Select
                          value={customReportConfig.format}
                          onValueChange={(value) => setCustomReportConfig(prev => ({ ...prev, format: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF Document</SelectItem>
                            <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                            <SelectItem value="csv">CSV Data</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Report Options</Label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="charts"
                            checked={customReportConfig.includeCharts}
                            onCheckedChange={(checked) => setCustomReportConfig(prev => ({ ...prev, includeCharts: checked as boolean }))}
                          />
                          <Label htmlFor="charts">Include Charts and Visualizations</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="recommendations"
                            checked={customReportConfig.includeRecommendations}
                            onCheckedChange={(checked) => setCustomReportConfig(prev => ({ ...prev, includeRecommendations: checked as boolean }))}
                          />
                          <Label htmlFor="recommendations">Include AI Recommendations</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="studentDetails"
                            checked={customReportConfig.includeStudentDetails}
                            onCheckedChange={(checked) => setCustomReportConfig(prev => ({ ...prev, includeStudentDetails: checked as boolean }))}
                          />
                          <Label htmlFor="studentDetails">Include Individual Student Details</Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Sections to Include</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(customReportConfig.sectionsIncluded).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                              id={key}
                              checked={value}
                              onCheckedChange={(checked) => setCustomReportConfig(prev => ({
                                ...prev,
                                sectionsIncluded: {
                                  ...prev.sectionsIncluded,
                                  [key]: checked as boolean
                                }
                              }))}
                            />
                            <Label htmlFor={key} className="capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCustomDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleGenerateCustomReport} disabled={isGenerating || !customReportConfig.title}>
                      {isGenerating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Generate Report
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                className="bg-white/80 backdrop-blur-sm border-white/20"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="container mx-auto space-y-8 px-6 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-lg">
            <TabsTrigger value="templates">Report Templates</TabsTrigger>
            <TabsTrigger value="recent">Recent Reports</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          </TabsList>

          {/* Report Templates */}
          <TabsContent value="templates" className="space-y-6">
            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
                <CardHeader>
                  <CardTitle>Quick Analytics Overview</CardTitle>
                  <CardDescription>Current statistics from your teaching dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData && (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{analyticsData.overview.totalStudents}</div>
                        <div className="text-sm text-slate-600">Total Students</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{analyticsData.overview.averageClassScore}%</div>
                        <div className="text-sm text-slate-600">Class Average</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{analyticsData.overview.completionRate}%</div>
                        <div className="text-sm text-slate-600">Completion Rate</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{analyticsData.overview.engagementRate}%</div>
                        <div className="text-sm text-slate-600">Engagement Rate</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {reportTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="group relative bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {template.popular && (
                      <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-cyan-600 z-10">
                        Popular
                      </Badge>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                            {template.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {template.description}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-slate-500" />
                            <span className="text-slate-600">Est. {template.estimatedTime}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {template.type}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">Includes:</p>
                          <div className="grid grid-cols-2 gap-1">
                            {template.features.map((feature, index) => (
                              <div key={index} className="flex items-center text-xs text-slate-600">
                                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleGenerateTemplate(template)}
                            disabled={isGenerating}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                          >
                            {isGenerating ? (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Download className="mr-2 h-4 w-4" />
                                Generate PDF
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-3"
                          >
                            <FileSpreadsheet className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Recent Reports */}
          <TabsContent value="recent" className="space-y-6">
            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
                <CardHeader>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription>Your previously generated reports and downloads</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentReports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                            {report.format === 'PDF' ? (
                              <FileText className="h-5 w-5 text-red-500" />
                            ) : (
                              <FileSpreadsheet className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-800">{report.name}</h4>
                            <div className="flex items-center space-x-3 text-sm text-slate-600">
                              <span>{report.type}</span>
                              <span>•</span>
                              <span>{new Date(report.generatedAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{report.size}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={report.status === 'completed' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {report.status === 'completed' ? (
                              <><CheckCircle className="h-3 w-3 mr-1" /> Completed</>
                            ) : (
                              <><AlertCircle className="h-3 w-3 mr-1" /> Processing</>
                            )}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Scheduled Reports */}
          <TabsContent value="scheduled" className="space-y-6">
            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Scheduled Reports</CardTitle>
                      <CardDescription>Automatically generated reports based on your preferences</CardDescription>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-500 to-cyan-600">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule New
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">No Scheduled Reports</h3>
                    <p className="text-slate-500 mb-6">
                      Set up automatic report generation to receive regular analytics updates
                    </p>
                    <Button className="bg-gradient-to-r from-blue-500 to-cyan-600">
                      <Settings className="mr-2 h-4 w-4" />
                      Create Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}