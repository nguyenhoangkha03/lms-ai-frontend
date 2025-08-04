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
import { Progress } from '@/components/ui/progress';
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
  Shield,
  FileText,
  UserCheck,
  Database,
  CheckCircle,
  Download,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  Users,
  Lock,
  FileCheck,
  AlertCircle,
  XCircle,
  Calendar,
  BarChart3,
  TrendingUp,
  UserX,
} from 'lucide-react';

interface GDPRComplianceStatus {
  overallScore: number;
  lastAuditDate: string;
  nextAuditDue: string;
  complianceAreas: Array<{
    area: string;
    status: 'compliant' | 'partially_compliant' | 'non_compliant';
    score: number;
    lastChecked: string;
    issues: number;
  }>;
  activeUsers: number;
  consentRate: number;
  dataRetentionCompliance: number;
  breachesReported: number;
}

interface DataProtectionRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type:
    | 'access'
    | 'rectification'
    | 'erasure'
    | 'portability'
    | 'restriction'
    | 'objection';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestDate: string;
  completionDate?: string;
  dueDate: string;
  description: string;
  attachments?: string[];
  processingNotes?: string;
  legalBasis?: string;
  assignedTo?: string;
  estimatedCompletionTime: number;
  dataTypes: string[];
}

interface ConsentRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  consentType:
    | 'marketing'
    | 'analytics'
    | 'functional'
    | 'performance'
    | 'third_party';
  status: 'given' | 'withdrawn' | 'expired' | 'pending';
  consentDate: string;
  withdrawalDate?: string;
  expiryDate?: string;
  version: string;
  ipAddress: string;
  userAgent: string;
  consentMethod: 'explicit' | 'implicit' | 'opt_in' | 'opt_out';
  legalBasis: string;
  purposes: string[];
}

interface ComplianceAuditRecord {
  id: string;
  auditType: 'gdpr' | 'ccpa' | 'internal' | 'external';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  auditor: string;
  scope: string[];
  findings: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    recommendation: string;
    status: 'open' | 'in_progress' | 'resolved';
  }>;
  complianceScore: number;
  reportUrl?: string;
  nextAuditDate?: string;
}

const mockGDPRStatus: GDPRComplianceStatus = {
  overallScore: 87.5,
  lastAuditDate: '2024-01-15T10:00:00Z',
  nextAuditDue: '2024-07-15T10:00:00Z',
  complianceAreas: [
    {
      area: 'Data Processing',
      status: 'compliant',
      score: 92,
      lastChecked: '2024-01-15T10:00:00Z',
      issues: 0,
    },
    {
      area: 'Consent Management',
      status: 'partially_compliant',
      score: 78,
      lastChecked: '2024-01-14T15:30:00Z',
      issues: 3,
    },
    {
      area: 'Data Retention',
      status: 'compliant',
      score: 95,
      lastChecked: '2024-01-13T09:15:00Z',
      issues: 0,
    },
    {
      area: 'User Rights',
      status: 'compliant',
      score: 89,
      lastChecked: '2024-01-12T14:20:00Z',
      issues: 1,
    },
    {
      area: 'Data Security',
      status: 'compliant',
      score: 94,
      lastChecked: '2024-01-11T11:45:00Z',
      issues: 0,
    },
    {
      area: 'Breach Response',
      status: 'partially_compliant',
      score: 82,
      lastChecked: '2024-01-10T16:30:00Z',
      issues: 2,
    },
  ],
  activeUsers: 45623,
  consentRate: 89.3,
  dataRetentionCompliance: 96.7,
  breachesReported: 0,
};

