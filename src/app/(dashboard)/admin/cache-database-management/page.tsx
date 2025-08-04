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
import { toast } from 'sonner';
import {
  Database,
  Zap,
  HardDrive,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Settings,
  RefreshCw,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle,
  Info,
  Play,
  Search,
  Eye,
  NetworkIcon,
  MemoryStick,
  Target,
} from 'lucide-react';

interface CacheMetrics {
  totalKeys: number;
  usedMemory: number;
  maxMemory: number;
  hitRate: number;
  missRate: number;
  evictions: number;
  connections: number;
  operationsPerSecond: number;
  avgResponseTime: number;
}

interface DatabaseMetrics {
  totalTables: number;
  totalRecords: number;
  databaseSize: number;
  indexSize: number;
  queryPerformance: {
    avgQueryTime: number;
    slowQueries: number;
    blockedQueries: number;
  };
  connections: {
    active: number;
    idle: number;
    max: number;
  };
  replication: {
    status: 'healthy' | 'lagging' | 'failed';
    lag: number;
  };
}

interface CacheKey {
  key: string;
  type: string;
  ttl: number;
  size: number;
  hits: number;
  lastAccessed: string;
  pattern: string;
}

interface DatabaseTable {
  name: string;
  schema: string;
  recordCount: number;
  dataSize: number;
  indexSize: number;
  lastOptimized: string;
  fragmentationLevel: number;
  indexes: Array<{
    name: string;
    columns: string[];
    type: string;
    usage: number;
  }>;
}

const mockCacheMetrics: CacheMetrics = {
  totalKeys: 125890,
  usedMemory: 2.4 * 1024 * 1024 * 1024, // 2.4GB
  maxMemory: 4 * 1024 * 1024 * 1024, // 4GB
  hitRate: 94.7,
  missRate: 5.3,
  evictions: 1205,
  connections: 47,
  operationsPerSecond: 15420,
  avgResponseTime: 0.8,
};

const mockDatabaseMetrics: DatabaseMetrics = {
  totalTables: 89,
  totalRecords: 15678234,
  databaseSize: 12.7 * 1024 * 1024 * 1024, // 12.7GB
  indexSize: 3.2 * 1024 * 1024 * 1024, // 3.2GB
  queryPerformance: {
    avgQueryTime: 0.045,
    slowQueries: 23,
    blockedQueries: 2,
  },
  connections: {
    active: 15,
    idle: 8,
    max: 100,
  },
  replication: {
    status: 'healthy',
    lag: 0.12,
  },
};

const mockCacheKeys: CacheKey[] = [
  {
    key: 'user:profile:12345',
    type: 'hash',
    ttl: 3600,
    size: 2048,
    hits: 1547,
    lastAccessed: '2024-01-15T10:30:00Z',
    pattern: 'user:profile:*',
  },
  {
    key: 'course:recommendations:67890',
    type: 'list',
    ttl: 1800,
    size: 4096,
    hits: 892,
    lastAccessed: '2024-01-15T10:28:00Z',
    pattern: 'course:recommendations:*',
  },
  {
    key: 'session:token:abc123',
    type: 'string',
    ttl: 7200,
    size: 512,
    hits: 234,
    lastAccessed: '2024-01-15T10:25:00Z',
    pattern: 'session:token:*',
  },
  {
    key: 'analytics:daily:2024-01-15',
    type: 'zset',
    ttl: 86400,
    size: 8192,
    hits: 156,
    lastAccessed: '2024-01-15T10:20:00Z',
    pattern: 'analytics:daily:*',
  },
];

