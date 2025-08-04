'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Plus,
  Search,
  Filter,
  Mail,
  Send,
  Pause,
  Play,
  Edit,
  Copy,
  Trash2,
  Eye,
  BarChart3,
  Users,
  MousePointer,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Zap,
  Settings,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const campaignFormSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  subject: z.string().min(1, 'Subject is required'),
  fromEmail: z.string().email('Invalid email address'),
  fromName: z.string().min(1, 'From name is required'),
  replyToEmail: z.string().email('Invalid reply-to email').optional(),
  htmlContent: z.string().min(1, 'Email content is required'),
  textContent: z.string().optional(),
  targetAudience: z.enum([
    'all_users',
    'students',
    'teachers',
    'premium_users',
    'trial_users',
    'inactive_users',
  ]),
  scheduledAt: z.date().optional(),
  description: z.string().optional(),
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

interface EmailCampaign {
  id: string;
  name: string;
  description?: string;
  subject: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  htmlContent: string;
  textContent?: string;
  targetAudience: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  scheduledAt?: string;
  sentAt?: string;
  completedAt?: string;
  totalRecipients: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
}

interface AutomationWorkflow {
  id: string;
  name: string;
  description?: string;
  triggerType:
    | 'user_signup'
    | 'course_purchase'
    | 'course_completion'
    | 'payment_failed'
    | 'subscription_renewal';
  status: 'active' | 'inactive' | 'draft';
  isActive: boolean;
  totalExecutions: number;
  successfulExecutions: number;
  averageOpenRate: number;
  averageClickRate: number;
  createdAt: string;
  steps: WorkflowStep[];
}

interface WorkflowStep {
  id: string;
  name: string;
  stepType: 'email' | 'delay' | 'condition' | 'action';
  orderIndex: number;
  templateId?: string;
  config: any;
  executionCount: number;
  successCount: number;
  openRate: number;
  clickRate: number;
}

