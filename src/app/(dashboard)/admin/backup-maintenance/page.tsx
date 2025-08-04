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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  HardDrive,
  Download,
  Upload,
  Clock,
  Settings,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Shield,
  Archive,
  Monitor,
  Activity,
  Eye,
  Copy,
  Gauge,
  MemoryStick,
} from 'lucide-react';

interface Backup {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'in_progress' | 'failed' | 'scheduled';
  size: number;
  duration: number;
  createdAt: string;
  completedAt?: string;
  location: string;
  retention: number; // days
  compression: number; // percentage
  verification: 'passed' | 'failed' | 'pending';
  includes: string[];
  excludes: string[];
  progress?: number;
  error?: string;
}

interface MaintenanceTask {
  id: string;
  name: string;
  description: string;
  type: 'backup' | 'cleanup' | 'optimization' | 'monitoring' | 'security';
  schedule: string;
  lastRun?: string;
  nextRun: string;
  status: 'active' | 'paused' | 'failed' | 'completed';
  duration?: number;
  isEnabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies?: string[];
  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    onStart: boolean;
  };
}

interface SystemHealth {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
  };
  memory: {
    used: number;
    total: number;
    cached: number;
  };
  disk: {
    used: number;
    total: number;
    iops: number;
  };
  network: {
    inbound: number;
    outbound: number;
    connections: number;
  };
  services: Array<{
    name: string;
    status: 'running' | 'stopped' | 'error';
    uptime: number;
    memory: number;
    cpu: number;
  }>;
}

const mockBackups: Backup[] = [
  {
    id: 'backup-1',
    name: 'Full System Backup',
    type: 'full',
    status: 'completed',
    size: 15.7 * 1024 * 1024 * 1024, // 15.7GB
    duration: 4320, // 72 minutes
    createdAt: '2024-01-15T02:00:00Z',
    completedAt: '2024-01-15T03:12:00Z',
    location: 's3://lms-backups/full/2024-01-15-full-backup.tar.gz',
    retention: 30,
    compression: 65,
    verification: 'passed',
    includes: ['database', 'user_files', 'system_config', 'logs'],
    excludes: ['temp_files', 'cache', 'session_data'],
  },
  {
    id: 'backup-2',
    name: 'Database Incremental',
    type: 'incremental',
    status: 'completed',
    size: 2.3 * 1024 * 1024 * 1024, // 2.3GB
    duration: 840, // 14 minutes
    createdAt: '2024-01-14T02:00:00Z',
    completedAt: '2024-01-14T02:14:00Z',
    location: 's3://lms-backups/incremental/2024-01-14-db-incremental.tar.gz',
    retention: 7,
    compression: 72,
    verification: 'passed',
    includes: ['database'],
    excludes: [],
  },
  {
    id: 'backup-3',
    name: 'User Files Backup',
    type: 'differential',
    status: 'in_progress',
    size: 8.9 * 1024 * 1024 * 1024, // 8.9GB
    duration: 0,
    createdAt: '2024-01-15T18:00:00Z',
    location:
      's3://lms-backups/differential/2024-01-15-files-differential.tar.gz',
    retention: 14,
    compression: 58,
    verification: 'pending',
    includes: ['user_files', 'course_materials'],
    excludes: ['temp_uploads'],
    progress: 67,
  },
  {
    id: 'backup-4',
    name: 'Configuration Backup',
    type: 'full',
    status: 'failed',
    size: 0,
    duration: 0,
    createdAt: '2024-01-13T02:00:00Z',
    location: '',
    retention: 90,
    compression: 0,
    verification: 'failed',
    includes: ['system_config', 'certificates', 'secrets'],
    excludes: [],
    error: 'Access denied to secrets directory',
  },
];