const mockDatabaseTables: DatabaseTable[] = [
  {
    name: 'users',
    schema: 'public',
    recordCount: 458923,
    dataSize: 256 * 1024 * 1024, // 256MB
    indexSize: 64 * 1024 * 1024, // 64MB
    lastOptimized: '2024-01-14T02:00:00Z',
    fragmentationLevel: 12,
    indexes: [
      { name: 'users_email_idx', columns: ['email'], type: 'btree', usage: 95 },
      {
        name: 'users_created_at_idx',
        columns: ['created_at'],
        type: 'btree',
        usage: 78,
      },
      { name: 'users_role_idx', columns: ['role'], type: 'hash', usage: 56 },
    ],
  },
  {
    name: 'courses',
    schema: 'public',
    recordCount: 12847,
    dataSize: 128 * 1024 * 1024, // 128MB
    indexSize: 32 * 1024 * 1024, // 32MB
    lastOptimized: '2024-01-13T02:00:00Z',
    fragmentationLevel: 8,
    indexes: [
      {
        name: 'courses_category_idx',
        columns: ['category_id'],
        type: 'btree',
        usage: 89,
      },
      {
        name: 'courses_instructor_idx',
        columns: ['instructor_id'],
        type: 'btree',
        usage: 67,
      },
      {
        name: 'courses_published_idx',
        columns: ['is_published'],
        type: 'hash',
        usage: 45,
      },
    ],
  },
  {
    name: 'enrollments',
    schema: 'public',
    recordCount: 2345672,
    dataSize: 512 * 1024 * 1024, // 512MB
    indexSize: 128 * 1024 * 1024, // 128MB
    lastOptimized: '2024-01-12T02:00:00Z',
    fragmentationLevel: 18,
    indexes: [
      {
        name: 'enrollments_user_course_idx',
        columns: ['user_id', 'course_id'],
        type: 'btree',
        usage: 98,
      },
      {
        name: 'enrollments_status_idx',
        columns: ['status'],
        type: 'hash',
        usage: 72,
      },
      {
        name: 'enrollments_enrolled_at_idx',
        columns: ['enrolled_at'],
        type: 'btree',
        usage: 34,
      },
    ],
  },
];

