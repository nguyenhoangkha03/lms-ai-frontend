'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Mail,
  Send,
  Calendar,
  FileText,
  TrendingUp,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  Eye,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  type:
    | 'welcome'
    | 'reminder'
    | 'achievement'
    | 'newsletter'
    | 'notification'
    | 'marketing';
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

interface EmailCampaign {
  id: string;
  name: string;
  description: string;
  type: 'one_time' | 'automated' | 'drip' | 'newsletter';
  status:
    | 'draft'
    | 'scheduled'
    | 'sending'
    | 'sent'
    | 'paused'
    | 'completed'
    | 'failed';
  templateId: string;
  templateName: string;
  subject: string;
  targetAudience:
    | 'all'
    | 'students'
    | 'teachers'
    | 'course_specific'
    | 'custom';
  courseId?: string;
  courseName?: string;
  totalRecipients: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
  scheduledAt?: string;
  sentAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  openRate: number;
  clickRate: number;
}

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  triggerType:
    | 'user_registration'
    | 'course_enrollment'
    | 'assignment_due'
    | 'course_completion'
    | 'inactivity';
  status: 'active' | 'inactive' | 'draft';
  steps: AutomationStep[];
  totalExecutions: number;
  successfulExecutions: number;
  averageOpenRate: number;
  averageClickRate: number;
  createdAt: string;
  updatedAt: string;
}

interface AutomationStep {
  id: string;
  name: string;
  stepType: 'email' | 'delay' | 'condition';
  templateId?: string;
  delayDuration?: number;
  delayUnit?: 'minutes' | 'hours' | 'days';
  condition?: string;
  orderIndex: number;
  isActive: boolean;
}

interface EmailAnalytics {
  totalCampaigns: number;
  totalEmailsSent: number;
  averageOpenRate: number;
  averageClickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  recentActivity: {
    date: string;
    sent: number;
    opened: number;
    clicked: number;
  }[];
}

interface CreateCampaignData {
  name: string;
  description: string;
  type: EmailCampaign['type'];
  templateId: string;
  targetAudience: EmailCampaign['targetAudience'];
  courseId?: string;
  scheduledAt?: string;
  sendImmediately: boolean;
}

const CAMPAIGN_STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  sending: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-green-100 text-green-800',
  paused: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const TEMPLATE_TYPES = {
  welcome: { label: 'Welcome', icon: '👋' },
  reminder: { label: 'Reminder', icon: '⏰' },
  achievement: { label: 'Achievement', icon: '🏆' },
  newsletter: { label: 'Newsletter', icon: '📰' },
  notification: { label: 'Notification', icon: '🔔' },
  marketing: { label: 'Marketing', icon: '📢' },
};

interface EmailIntegrationProps {
  className?: string;
}