const mockMaintenanceTasks: MaintenanceTask[] = [
  {
    id: 'task-1',
    name: 'Daily Full Backup',
    description:
      'Complete system backup including database, files, and configurations',
    type: 'backup',
    schedule: '0 2 * * *', // Daily at 2 AM
    lastRun: '2024-01-15T02:00:00Z',
    nextRun: '2024-01-16T02:00:00Z',
    status: 'completed',
    duration: 4320,
    isEnabled: true,
    priority: 'critical',
    notifications: {
      onSuccess: true,
      onFailure: true,
      onStart: false,
    },
  },
  {
    id: 'task-2',
    name: 'Log Cleanup',
    description: 'Remove old log files older than 30 days',
    type: 'cleanup',
    schedule: '0 3 * * 0', // Weekly on Sunday at 3 AM
    lastRun: '2024-01-14T03:00:00Z',
    nextRun: '2024-01-21T03:00:00Z',
    status: 'active',
    isEnabled: true,
    priority: 'medium',
    notifications: {
      onSuccess: false,
      onFailure: true,
      onStart: false,
    },
  },
  {
    id: 'task-3',
    name: 'Database Optimization',
    description: 'Optimize database tables and rebuild indexes',
    type: 'optimization',
    schedule: '0 4 1 * *', // Monthly on 1st at 4 AM
    lastRun: '2024-01-01T04:00:00Z',
    nextRun: '2024-02-01T04:00:00Z',
    status: 'active',
    isEnabled: true,
    priority: 'high',
    notifications: {
      onSuccess: true,
      onFailure: true,
      onStart: true,
    },
  },
  {
    id: 'task-4',
    name: 'Security Scan',
    description: 'Run security vulnerability scans and generate reports',
    type: 'security',
    schedule: '0 1 * * 1', // Weekly on Monday at 1 AM
    lastRun: '2024-01-15T01:00:00Z',
    nextRun: '2024-01-22T01:00:00Z',
    status: 'failed',
    isEnabled: true,
    priority: 'high',
    notifications: {
      onSuccess: true,
      onFailure: true,
      onStart: false,
    },
  },
  {
    id: 'task-5',
    name: 'System Health Check',
    description: 'Monitor system resources and generate health reports',
    type: 'monitoring',
    schedule: '*/15 * * * *', // Every 15 minutes
    lastRun: '2024-01-15T18:45:00Z',
    nextRun: '2024-01-15T19:00:00Z',
    status: 'active',
    isEnabled: true,
    priority: 'medium',
    notifications: {
      onSuccess: false,
      onFailure: true,
      onStart: false,
    },
  },
];

const mockSystemHealth: SystemHealth = {
  cpu: {
    usage: 34.7,
    cores: 8,
    temperature: 52.3,
  },
  memory: {
    used: 12.4 * 1024 * 1024 * 1024, // 12.4GB
    total: 32 * 1024 * 1024 * 1024, // 32GB
    cached: 8.2 * 1024 * 1024 * 1024, // 8.2GB
  },
  disk: {
    used: 245.8 * 1024 * 1024 * 1024, // 245.8GB
    total: 500 * 1024 * 1024 * 1024, // 500GB
    iops: 1247,
  },
  network: {
    inbound: 125.6, // MB/s
    outbound: 89.3, // MB/s
    connections: 1834,
  },
  services: [
    { name: 'nginx', status: 'running', uptime: 345600, memory: 156, cpu: 2.1 },
    {
      name: 'mysql',
      status: 'running',
      uptime: 345600,
      memory: 2048,
      cpu: 12.4,
    },
    { name: 'redis', status: 'running', uptime: 345600, memory: 512, cpu: 3.2 },
    {
      name: 'nodejs',
      status: 'running',
      uptime: 12600,
      memory: 1024,
      cpu: 8.7,
    },
    {
      name: 'elasticsearch',
      status: 'running',
      uptime: 345600,
      memory: 4096,
      cpu: 15.3,
    },
  ],
};