const mockDataProtectionRequests: DataProtectionRequest[] = [
  {
    id: 'dpr-001',
    userId: 'user-12345',
    userName: 'John Doe',
    userEmail: 'john.doe@email.com',
    type: 'access',
    status: 'pending',
    priority: 'medium',
    requestDate: '2024-01-15T14:30:00Z',
    dueDate: '2024-02-14T14:30:00Z',
    description:
      'Request for access to all personal data held by the organization',
    dataTypes: [
      'profile',
      'learning_progress',
      'communications',
      'assessments',
    ],
    estimatedCompletionTime: 5,
    legalBasis: 'Article 15 - Right of access',
  },
  {
    id: 'dpr-002',
    userId: 'user-67890',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@email.com',
    type: 'erasure',
    status: 'in_progress',
    priority: 'high',
    requestDate: '2024-01-12T09:15:00Z',
    dueDate: '2024-02-11T09:15:00Z',
    description:
      'Request to delete all personal data due to withdrawal from platform',
    dataTypes: [
      'profile',
      'learning_progress',
      'user_files',
      'assessments',
      'communications',
    ],
    estimatedCompletionTime: 7,
    assignedTo: 'Privacy Officer',
    processingNotes:
      'Initiated data deletion process. Waiting for confirmation from third-party services.',
    legalBasis: 'Article 17 - Right to erasure',
  },
  {
    id: 'dpr-003',
    userId: 'user-54321',
    userName: 'Mike Johnson',
    userEmail: 'mike.johnson@email.com',
    type: 'portability',
    status: 'completed',
    priority: 'low',
    requestDate: '2024-01-08T16:45:00Z',
    completionDate: '2024-01-10T11:20:00Z',
    dueDate: '2024-02-07T16:45:00Z',
    description: 'Request for data export in machine-readable format',
    dataTypes: ['profile', 'learning_progress', 'certificates'],
    estimatedCompletionTime: 3,
    assignedTo: 'Data Team',
    legalBasis: 'Article 20 - Right to data portability',
  },
];

const mockConsentRecords: ConsentRecord[] = [
  {
    id: 'consent-001',
    userId: 'user-12345',
    userName: 'John Doe',
    userEmail: 'john.doe@email.com',
    consentType: 'marketing',
    status: 'given',
    consentDate: '2024-01-15T10:30:00Z',
    version: '2.1',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    consentMethod: 'explicit',
    legalBasis: 'Consent',
    purposes: ['Email marketing', 'Product updates', 'Promotional offers'],
  },
  {
    id: 'consent-002',
    userId: 'user-67890',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@email.com',
    consentType: 'analytics',
    status: 'withdrawn',
    consentDate: '2024-01-10T14:20:00Z',
    withdrawalDate: '2024-01-14T09:45:00Z',
    version: '2.1',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0...',
    consentMethod: 'explicit',
    legalBasis: 'Consent',
    purposes: ['Usage analytics', 'Performance monitoring'],
  },
];

const mockAuditRecords: ComplianceAuditRecord[] = [
  {
    id: 'audit-001',
    auditType: 'gdpr',
    status: 'completed',
    startDate: '2024-01-15T09:00:00Z',
    endDate: '2024-01-17T17:00:00Z',
    auditor: 'External Compliance Firm',
    scope: ['Data Processing', 'Consent Management', 'User Rights'],
    complianceScore: 87.5,
    findings: [
      {
        severity: 'medium',
        category: 'Consent Management',
        description: 'Some consent forms lack clear withdrawal instructions',
        recommendation:
          'Update consent forms to include clear withdrawal process',
        status: 'in_progress',
      },
      {
        severity: 'low',
        category: 'Data Retention',
        description: 'Documentation for retention periods could be clearer',
        recommendation: 'Create detailed retention policy documentation',
        status: 'resolved',
      },
    ],
    reportUrl: '/api/reports/audit-001.pdf',
    nextAuditDate: '2024-07-15T09:00:00Z',
  },
];