export default function EmailCampaignManagement() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);
  const [createWorkflowOpen, setCreateWorkflowOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] =
    useState<EmailCampaign | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      fromEmail: 'noreply@learningplatform.com',
      fromName: 'Learning Platform',
      targetAudience: 'all_users',
    },
  });

  useEffect(() => {
    fetchCampaigns();
    fetchWorkflows();
  }, [searchTerm, statusFilter]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        limit: '50',
      });

      const response = await fetch(`/api/v1/email-campaigns?${params}`);
      const data = await response.json();
      setCampaigns(data.data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: 'Error',
        description: 'Failed to load email campaigns',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/v1/email-automation/workflows');
      const data = await response.json();
      setWorkflows(data.data || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    }
  };

  const onSubmitCampaign = async (data: CampaignFormData) => {
    try {
      const response = await fetch('/api/v1/email-campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Email campaign created successfully',
        });
        setCreateCampaignOpen(false);
        form.reset();
        await fetchCampaigns();
      } else {
        throw new Error('Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to create email campaign',
        variant: 'destructive',
      });
    }
  };

  const sendCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(
        `/api/v1/email-campaigns/${campaignId}/send`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Campaign is being sent',
        });
        await fetchCampaigns();
      } else {
        throw new Error('Failed to send campaign');
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to send campaign',
        variant: 'destructive',
      });
    }
  };

  const pauseCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(
        `/api/v1/email-campaigns/${campaignId}/pause`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Campaign paused successfully',
        });
        await fetchCampaigns();
      }
    } catch (error) {
      console.error('Error pausing campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to pause campaign',
        variant: 'destructive',
      });
    }
  };

  const toggleWorkflow = async (workflowId: string, isActive: boolean) => {
    try {
      const endpoint = isActive ? 'activate' : 'deactivate';
      const response = await fetch(
        `/api/v1/email-automation/workflows/${workflowId}/${endpoint}`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Workflow ${isActive ? 'activated' : 'deactivated'} successfully`,
        });
        await fetchWorkflows();
      }
    } catch (error) {
      console.error('Error toggling workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to update workflow status',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'sending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="h-4 w-4" />;
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      case 'sending':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'sent':
        return <CheckCircle className="h-4 w-4" />;
      case 'paused':
        return <Pause className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Marketing & Automation</h1>
          <p className="text-muted-foreground">
            Manage email campaigns and automated workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchCampaigns} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog
            open={createWorkflowOpen}
            onOpenChange={setCreateWorkflowOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Zap className="mr-2 h-4 w-4" />
                Create Automation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Automation Workflow</DialogTitle>
                <DialogDescription>
                  Set up automated email sequences based on user actions
                </DialogDescription>
              </DialogHeader>
              <div className="py-8 text-center">
                <Zap className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Automation workflow builder coming soon
                </p>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog
            open={createCampaignOpen}
            onOpenChange={setCreateCampaignOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Email Campaign</DialogTitle>
                <DialogDescription>
                  Create a new email campaign to engage with your users
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitCampaign)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campaign Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Monthly Newsletter"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Subject</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your learning journey continues..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Optional campaign description..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="fromName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Learning Platform" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fromEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="noreply@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="replyToEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reply-To Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="support@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Optional</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="targetAudience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Audience</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all_users">
                                All Users
                              </SelectItem>
                              <SelectItem value="students">
                                Students Only
                              </SelectItem>
                              <SelectItem value="teachers">
                                Teachers Only
                              </SelectItem>
                              <SelectItem value="premium_users">
                                Premium Users
                              </SelectItem>
                              <SelectItem value="trial_users">
                                Trial Users
                              </SelectItem>
                              <SelectItem value="inactive_users">
                                Inactive Users
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="scheduledAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schedule For</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={field.value}
                              onDateChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription>
                            Leave empty to send immediately
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="htmlContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Content (HTML)</FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-[200px] font-mono text-sm"
                            placeholder={`<html>
<body>
  <h1>Welcome to our newsletter!</h1>
  <p>Your learning journey continues...</p>
</body>
</html>`}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          HTML content for the email
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="textContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plain Text Content</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Welcome to our newsletter!

Your learning journey continues..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Plain text version for email clients that don't
                          support HTML
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCreateCampaignOpen(false);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create Campaign</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="sending">Sending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
          <TabsTrigger value="automation">Automation Workflows</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaigns</CardTitle>
              <CardDescription>
                Manage your email marketing campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map(campaign => (
                    <div
                      key={campaign.id}
                      className="space-y-4 rounded-lg border p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="text-lg font-semibold">
                              {campaign.name}
                            </h3>
                            <Badge className={getStatusColor(campaign.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(campaign.status)}
                                {campaign.status}
                              </div>
                            </Badge>
                          </div>

                          <p className="mb-2 text-muted-foreground">
                            <strong>Subject:</strong> {campaign.subject}
                          </p>

                          {campaign.description && (
                            <p className="mb-3 text-muted-foreground">
                              {campaign.description}
                            </p>
                          )}

                          <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-blue-600" />
                              <div>
                                <p className="font-semibold">
                                  {campaign.totalRecipients.toLocaleString()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Recipients
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Send className="h-4 w-4 text-green-600" />
                              <div>
                                <p className="font-semibold">
                                  {campaign.sentCount.toLocaleString()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Sent
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-purple-600" />
                              <div>
                                <p className="font-semibold">
                                  {formatPercentage(campaign.openRate)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Open Rate
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <MousePointer className="h-4 w-4 text-orange-600" />
                              <div>
                                <p className="font-semibold">
                                  {formatPercentage(campaign.clickRate)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Click Rate
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              From: {campaign.fromName} &lt;{campaign.fromEmail}
                              &gt;
                            </span>
                            <span>
                              Audience:{' '}
                              {campaign.targetAudience.replace('_', ' ')}
                            </span>
                            <span>
                              Created: {formatDate(campaign.createdAt)}
                            </span>
                            {campaign.scheduledAt && (
                              <span>
                                Scheduled: {formatDate(campaign.scheduledAt)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="ml-4 flex flex-col gap-2">
                          {campaign.status === 'draft' && (
                            <Button
                              onClick={() => sendCampaign(campaign.id)}
                              size="sm"
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Send Now
                            </Button>
                          )}

                          {campaign.status === 'sending' && (
                            <Button
                              onClick={() => pauseCampaign(campaign.id)}
                              variant="outline"
                              size="sm"
                            >
                              <Pause className="mr-2 h-4 w-4" />
                              Pause
                            </Button>
                          )}

                          <div className="flex gap-1">
                            <Dialog
                              open={
                                previewOpen &&
                                selectedCampaign?.id === campaign.id
                              }
                              onOpenChange={open => {
                                setPreviewOpen(open);
                                if (!open) setSelectedCampaign(null);
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedCampaign(campaign)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    Campaign Preview: {campaign.name}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Preview how this email will appear to
                                    recipients
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="rounded-lg bg-muted p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                      <div>
                                        <p className="font-medium">
                                          From: {campaign.fromName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {campaign.fromEmail}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium">
                                          Subject: {campaign.subject}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          To:{' '}
                                          {campaign.targetAudience.replace(
                                            '_',
                                            ' '
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="rounded-lg border bg-white p-4">
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: campaign.htmlContent,
                                      }}
                                      className="prose max-w-none"
                                    />
                                  </div>

                                  {campaign.textContent && (
                                    <div>
                                      <h4 className="mb-2 font-medium">
                                        Plain Text Version:
                                      </h4>
                                      <div className="whitespace-pre-wrap rounded-lg bg-muted p-4 font-mono text-sm">
                                        {campaign.textContent}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button variant="outline" size="sm">
                              <BarChart3 className="h-4 w-4" />
                            </Button>

                            <Button variant="outline" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>

                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {campaigns.length === 0 && (
                    <div className="py-8 text-center">
                      <Mail className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="text-lg font-medium">
                        No campaigns found
                      </h3>
                      <p className="mb-4 text-muted-foreground">
                        Create your first email campaign to start engaging with
                        users
                      </p>
                      <Button onClick={() => setCreateCampaignOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Campaign
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Workflows</CardTitle>
              <CardDescription>
                Automated email sequences triggered by user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows.map(workflow => (
                  <div
                    key={workflow.id}
                    className="space-y-4 rounded-lg border p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <h3 className="text-lg font-semibold">
                            {workflow.name}
                          </h3>
                          <Badge
                            variant={
                              workflow.isActive ? 'default' : 'secondary'
                            }
                          >
                            {workflow.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">
                            {workflow.triggerType.replace('_', ' ')}
                          </Badge>
                        </div>

                        {workflow.description && (
                          <p className="mb-3 text-muted-foreground">
                            {workflow.description}
                          </p>
                        )}

                        <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                          <div>
                            <p className="font-semibold">
                              {workflow.totalExecutions.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Total Executions
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold">
                              {workflow.successfulExecutions.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Successful
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold">
                              {formatPercentage(workflow.averageOpenRate)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Avg Open Rate
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold">
                              {formatPercentage(workflow.averageClickRate)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Avg Click Rate
                            </p>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Created: {formatDate(workflow.createdAt)} •{' '}
                          {workflow.steps.length} steps
                        </div>
                      </div>

                      <div className="ml-4 flex items-center gap-2">
                        <Switch
                          checked={workflow.isActive}
                          onCheckedChange={checked =>
                            toggleWorkflow(workflow.id, checked)
                          }
                        />
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {workflows.length === 0 && (
                  <div className="py-8 text-center">
                    <Zap className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-medium">
                      No automation workflows
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      Set up automated email sequences to engage users based on
                      their actions
                    </p>
                    <Button onClick={() => setCreateWorkflowOpen(true)}>
                      <Zap className="mr-2 h-4 w-4" />
                      Create Automation
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Campaigns
                </CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaigns.length}</div>
                <p className="text-sm text-muted-foreground">
                  Active campaigns
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sent
                </CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns
                    .reduce((sum, c) => sum + c.sentCount, 0)
                    .toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">
                  Emails delivered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Open Rate
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.length > 0
                    ? formatPercentage(
                        campaigns.reduce((sum, c) => sum + c.openRate, 0) /
                          campaigns.length
                      )
                    : '0%'}
                </div>
                <p className="text-sm text-muted-foreground">
                  Across all campaigns
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Click Rate
                </CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.length > 0
                    ? formatPercentage(
                        campaigns.reduce((sum, c) => sum + c.clickRate, 0) /
                          campaigns.length
                      )
                    : '0%'}
                </div>
                <p className="text-sm text-muted-foreground">
                  Across all campaigns
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Email Performance Trend
              </CardTitle>
              <CardDescription>Campaign performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-80 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
                <div className="text-center">
                  <BarChart3 className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Email performance analytics chart
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Performance metrics visualization placeholder
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