export default function BackupMaintenancePage() {
  const [activeTab, setActiveTab] = useState('backups');
  const [backups, setBackups] = useState<Backup[]>(mockBackups);
  const [maintenanceTasks, setMaintenanceTasks] =
    useState<MaintenanceTask[]>(mockMaintenanceTasks);
  const [systemHealth, setSystemHealth] =
    useState<SystemHealth>(mockSystemHealth);
  const [loading, setLoading] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [showBackupDialog, setShowBackupDialog] = useState(false);

  useEffect(() => {
    // Simulate real-time system health updates
    const interval = setInterval(() => {
      setSystemHealth(prev => ({
        ...prev,
        cpu: {
          ...prev.cpu,
          usage: Math.max(
            10,
            Math.min(90, prev.cpu.usage + (Math.random() - 0.5) * 10)
          ),
        },
        memory: {
          ...prev.memory,
          used: Math.max(
            8 * 1024 * 1024 * 1024,
            Math.min(
              28 * 1024 * 1024 * 1024,
              prev.memory.used + (Math.random() - 0.5) * 1024 * 1024 * 1024
            )
          ),
        },
        network: {
          ...prev.network,
          inbound: Math.max(
            50,
            Math.min(200, prev.network.inbound + (Math.random() - 0.5) * 20)
          ),
          outbound: Math.max(
            30,
            Math.min(150, prev.network.outbound + (Math.random() - 0.5) * 15)
          ),
        },
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'running':
      case 'passed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'in_progress':
      case 'active':
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'failed':
      case 'error':
      case 'stopped':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'paused':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
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

  const handleBackupAction = async (backupId: string, action: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      switch (action) {
        case 'restore':
          toast.success('Backup restore initiated');
          break;
        case 'download':
          toast.success('Backup download started');
          break;
        case 'verify':
          setBackups(prev =>
            prev.map(backup =>
              backup.id === backupId
                ? { ...backup, verification: 'passed' }
                : backup
            )
          );
          toast.success('Backup verification completed');
          break;
        case 'delete':
          setBackups(prev => prev.filter(backup => backup.id !== backupId));
          toast.success('Backup deleted successfully');
          break;
      }
    } catch (error) {
      toast.error(`Failed to ${action} backup`);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAction = async (taskId: string, action: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      switch (action) {
        case 'run_now':
          setMaintenanceTasks(prev =>
            prev.map(task =>
              task.id === taskId
                ? {
                    ...task,
                    status: 'active',
                    lastRun: new Date().toISOString(),
                  }
                : task
            )
          );
          toast.success('Task execution started');
          break;
        case 'pause':
          setMaintenanceTasks(prev =>
            prev.map(task =>
              task.id === taskId ? { ...task, status: 'paused' } : task
            )
          );
          toast.success('Task paused');
          break;
        case 'resume':
          setMaintenanceTasks(prev =>
            prev.map(task =>
              task.id === taskId ? { ...task, status: 'active' } : task
            )
          );
          toast.success('Task resumed');
          break;
        case 'toggle_enabled':
          setMaintenanceTasks(prev =>
            prev.map(task =>
              task.id === taskId
                ? { ...task, isEnabled: !task.isEnabled }
                : task
            )
          );
          toast.success('Task status updated');
          break;
      }
    } catch (error) {
      toast.error(`Failed to ${action} task`);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (backupData: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newBackup: Backup = {
        id: `backup-${Date.now()}`,
        name: backupData.name,
        type: backupData.type,
        status: 'in_progress',
        size: 0,
        duration: 0,
        createdAt: new Date().toISOString(),
        location: `s3://lms-backups/${backupData.type}/${backupData.name}.tar.gz`,
        retention: backupData.retention,
        compression: backupData.compression,
        verification: 'pending',
        includes: backupData.includes,
        excludes: backupData.excludes,
        progress: 0,
      };

      setBackups(prev => [newBackup, ...prev]);
      setShowBackupDialog(false);
      toast.success('Backup creation initiated');
    } catch (error) {
      toast.error('Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const memoryUsagePercentage =
    (systemHealth.memory.used / systemHealth.memory.total) * 100;
  const diskUsagePercentage =
    (systemHealth.disk.used / systemHealth.disk.total) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Backup & System Maintenance</h1>
          <p className="text-muted-foreground">
            Manage backups, system health, and automated maintenance tasks
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>

          <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
            <DialogTrigger asChild>
              <Button>
                <Archive className="mr-2 h-4 w-4" />
                Create Backup
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Backup</DialogTitle>
                <DialogDescription>
                  Configure and start a new backup operation
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Backup Name</Label>
                    <Input placeholder="Enter backup name" className="mt-1" />
                  </div>

                  <div>
                    <Label>Backup Type</Label>
                    <Select defaultValue="full">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Backup</SelectItem>
                        <SelectItem value="incremental">Incremental</SelectItem>
                        <SelectItem value="differential">
                          Differential
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Retention (Days)</Label>
                    <Input type="number" defaultValue="30" className="mt-1" />
                  </div>

                  <div>
                    <Label>Compression Level</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Include Components</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {[
                      'database',
                      'user_files',
                      'system_config',
                      'logs',
                      'cache',
                      'temp_files',
                    ].map(component => (
                      <div
                        key={component}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={component}
                          defaultChecked={
                            !['cache', 'temp_files'].includes(component)
                          }
                        />
                        <Label
                          htmlFor={component}
                          className="text-sm capitalize"
                        >
                          {component.replace('_', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowBackupDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => createBackup({})}>
                    Create Backup
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="system-health">System Health</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="backups" className="space-y-6">
          {/* Backup Overview */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Backups
                    </p>
                    <p className="text-2xl font-bold">{backups.length}</p>
                  </div>
                  <Archive className="h-8 w-8 text-blue-500" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {backups.filter(b => b.status === 'completed').length}{' '}
                  completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Storage Used
                    </p>
                    <p className="text-2xl font-bold">
                      {formatBytes(backups.reduce((sum, b) => sum + b.size, 0))}
                    </p>
                  </div>
                  <HardDrive className="h-8 w-8 text-green-500" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Across all backup locations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Last Backup</p>
                    <p className="text-2xl font-bold">
                      {backups[0]
                        ? new Date(backups[0].createdAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {backups[0] ? formatDuration(backups[0].duration) : '0m'}{' '}
                  duration
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Success Rate
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {backups.length > 0
                        ? Math.round(
                            (backups.filter(b => b.status === 'completed')
                              .length /
                              backups.length) *
                              100
                          )
                        : 0}
                      %
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Backups List */}
          <div className="grid gap-4">
            {backups.map(backup => (
              <Card key={backup.id}>
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Archive className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{backup.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {backup.type.charAt(0).toUpperCase() +
                            backup.type.slice(1)}{' '}
                          backup
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(backup.status)}>
                        {backup.status.replace('_', ' ')}
                      </Badge>

                      {backup.verification && (
                        <Badge className={getStatusColor(backup.verification)}>
                          {backup.verification}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {backup.status === 'in_progress' && backup.progress && (
                    <div className="mb-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Progress
                        </span>
                        <span className="text-sm font-medium">
                          {backup.progress}%
                        </span>
                      </div>
                      <Progress value={backup.progress} />
                    </div>
                  )}

                  {backup.error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-800">
                          {backup.error}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Size</p>
                      <p className="text-sm font-medium">
                        {formatBytes(backup.size)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-sm font-medium">
                        {backup.duration > 0
                          ? formatDuration(backup.duration)
                          : 'In progress'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Compression
                      </p>
                      <p className="text-sm font-medium">
                        {backup.compression}%
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Retention</p>
                      <p className="text-sm font-medium">
                        {backup.retention} days
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {backup.includes.map(item => (
                        <Badge
                          key={item}
                          variant="secondary"
                          className="text-xs"
                        >
                          {item.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      {backup.status === 'completed' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleBackupAction(backup.id, 'download')
                            }
                            disabled={loading}
                          >
                            <Download className="mr-1 h-3 w-3" />
                            Download
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleBackupAction(backup.id, 'restore')
                            }
                            disabled={loading}
                          >
                            <Upload className="mr-1 h-3 w-3" />
                            Restore
                          </Button>
                        </>
                      )}

                      {backup.verification === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleBackupAction(backup.id, 'verify')
                          }
                          disabled={loading}
                        >
                          <Shield className="mr-1 h-3 w-3" />
                          Verify
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedBackup(backup)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Details
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleBackupAction(backup.id, 'delete')}
                        disabled={loading}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {backups.length === 0 && (
            <div className="py-12 text-center">
              <Archive className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No backups found</h3>
              <p className="text-muted-foreground">
                Create your first backup to get started.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          {/* Maintenance Tasks */}
          <div className="grid gap-4">
            {maintenanceTasks.map(task => (
              <Card key={task.id}>
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        {task.type === 'backup' && (
                          <Archive className="h-5 w-5 text-primary" />
                        )}
                        {task.type === 'cleanup' && (
                          <Trash2 className="h-5 w-5 text-primary" />
                        )}
                        {task.type === 'optimization' && (
                          <Settings className="h-5 w-5 text-primary" />
                        )}
                        {task.type === 'monitoring' && (
                          <Monitor className="h-5 w-5 text-primary" />
                        )}
                        {task.type === 'security' && (
                          <Shield className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{task.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                      <Switch
                        checked={task.isEnabled}
                        onCheckedChange={() =>
                          handleTaskAction(task.id, 'toggle_enabled')
                        }
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Schedule</p>
                      <p className="text-sm font-medium">{task.schedule}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Last Run</p>
                      <p className="text-sm font-medium">
                        {task.lastRun
                          ? new Date(task.lastRun).toLocaleDateString()
                          : 'Never'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Next Run</p>
                      <p className="text-sm font-medium">
                        {new Date(task.nextRun).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-sm font-medium">
                        {task.duration ? formatDuration(task.duration) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <span>Notifications:</span>
                        {task.notifications.onSuccess && (
                          <Badge variant="outline" className="text-xs">
                            Success
                          </Badge>
                        )}
                        {task.notifications.onFailure && (
                          <Badge variant="outline" className="text-xs">
                            Failure
                          </Badge>
                        )}
                        {task.notifications.onStart && (
                          <Badge variant="outline" className="text-xs">
                            Start
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTaskAction(task.id, 'run_now')}
                        disabled={loading || !task.isEnabled}
                      >
                        <Play className="mr-1 h-3 w-3" />
                        Run Now
                      </Button>

                      {task.status === 'active' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTaskAction(task.id, 'pause')}
                          disabled={loading}
                        >
                          <Pause className="mr-1 h-3 w-3" />
                          Pause
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTaskAction(task.id, 'resume')}
                          disabled={loading}
                        >
                          <Play className="mr-1 h-3 w-3" />
                          Resume
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system-health" className="space-y-6">
          {/* System Health Overview */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">CPU Usage</p>
                    <p className="text-2xl font-bold">
                      {systemHealth.cpu.usage.toFixed(1)}%
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {systemHealth.cpu.cores} cores,{' '}
                      {systemHealth.cpu.temperature}°C
                    </p>
                  </div>
                  <Gauge className="h-8 w-8 text-blue-500" />
                </div>
                <Progress value={systemHealth.cpu.usage} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Memory Usage
                    </p>
                    <p className="text-2xl font-bold">
                      {memoryUsagePercentage.toFixed(1)}%
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatBytes(systemHealth.memory.used)} of{' '}
                      {formatBytes(systemHealth.memory.total)}
                    </p>
                  </div>
                  <MemoryStick className="h-8 w-8 text-green-500" />
                </div>
                <Progress value={memoryUsagePercentage} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Disk Usage</p>
                    <p className="text-2xl font-bold">
                      {diskUsagePercentage.toFixed(1)}%
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatBytes(systemHealth.disk.used)} of{' '}
                      {formatBytes(systemHealth.disk.total)}
                    </p>
                  </div>
                  <HardDrive className="h-8 w-8 text-purple-500" />
                </div>
                <Progress value={diskUsagePercentage} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Network I/O</p>
                    <p className="text-2xl font-bold">
                      {systemHealth.network.inbound.toFixed(1)} MB/s
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      ↑ {systemHealth.network.outbound.toFixed(1)} MB/s out
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-500" />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {systemHealth.network.connections} active connections
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Services Status */}
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>
                Monitor the health and performance of system services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemHealth.services.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          service.status === 'running'
                            ? 'bg-green-500'
                            : service.status === 'stopped'
                              ? 'bg-gray-500'
                              : 'bg-red-500'
                        }`}
                      />
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Uptime: {formatUptime(service.uptime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {service.cpu.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">CPU</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatBytes(service.memory * 1024 * 1024)}
                        </p>
                        <p className="text-xs text-muted-foreground">Memory</p>
                      </div>

                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          {/* Backup Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Backup Configuration</CardTitle>
              <CardDescription>
                Configure backup settings and storage locations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label>Default Storage Location</Label>
                    <Select defaultValue="s3">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="s3">Amazon S3</SelectItem>
                        <SelectItem value="gcs">
                          Google Cloud Storage
                        </SelectItem>
                        <SelectItem value="azure">
                          Azure Blob Storage
                        </SelectItem>
                        <SelectItem value="local">Local Storage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Default Retention (Days)</Label>
                    <Input type="number" defaultValue="30" className="mt-1" />
                  </div>

                  <div>
                    <Label>Compression Level</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Backup Window</Label>
                    <div className="mt-1 flex space-x-2">
                      <Input
                        placeholder="Start (e.g., 02:00)"
                        defaultValue="02:00"
                      />
                      <Input
                        placeholder="End (e.g., 06:00)"
                        defaultValue="06:00"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable Encryption</Label>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Enable Verification</Label>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Cross-Region Replication</Label>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Automatic Cleanup</Label>
                    <Switch defaultChecked />
                  </div>

                  <div>
                    <Label>Notification Recipients</Label>
                    <Textarea
                      className="mt-1"
                      placeholder="admin@company.com, ops@company.com"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-4 font-semibold">Storage Locations</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">Primary S3 Bucket</p>
                      <p className="text-sm text-muted-foreground">
                        s3://lms-backups-primary
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                      <Button size="sm" variant="outline">
                        Test
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">Secondary S3 Bucket</p>
                      <p className="text-sm text-muted-foreground">
                        s3://lms-backups-secondary
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        Standby
                      </Badge>
                      <Button size="sm" variant="outline">
                        Test
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Test Configuration</Button>
                <Button>Save Configuration</Button>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Configuration</CardTitle>
              <CardDescription>
                Configure automated maintenance tasks and schedules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label>Maintenance Window</Label>
                    <div className="mt-1 flex space-x-2">
                      <Input
                        placeholder="Start (e.g., 01:00)"
                        defaultValue="01:00"
                      />
                      <Input
                        placeholder="End (e.g., 05:00)"
                        defaultValue="05:00"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Max Concurrent Tasks</Label>
                    <Input type="number" defaultValue="3" className="mt-1" />
                  </div>

                  <div>
                    <Label>Task Timeout (minutes)</Label>
                    <Input type="number" defaultValue="60" className="mt-1" />
                  </div>

                  <div>
                    <Label>Retry Attempts</Label>
                    <Input type="number" defaultValue="3" className="mt-1" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable Maintenance Mode</Label>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Auto-Resume Failed Tasks</Label>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Skip on High Load</Label>
                    <Switch defaultChecked />
                  </div>

                  <div>
                    <Label>Load Threshold (%)</Label>
                    <Input type="number" defaultValue="80" className="mt-1" />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-4 font-semibold">Notification Settings</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Email Notifications</Label>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Slack Notifications</Label>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>SMS Alerts</Label>
                      <Switch />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Email Recipients</Label>
                      <Textarea
                        className="mt-1"
                        placeholder="admin@company.com, ops@company.com"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Slack Webhook URL</Label>
                      <Input
                        type="url"
                        placeholder="https://hooks.slack.com/..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Reset to Default</Button>
                <Button>Save Configuration</Button>
              </div>
            </CardContent>
          </Card>

          {/* System Monitoring Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>System Monitoring Configuration</CardTitle>
              <CardDescription>
                Configure system health monitoring and alerting thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">CPU Monitoring</h4>

                  <div>
                    <Label>Warning Threshold (%)</Label>
                    <Input type="number" defaultValue="70" className="mt-1" />
                  </div>

                  <div>
                    <Label>Critical Threshold (%)</Label>
                    <Input type="number" defaultValue="90" className="mt-1" />
                  </div>

                  <div>
                    <Label>Check Interval (seconds)</Label>
                    <Input type="number" defaultValue="60" className="mt-1" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Memory Monitoring</h4>

                  <div>
                    <Label>Warning Threshold (%)</Label>
                    <Input type="number" defaultValue="80" className="mt-1" />
                  </div>

                  <div>
                    <Label>Critical Threshold (%)</Label>
                    <Input type="number" defaultValue="95" className="mt-1" />
                  </div>

                  <div>
                    <Label>Check Interval (seconds)</Label>
                    <Input type="number" defaultValue="60" className="mt-1" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Disk Monitoring</h4>

                  <div>
                    <Label>Warning Threshold (%)</Label>
                    <Input type="number" defaultValue="85" className="mt-1" />
                  </div>

                  <div>
                    <Label>Critical Threshold (%)</Label>
                    <Input type="number" defaultValue="95" className="mt-1" />
                  </div>

                  <div>
                    <Label>Check Interval (seconds)</Label>
                    <Input type="number" defaultValue="300" className="mt-1" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Network Monitoring</h4>

                  <div>
                    <Label>Bandwidth Threshold (MB/s)</Label>
                    <Input type="number" defaultValue="500" className="mt-1" />
                  </div>

                  <div>
                    <Label>Connection Limit</Label>
                    <Input type="number" defaultValue="5000" className="mt-1" />
                  </div>

                  <div>
                    <Label>Check Interval (seconds)</Label>
                    <Input type="number" defaultValue="30" className="mt-1" />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-4 font-medium">Alert Configuration</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex items-center justify-between">
                    <Label>Enable CPU Alerts</Label>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Enable Memory Alerts</Label>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Enable Disk Alerts</Label>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Enable Network Alerts</Label>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Enable Service Alerts</Label>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Alert Aggregation</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Test Alerts</Button>
                <Button>Save Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Backup Details Dialog */}
      {selectedBackup && (
        <Dialog
          open={!!selectedBackup}
          onOpenChange={() => setSelectedBackup(null)}
        >
          <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Backup Details: {selectedBackup.name}</DialogTitle>
              <DialogDescription>
                Detailed information about the backup operation
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Backup ID</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedBackup.id}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <p className="mt-1 text-sm capitalize text-muted-foreground">
                      {selectedBackup.type}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge
                      className={
                        getStatusColor(selectedBackup.status) + ' mt-1'
                      }
                    >
                      {selectedBackup.status}
                    </Badge>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Size</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatBytes(selectedBackup.size)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(selectedBackup.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Duration</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedBackup.duration > 0
                        ? formatDuration(selectedBackup.duration)
                        : 'In progress'}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Compression</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedBackup.compression}%
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Retention</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedBackup.retention} days
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Storage Location</Label>
                <div className="mt-1 flex items-center space-x-2">
                  <Input
                    value={selectedBackup.location}
                    readOnly
                    className="text-xs"
                  />
                  <Button size="sm" variant="outline">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium">
                    Included Components
                  </Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedBackup.includes.map(item => (
                      <Badge key={item} variant="secondary">
                        {item.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Excluded Components
                  </Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedBackup.excludes.length > 0 ? (
                      selectedBackup.excludes.map(item => (
                        <Badge key={item} variant="outline">
                          {item.replace('_', ' ')}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        None
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {selectedBackup.error && (
                <div>
                  <Label className="text-sm font-medium">Error Details</Label>
                  <div className="mt-1 rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-sm text-red-800">
                      {selectedBackup.error}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