export default function CacheDatabaseManagementPage() {
  const [activeTab, setActiveTab] = useState('cache-overview');
  const [cacheMetrics, setCacheMetrics] =
    useState<CacheMetrics>(mockCacheMetrics);
  const [databaseMetrics, setDatabaseMetrics] =
    useState<DatabaseMetrics>(mockDatabaseMetrics);
  const [cacheKeys, setCacheKeys] = useState<CacheKey[]>(mockCacheKeys);
  const [databaseTables, setDatabaseTables] =
    useState<DatabaseTable[]>(mockDatabaseTables);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPattern, setSelectedPattern] = useState('all');

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate real-time updates
        setCacheMetrics(prev => ({
          ...prev,
          operationsPerSecond:
            prev.operationsPerSecond + Math.floor(Math.random() * 100 - 50),
          hitRate: Math.max(
            90,
            Math.min(99, prev.hitRate + (Math.random() - 0.5))
          ),
          connections: Math.max(
            0,
            Math.min(100, prev.connections + Math.floor(Math.random() * 6 - 3))
          ),
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const handleCacheOperation = async (operation: string, pattern?: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      switch (operation) {
        case 'flush_all':
          setCacheMetrics(prev => ({ ...prev, totalKeys: 0, usedMemory: 0 }));
          setCacheKeys([]);
          toast.success('Cache flushed successfully');
          break;
        case 'flush_pattern':
          if (pattern) {
            setCacheKeys(prev =>
              prev.filter(key => !key.pattern.includes(pattern))
            );
            toast.success(
              `Keys matching pattern "${pattern}" flushed successfully`
            );
          }
          break;
        case 'optimize':
          toast.success('Cache optimization completed');
          break;
        default:
          toast.success(`Cache ${operation} completed`);
      }
    } catch (error) {
      toast.error(`Failed to ${operation} cache`);
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseOperation = async (operation: string, table?: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      switch (operation) {
        case 'optimize_table':
          if (table) {
            setDatabaseTables(prev =>
              prev.map(t =>
                t.name === table
                  ? {
                      ...t,
                      fragmentationLevel: 0,
                      lastOptimized: new Date().toISOString(),
                    }
                  : t
              )
            );
            toast.success(`Table "${table}" optimized successfully`);
          }
          break;
        case 'analyze_all':
          toast.success('Database analysis completed');
          break;
        case 'reindex':
          toast.success('Database reindexing completed');
          break;
        default:
          toast.success(`Database ${operation} completed`);
      }
    } catch (error) {
      toast.error(`Failed to ${operation} database`);
    } finally {
      setLoading(false);
    }
  };

  const filteredCacheKeys = cacheKeys.filter(key => {
    const matchesSearch =
      key.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.pattern.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPattern =
      selectedPattern === 'all' || key.pattern.includes(selectedPattern);
    return matchesSearch && matchesPattern;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      case 'lagging':
        return 'text-orange-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getFragmentationColor = (level: number) => {
    if (level < 10) return 'text-green-600';
    if (level < 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const memoryUsagePercentage =
    (cacheMetrics.usedMemory / cacheMetrics.maxMemory) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cache & Database Management</h1>
          <p className="text-muted-foreground">
            Monitor and optimize cache performance and database health
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="auto-refresh" className="text-sm">
              Auto Refresh
            </Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>

          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="cache-overview">Cache Overview</TabsTrigger>
          <TabsTrigger value="cache-keys">Cache Keys</TabsTrigger>
          <TabsTrigger value="database-overview">Database Overview</TabsTrigger>
          <TabsTrigger value="database-tables">Database Tables</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="cache-overview" className="space-y-6">
          {/* Cache Metrics Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Memory Usage
                    </p>
                    <p className="text-2xl font-bold">
                      {formatBytes(cacheMetrics.usedMemory)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      of {formatBytes(cacheMetrics.maxMemory)}
                    </p>
                  </div>
                  <MemoryStick className="h-8 w-8 text-blue-500" />
                </div>
                <Progress value={memoryUsagePercentage} className="mt-3" />
                <p className="mt-1 text-xs text-muted-foreground">
                  {memoryUsagePercentage.toFixed(1)}% used
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Hit Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {cacheMetrics.hitRate.toFixed(1)}%
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Miss: {cacheMetrics.missRate.toFixed(1)}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-3">
                  <Progress value={cacheMetrics.hitRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Operations/sec
                    </p>
                    <p className="text-2xl font-bold">
                      {formatNumber(cacheMetrics.operationsPerSecond)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Avg: {cacheMetrics.avgResponseTime}ms
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="mt-3 flex items-center">
                  <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-600">
                    +5.2% from last hour
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Keys</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(cacheMetrics.totalKeys)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {cacheMetrics.evictions} evictions
                    </p>
                  </div>
                  <Database className="h-8 w-8 text-purple-500" />
                </div>
                <div className="mt-3 flex items-center">
                  <span className="text-xs text-muted-foreground">
                    {cacheMetrics.connections} active connections
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cache Operations */}
          <Card>
            <CardHeader>
              <CardTitle>Cache Operations</CardTitle>
              <CardDescription>
                Manage cache operations and maintenance tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button
                  variant="outline"
                  className="h-auto justify-start p-4"
                  onClick={() => handleCacheOperation('flush_all')}
                  disabled={loading}
                >
                  <Trash2 className="mr-3 h-5 w-5 text-red-500" />
                  <div className="text-left">
                    <div className="font-medium">Flush All</div>
                    <div className="text-xs text-muted-foreground">
                      Clear all cache keys
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto justify-start p-4"
                  onClick={() => handleCacheOperation('optimize')}
                  disabled={loading}
                >
                  <Settings className="mr-3 h-5 w-5 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium">Optimize</div>
                    <div className="text-xs text-muted-foreground">
                      Optimize cache performance
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto justify-start p-4"
                  onClick={() => handleCacheOperation('warm')}
                  disabled={loading}
                >
                  <Play className="mr-3 h-5 w-5 text-green-500" />
                  <div className="text-left">
                    <div className="font-medium">Warm Cache</div>
                    <div className="text-xs text-muted-foreground">
                      Preload popular keys
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto justify-start p-4"
                  onClick={() => handleCacheOperation('analyze')}
                  disabled={loading}
                >
                  <BarChart3 className="mr-3 h-5 w-5 text-purple-500" />
                  <div className="text-left">
                    <div className="font-medium">Analyze</div>
                    <div className="text-xs text-muted-foreground">
                      Generate usage report
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cache Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Cache Configuration</CardTitle>
              <CardDescription>
                Configure cache settings and policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label>Max Memory Limit</Label>
                    <Select defaultValue="4gb">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1gb">1 GB</SelectItem>
                        <SelectItem value="2gb">2 GB</SelectItem>
                        <SelectItem value="4gb">4 GB</SelectItem>
                        <SelectItem value="8gb">8 GB</SelectItem>
                        <SelectItem value="16gb">16 GB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Eviction Policy</Label>
                    <Select defaultValue="allkeys-lru">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="allkeys-lru">
                          All Keys LRU
                        </SelectItem>
                        <SelectItem value="volatile-lru">
                          Volatile LRU
                        </SelectItem>
                        <SelectItem value="allkeys-random">
                          All Keys Random
                        </SelectItem>
                        <SelectItem value="volatile-random">
                          Volatile Random
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Default TTL (seconds)</Label>
                    <Input type="number" defaultValue="3600" className="mt-1" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable Persistence</Label>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Enable Compression</Label>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Enable Cluster Mode</Label>
                    <Switch />
                  </div>

                  <div>
                    <Label>Max Connections</Label>
                    <Input
                      type="number"
                      defaultValue="10000"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Reset to Default</Button>
                <Button>Save Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache-keys" className="space-y-6">
          {/* Key Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <Input
                    placeholder="Search cache keys..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select
                  value={selectedPattern}
                  onValueChange={setSelectedPattern}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Patterns</SelectItem>
                    <SelectItem value="user:">User Data</SelectItem>
                    <SelectItem value="course:">Course Data</SelectItem>
                    <SelectItem value="session:">Session Data</SelectItem>
                    <SelectItem value="analytics:">Analytics Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Keys List */}
          <div className="grid gap-4">
            {filteredCacheKeys.map((key, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center space-x-2">
                        <code className="rounded bg-muted px-2 py-1 text-sm">
                          {key.key}
                        </code>
                        <Badge variant="outline">{key.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Pattern: {key.pattern}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Refresh
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Size</p>
                      <p className="text-sm font-medium">
                        {formatBytes(key.size)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">TTL</p>
                      <p className="text-sm font-medium">
                        {key.ttl > 0 ? `${key.ttl}s` : 'Never'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Hits</p>
                      <p className="text-sm font-medium">
                        {formatNumber(key.hits)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Last Accessed
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(key.lastAccessed).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCacheKeys.length === 0 && (
            <div className="py-12 text-center">
              <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                No cache keys found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or pattern filter.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="database-overview" className="space-y-6">
          {/* Database Metrics Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Database Size
                    </p>
                    <p className="text-2xl font-bold">
                      {formatBytes(databaseMetrics.databaseSize)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatBytes(databaseMetrics.indexSize)} indexes
                    </p>
                  </div>
                  <HardDrive className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground">
                    {databaseMetrics.totalTables} tables
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Records
                    </p>
                    <p className="text-2xl font-bold">
                      {formatNumber(databaseMetrics.totalRecords)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Across all tables
                    </p>
                  </div>
                  <Database className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-3 flex items-center">
                  <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-600">+2.1% growth</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Avg Query Time
                    </p>
                    <p className="text-2xl font-bold">
                      {databaseMetrics.queryPerformance.avgQueryTime * 1000}ms
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {databaseMetrics.queryPerformance.slowQueries} slow
                      queries
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="mt-3 flex items-center">
                  <TrendingDown className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-600">-8% faster</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Connections</p>
                    <p className="text-2xl font-bold">
                      {databaseMetrics.connections.active}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      of {databaseMetrics.connections.max} max
                    </p>
                  </div>
                  <NetworkIcon className="h-8 w-8 text-purple-500" />
                </div>
                <Progress
                  value={
                    (databaseMetrics.connections.active /
                      databaseMetrics.connections.max) *
                    100
                  }
                  className="mt-3"
                />
              </CardContent>
            </Card>
          </div>

          {/* Replication Status */}
          <Card>
            <CardHeader>
              <CardTitle>Replication Status</CardTitle>
              <CardDescription>
                Monitor database replication health and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      databaseMetrics.replication.status === 'healthy'
                        ? 'bg-green-500'
                        : databaseMetrics.replication.status === 'lagging'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                  />
                  <div>
                    <p className="font-medium">Primary → Replica</p>
                    <p className="text-sm text-muted-foreground">
                      Status:{' '}
                      <span
                        className={getStatusColor(
                          databaseMetrics.replication.status
                        )}
                      >
                        {databaseMetrics.replication.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium">
                    Lag: {databaseMetrics.replication.lag}s
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last sync: 2 mins ago
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Operations */}
          <Card>
            <CardHeader>
              <CardTitle>Database Operations</CardTitle>
              <CardDescription>
                Perform maintenance and optimization tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button
                  variant="outline"
                  className="h-auto justify-start p-4"
                  onClick={() => handleDatabaseOperation('analyze_all')}
                  disabled={loading}
                >
                  <BarChart3 className="mr-3 h-5 w-5 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium">Analyze Tables</div>
                    <div className="text-xs text-muted-foreground">
                      Update table statistics
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto justify-start p-4"
                  onClick={() => handleDatabaseOperation('reindex')}
                  disabled={loading}
                >
                  <Settings className="mr-3 h-5 w-5 text-green-500" />
                  <div className="text-left">
                    <div className="font-medium">Reindex</div>
                    <div className="text-xs text-muted-foreground">
                      Rebuild all indexes
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto justify-start p-4"
                  onClick={() => handleDatabaseOperation('vacuum')}
                  disabled={loading}
                >
                  <RefreshCw className="mr-3 h-5 w-5 text-purple-500" />
                  <div className="text-left">
                    <div className="font-medium">Vacuum</div>
                    <div className="text-xs text-muted-foreground">
                      Reclaim storage space
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto justify-start p-4"
                  onClick={() => handleDatabaseOperation('backup')}
                  disabled={loading}
                >
                  <Download className="mr-3 h-5 w-5 text-orange-500" />
                  <div className="text-left">
                    <div className="font-medium">Backup</div>
                    <div className="text-xs text-muted-foreground">
                      Create database backup
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database-tables" className="space-y-6">
          {/* Tables List */}
          <div className="grid gap-4">
            {databaseTables.map(table => (
              <Card key={table.name}>
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{table.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Schema: {table.schema}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge
                        className={
                          table.fragmentationLevel < 10
                            ? 'bg-green-100 text-green-800'
                            : table.fragmentationLevel < 20
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }
                      >
                        {table.fragmentationLevel}% fragmented
                      </Badge>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleDatabaseOperation('optimize_table', table.name)
                        }
                        disabled={loading}
                      >
                        <Settings className="mr-1 h-3 w-3" />
                        Optimize
                      </Button>
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Records</p>
                      <p className="text-sm font-medium">
                        {formatNumber(table.recordCount)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Data Size</p>
                      <p className="text-sm font-medium">
                        {formatBytes(table.dataSize)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Index Size
                      </p>
                      <p className="text-sm font-medium">
                        {formatBytes(table.indexSize)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Last Optimized
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(table.lastOptimized).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 font-medium">
                      Indexes ({table.indexes.length})
                    </h4>
                    <div className="space-y-2">
                      {table.indexes.map((index, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded bg-muted/50 p-2"
                        >
                          <div>
                            <p className="text-sm font-medium">{index.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {index.columns.join(', ')} ({index.type})
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {index.usage}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Usage
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          {/* Optimization Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>
                AI-powered recommendations to improve system performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 rounded-lg border p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-orange-500" />
                  <div className="flex-1">
                    <h4 className="font-medium">
                      High Cache Miss Rate on User Profiles
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      User profile cache has a 15% miss rate. Consider
                      increasing TTL or implementing cache warming.
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                      <Badge variant="outline">High Impact</Badge>
                      <Button size="sm" variant="outline">
                        Apply Fix
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 rounded-lg border p-4">
                  <Info className="mt-0.5 h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <h4 className="font-medium">
                      Unused Database Index Detected
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Index 'enrollments_enrolled_at_idx' has only 34% usage.
                      Consider dropping it to save space.
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                      <Badge variant="outline">Medium Impact</Badge>
                      <Button size="sm" variant="outline">
                        Review Index
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 rounded-lg border p-4">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <h4 className="font-medium">Optimal Memory Usage</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Cache memory usage is within optimal range. Current
                      fragmentation is minimal.
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700"
                      >
                        Optimized
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 rounded-lg border p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-500" />
                  <div className="flex-1">
                    <h4 className="font-medium">
                      Database Table Fragmentation
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      The 'enrollments' table shows 18% fragmentation. Schedule
                      optimization during low traffic.
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                      <Badge variant="outline">Medium Impact</Badge>
                      <Button size="sm" variant="outline">
                        Schedule Optimization
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Tuning */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Tuning</CardTitle>
              <CardDescription>
                Advanced configuration options for optimal performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Cache Tuning */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Cache Tuning</h3>

                  <div>
                    <Label>Cache Warming Strategy</Label>
                    <Select defaultValue="aggressive">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">
                          Conservative
                        </SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Label>Memory Allocation Policy</Label>
                    <Select defaultValue="dynamic">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="static">Static</SelectItem>
                        <SelectItem value="dynamic">Dynamic</SelectItem>
                        <SelectItem value="adaptive">Adaptive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Enable Cache Prefetching</Label>
                    <Switch defaultChecked />
                  </div>
                </div>

                {/* Database Tuning */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Database Tuning</h3>

                  <div>
                    <Label>Query Optimizer</Label>
                    <Select defaultValue="cost_based">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rule_based">Rule Based</SelectItem>
                        <SelectItem value="cost_based">Cost Based</SelectItem>
                        <SelectItem value="adaptive">Adaptive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Buffer Pool Size</Label>
                    <Select defaultValue="75">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">50% of RAM</SelectItem>
                        <SelectItem value="75">75% of RAM</SelectItem>
                        <SelectItem value="80">80% of RAM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Log Buffer Size (MB)</Label>
                    <Input type="number" defaultValue="64" className="mt-1" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Enable Query Cache</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Monitoring Configuration */}
              <div>
                <h3 className="mb-4 font-semibold">Monitoring Configuration</h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label>Performance Metrics Collection</Label>
                    <Select defaultValue="detailed">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Alert Thresholds</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">
                          Conservative
                        </SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex items-center justify-between">
                    <Label>Real-time Monitoring</Label>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Slow Query Logging</Label>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Performance Insights</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Export Configuration</Button>
                <Button variant="outline">Reset to Default</Button>
                <Button>Apply Configuration</Button>
              </div>
            </CardContent>
          </Card>

          {/* Scheduled Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Maintenance</CardTitle>
              <CardDescription>
                Configure automated maintenance tasks and schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">Cache Optimization</p>
                        <p className="text-sm text-muted-foreground">
                          Daily at 2:00 AM
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">Database Vacuum</p>
                        <p className="text-sm text-muted-foreground">
                          Weekly on Sunday at 3:00 AM
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">Index Maintenance</p>
                        <p className="text-sm text-muted-foreground">
                          Monthly on 1st at 4:00 AM
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">Statistics Update</p>
                        <p className="text-sm text-muted-foreground">
                          Daily at 1:00 AM
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">Log Rotation</p>
                        <p className="text-sm text-muted-foreground">
                          Weekly on Monday at 12:00 AM
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">Performance Analysis</p>
                        <p className="text-sm text-muted-foreground">
                          Weekly on Friday at 6:00 PM
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Edit Schedules</Button>
                  <Button>Save Maintenance Plan</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
