'use client';

import React, { useState } from 'react';
import {
  Settings,
  Users,
  MessageSquare,
  Star,
  Award,
  Eye,
  Shield,
  Bell,
  Globe,
  Clock,
  BookOpen,
  CheckCircle,
  Info,
  Lock,
  UserCheck,
  Mail,
  Download,
  Share2,
  Zap,
  Crown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

import type { CourseDraft } from '@/lib/redux/api/course-creation-api';

interface SettingsStepProps {
  draft: CourseDraft;
  onUpdate: (updates: Partial<CourseDraft>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

const ENROLLMENT_LIMITS = [
  {
    value: undefined,
    label: 'Unlimited',
    description: 'No limit on enrollments',
  },
  {
    value: 50,
    label: '50 Students',
    description: 'Good for interactive courses',
  },
  { value: 100, label: '100 Students', description: 'Standard class size' },
  { value: 250, label: '250 Students', description: 'Large cohort' },
  { value: 500, label: '500 Students', description: 'Very large audience' },
  { value: 1000, label: '1000 Students', description: 'Massive open course' },
];

const CERTIFICATE_TEMPLATES = [
  { value: 'modern', label: 'Modern', preview: '/certificate-modern.jpg' },
  { value: 'classic', label: 'Classic', preview: '/certificate-classic.jpg' },
  { value: 'elegant', label: 'Elegant', preview: '/certificate-elegant.jpg' },
  {
    value: 'professional',
    label: 'Professional',
    preview: '/certificate-professional.jpg',
  },
];

export function SettingsStep({
  draft,
  onUpdate,
  onNext,
  onPrevious,
  isLoading,
  errors = {},
}: SettingsStepProps) {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('general');

  // Update settings
  const updateSettings = (updates: Partial<typeof draft.settings>) => {
    onUpdate({
      settings: { ...draft.settings, ...updates },
    });
  };

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Course Settings
          </CardTitle>
          <CardDescription>
            Configure additional settings and preferences for your course
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Settings Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Visibility & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Public Course
                  </Label>
                  <p className="text-sm text-gray-600">
                    Make your course discoverable in the course catalog
                  </p>
                </div>
                <Switch
                  checked={draft.settings.isPublic}
                  onCheckedChange={checked =>
                    updateSettings({ isPublic: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Require Approval
                  </Label>
                  <p className="text-sm text-gray-600">
                    Manually approve student enrollments
                  </p>
                </div>
                <Switch
                  checked={draft.settings.requiresApproval}
                  onCheckedChange={checked =>
                    updateSettings({ requiresApproval: checked })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Course Availability</Label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm">Available From</Label>
                    <Input
                      type="datetime-local"
                      value={draft.settings.availableFrom || ''}
                      onChange={e =>
                        updateSettings({
                          availableFrom: e.target.value || undefined,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Available Until</Label>
                    <Input
                      type="datetime-local"
                      value={draft.settings.availableUntil || ''}
                      onChange={e =>
                        updateSettings({
                          availableUntil: e.target.value || undefined,
                        })
                      }
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Leave empty for always available
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enrollment Settings */}
        <TabsContent value="enrollment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Enrollment Limits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Maximum Enrollments</Label>
                <Select
                  value={
                    draft.settings.enrollmentLimit?.toString() || 'unlimited'
                  }
                  onValueChange={value =>
                    updateSettings({
                      enrollmentLimit:
                        value === 'unlimited' ? undefined : parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                    {ENROLLMENT_LIMITS.filter(limit => limit.value).map(
                      limit => (
                        <SelectItem
                          key={limit.value}
                          value={limit.value!.toString()}
                        >
                          <div>
                            <div className="font-medium">{limit.label}</div>
                            <div className="text-sm text-gray-500">
                              {limit.description}
                            </div>
                          </div>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {draft.settings.enrollmentLimit && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Limited enrollment can create urgency and exclusivity,
                    potentially increasing conversions.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Enrollment Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Receive email when students enroll
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Welcome Messages</Label>
                  <p className="text-sm text-gray-600">
                    Send welcome email to new students
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Settings */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Community Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Allow Reviews
                  </Label>
                  <p className="text-sm text-gray-600">
                    Students can rate and review your course
                  </p>
                </div>
                <Switch
                  checked={draft.settings.allowReviews}
                  onCheckedChange={checked =>
                    updateSettings({ allowReviews: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Allow Discussions
                  </Label>
                  <p className="text-sm text-gray-600">
                    Enable Q&A and discussion forums
                  </p>
                </div>
                <Switch
                  checked={draft.settings.allowDiscussions}
                  onCheckedChange={checked =>
                    updateSettings({ allowDiscussions: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Downloadable Resources
                  </Label>
                  <p className="text-sm text-gray-600">
                    Allow students to download course materials
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certificates & Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Course Certificate
                  </Label>
                  <p className="text-sm text-gray-600">
                    Award completion certificates to students
                  </p>
                </div>
                <Switch
                  checked={draft.settings.hasCertificate}
                  onCheckedChange={checked =>
                    updateSettings({ hasCertificate: checked })
                  }
                />
              </div>

              {draft.settings.hasCertificate && (
                <div className="space-y-4 rounded-lg bg-blue-50 p-4">
                  <div className="space-y-2">
                    <Label>Certificate Template</Label>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {CERTIFICATE_TEMPLATES.map(template => (
                        <div
                          key={template.value}
                          className="relative cursor-pointer rounded-lg border-2 border-gray-200 p-2 transition-colors hover:border-blue-300"
                        >
                          <div className="mb-2 flex aspect-video items-center justify-center rounded bg-gray-100">
                            <Award className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-center text-xs font-medium">
                            {template.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Completion Requirements</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                        <span className="text-sm">Complete all lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                        <span className="text-sm">
                          Pass all quizzes (70% minimum)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Submit final project</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Badges & Achievements
                  </Label>
                  <p className="text-sm text-gray-600">
                    Award badges for milestones and achievements
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Advanced Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Social Sharing
                  </Label>
                  <p className="text-sm text-gray-600">
                    Allow students to share course progress on social media
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Push Notifications
                  </Label>
                  <p className="text-sm text-gray-600">
                    Send push notifications for course updates
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Drip Content
                  </Label>
                  <p className="text-sm text-gray-600">
                    Release content on a schedule
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Content Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Video Protection
                  </Label>
                  <p className="text-sm text-gray-600">
                    Prevent video downloads and screen recording
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Watermark Videos
                  </Label>
                  <p className="text-sm text-gray-600">
                    Add your logo watermark to videos
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Course Backup</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export Course Data
                  </Button>
                  <p className="text-xs text-gray-500">
                    Download a backup of your course content and settings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Learning Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Detailed Analytics</Label>
                  <p className="text-sm text-gray-600">
                    Track detailed student progress and engagement
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Completion Tracking</Label>
                  <p className="text-sm text-gray-600">
                    Monitor lesson completion and time spent
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Performance Insights</Label>
                  <p className="text-sm text-gray-600">
                    Get AI-powered insights on student performance
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Settings Summary
          </CardTitle>
          <CardDescription>
            Review your course settings before proceeding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">
                Access & Visibility
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Public Course:</span>
                  <Badge
                    variant={draft.settings.isPublic ? 'default' : 'secondary'}
                  >
                    {draft.settings.isPublic ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Requires Approval:</span>
                  <Badge
                    variant={
                      draft.settings.requiresApproval ? 'default' : 'secondary'
                    }
                  >
                    {draft.settings.requiresApproval ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Enrollment Limit:</span>
                  <Badge variant="outline">
                    {draft.settings.enrollmentLimit || 'Unlimited'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Features</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Reviews:</span>
                  <Badge
                    variant={
                      draft.settings.allowReviews ? 'default' : 'secondary'
                    }
                  >
                    {draft.settings.allowReviews ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Discussions:</span>
                  <Badge
                    variant={
                      draft.settings.allowDiscussions ? 'default' : 'secondary'
                    }
                  >
                    {draft.settings.allowDiscussions ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Certificate:</span>
                  <Badge
                    variant={
                      draft.settings.hasCertificate ? 'default' : 'secondary'
                    }
                  >
                    {draft.settings.hasCertificate ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Alert className="mt-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> Most of these settings can be changed later
              after your course is published. You can always update your course
              configuration based on student feedback and performance.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