export const EmailIntegration: React.FC<EmailIntegrationProps> = ({
  className,
}) => {
  const { user } = useAuth();

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null);

  const [activeTab, setActiveTab] = useState<
    'campaigns' | 'templates' | 'automation' | 'analytics'
  >('campaigns');
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] =
    useState<EmailCampaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | EmailCampaign['status']
  >('all');
  const [typeFilter, setTypeFilter] = useState<'all' | EmailCampaign['type']>(
    'all'
  );

  // Create campaign form
  const [createCampaignData, setCreateCampaignData] =
    useState<CreateCampaignData>({
      name: '',
      description: '',
      type: 'one_time',
      templateId: '',
      targetAudience: 'all',
      sendImmediately: false,
    });

  // Create template form
  const [createTemplateData, setCreateTemplateData] = useState({
    name: '',
    description: '',
    type: 'notification' as EmailTemplate['type'],
    subject: '',
    htmlContent: '',
    textContent: '',
  });

  const canManageEmail =
    user?.userType === 'admin' || user?.userType === 'teacher';

  useEffect(() => {
    loadEmailData();
  }, []);

  const loadEmailData = async () => {
    try {
      setIsLoading(true);

      // Mock data - replace with actual API calls
      const mockTemplates: EmailTemplate[] = [
        {
          id: '1',
          name: 'Welcome Email',
          description: 'Welcome new students to the platform',
          type: 'welcome',
          subject: 'Welcome to {platform_name}!',
          htmlContent:
            "<h1>Welcome {first_name}!</h1><p>We're excited to have you join us...</p>",
          textContent:
            "Welcome {first_name}! We're excited to have you join us...",
          variables: ['first_name', 'platform_name', 'login_url'],
          isActive: true,
          createdAt: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          usageCount: 145,
        },
        {
          id: '2',
          name: 'Assignment Reminder',
          description: 'Remind students about upcoming assignment deadlines',
          type: 'reminder',
          subject: 'Assignment Due: {assignment_name}',
          htmlContent:
            '<h2>Don\'t forget!</h2><p>Your assignment "{assignment_name}" is due {due_date}</p>',
          textContent:
            'Don\'t forget! Your assignment "{assignment_name}" is due {due_date}',
          variables: ['assignment_name', 'due_date', 'course_name'],
          isActive: true,
          createdAt: new Date(
            Date.now() - 14 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          usageCount: 89,
        },
        {
          id: '3',
          name: 'Course Completion',
          description: 'Congratulate students on course completion',
          type: 'achievement',
          subject: 'Congratulations! You completed {course_name}',
          htmlContent:
            '<h1>🎉 Congratulations {first_name}!</h1><p>You have successfully completed {course_name}!</p>',
          textContent:
            'Congratulations {first_name}! You have successfully completed {course_name}!',
          variables: ['first_name', 'course_name', 'certificate_url'],
          isActive: true,
          createdAt: new Date(
            Date.now() - 21 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          usageCount: 67,
        },
      ];

      const mockCampaigns: EmailCampaign[] = [
        {
          id: '1',
          name: 'Winter Course Promotion',
          description: 'Promote new winter courses to existing students',
          type: 'one_time',
          status: 'completed',
          templateId: '1',
          templateName: 'Marketing Template',
          subject: 'New Winter Courses Available!',
          targetAudience: 'students',
          totalRecipients: 1250,
          sentCount: 1250,
          openedCount: 437,
          clickedCount: 89,
          bouncedCount: 12,
          unsubscribedCount: 3,
          sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          createdAt: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          openRate: 35.0,
          clickRate: 7.1,
        },
        {
          id: '2',
          name: 'Weekly Newsletter #45',
          description: 'Weekly updates and featured content',
          type: 'newsletter',
          status: 'scheduled',
          templateId: '2',
          templateName: 'Newsletter Template',
          subject: 'This Week in Learning - Newsletter #45',
          targetAudience: 'all',
          totalRecipients: 2150,
          sentCount: 0,
          openedCount: 0,
          clickedCount: 0,
          bouncedCount: 0,
          unsubscribedCount: 0,
          scheduledAt: new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          createdAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
          openRate: 0,
          clickRate: 0,
        },
        {
          id: '3',
          name: 'Course Reminder Campaign',
          description: 'Remind inactive students to continue their courses',
          type: 'automated',
          status: 'sending',
          templateId: '2',
          templateName: 'Reminder Template',
          subject: 'Continue Your Learning Journey',
          targetAudience: 'students',
          totalRecipients: 450,
          sentCount: 230,
          openedCount: 67,
          clickedCount: 23,
          bouncedCount: 5,
          unsubscribedCount: 1,
          sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          openRate: 29.1,
          clickRate: 10.0,
        },
      ];

      const mockWorkflows: AutomationWorkflow[] = [
        {
          id: '1',
          name: 'New User Onboarding',
          description: 'Welcome sequence for new users',
          triggerType: 'user_registration',
          status: 'active',
          steps: [
            {
              id: '1',
              name: 'Welcome Email',
              stepType: 'email',
              templateId: '1',
              orderIndex: 1,
              isActive: true,
            },
            {
              id: '2',
              name: 'Wait 3 Days',
              stepType: 'delay',
              delayDuration: 3,
              delayUnit: 'days',
              orderIndex: 2,
              isActive: true,
            },
            {
              id: '3',
              name: 'Getting Started Tips',
              stepType: 'email',
              templateId: '2',
              orderIndex: 3,
              isActive: true,
            },
          ],
          totalExecutions: 156,
          successfulExecutions: 148,
          averageOpenRate: 42.5,
          averageClickRate: 8.7,
          createdAt: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          id: '2',
          name: 'Assignment Deadline Reminder',
          description: 'Automated reminders for assignment deadlines',
          triggerType: 'assignment_due',
          status: 'active',
          steps: [
            {
              id: '1',
              name: '3 Day Reminder',
              stepType: 'email',
              templateId: '2',
              orderIndex: 1,
              isActive: true,
            },
            {
              id: '2',
              name: '1 Day Reminder',
              stepType: 'email',
              templateId: '2',
              orderIndex: 2,
              isActive: true,
            },
          ],
          totalExecutions: 89,
          successfulExecutions: 85,
          averageOpenRate: 56.8,
          averageClickRate: 15.2,
          createdAt: new Date(
            Date.now() - 45 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 14 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ];

      const mockAnalytics: EmailAnalytics = {
        totalCampaigns: 15,
        totalEmailsSent: 12450,
        averageOpenRate: 34.2,
        averageClickRate: 6.8,
        bounceRate: 2.1,
        unsubscribeRate: 0.3,
        recentActivity: [
          { date: '2024-01-01', sent: 1250, opened: 437, clicked: 89 },
          { date: '2024-01-02', sent: 890, opened: 312, clicked: 67 },
          { date: '2024-01-03', sent: 1100, opened: 398, clicked: 78 },
          { date: '2024-01-04', sent: 750, opened: 289, clicked: 45 },
          { date: '2024-01-05', sent: 950, opened: 367, clicked: 82 },
          { date: '2024-01-06', sent: 1300, opened: 478, clicked: 95 },
          { date: '2024-01-07', sent: 1150, opened: 423, clicked: 87 },
        ],
      };

      setTemplates(mockTemplates);
      setCampaigns(mockCampaigns);
      setWorkflows(mockWorkflows);
      setAnalytics(mockAnalytics);
    } catch (error) {
      toast.error('Failed to load email data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!createCampaignData.name || !createCampaignData.templateId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const template = templates.find(
        t => t.id === createCampaignData.templateId
      );
      if (!template) {
        toast.error('Selected template not found');
        return;
      }

      const newCampaign: EmailCampaign = {
        id: Date.now().toString(),
        ...createCampaignData,
        templateName: template.name,
        subject: template.subject,
        status: createCampaignData.sendImmediately ? 'sending' : 'draft',
        totalRecipients: 0,
        sentCount: 0,
        openedCount: 0,
        clickedCount: 0,
        bouncedCount: 0,
        unsubscribedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        openRate: 0,
        clickRate: 0,
      };

      setCampaigns(prev => [newCampaign, ...prev]);
      setIsCreateCampaignOpen(false);

      // Reset form
      setCreateCampaignData({
        name: '',
        description: '',
        type: 'one_time',
        templateId: '',
        targetAudience: 'all',
        sendImmediately: false,
      });

      toast.success('Campaign created successfully');
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  const handleCreateTemplate = async () => {
    if (!createTemplateData.name || !createTemplateData.subject) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newTemplate: EmailTemplate = {
        id: Date.now().toString(),
        ...createTemplateData,
        variables: extractVariables(
          createTemplateData.htmlContent + createTemplateData.textContent
        ),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
      };

      setTemplates(prev => [newTemplate, ...prev]);
      setIsCreateTemplateOpen(false);

      // Reset form
      setCreateTemplateData({
        name: '',
        description: '',
        type: 'notification',
        subject: '',
        htmlContent: '',
        textContent: '',
      });

      toast.success('Template created successfully');
    } catch (error) {
      toast.error('Failed to create template');
    }
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{([^}]+)\}/g);
    return matches
      ? [...new Set(matches.map(match => match.slice(1, -1)))]
      : [];
  };

  const handleCampaignAction = async (
    campaignId: string,
    action: 'start' | 'pause' | 'duplicate' | 'delete'
  ) => {
    try {
      switch (action) {
        case 'start':
          setCampaigns(prev =>
            prev.map(c =>
              c.id === campaignId ? { ...c, status: 'sending' as const } : c
            )
          );
          toast.success('Campaign started');
          break;
        case 'pause':
          setCampaigns(prev =>
            prev.map(c =>
              c.id === campaignId ? { ...c, status: 'paused' as const } : c
            )
          );
          toast.success('Campaign paused');
          break;
        case 'duplicate':
          const campaign = campaigns.find(c => c.id === campaignId);
          if (campaign) {
            const duplicated = {
              ...campaign,
              id: Date.now().toString(),
              name: `${campaign.name} (Copy)`,
              status: 'draft' as const,
              sentCount: 0,
              openedCount: 0,
              clickedCount: 0,
              createdAt: new Date().toISOString(),
            };
            setCampaigns(prev => [duplicated, ...prev]);
            toast.success('Campaign duplicated');
          }
          break;
        case 'delete':
          setCampaigns(prev => prev.filter(c => c.id !== campaignId));
          toast.success('Campaign deleted');
          break;
      }
    } catch (error) {
      toast.error(`Failed to ${action} campaign`);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch =
      searchQuery === '' ||
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const renderCampaignCard = (campaign: EmailCampaign) => (
    <Card key={campaign.id} className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center space-x-2">
              <h3 className="text-lg font-semibold">{campaign.name}</h3>
              <Badge
                className={cn(
                  'text-xs',
                  CAMPAIGN_STATUS_COLORS[campaign.status]
                )}
              >
                {campaign.status}
              </Badge>
            </div>
            <p className="mb-2 text-sm text-muted-foreground">
              {campaign.description}
            </p>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>Template: {campaign.templateName}</span>
              <span>•</span>
              <span>
                Recipients: {campaign.totalRecipients.toLocaleString()}
              </span>
              <span>•</span>
              <span>
                Created:{' '}
                {formatDistanceToNow(new Date(campaign.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedCampaign(campaign)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {campaign.status === 'draft' && (
                <DropdownMenuItem
                  onClick={() => handleCampaignAction(campaign.id, 'start')}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Campaign
                </DropdownMenuItem>
              )}
              {campaign.status === 'sending' && (
                <DropdownMenuItem
                  onClick={() => handleCampaignAction(campaign.id, 'pause')}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Pause Campaign
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => handleCampaignAction(campaign.id, 'duplicate')}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleCampaignAction(campaign.id, 'delete')}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Campaign Stats */}
        {campaign.sentCount > 0 && (
          <div className="grid grid-cols-4 gap-4 rounded-lg bg-muted/50 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {campaign.sentCount.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {campaign.openRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Opened</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {campaign.clickRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Clicked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {campaign.unsubscribedCount}
              </div>
              <div className="text-xs text-muted-foreground">Unsubscribed</div>
            </div>
          </div>
        )}

        {/* Scheduled info */}
        {campaign.scheduledAt && (
          <div className="mt-4 flex items-center space-x-2 rounded-lg bg-blue-50 p-3">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Scheduled for {format(new Date(campaign.scheduledAt), 'PPP p')}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderTemplateCard = (template: EmailTemplate) => (
    <Card key={template.id} className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center space-x-2">
              <span className="text-lg">
                {TEMPLATE_TYPES[template.type]?.icon}
              </span>
              <h3 className="text-lg font-semibold">{template.name}</h3>
              <Badge
                variant={template.isActive ? 'default' : 'secondary'}
                className="text-xs"
              >
                {template.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="mb-2 text-sm text-muted-foreground">
              {template.description}
            </p>
            <div className="mb-2 text-sm font-medium">
              Subject: {template.subject}
            </div>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>Type: {TEMPLATE_TYPES[template.type]?.label}</span>
              <span>•</span>
              <span>Used: {template.usageCount} times</span>
              <span>•</span>
              <span>
                Updated:{' '}
                {formatDistanceToNow(new Date(template.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Variables */}
        {template.variables.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 text-sm font-medium">Variables:</div>
            <div className="flex flex-wrap gap-1">
              {template.variables.map(variable => (
                <Badge key={variable} variant="outline" className="text-xs">
                  {variable}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderWorkflowCard = (workflow: AutomationWorkflow) => (
    <Card key={workflow.id} className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center space-x-2">
              <h3 className="text-lg font-semibold">{workflow.name}</h3>
              <Badge
                variant={workflow.status === 'active' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {workflow.status}
              </Badge>
            </div>
            <p className="mb-2 text-sm text-muted-foreground">
              {workflow.description}
            </p>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>Trigger: {workflow.triggerType.replace('_', ' ')}</span>
              <span>•</span>
              <span>Steps: {workflow.steps.length}</span>
              <span>•</span>
              <span>Executions: {workflow.totalExecutions}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Workflow
              </DropdownMenuItem>
              {workflow.status === 'active' ? (
                <DropdownMenuItem>
                  <Pause className="mr-2 h-4 w-4" />
                  Deactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem>
                  <Play className="mr-2 h-4 w-4" />
                  Activate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Workflow Performance */}
        <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {workflow.successfulExecutions}
            </div>
            <div className="text-xs text-muted-foreground">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {workflow.averageOpenRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Avg Open Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {workflow.averageClickRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Avg Click Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!canManageEmail) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <Mail className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">Access Restricted</h3>
          <p className="text-muted-foreground">
            You don't have permission to manage email campaigns and templates.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Integration</h2>
          <p className="text-muted-foreground">
            Manage email campaigns, templates, and automation
          </p>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsCreateTemplateOpen(true)}
          >
            <FileText className="mr-2 h-4 w-4" />
            New Template
          </Button>
          <Button onClick={() => setIsCreateCampaignOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={value => setActiveTab(value as typeof activeTab)}
      >
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={value =>
                setStatusFilter(value as typeof statusFilter)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sending">Sending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={value => setTypeFilter(value as typeof typeFilter)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="one_time">One Time</SelectItem>
                <SelectItem value="automated">Automated</SelectItem>
                <SelectItem value="drip">Drip</SelectItem>
                <SelectItem value="newsletter">Newsletter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campaigns Grid */}
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="text-sm text-muted-foreground">
                Loading campaigns...
              </div>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="py-12 text-center">
              <Mail className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">No campaigns found</h3>
              <p className="mb-4 text-muted-foreground">
                Create your first email campaign to get started
              </p>
              <Button onClick={() => setIsCreateCampaignOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
              {filteredCampaigns.map(renderCampaignCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {templates.map(renderTemplateCard)}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {workflows.map(renderWorkflowCard)}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {analytics.averageOpenRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Average Open Rate
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {analytics.averageClickRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Average Click Rate
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {analytics.bounceRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Bounce Rate
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Email Activity</CardTitle>
              <CardDescription>
                Email performance over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-80 items-center justify-center">
                <div className="text-muted-foreground">
                  Chart placeholder - integrate with your preferred charting
                  library
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Campaign Dialog */}
      <Dialog
        open={isCreateCampaignOpen}
        onOpenChange={setIsCreateCampaignOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Email Campaign</DialogTitle>
            <DialogDescription>
              Create a new email campaign to reach your audience
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Campaign Name
                </label>
                <Input
                  placeholder="Enter campaign name..."
                  value={createCampaignData.name}
                  onChange={e =>
                    setCreateCampaignData(prev => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Campaign Type
                </label>
                <Select
                  value={createCampaignData.type}
                  onValueChange={value =>
                    setCreateCampaignData(prev => ({
                      ...prev,
                      type: value as EmailCampaign['type'],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">One Time</SelectItem>
                    <SelectItem value="automated">Automated</SelectItem>
                    <SelectItem value="drip">Drip Campaign</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>
              <Textarea
                placeholder="Describe your campaign..."
                value={createCampaignData.description}
                onChange={e =>
                  setCreateCampaignData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email Template
                </label>
                <Select
                  value={createCampaignData.templateId}
                  onValueChange={value =>
                    setCreateCampaignData(prev => ({
                      ...prev,
                      templateId: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates
                      .filter(t => t.isActive)
                      .map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Target Audience
                </label>
                <Select
                  value={createCampaignData.targetAudience}
                  onValueChange={value =>
                    setCreateCampaignData(prev => ({
                      ...prev,
                      targetAudience: value as EmailCampaign['targetAudience'],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="teachers">Teachers Only</SelectItem>
                    <SelectItem value="course_specific">
                      Course Specific
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!createCampaignData.sendImmediately && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Schedule (Optional)
                </label>
                <Input
                  type="datetime-local"
                  value={createCampaignData.scheduledAt || ''}
                  onChange={e =>
                    setCreateCampaignData(prev => ({
                      ...prev,
                      scheduledAt: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                checked={createCampaignData.sendImmediately}
                onCheckedChange={checked =>
                  setCreateCampaignData(prev => ({
                    ...prev,
                    sendImmediately: checked,
                    scheduledAt: checked ? undefined : prev.scheduledAt,
                  }))
                }
              />
              <label className="text-sm font-medium">Send immediately</label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateCampaignOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign}>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog
        open={isCreateTemplateOpen}
        onOpenChange={setIsCreateTemplateOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Email Template</DialogTitle>
            <DialogDescription>
              Create a reusable email template for your campaigns
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Template Name
                </label>
                <Input
                  placeholder="Enter template name..."
                  value={createTemplateData.name}
                  onChange={e =>
                    setCreateTemplateData(prev => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Template Type
                </label>
                <Select
                  value={createTemplateData.type}
                  onValueChange={value =>
                    setCreateTemplateData(prev => ({
                      ...prev,
                      type: value as EmailTemplate['type'],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TEMPLATE_TYPES).map(
                      ([key, { label, icon }]) => (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center space-x-2">
                            <span>{icon}</span>
                            <span>{label}</span>
                          </span>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>
              <Input
                placeholder="Describe this template..."
                value={createTemplateData.description}
                onChange={e =>
                  setCreateTemplateData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Email Subject
              </label>
              <Input
                placeholder="Enter email subject (use {variables} for dynamic content)..."
                value={createTemplateData.subject}
                onChange={e =>
                  setCreateTemplateData(prev => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                HTML Content
              </label>
              <Textarea
                placeholder="Enter HTML email content (use {variables} for dynamic content)..."
                value={createTemplateData.htmlContent}
                onChange={e =>
                  setCreateTemplateData(prev => ({
                    ...prev,
                    htmlContent: e.target.value,
                  }))
                }
                rows={6}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Plain Text Content
              </label>
              <Textarea
                placeholder="Enter plain text version..."
                value={createTemplateData.textContent}
                onChange={e =>
                  setCreateTemplateData(prev => ({
                    ...prev,
                    textContent: e.target.value,
                  }))
                }
                rows={4}
              />
            </div>

            <div className="rounded-lg bg-muted/50 p-3">
              <div className="mb-2 text-sm font-medium">
                Available Variables:
              </div>
              <div className="text-xs text-muted-foreground">
                Common variables: {'{first_name}'}, {'{last_name}'}, {'{email}'}
                , {'{course_name}'}, {'{platform_name}'}, {'{login_url}'}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateTemplateOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Campaign Details Dialog */}
      {selectedCampaign && (
        <Dialog
          open={!!selectedCampaign}
          onOpenChange={() => setSelectedCampaign(null)}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <span>{selectedCampaign.name}</span>
                <Badge
                  className={cn(
                    'text-xs',
                    CAMPAIGN_STATUS_COLORS[selectedCampaign.status]
                  )}
                >
                  {selectedCampaign.status}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {selectedCampaign.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Campaign Overview */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedCampaign.totalRecipients.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Recipients
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedCampaign.sentCount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Emails Sent
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedCampaign.openRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Open Rate
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedCampaign.clickRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Click Rate
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Campaign Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="mb-3 font-medium">Campaign Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="capitalize">
                        {selectedCampaign.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Template:</span>
                      <span>{selectedCampaign.templateName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subject:</span>
                      <span className="max-w-40 truncate">
                        {selectedCampaign.subject}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Audience:</span>
                      <span className="capitalize">
                        {selectedCampaign.targetAudience.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 font-medium">Performance Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Opened:</span>
                      <span>
                        {selectedCampaign.openedCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Clicked:</span>
                      <span>
                        {selectedCampaign.clickedCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bounced:</span>
                      <span>
                        {selectedCampaign.bouncedCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Unsubscribed:
                      </span>
                      <span>
                        {selectedCampaign.unsubscribedCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="mb-3 font-medium">Campaign Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>
                      Created:{' '}
                      {format(new Date(selectedCampaign.createdAt), 'PPP p')}
                    </span>
                  </div>
                  {selectedCampaign.scheduledAt && (
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>
                        Scheduled:{' '}
                        {format(
                          new Date(selectedCampaign.scheduledAt),
                          'PPP p'
                        )}
                      </span>
                    </div>
                  )}
                  {selectedCampaign.sentAt && (
                    <div className="flex items-center space-x-3">
                      <Send className="h-4 w-4 text-purple-600" />
                      <span>
                        Sent:{' '}
                        {format(new Date(selectedCampaign.sentAt), 'PPP p')}
                      </span>
                    </div>
                  )}
                  {selectedCampaign.completedAt && (
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>
                        Completed:{' '}
                        {format(
                          new Date(selectedCampaign.completedAt),
                          'PPP p'
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EmailIntegration;
