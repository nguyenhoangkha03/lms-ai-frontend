// src/components/file-management/CDNManagementPanel.tsx
'use client';

import React, { useState } from 'react';
import {
  Globe,
  Settings,
  BarChart3,
  Shield,
  Zap,
  RefreshCw,
  Server,
  MapPin,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  Upload,
  Activity,
  Database,
  Trash2,
  Eye,
  Link,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  useGetCDNConfigurationQuery,
  useUpdateCDNConfigurationMutation,
  usePurgeFromCDNMutation,
} from '@/lib/redux/api/file-management-api';
import { CDNConfiguration } from '@/lib/types/file-management';
import { cn, formatFileSize, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface CDNManagementPanelProps {
  className?: string;
}

export function CDNManagementPanel({ className }: CDNManagementPanelProps) {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [purgeUrls, setPurgeUrls] = useState('');
  const [showPurgeDialog, setShowPurgeDialog] = useState(false);

  // Fetch CDN configuration
  const {
    data: cdnConfig,
    isLoading: configLoading,
    error: configError,
    refetch: refetchConfig,
  } = useGetCDNConfigurationQuery();

  // Mutations
  const [updateCDNConfig] = useUpdateCDNConfigurationMutation();
  const [purgeFromCDN] = usePurgeFromCDNMutation();

  // Handle configuration update
  const handleConfigUpdate = async (updates: Partial<CDNConfiguration>) => {
    try {
      await updateCDNConfig(updates).unwrap();
      toast.success('CDN configuration updated successfully');
      refetchConfig();
    } catch (error) {
      toast.error('Failed to update CDN configuration');
    }
  };

  // Handle cache purge
  const handleCachePurge = async (type: 'url' | 'tag' | 'all') => {
    try {
      const urls = type === 'url' ? purgeUrls.split('\n').filter(Boolean) : [];
      await purgeFromCDN({ urls, type }).unwrap();
      toast.success('Cache purge initiated successfully');
      setPurgeUrls('');
      setShowPurgeDialog(false);
    } catch (error) {
      toast.error('Failed to purge cache');
    }
  };

  if (configLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="mb-2 h-4 w-1/3 rounded bg-muted" />
                  <div className="h-8 w-1/2 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (configError || !cdnConfig) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load CDN configuration. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">CDN Management</h2>
          <p className="text-muted-foreground">
            Configure content delivery network and global distribution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetchConfig()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Dialog open={showPurgeDialog} onOpenChange={setShowPurgeDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Trash2 className="mr-2 h-4 w-4" />
                Purge Cache
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Purge CDN Cache</DialogTitle>
                <DialogDescription>
                  Clear cached content from CDN edge servers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>URLs to Purge (one per line)</Label>
                  <Textarea
                    placeholder="https://cdn.example.com/file1.jpg&#10;https://cdn.example.com/file2.mp4"
                    value={purgeUrls}
                    onChange={e => setPurgeUrls(e.target.value)}
                    rows={5}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleCachePurge('url')}
                    disabled={!purgeUrls.trim()}
                  >
                    Purge URLs
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCachePurge('all')}
                  >
                    Purge All
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <div className="mt-1 flex items-center gap-2">
                  {cdnConfig.status === 'active' ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600">
                        Active
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="font-semibold text-red-600">
                        Inactive
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Globe
                className={cn(
                  'h-8 w-8',
                  cdnConfig.status === 'active'
                    ? 'text-green-600'
                    : 'text-red-600'
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Bandwidth
                </p>
                <p className="text-2xl font-bold">
                  {formatFileSize(cdnConfig.stats.bandwidth)}
                </p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Cache Hit Ratio
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(cdnConfig.stats.cacheHitRatio * 100)}%
                </p>
                <Progress
                  value={cdnConfig.stats.cacheHitRatio * 100}
                  className="mt-2 h-1"
                />
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Requests
                </p>
                <p className="text-2xl font-bold">
                  {cdnConfig.stats.requests.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Configuration */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="locations">Edge Locations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Provider Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                CDN Provider
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Provider</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {cdnConfig.provider}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsConfiguring(true)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Base URL</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      value={cdnConfig.settings.baseUrl}
                      readOnly
                      className="bg-muted"
                    />
                    <Button variant="ghost" size="sm">
                      <Link className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-sm">Total Files</Label>
                  <p className="text-2xl font-bold">
                    {cdnConfig.stats.totalFiles.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm">Total Size</Label>
                  <p className="text-2xl font-bold">
                    {formatFileSize(cdnConfig.stats.totalSize)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm">Last Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(cdnConfig.lastSync)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button
                  variant="outline"
                  className="flex h-auto flex-col gap-2 p-4"
                >
                  <RefreshCw className="h-6 w-6" />
                  <span className="text-sm">Sync Files</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex h-auto flex-col gap-2 p-4"
                  onClick={() => setShowPurgeDialog(true)}
                >
                  <Trash2 className="h-6 w-6" />
                  <span className="text-sm">Purge Cache</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex h-auto flex-col gap-2 p-4"
                >
                  <Shield className="h-6 w-6" />
                  <span className="text-sm">Security Scan</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex h-auto flex-col gap-2 p-4"
                >
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">View Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <CDNSettingsPanel
            config={cdnConfig}
            onUpdate={handleConfigUpdate}
            isUpdating={false}
          />
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <EdgeLocationsPanel edgeLocations={cdnConfig.edgeLocations} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <CDNAnalyticsPanel stats={cdnConfig.stats} />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <CDNSecurityPanel config={cdnConfig} onUpdate={handleConfigUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// CDN Settings Panel
interface CDNSettingsPanelProps {
  config: CDNConfiguration;
  onUpdate: (updates: Partial<CDNConfiguration>) => void;
  isUpdating: boolean;
}

function CDNSettingsPanel({
  config,
  onUpdate,
  isUpdating,
}: CDNSettingsPanelProps) {
  const [settings, setSettings] = useState(config.settings);

  const handleSave = () => {
    onUpdate({ settings });
  };

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select
                value={config.provider}
                onValueChange={value => onUpdate({ provider: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cloudflare">Cloudflare</SelectItem>
                  <SelectItem value="aws">AWS CloudFront</SelectItem>
                  <SelectItem value="azure">Azure CDN</SelectItem>
                  <SelectItem value="gcp">Google Cloud CDN</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Base URL</Label>
              <Input
                value={settings.baseUrl}
                onChange={e =>
                  setSettings(prev => ({ ...prev, baseUrl: e.target.value }))
                }
                placeholder="https://cdn.example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={settings.apiKey}
                onChange={e =>
                  setSettings(prev => ({ ...prev, apiKey: e.target.value }))
                }
                placeholder="Enter API key"
              />
            </div>

            <div className="space-y-2">
              <Label>Zone ID / Bucket Name</Label>
              <Input
                value={settings.zoneId || settings.bucketName || ''}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    zoneId: e.target.value,
                    bucketName: e.target.value,
                  }))
                }
                placeholder="Zone ID or Bucket Name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Caching Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Caching Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Default TTL (seconds)</Label>
              <Input
                type="number"
                value={settings.caching.defaultTtl}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    caching: {
                      ...prev.caching,
                      defaultTtl: parseInt(e.target.value),
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Max TTL (seconds)</Label>
              <Input
                type="number"
                value={settings.caching.maxTtl}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    caching: {
                      ...prev.caching,
                      maxTtl: parseInt(e.target.value),
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Browser TTL (seconds)</Label>
              <Input
                type="number"
                value={settings.caching.browserTtl}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    caching: {
                      ...prev.caching,
                      browserTtl: parseInt(e.target.value),
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Edge TTL (seconds)</Label>
              <Input
                type="number"
                value={settings.caching.edgeTtl}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    caching: {
                      ...prev.caching,
                      edgeTtl: parseInt(e.target.value),
                    },
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Minify</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically minify CSS, JS, and HTML
                  </p>
                </div>
                <Switch
                  checked={settings.optimization.autoMinify}
                  onCheckedChange={checked =>
                    setSettings(prev => ({
                      ...prev,
                      optimization: {
                        ...prev.optimization,
                        autoMinify: checked,
                      },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Compression</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable gzip/brotli compression
                  </p>
                </div>
                <Switch
                  checked={settings.optimization.compression}
                  onCheckedChange={checked =>
                    setSettings(prev => ({
                      ...prev,
                      optimization: {
                        ...prev.optimization,
                        compression: checked,
                      },
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Image Optimization</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatic image format conversion
                  </p>
                </div>
                <Switch
                  checked={settings.optimization.imageOptimization}
                  onCheckedChange={checked =>
                    setSettings(prev => ({
                      ...prev,
                      optimization: {
                        ...prev.optimization,
                        imageOptimization: checked,
                      },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>WebP Conversion</Label>
                  <p className="text-sm text-muted-foreground">
                    Convert images to WebP format
                  </p>
                </div>
                <Switch
                  checked={settings.optimization.webpConversion}
                  onCheckedChange={checked =>
                    setSettings(prev => ({
                      ...prev,
                      optimization: {
                        ...prev.optimization,
                        webpConversion: checked,
                      },
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Settings className="mr-2 h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Edge Locations Panel
interface EdgeLocationsPanelProps {
  edgeLocations: string[];
}

function EdgeLocationsPanel({ edgeLocations }: EdgeLocationsPanelProps) {
  // Mock data for edge locations
  const locationDetails = [
    {
      code: 'us-east-1',
      name: 'US East (N. Virginia)',
      region: 'North America',
      status: 'active',
      latency: 12,
    },
    {
      code: 'us-west-2',
      name: 'US West (Oregon)',
      region: 'North America',
      status: 'active',
      latency: 18,
    },
    {
      code: 'eu-west-1',
      name: 'Europe (Ireland)',
      region: 'Europe',
      status: 'active',
      latency: 24,
    },
    {
      code: 'ap-southeast-1',
      name: 'Asia Pacific (Singapore)',
      region: 'Asia Pacific',
      status: 'active',
      latency: 35,
    },
    {
      code: 'ap-northeast-1',
      name: 'Asia Pacific (Tokyo)',
      region: 'Asia Pacific',
      status: 'maintenance',
      latency: 42,
    },
  ];

  const regionGroups = locationDetails.reduce(
    (groups, location) => {
      const region = location.region;
      if (!groups[region]) {
        groups[region] = [];
      }
      groups[region].push(location);
      return groups;
    },
    {} as Record<string, typeof locationDetails>
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Edge Locations Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {locationDetails.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Locations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {locationDetails.filter(l => l.status === 'active').length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {Math.round(
                  locationDetails.reduce((sum, l) => sum + l.latency, 0) /
                    locationDetails.length
                )}
                ms
              </p>
              <p className="text-sm text-muted-foreground">Avg Latency</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locations by Region */}
      <div className="space-y-6">
        {Object.entries(regionGroups).map(([region, locations]) => (
          <Card key={region}>
            <CardHeader>
              <CardTitle className="text-lg">{region}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {locations.map(location => (
                  <div
                    key={location.code}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'h-3 w-3 rounded-full',
                          location.status === 'active'
                            ? 'bg-green-500'
                            : 'bg-yellow-500'
                        )}
                      />
                      <div>
                        <h4 className="font-medium">{location.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {location.code}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <Badge
                        variant={
                          location.status === 'active' ? 'secondary' : 'outline'
                        }
                      >
                        {location.status}
                      </Badge>
                      <div className="text-right">
                        <p className="font-medium">{location.latency}ms</p>
                        <p className="text-muted-foreground">Latency</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// CDN Analytics Panel
interface CDNAnalyticsPanelProps {
  stats: CDNConfiguration['stats'];
}

function CDNAnalyticsPanel({ stats }: CDNAnalyticsPanelProps) {
  // Mock analytics data
  const analyticsData = {
    requestsByDay: [
      { date: '2024-01-01', requests: 12500, bandwidth: 2.3 },
      { date: '2024-01-02', requests: 15200, bandwidth: 2.8 },
      { date: '2024-01-03', requests: 18100, bandwidth: 3.2 },
      { date: '2024-01-04', requests: 16800, bandwidth: 3.0 },
      { date: '2024-01-05', requests: 19200, bandwidth: 3.5 },
      { date: '2024-01-06', requests: 21300, bandwidth: 3.8 },
      { date: '2024-01-07', requests: 17900, bandwidth: 3.1 },
    ],
    topFiles: [
      { file: 'course-intro-video.mp4', requests: 2400, bandwidth: 450 },
      { file: 'lesson-1-slides.pdf', requests: 1800, bandwidth: 89 },
      { file: 'hero-banner.jpg', requests: 1200, bandwidth: 24 },
      { file: 'background-music.mp3', requests: 980, bandwidth: 156 },
      { file: 'certificate-template.pdf', requests: 750, bandwidth: 45 },
    ],
    errorRates: {
      '4xx': 2.1,
      '5xx': 0.3,
      timeout: 0.1,
    },
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Requests
                </p>
                <p className="text-2xl font-bold">
                  {stats.requests.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">+12% from last month</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Bandwidth
                </p>
                <p className="text-2xl font-bold">
                  {formatFileSize(stats.bandwidth)}
                </p>
                <p className="text-xs text-green-600">+8% from last month</p>
              </div>
              <Download className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Cache Hit Rate
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(stats.cacheHitRatio * 100)}%
                </p>
                <Progress
                  value={stats.cacheHitRatio * 100}
                  className="mt-2 h-1"
                />
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Error Rate
                </p>
                <p className="text-2xl font-bold">0.4%</p>
                <p className="text-xs text-green-600">-0.2% from last month</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Request Trends (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.requestsByDay.map((day, index) => (
              <div key={day.date} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="w-20 text-sm font-medium">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <div className="flex-1">
                    <Progress
                      value={(day.requests / 25000) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">
                    {day.requests.toLocaleString()} requests
                  </p>
                  <p className="text-muted-foreground">
                    {day.bandwidth}GB bandwidth
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Files */}
      <Card>
        <CardHeader>
          <CardTitle>Top Requested Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.topFiles.map((file, index) => (
              <div
                key={file.file}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <span className="text-sm font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{file.file}</p>
                    <p className="text-sm text-muted-foreground">
                      {file.requests.toLocaleString()} requests
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatFileSize(file.bandwidth * 1024 * 1024)}
                  </p>
                  <p className="text-sm text-muted-foreground">Bandwidth</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// CDN Security Panel
interface CDNSecurityPanelProps {
  config: CDNConfiguration;
  onUpdate: (updates: Partial<CDNConfiguration>) => void;
}

function CDNSecurityPanel({ config, onUpdate }: CDNSecurityPanelProps) {
  const [security, setSecurity] = useState(config.settings.security);

  const handleSave = () => {
    onUpdate({
      settings: {
        ...config.settings,
        security,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Security Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Hotlink Protection</Label>
                  <p className="text-sm text-muted-foreground">
                    Prevent unauthorized linking to your files
                  </p>
                </div>
                <Switch
                  checked={security.hotlinkProtection}
                  onCheckedChange={checked =>
                    setSecurity(prev => ({
                      ...prev,
                      hotlinkProtection: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>DDoS Protection</Label>
                  <p className="text-sm text-muted-foreground">
                    Advanced DDoS mitigation
                  </p>
                </div>
                <Switch
                  checked={security.ddosProtection}
                  onCheckedChange={checked =>
                    setSecurity(prev => ({ ...prev, ddosProtection: checked }))
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Web Application Firewall</Label>
                  <p className="text-sm text-muted-foreground">
                    Filter malicious traffic
                  </p>
                </div>
                <Switch
                  checked={security.wafEnabled}
                  onCheckedChange={checked =>
                    setSecurity(prev => ({ ...prev, wafEnabled: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>HTTPS Redirect</Label>
                  <p className="text-sm text-muted-foreground">
                    Force HTTPS connections
                  </p>
                </div>
                <Switch
                  checked={security.httpsRedirect}
                  onCheckedChange={checked =>
                    setSecurity(prev => ({ ...prev, httpsRedirect: checked }))
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>DDoS Attack Blocked</strong> - 15 minutes ago
                <br />
                Blocked 2,500 malicious requests from 12 IP addresses
              </AlertDescription>
            </Alert>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Hotlink Attempt Blocked</strong> - 2 hours ago
                <br />
                Prevented unauthorized access to video files from external
                domain
              </AlertDescription>
            </Alert>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>SSL Certificate Renewed</strong> - 1 day ago
                <br />
                SSL certificate automatically renewed for cdn.example.com
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Shield className="mr-2 h-4 w-4" />
          Save Security Settings
        </Button>
      </div>
    </div>
  );
}