export default function PrivacyCompliancePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [gdprStatus, setGdprStatus] =
    useState<GDPRComplianceStatus>(mockGDPRStatus);
  const [dataRequests, setDataRequests] = useState<DataProtectionRequest[]>(
    mockDataProtectionRequests
  );
  const [consentRecords, setConsentRecords] =
    useState<ConsentRecord[]>(mockConsentRecords);
  const [auditRecords, setAuditRecords] =
    useState<ComplianceAuditRecord[]>(mockAuditRecords);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] =
    useState<DataProtectionRequest | null>(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'completed':
      case 'given':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'partially_compliant':
      case 'in_progress':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'non_compliant':
      case 'rejected':
      case 'withdrawn':
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const handleRequestAction = async (requestId: string, action: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (action === 'process') {
        setDataRequests(prev =>
          prev.map(req =>
            req.id === requestId
              ? { ...req, status: 'in_progress', assignedTo: 'Current Admin' }
              : req
          )
        );
        toast.success('Request processing started');
      } else if (action === 'complete') {
        setDataRequests(prev =>
          prev.map(req =>
            req.id === requestId
              ? {
                  ...req,
                  status: 'completed',
                  completionDate: new Date().toISOString(),
                }
              : req
          )
        );
        toast.success('Request completed successfully');
      }
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    } finally {
      setLoading(false);
    }
  };

  const handleDataAnonymization = async (userId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Data anonymization completed');
    } catch (error) {
      toast.error('Failed to anonymize data');
    } finally {
      setLoading(false);
    }
  };

  const generateComplianceReport = async (reportType: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(
        `${reportType} report generated and will be downloaded shortly`
      );
    } catch (error) {
      toast.error(`Failed to generate ${reportType} report`);
    } finally {
      setLoading(false);
    }
  };

  const filteredDataRequests = dataRequests.filter(request => {
    const matchesSearch =
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'access':
        return Eye;
      case 'rectification':
        return Edit;
      case 'erasure':
        return Trash2;
      case 'portability':
        return Download;
      case 'restriction':
        return Lock;
      case 'objection':
        return XCircle;
      default:
        return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Privacy & GDPR Compliance</h1>
          <p className="text-muted-foreground">
            Manage data protection, compliance, and user privacy rights
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => generateComplianceReport('GDPR')}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button onClick={() => setShowProcessDialog(true)}>
            <Shield className="mr-2 h-4 w-4" />
            Run Audit
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">GDPR Dashboard</TabsTrigger>
          <TabsTrigger value="data-requests">Data Requests</TabsTrigger>
          <TabsTrigger value="consent-management">
            Consent Management
          </TabsTrigger>
          <TabsTrigger value="data-tools">Data Tools</TabsTrigger>
          <TabsTrigger value="audit-reports">Audit & Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* GDPR Compliance Overview */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Compliance Score
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {gdprStatus.overallScore}%
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Last audit:{' '}
                      {new Date(gdprStatus.lastAuditDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
                <Progress value={gdprStatus.overallScore} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Active Users
                    </p>
                    <p className="text-3xl font-bold">
                      {gdprStatus.activeUsers.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {gdprStatus.consentRate}% consent rate
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <Progress value={gdprStatus.consentRate} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Data Retention
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {gdprStatus.dataRetentionCompliance}%
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Compliance rate
                    </p>
                  </div>
                  <Database className="h-8 w-8 text-purple-500" />
                </div>
                <Progress
                  value={gdprStatus.dataRetentionCompliance}
                  className="mt-3"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Breach Reports
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {gdprStatus.breachesReported}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Last 30 days
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-500" />
                </div>
                <div className="mt-3">
                  <span className="text-xs text-green-600">
                    ✓ No breaches reported
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Areas */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Areas Status</CardTitle>
              <CardDescription>
                Detailed breakdown of GDPR compliance across different areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gdprStatus.complianceAreas.map((area, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          area.status === 'compliant'
                            ? 'bg-green-500'
                            : area.status === 'partially_compliant'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                      />
                      <div>
                        <p className="font-medium">{area.area}</p>
                        <p className="text-sm text-muted-foreground">
                          Last checked:{' '}
                          {new Date(area.lastChecked).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-bold">{area.score}%</p>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>

                      {area.issues > 0 && (
                        <Badge
                          variant="outline"
                          className="bg-orange-50 text-orange-700"
                        >
                          {area.issues} issues
                        </Badge>
                      )}

                      <Badge className={getStatusColor(area.status)}>
                        {area.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common privacy and compliance management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-auto justify-start p-4">
                  <FileCheck className="mr-3 h-5 w-5 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium">Generate Report</div>
                    <div className="text-xs text-muted-foreground">
                      Create compliance report
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto justify-start p-4">
                  <UserCheck className="mr-3 h-5 w-5 text-green-500" />
                  <div className="text-left">
                    <div className="font-medium">Audit Consents</div>
                    <div className="text-xs text-muted-foreground">
                      Review consent records
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto justify-start p-4">
                  <Database className="mr-3 h-5 w-5 text-purple-500" />
                  <div className="text-left">
                    <div className="font-medium">Data Cleanup</div>
                    <div className="text-xs text-muted-foreground">
                      Remove expired data
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto justify-start p-4">
                  <Shield className="mr-3 h-5 w-5 text-orange-500" />
                  <div className="text-left">
                    <div className="font-medium">Security Scan</div>
                    <div className="text-xs text-muted-foreground">
                      Run security audit
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-requests" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="access">Access</SelectItem>
                    <SelectItem value="rectification">Rectification</SelectItem>
                    <SelectItem value="erasure">Erasure</SelectItem>
                    <SelectItem value="portability">Portability</SelectItem>
                    <SelectItem value="restriction">Restriction</SelectItem>
                    <SelectItem value="objection">Objection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection Requests */}
          <div className="grid gap-4">
            {filteredDataRequests.map(request => {
              const TypeIcon = getTypeIcon(request.type);
              const daysRemaining = Math.ceil(
                (new Date(request.dueDate).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              return (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <TypeIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold capitalize">
                            {request.type.replace('_', ' ')} Request
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {request.userName} • {request.userEmail}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <p className="mb-4 text-sm text-muted-foreground">
                      {request.description}
                    </p>

                    <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Request Date
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(request.requestDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Due Date
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            daysRemaining < 7
                              ? 'text-red-600'
                              : daysRemaining < 14
                                ? 'text-yellow-600'
                                : 'text-green-600'
                          }`}
                        >
                          {daysRemaining > 0
                            ? `${daysRemaining} days left`
                            : 'Overdue'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Data Types
                        </p>
                        <p className="text-sm font-medium">
                          {request.dataTypes.length} types
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Est. Time
                        </p>
                        <p className="text-sm font-medium">
                          {request.estimatedCompletionTime} days
                        </p>
                      </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {request.dataTypes.map(type => (
                        <Badge
                          key={type}
                          variant="secondary"
                          className="text-xs"
                        >
                          {type.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {request.assignedTo &&
                          `Assigned to: ${request.assignedTo}`}
                        {request.legalBasis && ` • ${request.legalBasis}`}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Details
                        </Button>

                        {request.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleRequestAction(request.id, 'process')
                            }
                            disabled={loading}
                          >
                            <RefreshCw className="mr-1 h-3 w-3" />
                            Process
                          </Button>
                        )}

                        {request.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleRequestAction(request.id, 'complete')
                            }
                            disabled={loading}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredDataRequests.length === 0 && (
            <div className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                No data requests found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="consent-management" className="space-y-6">
          {/* Consent Overview */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Consents
                    </p>
                    <p className="text-2xl font-bold">
                      {consentRecords.length}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Active Consents
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {consentRecords.filter(c => c.status === 'given').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Withdrawn</p>
                    <p className="text-2xl font-bold text-red-600">
                      {
                        consentRecords.filter(c => c.status === 'withdrawn')
                          .length
                      }
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Consent Rate
                    </p>
                    <p className="text-2xl font-bold text-blue-600">89.3%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Consent Records */}
          <Card>
            <CardHeader>
              <CardTitle>Consent Records</CardTitle>
              <CardDescription>
                Manage user consent preferences and compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consentRecords.map(consent => (
                  <div
                    key={consent.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          consent.status === 'given'
                            ? 'bg-green-500'
                            : consent.status === 'withdrawn'
                              ? 'bg-red-500'
                              : consent.status === 'expired'
                                ? 'bg-gray-500'
                                : 'bg-yellow-500'
                        }`}
                      />

                      <div>
                        <p className="font-medium">{consent.userName}</p>
                        <p className="text-sm text-muted-foreground">
                          {consent.userEmail}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium capitalize">
                          {consent.consentType.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {consent.consentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right text-xs text-muted-foreground">
                        <p>
                          Given:{' '}
                          {new Date(consent.consentDate).toLocaleDateString()}
                        </p>
                        {consent.withdrawalDate && (
                          <p>
                            Withdrawn:{' '}
                            {new Date(
                              consent.withdrawalDate
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <Badge className={getStatusColor(consent.status)}>
                        {consent.status}
                      </Badge>

                      <Button size="sm" variant="outline">
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Consent Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Consent Analytics</CardTitle>
              <CardDescription>
                Track consent trends and compliance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-4 font-medium">Consent by Type</h4>
                  <div className="space-y-3">
                    {[
                      'marketing',
                      'analytics',
                      'functional',
                      'performance',
                    ].map(type => {
                      const typeConsents = consentRecords.filter(
                        c => c.consentType === type
                      );
                      const activeConsents = typeConsents.filter(
                        c => c.status === 'given'
                      ).length;
                      const percentage =
                        typeConsents.length > 0
                          ? (activeConsents / typeConsents.length) * 100
                          : 0;

                      return (
                        <div
                          key={type}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm capitalize">
                            {type.replace('_', ' ')}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Progress value={percentage} className="w-20" />
                            <span className="text-sm font-medium">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="mb-4 font-medium">Recent Activities</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>15 new consents today</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span>3 consents withdrawn</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span>8 consents expiring soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-tools" className="space-y-6">
          {/* Data Anonymization */}
          <Card>
            <CardHeader>
              <CardTitle>Data Anonymization & Deletion</CardTitle>
              <CardDescription>
                Tools for data anonymization and secure deletion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold">Data Anonymization</h3>

                  <div>
                    <Label>User ID or Email</Label>
                    <Input
                      placeholder="Enter user ID or email"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Anonymization Level</Label>
                    <Select defaultValue="partial">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="partial">
                          Partial (Keep Analytics)
                        </SelectItem>
                        <SelectItem value="full">Full Anonymization</SelectItem>
                        <SelectItem value="pseudonymization">
                          Pseudonymization
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Data Categories</Label>
                    <div className="mt-2 space-y-2">
                      {[
                        'Personal Info',
                        'Learning Data',
                        'Communications',
                        'Files',
                      ].map(category => (
                        <div
                          key={category}
                          className="flex items-center space-x-2"
                        >
                          <input type="checkbox" id={category} defaultChecked />
                          <Label htmlFor={category} className="text-sm">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleDataAnonymization('test-user')}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Start Anonymization
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Data Deletion</h3>

                  <div>
                    <Label>User ID or Email</Label>
                    <Input
                      placeholder="Enter user ID or email"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Deletion Type</Label>
                    <Select defaultValue="soft">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="soft">
                          Soft Delete (Recoverable)
                        </SelectItem>
                        <SelectItem value="hard">
                          Hard Delete (Permanent)
                        </SelectItem>
                        <SelectItem value="scheduled">
                          Schedule Deletion
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Retention Period (Days)</Label>
                    <Input type="number" defaultValue="30" className="mt-1" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="confirm-deletion" />
                    <Label htmlFor="confirm-deletion" className="text-sm">
                      I confirm this deletion request
                    </Label>
                  </div>

                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Schedule Deletion
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-4 font-semibold">Recent Activities</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center space-x-3">
                      <UserX className="h-4 w-4 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium">
                          Data Anonymization
                        </p>
                        <p className="text-xs text-muted-foreground">
                          user-12345 • Completed
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      2 hours ago
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center space-x-3">
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-sm font-medium">Data Deletion</p>
                        <p className="text-xs text-muted-foreground">
                          user-67890 • In Progress
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      1 day ago
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Export Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Data Export & Portability</CardTitle>
              <CardDescription>
                Export user data for portability requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label>Export Type</Label>
                    <Select defaultValue="user_data">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user_data">
                          User Data Export
                        </SelectItem>
                        <SelectItem value="learning_data">
                          Learning Data Only
                        </SelectItem>
                        <SelectItem value="compliance_report">
                          Compliance Report
                        </SelectItem>
                        <SelectItem value="audit_trail">Audit Trail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Format</Label>
                    <Select defaultValue="json">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xml">XML</SelectItem>
                        <SelectItem value="pdf">PDF Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Date Range</Label>
                    <div className="mt-1 flex space-x-2">
                      <Input type="date" />
                      <Input type="date" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Include Data Types</Label>
                    <div className="mt-2 space-y-2">
                      {[
                        'Profile Information',
                        'Learning Progress',
                        'Assessment Results',
                        'Communications',
                        'File Uploads',
                        'Login History',
                      ].map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <input type="checkbox" id={type} defaultChecked />
                          <Label htmlFor={type} className="text-sm">
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit-reports" className="space-y-6">
          {/* Audit Overview */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Audits
                    </p>
                    <p className="text-2xl font-bold">{auditRecords.length}</p>
                  </div>
                  <FileCheck className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                    <p className="text-2xl font-bold text-green-600">87.5%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Next Audit</p>
                    <p className="text-2xl font-bold">156 days</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audit Records */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Audit Records</CardTitle>
              <CardDescription>
                Track compliance audits and findings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditRecords.map(audit => (
                  <div key={audit.id} className="rounded-lg border p-4">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold capitalize">
                          {audit.auditType} Audit
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Conducted by {audit.auditor}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(audit.status)}>
                          {audit.status.replace('_', ' ')}
                        </Badge>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {audit.complianceScore}%
                          </p>
                          <p className="text-xs text-muted-foreground">Score</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Start Date
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(audit.startDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          End Date
                        </p>
                        <p className="text-sm font-medium">
                          {audit.endDate
                            ? new Date(audit.endDate).toLocaleDateString()
                            : 'In Progress'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Scope Areas
                        </p>
                        <p className="text-sm font-medium">
                          {audit.scope.length} areas
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Findings
                        </p>
                        <p className="text-sm font-medium">
                          {audit.findings.length} issues
                        </p>
                      </div>
                    </div>

                    {audit.findings.length > 0 && (
                      <div className="mb-4">
                        <h4 className="mb-2 font-medium">Key Findings</h4>
                        <div className="space-y-2">
                          {audit.findings.slice(0, 2).map((finding, index) => (
                            <div
                              key={index}
                              className="flex items-start space-x-2 text-sm"
                            >
                              <Badge
                                variant="outline"
                                className={
                                  finding.severity === 'critical'
                                    ? 'border-red-500 text-red-700'
                                    : finding.severity === 'high'
                                      ? 'border-orange-500 text-orange-700'
                                      : finding.severity === 'medium'
                                        ? 'border-yellow-500 text-yellow-700'
                                        : 'border-green-500 text-green-700'
                                }
                              >
                                {finding.severity}
                              </Badge>
                              <div className="flex-1">
                                <p className="font-medium">
                                  {finding.category}
                                </p>
                                <p className="text-muted-foreground">
                                  {finding.description}
                                </p>
                              </div>
                              <Badge className={getStatusColor(finding.status)}>
                                {finding.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          ))}
                          {audit.findings.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{audit.findings.length - 2} more findings
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {audit.scope.slice(0, 3).map(area => (
                          <Badge
                            key={area}
                            variant="secondary"
                            className="text-xs"
                          >
                            {area}
                          </Badge>
                        ))}
                        {audit.scope.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{audit.scope.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {audit.reportUrl && (
                          <Button size="sm" variant="outline">
                            <Download className="mr-1 h-3 w-3" />
                            Report
                          </Button>
                        )}

                        <Button size="sm" variant="outline">
                          <Eye className="mr-1 h-3 w-3" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generate Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Compliance Reports</CardTitle>
              <CardDescription>
                Create custom compliance and audit reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button
                  variant="outline"
                  className="h-auto justify-start p-4"
                  onClick={() => generateComplianceReport('GDPR')}
                  disabled={loading}
                >
                  <Shield className="mr-3 h-5 w-5 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium">GDPR Report</div>
                    <div className="text-xs text-muted-foreground">
                      Full compliance report
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto justify-start p-4"
                  onClick={() => generateComplianceReport('Data Audit')}
                  disabled={loading}
                >
                  <Database className="mr-3 h-5 w-5 text-green-500" />
                  <div className="text-left">
                    <div className="font-medium">Data Audit</div>
                    <div className="text-xs text-muted-foreground">
                      Data processing audit
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto justify-start p-4"
                  onClick={() => generateComplianceReport('Consent')}
                  disabled={loading}
                >
                  <UserCheck className="mr-3 h-5 w-5 text-purple-500" />
                  <div className="text-left">
                    <div className="font-medium">Consent Report</div>
                    <div className="text-xs text-muted-foreground">
                      Consent management audit
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto justify-start p-4"
                  onClick={() => generateComplianceReport('Security')}
                  disabled={loading}
                >
                  <Lock className="mr-3 h-5 w-5 text-orange-500" />
                  <div className="text-left">
                    <div className="font-medium">Security Report</div>
                    <div className="text-xs text-muted-foreground">
                      Security compliance audit
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Details Dialog */}
      {selectedRequest && (
        <Dialog
          open={!!selectedRequest}
          onOpenChange={() => setSelectedRequest(null)}
        >
          <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Data Protection Request Details</DialogTitle>
              <DialogDescription>
                Full details of the data protection request
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Request ID</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedRequest.id}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">User</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedRequest.userName} ({selectedRequest.userEmail})
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Request Type</Label>
                    <p className="mt-1 text-sm capitalize text-muted-foreground">
                      {selectedRequest.type.replace('_', ' ')}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <Badge
                      className={
                        getPriorityColor(selectedRequest.priority) + ' mt-1'
                      }
                    >
                      {selectedRequest.priority}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge
                      className={
                        getStatusColor(selectedRequest.status) + ' mt-1'
                      }
                    >
                      {selectedRequest.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Request Date</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(selectedRequest.requestDate).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Due Date</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(selectedRequest.dueDate).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">
                      Estimated Time
                    </Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedRequest.estimatedCompletionTime} days
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="mt-1 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  {selectedRequest.description}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Data Types Involved
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedRequest.dataTypes.map(type => (
                    <Badge key={type} variant="secondary">
                      {type.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedRequest.legalBasis && (
                <div>
                  <Label className="text-sm font-medium">Legal Basis</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedRequest.legalBasis}
                  </p>
                </div>
              )}

              {selectedRequest.assignedTo && (
                <div>
                  <Label className="text-sm font-medium">Assigned To</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedRequest.assignedTo}
                  </p>
                </div>
              )}

              {selectedRequest.processingNotes && (
                <div>
                  <Label className="text-sm font-medium">
                    Processing Notes
                  </Label>
                  <p className="mt-1 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                    {selectedRequest.processingNotes}
                  </p>
                </div>
              )}

              {selectedRequest.attachments &&
                selectedRequest.attachments.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Attachments</Label>
                    <div className="mt-2 space-y-2">
                      {selectedRequest.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 rounded border p-2"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{attachment}</span>
                          <Button size="sm" variant="ghost">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </Button>
              {selectedRequest.status === 'pending' && (
                <Button
                  onClick={() =>
                    handleRequestAction(selectedRequest.id, 'process')
                  }
                >
                  Process Request
                </Button>
              )}
              {selectedRequest.status === 'in_progress' && (
                <Button
                  onClick={() =>
                    handleRequestAction(selectedRequest.id, 'complete')
                  }
                >
                  Mark Complete
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Process Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Run Compliance Audit</DialogTitle>
            <DialogDescription>
              Configure and start a new compliance audit
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Audit Type</Label>
                <Select defaultValue="gdpr">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gdpr">GDPR Compliance</SelectItem>
                    <SelectItem value="ccpa">CCPA Compliance</SelectItem>
                    <SelectItem value="internal">Internal Audit</SelectItem>
                    <SelectItem value="security">Security Audit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Scope</Label>
                <Select defaultValue="full">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full System Audit</SelectItem>
                    <SelectItem value="data_processing">
                      Data Processing Only
                    </SelectItem>
                    <SelectItem value="consent">Consent Management</SelectItem>
                    <SelectItem value="user_rights">User Rights</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Auditor</Label>
              <Input
                placeholder="Enter auditor name or organization"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Audit Areas</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  'Data Processing',
                  'Consent Management',
                  'User Rights',
                  'Data Security',
                  'Breach Response',
                  'Data Retention',
                ].map(area => (
                  <div key={area} className="flex items-center space-x-2">
                    <input type="checkbox" id={area} defaultChecked />
                    <Label htmlFor={area} className="text-sm">
                      {area}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Add any specific notes or requirements for this audit"
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowProcessDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowProcessDialog(false);
                  toast.success('Compliance audit scheduled successfully');
                }}
              >
                Start Audit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
