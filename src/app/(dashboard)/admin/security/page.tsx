'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Lock,
  Unlock,
  Activity,
  FileText,
  RefreshCw,
  Download,
  Search,
  Filter,
  Clock,
  User,
  Globe,
  Server,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

export default function AdminSecurityPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock security data
  const securityData = {
    overview: {
      totalThreats: 23,
      blockedAttacks: 156,
      vulnerabilities: 3,
      uptime: 99.98,
    },
    recentAlerts: [
      {
        id: '1',
        type: 'critical',
        title: 'Multiple Failed Login Attempts',
        description: 'User attempted login 10 times with wrong credentials',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        source: 'Authentication System',
        status: 'investigating',
      },
      {
        id: '2',
        type: 'warning',
        title: 'Unusual API Usage Pattern',
        description: 'API endpoint /admin/users accessed 500 times in 1 hour',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        source: 'API Monitor',
        status: 'resolved',
      },
      {
        id: '3',
        type: 'info',
        title: 'SSL Certificate Renewal',
        description: 'SSL certificate will expire in 30 days',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        source: 'Certificate Monitor',
        status: 'scheduled',
      },
    ],
    auditLogs: [
      {
        id: '1',
        action: 'User Login',
        user: 'john.doe@example.com',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        status: 'success',
      },
      {
        id: '2',
        action: 'Course Created',
        user: 'teacher@example.com',
        ip: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        status: 'success',
      },
      {
        id: '3',
        action: 'Failed Admin Access',
        user: 'unknown@suspicious.com',
        ip: '185.220.100.240',
        userAgent: 'curl/7.68.0',
        timestamp: new Date(Date.now() - 35 * 60 * 1000),
        status: 'blocked',
      },
    ],
    threats: [
      {
        id: '1',
        type: 'Brute Force Attack',
        severity: 'high',
        source: '185.220.100.240',
        target: '/admin/login',
        attempts: 25,
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        status: 'blocked',
      },
      {
        id: '2',
        type: 'SQL Injection Attempt',
        severity: 'critical',
        source: '192.168.1.50',
        target: '/api/courses/search',
        attempts: 3,
        timestamp: new Date(Date.now() - 120 * 60 * 1000),
        status: 'blocked',
      },
    ],
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'info':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return XCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return CheckCircle;
      default:
        return Shield;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'blocked':
        return 'text-red-600 bg-red-100';
      case 'investigating':
        return 'text-yellow-600 bg-yellow-100';
      case 'resolved':
        return 'text-green-600 bg-green-100';
      case 'scheduled':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!user || user.userType !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to access security settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security & Monitoring</h1>
          <p className="text-muted-foreground">
            System security, threat monitoring, and audit logs
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Threats</p>
                <p className="text-2xl font-bold">{securityData.overview.totalThreats}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Blocked Attacks</p>
                <p className="text-2xl font-bold">{securityData.overview.blockedAttacks}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vulnerabilities</p>
                <p className="text-2xl font-bold">{securityData.overview.vulnerabilities}</p>
              </div>
              <XCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Uptime</p>
                <p className="text-2xl font-bold">{securityData.overview.uptime}%</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Security Overview</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="threats">Threat Detection</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  System Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Firewall</span>
                  <Badge className="text-green-600 bg-green-100">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SSL Certificate</span>
                  <Badge className="text-green-600 bg-green-100">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Valid
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">DDoS Protection</span>
                  <Badge className="text-green-600 bg-green-100">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Enabled
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">WAF (Web Application Firewall)</span>
                  <Badge className="text-green-600 bg-green-100">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rate Limiting</span>
                  <Badge className="text-green-600 bg-green-100">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Configured
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Recent Security Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Failed login attempts blocked</span>
                    <span className="font-medium">45 in last hour</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Suspicious API requests</span>
                    <span className="font-medium">12 detected</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Security scans completed</span>
                    <span className="font-medium">3 today</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Vulnerability patches applied</span>
                    <span className="font-medium">2 this week</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Security Alerts
                </div>
                <Badge variant="outline">
                  {securityData.recentAlerts.length} alerts
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityData.recentAlerts.map((alert) => {
                  const AlertIcon = getAlertIcon(alert.type);
                  return (
                    <div
                      key={alert.id}
                      className="rounded-lg border p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <AlertIcon className={cn('h-4 w-4', alert.type === 'critical' ? 'text-red-600' : alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600')} />
                          <div>
                            <h4 className="font-medium">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground">{alert.description}</p>
                          </div>
                        </div>
                        <Badge className={cn('text-xs', getStatusColor(alert.status))}>
                          {alert.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{alert.source}</span>
                        <span>{format(alert.timestamp, 'MMM d, yyyy HH:mm')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Audit Logs
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search logs..." className="pl-8 w-64" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityData.auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{log.user}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span>{log.ip}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('text-xs', getStatusColor(log.status))}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{format(log.timestamp, 'MMM d, yyyy HH:mm')}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Threat Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Threat Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityData.threats.map((threat) => (
                    <TableRow key={threat.id}>
                      <TableCell className="font-medium">{threat.type}</TableCell>
                      <TableCell>
                        <Badge className={cn('text-xs', getSeverityColor(threat.severity))}>
                          {threat.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Server className="h-4 w-4 text-muted-foreground" />
                          <span>{threat.source}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{threat.target}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{threat.attempts}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('text-xs', getStatusColor(threat.status))}>
                          {threat.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(threat.timestamp, 'MMM d, yyyy HH:mm')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}