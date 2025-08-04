'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Eye,
  Edit,
  Copy,
  Plus,
  Send,
  BarChart3,
  Download,
  Zap,
  Hash,
  AtSign,
} from 'lucide-react';

interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  type:
    | 'course_enrollment'
    | 'lesson_available'
    | 'assignment_due'
    | 'grade_posted'
    | 'system_maintenance'
    | 'security_alert'
    | 'announcement'
    | 'reminder_study';
  channel: 'email' | 'push' | 'sms' | 'in_app' | 'slack' | 'discord';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category:
    | 'academic'
    | 'social'
    | 'system'
    | 'security'
    | 'marketing'
    | 'administrative';
  isActive: boolean;
  subject: string;
  content: string;
  htmlContent?: string;
  variables: string[];
  triggers: Array<{
    event: string;
    conditions: any;
    delay?: number;
  }>;
  personalizations: {
    userSegments: string[];
    languages: string[];
    timezones: string[];
  };
  scheduling: {
    sendTime?: string;
    frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
    quietHours?: { start: string; end: string };
  };
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastUsed?: string;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: {
    type: 'event' | 'schedule' | 'condition';
    event?: string;
    schedule?: string;
    conditions?: any[];
  };
  actions: Array<{
    type: 'send_notification' | 'update_user' | 'log_event' | 'webhook';
    templateId?: string;
    parameters?: any;
  }>;
  filters: {
    userRoles?: string[];
    userSegments?: string[];
    courseCategories?: string[];
  };
  metrics: {
    totalTriggers: number;
    successfulActions: number;
    failedActions: number;
    lastTriggered?: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

const mockTemplates: NotificationTemplate[] = [
  {
    id: 'template-1',
    name: 'Course Enrollment Welcome',
    description: 'Welcome message sent when a student enrolls in a course',
    type: 'course_enrollment',
    channel: 'email',
    priority: 'normal',
    category: 'academic',
    isActive: true,
    subject: "Welcome to {{course_name}}! Let's start learning 🚀",
    content: `Hi {{student_name}},

Welcome to {{course_name}}! We're excited to have you join us on this learning journey.

Here's what you can expect:
- {{lesson_count}} comprehensive lessons
- Interactive exercises and quizzes
- Access to our community forum
- Certificate upon completion

Your instructor {{instructor_name}} is here to help you succeed.

Ready to get started? Click the link below to access your first lesson:
{{course_url}}

Happy learning!
The {{platform_name}} Team`,
    htmlContent: `<!DOCTYPE html>
<html>
<head>
    <style>
        .welcome-container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .cta-button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="welcome-container">
        <div class="header">
            <h1>Welcome to {{course_name}}!</h1>
        </div>
        <div class="content">
            <p>Hi {{student_name}},</p>
            <p>We're excited to have you join us on this learning journey.</p>
            <a href="{{course_url}}" class="cta-button">Start Learning Now</a>
        </div>
    </div>
</body>
</html>`,
    variables: [
      'student_name',
      'course_name',
      'instructor_name',
      'lesson_count',
      'course_url',
      'platform_name',
    ],
    triggers: [
      {
        event: 'course_enrolled',
        conditions: { status: 'active' },
        delay: 0,
      },
    ],
    personalizations: {
      userSegments: ['new_students', 'premium_users'],
      languages: ['en', 'es', 'fr'],
      timezones: ['UTC', 'PST', 'EST'],
    },
    scheduling: {
      frequency: 'immediate',
      quietHours: { start: '22:00', end: '08:00' },
    },
    metrics: {
      sent: 15620,
      delivered: 15456,
      opened: 12234,
      clicked: 8765,
      bounced: 164,
      unsubscribed: 23,
    },
    createdAt: '2024-01-10T10:30:00Z',
    updatedAt: '2024-01-15T14:20:00Z',
    createdBy: 'Marketing Team',
    lastUsed: '2024-01-15T09:45:00Z',
  },
  {
    id: 'template-2',
    name: 'Assignment Due Reminder',
    description: 'Reminder sent 24 hours before assignment deadline',
    type: 'assignment_due',
    channel: 'push',
    priority: 'high',
    category: 'academic',
    isActive: true,
    subject: '⏰ Assignment Due Tomorrow: {{assignment_name}}',
    content: `Don't forget! Your assignment "{{assignment_name}}" for {{course_name}} is due tomorrow at {{due_time}}.

Make sure to submit your work before the deadline to avoid any penalties.

{{submission_url}}`,
    variables: ['assignment_name', 'course_name', 'due_time', 'submission_url'],
    triggers: [
      {
        event: 'assignment_deadline_approaching',
        conditions: { hours_remaining: 24 },
        delay: 0,
      },
    ],
    personalizations: {
      userSegments: ['active_students'],
      languages: ['en'],
      timezones: ['student_timezone'],
    },
    scheduling: {
      frequency: 'immediate',
      quietHours: { start: '22:00', end: '08:00' },
    },
    metrics: {
      sent: 8932,
      delivered: 8901,
      opened: 7845,
      clicked: 6234,
      bounced: 31,
      unsubscribed: 12,
    },
    createdAt: '2024-01-08T15:00:00Z',
    updatedAt: '2024-01-14T11:30:00Z',
    createdBy: 'Academic Team',
    lastUsed: '2024-01-15T16:20:00Z',
  },
  {
    id: 'template-3',
    name: 'System Maintenance Alert',
    description: 'Alert users about scheduled system maintenance',
    type: 'system_maintenance',
    channel: 'in_app',
    priority: 'urgent',
    category: 'system',
    isActive: true,
    subject: '🔧 Scheduled Maintenance: {{maintenance_date}}',
    content: `We'll be performing scheduled maintenance on {{maintenance_date}} from {{start_time}} to {{end_time}}.

During this time, the platform will be temporarily unavailable. We apologize for any inconvenience.

What to expect:
- Complete service interruption
- All data will be preserved
- Estimated downtime: {{duration}}

We'll send another notification once maintenance is complete.

Thank you for your patience!`,
    variables: ['maintenance_date', 'start_time', 'end_time', 'duration'],
    triggers: [
      {
        event: 'maintenance_scheduled',
        conditions: {},
        delay: 86400, // 24 hours before
      },
    ],
    personalizations: {
      userSegments: ['all_users'],
      languages: ['en', 'es', 'fr', 'de'],
      timezones: ['user_timezone'],
    },
    scheduling: {
      frequency: 'immediate',
    },
    metrics: {
      sent: 45623,
      delivered: 45623,
      opened: 42134,
      clicked: 15234,
      bounced: 0,
      unsubscribed: 5,
    },
    createdAt: '2024-01-05T09:15:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    createdBy: 'System Admin',
    lastUsed: '2024-01-13T08:00:00Z',
  },
];

const mockAutomationRules: AutomationRule[] = [
  {
    id: 'rule-1',
    name: 'Welcome Series for New Students',
    description: 'Automated welcome email series for newly registered students',
    isActive: true,
    trigger: {
      type: 'event',
      event: 'user_registered',
      conditions: [
        { field: 'user_role', operator: 'equals', value: 'student' },
      ],
    },
    actions: [
      {
        type: 'send_notification',
        templateId: 'welcome-email-1',
        parameters: { delay: 0 },
      },
      {
        type: 'send_notification',
        templateId: 'welcome-email-2',
        parameters: { delay: 86400 }, // 1 day
      },
      {
        type: 'send_notification',
        templateId: 'welcome-email-3',
        parameters: { delay: 604800 }, // 1 week
      },
    ],
    filters: {
      userRoles: ['student'],
      userSegments: ['new_users'],
    },
    metrics: {
      totalTriggers: 1245,
      successfulActions: 3654,
      failedActions: 87,
      lastTriggered: '2024-01-15T14:30:00Z',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T12:00:00Z',
    createdBy: 'Marketing Team',
  },
  {
    id: 'rule-2',
    name: 'Course Completion Celebration',
    description:
      'Send congratulations and certificate when student completes a course',
    isActive: true,
    trigger: {
      type: 'event',
      event: 'course_completed',
    },
    actions: [
      {
        type: 'send_notification',
        templateId: 'course-completion-congrats',
        parameters: { delay: 0 },
      },
      {
        type: 'update_user',
        parameters: { add_badge: 'course_completer' },
      },
      {
        type: 'webhook',
        parameters: { url: 'https://api.lms.com/webhooks/course-completion' },
      },
    ],
    filters: {
      userRoles: ['student'],
    },
    metrics: {
      totalTriggers: 892,
      successfulActions: 2676,
      failedActions: 12,
      lastTriggered: '2024-01-15T11:20:00Z',
    },
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-08T15:30:00Z',
    createdBy: 'Academic Team',
  },
];

export default function NotificationManagementPage() {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] =
    useState<NotificationTemplate[]>(mockTemplates);
  const [automationRules, setAutomationRules] =
    useState<AutomationRule[]>(mockAutomationRules);
  const [selectedTemplate, setSelectedTemplate] =
    useState<NotificationTemplate | null>(null);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>({});

  const filteredTemplates = templates.filter(template => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChannel =
      filterChannel === 'all' || template.channel === filterChannel;
    const matchesCategory =
      filterCategory === 'all' || template.category === filterCategory;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && template.isActive) ||
      (filterStatus === 'inactive' && !template.isActive);

    return matchesSearch && matchesChannel && matchesCategory && matchesStatus;
  });

  const filteredRules = automationRules.filter(rule => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && rule.isActive) ||
      (filterStatus === 'inactive' && !rule.isActive);

    return matchesSearch && matchesStatus;
  });

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return Mail;
      case 'push':
        return Smartphone;
      case 'sms':
        return MessageSquare;
      case 'in_app':
        return Bell;
      case 'slack':
        return Hash;
      case 'discord':
        return AtSign;
      default:
        return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'normal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const handleTemplateAction = async (templateId: string, action: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (action === 'toggle_active') {
        setTemplates(prev =>
          prev.map(template =>
            template.id === templateId
              ? { ...template, isActive: !template.isActive }
              : template
          )
        );
      }

      toast.success(`Template ${action.replace('_', ' ')} successfully`);
    } catch (error) {
      toast.error(`Failed to ${action.replace('_', ' ')} template`);
    } finally {
      setLoading(false);
    }
  };

  const handleRuleAction = async (ruleId: string, action: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (action === 'toggle_active') {
        setAutomationRules(prev =>
          prev.map(rule =>
            rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
          )
        );
      }

      toast.success(`Automation rule ${action.replace('_', ' ')} successfully`);
    } catch (error) {
      toast.error(`Failed to ${action.replace('_', ' ')} automation rule`);
    } finally {
      setLoading(false);
    }
  };

  const previewTemplate = (template: NotificationTemplate) => {
    const sampleData = {
      student_name: 'John Doe',
      course_name: 'Advanced React Development',
      instructor_name: 'Dr. Sarah Johnson',
      lesson_count: '12',
      course_url: 'https://lms.com/courses/react-advanced',
      platform_name: 'SmartLMS AI',
      assignment_name: 'Final Project Submission',
      due_time: 'January 20, 2024 at 11:59 PM',
      submission_url: 'https://lms.com/assignments/submit/123',
      maintenance_date: 'January 22, 2024',
      start_time: '2:00 AM EST',
      end_time: '6:00 AM EST',
      duration: '4 hours',
    };

    setPreviewData(sampleData);
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const renderPreviewContent = (content: string, data: any) => {
    let previewContent = content;
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      previewContent = previewContent.replace(regex, data[key]);
    });
    return previewContent;
  };

  const calculateEngagementRate = (
    metrics: NotificationTemplate['metrics']
  ) => {
    if (metrics.sent === 0) return 0;
    return Math.round((metrics.opened / metrics.sent) * 100);
  };

  const calculateClickThroughRate = (
    metrics: NotificationTemplate['metrics']
  ) => {
    if (metrics.opened === 0) return 0;
    return Math.round((metrics.clicked / metrics.opened) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification Management</h1>
          <p className="text-muted-foreground">
            Manage templates, automation rules, and notification analytics
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>

                <Select value={filterChannel} onValueChange={setFilterChannel}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="in_app">In-App</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="discord">Discord</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="administrative">
                      Administrative
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Templates List */}
          <div className="grid gap-4">
            {filteredTemplates.map(template => {
              const ChannelIcon = getChannelIcon(template.channel);
              const engagementRate = calculateEngagementRate(template.metrics);
              const clickThroughRate = calculateClickThroughRate(
                template.metrics
              );

              return (
                <Card key={template.id}>
                  <CardContent className="pt-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <ChannelIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {template.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {template.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(template.priority)}>
                          {template.priority}
                        </Badge>
                        <Badge variant="secondary">{template.category}</Badge>
                        <Switch
                          checked={template.isActive}
                          onCheckedChange={() =>
                            handleTemplateAction(template.id, 'toggle_active')
                          }
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {template.metrics.sent.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Sent
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {engagementRate}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Open Rate
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {clickThroughRate}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Click Rate
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {template.metrics.bounced}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Bounced
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {template.variables.slice(0, 3).map(variable => (
                          <Badge
                            key={variable}
                            variant="outline"
                            className="text-xs"
                          >
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                        {template.variables.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.variables.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => previewTemplate(template)}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Preview
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleTemplateAction(template.id, 'duplicate')
                          }
                          disabled={loading}
                        >
                          <Copy className="mr-1 h-3 w-3" />
                          Clone
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="py-12 text-center">
              <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No templates found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          {/* Automation Rules List */}
          <div className="grid gap-4">
            {filteredRules.map(rule => (
              <Card key={rule.id}>
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{rule.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {rule.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge
                        className={
                          rule.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() =>
                          handleRuleAction(rule.id, 'toggle_active')
                        }
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="mb-4 space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <strong>Trigger:</strong>
                      <Badge variant="outline">{rule.trigger.type}</Badge>
                      {rule.trigger.event && (
                        <span className="text-muted-foreground">
                          {rule.trigger.event}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <strong>Actions:</strong>
                      <div className="flex flex-wrap gap-1">
                        {rule.actions.map((action, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {action.type.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {rule.metrics.totalTriggers.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Triggers
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {rule.metrics.successfulActions.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Successful
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {rule.metrics.failedActions}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Failed
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {rule.metrics.lastTriggered
                          ? new Date(
                              rule.metrics.lastTriggered
                            ).toLocaleDateString()
                          : 'Never'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last Triggered
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Created by {rule.createdBy} on{' '}
                      {new Date(rule.createdAt).toLocaleDateString()}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <BarChart3 className="mr-1 h-3 w-3" />
                        Analytics
                      </Button>

                      <Button size="sm" variant="outline">
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>

                      <Button size="sm" variant="outline">
                        <Copy className="mr-1 h-3 w-3" />
                        Clone
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRules.length === 0 && (
            <div className="py-12 text-center">
              <Zap className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                No automation rules found
              </h3>
              <p className="text-muted-foreground">
                Create your first automation rule to get started.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Templates
                    </p>
                    <p className="text-3xl font-bold">{templates.length}</p>
                  </div>
                  <Bell className="h-8 w-8 text-primary" />
                </div>
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">
                    {templates.filter(t => t.isActive).length} active
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Notifications Sent
                    </p>
                    <p className="text-3xl font-bold">
                      {templates
                        .reduce((sum, t) => sum + t.metrics.sent, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <Send className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-2">
                  <p className="text-xs text-green-600">
                    ↗ 12% from last month
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Avg Open Rate
                    </p>
                    <p className="text-3xl font-bold">
                      {Math.round(
                        templates.reduce(
                          (sum, t) => sum + calculateEngagementRate(t.metrics),
                          0
                        ) / templates.length
                      )}
                      %
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-2">
                  <p className="text-xs text-blue-600">↗ 3% from last month</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Active Rules
                    </p>
                    <p className="text-3xl font-bold">
                      {automationRules.filter(r => r.isActive).length}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">
                    {automationRules.length} total rules
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Channel Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Channel Performance</CardTitle>
              <CardDescription>
                Performance metrics by notification channel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['email', 'push', 'sms', 'in_app'].map(channel => {
                  const channelTemplates = templates.filter(
                    t => t.channel === channel
                  );
                  const totalSent = channelTemplates.reduce(
                    (sum, t) => sum + t.metrics.sent,
                    0
                  );
                  const totalOpened = channelTemplates.reduce(
                    (sum, t) => sum + t.metrics.opened,
                    0
                  );
                  const openRate =
                    totalSent > 0
                      ? Math.round((totalOpened / totalSent) * 100)
                      : 0;
                  const ChannelIcon = getChannelIcon(channel);

                  return (
                    <div
                      key={channel}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center space-x-3">
                        <ChannelIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium capitalize">{channel}</p>
                          <p className="text-sm text-muted-foreground">
                            {channelTemplates.length} templates
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {totalSent.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">Sent</p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-medium">{openRate}%</p>
                          <p className="text-xs text-muted-foreground">
                            Open Rate
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Global Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Global Notification Settings</CardTitle>
              <CardDescription>
                Configure system-wide notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable Email Notifications</Label>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Enable Push Notifications</Label>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Enable SMS Notifications</Label>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Enable In-App Notifications</Label>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Default Sender Name</Label>
                    <Input className="mt-1" defaultValue="SmartLMS AI" />
                  </div>

                  <div>
                    <Label>Default Sender Email</Label>
                    <Input
                      className="mt-1"
                      defaultValue="noreply@smartlms.ai"
                    />
                  </div>

                  <div>
                    <Label>Notification Rate Limit</Label>
                    <Select defaultValue="1000">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100 per hour</SelectItem>
                        <SelectItem value="500">500 per hour</SelectItem>
                        <SelectItem value="1000">1000 per hour</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Default Quiet Hours</Label>
                    <div className="mt-1 flex space-x-2">
                      <Input
                        placeholder="Start (e.g., 22:00)"
                        defaultValue="22:00"
                      />
                      <Input
                        placeholder="End (e.g., 08:00)"
                        defaultValue="08:00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Template Variables</h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label>Available Global Variables</Label>
                    <Textarea
                      className="mt-1"
                      rows={8}
                      defaultValue={`platform_name
                        user_name
                        user_email
                        current_date
                        current_time
                        support_email
                        support_phone
                        company_address
                        unsubscribe_url
                        privacy_policy_url
                        `}
                    />
                  </div>

                  <div>
                    <Label>Custom Variables</Label>
                    <Textarea
                      className="mt-1"
                      rows={8}
                      placeholder="Add custom variables (one per line)"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Reset to Default</Button>
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Provider Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Email Provider Configuration</CardTitle>
              <CardDescription>
                Configure email service providers and SMTP settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Primary Email Provider</Label>
                  <Select defaultValue="sendgrid">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                      <SelectItem value="ses">Amazon SES</SelectItem>
                      <SelectItem value="smtp">Custom SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Fallback Provider</Label>
                  <Select defaultValue="ses">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                      <SelectItem value="ses">Amazon SES</SelectItem>
                      <SelectItem value="smtp">Custom SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    className="mt-1"
                    placeholder="Enter API key"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Enable Email Tracking</Label>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Enable Click Tracking</Label>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Test Connection</Button>
                <Button>Save Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Template Preview: {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Preview how the notification will look to recipients
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Channel</Label>
                  <div className="mt-1 flex items-center space-x-2">
                    {React.createElement(
                      getChannelIcon(selectedTemplate.channel),
                      { className: 'h-4 w-4' }
                    )}
                    <span className="capitalize">
                      {selectedTemplate.channel}
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge
                    className={
                      getPriorityColor(selectedTemplate.priority) + ' mt-1'
                    }
                  >
                    {selectedTemplate.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <div className="mt-1 rounded-lg bg-muted p-3">
                  {renderPreviewContent(selectedTemplate.subject, previewData)}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Content</Label>
                <div className="mt-1 whitespace-pre-wrap rounded-lg bg-muted p-4">
                  {renderPreviewContent(selectedTemplate.content, previewData)}
                </div>
              </div>

              {selectedTemplate.htmlContent && (
                <div>
                  <Label className="text-sm font-medium">HTML Preview</Label>
                  <div className="mt-1 overflow-hidden rounded-lg border">
                    <iframe
                      srcDoc={renderPreviewContent(
                        selectedTemplate.htmlContent,
                        previewData
                      )}
                      className="h-96 w-full"
                      title="HTML Preview"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Variables Used</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedTemplate.variables.map(variable => (
                    <Badge key={variable} variant="outline">
                      {`{{${variable}}}`} →{' '}
                      {previewData[variable] || '[Not Set]'}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
