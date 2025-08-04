'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Settings,
  Zap,
  Shield,
  Mail,
  Bell,
  Palette,
  Brain,
  Users,
  Lock,
  Globe,
  Activity,
  HardDrive,
  AlertTriangle,
  Save,
  RefreshCw,
  History,
  Download,
} from 'lucide-react';

interface SystemSetting {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  type:
    | 'string'
    | 'text'
    | 'number'
    | 'boolean'
    | 'email'
    | 'url'
    | 'json'
    | 'array'
    | 'date'
    | 'color'
    | 'file';
  value: any;
  defaultValue: any;
  isActive: boolean;
  isPublic: boolean;
  isReadOnly: boolean;
  isEncrypted: boolean;
  validationRules?: any;
  uiConfig?: any;
  dependencies?: string[];
  lastModifiedBy: string;
  lastModifiedAt: string;
  valueHistory?: Array<{
    value: any;
    modifiedBy: string;
    modifiedAt: string;
    reason?: string;
  }>;
}

const settingCategories = [
  {
    id: 'general',
    name: 'General',
    icon: Settings,
    color: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'security',
    name: 'Security',
    icon: Shield,
    color: 'bg-red-100 text-red-800',
  },
  {
    id: 'email',
    name: 'Email',
    icon: Mail,
    color: 'bg-green-100 text-green-800',
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: Bell,
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    id: 'integrations',
    name: 'Integrations',
    icon: Globe,
    color: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'appearance',
    name: 'Appearance',
    icon: Palette,
    color: 'bg-pink-100 text-pink-800',
  },
  {
    id: 'learning',
    name: 'Learning',
    icon: Brain,
    color: 'bg-indigo-100 text-indigo-800',
  },
  {
    id: 'assessment',
    name: 'Assessment',
    icon: Users,
    color: 'bg-cyan-100 text-cyan-800',
  },
  {
    id: 'communication',
    name: 'Communication',
    icon: Activity,
    color: 'bg-orange-100 text-orange-800',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: Activity,
    color: 'bg-teal-100 text-teal-800',
  },
  {
    id: 'ai',
    name: 'AI & ML',
    icon: Brain,
    color: 'bg-violet-100 text-violet-800',
  },
  {
    id: 'storage',
    name: 'Storage',
    icon: HardDrive,
    color: 'bg-gray-100 text-gray-800',
  },
  {
    id: 'performance',
    name: 'Performance',
    icon: Zap,
    color: 'bg-lime-100 text-lime-800',
  },
  {
    id: 'compliance',
    name: 'Compliance',
    icon: Lock,
    color: 'bg-rose-100 text-rose-800',
  },
];

export default function SystemConfigurationPage() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingSetting, setEditingSetting] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Map<string, any>>(
    new Map()
  );

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const mockSettings: SystemSetting[] = [
        {
          id: '1',
          key: 'site_name',
          name: 'Site Name',
          description: 'The name of your learning platform',
          category: 'general',
          type: 'string',
          value: 'SmartLMS AI',
          defaultValue: 'LMS Platform',
          isActive: true,
          isPublic: true,
          isReadOnly: false,
          isEncrypted: false,
          lastModifiedBy: 'Admin User',
          lastModifiedAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          key: 'max_file_upload_size',
          name: 'Max File Upload Size (MB)',
          description: 'Maximum size for file uploads in megabytes',
          category: 'general',
          type: 'number',
          value: 100,
          defaultValue: 50,
          isActive: true,
          isPublic: false,
          isReadOnly: false,
          isEncrypted: false,
          validationRules: { min: 1, max: 1000 },
          lastModifiedBy: 'Admin User',
          lastModifiedAt: '2024-01-14T15:20:00Z',
        },
        {
          id: '3',
          key: 'enable_two_factor_auth',
          name: 'Enable Two-Factor Authentication',
          description: 'Require 2FA for all user accounts',
          category: 'security',
          type: 'boolean',
          value: true,
          defaultValue: false,
          isActive: true,
          isPublic: false,
          isReadOnly: false,
          isEncrypted: false,
          lastModifiedBy: 'Security Admin',
          lastModifiedAt: '2024-01-13T09:45:00Z',
        },
        {
          id: '4',
          key: 'session_timeout_minutes',
          name: 'Session Timeout (Minutes)',
          description: 'User session timeout in minutes',
          category: 'security',
          type: 'number',
          value: 120,
          defaultValue: 60,
          isActive: true,
          isPublic: false,
          isReadOnly: false,
          isEncrypted: false,
          validationRules: { min: 15, max: 1440 },
          lastModifiedBy: 'Security Admin',
          lastModifiedAt: '2024-01-12T14:30:00Z',
        },
        {
          id: '5',
          key: 'smtp_host',
          name: 'SMTP Host',
          description: 'Email server hostname',
          category: 'email',
          type: 'string',
          value: 'smtp.gmail.com',
          defaultValue: '',
          isActive: true,
          isPublic: false,
          isReadOnly: false,
          isEncrypted: true,
          lastModifiedBy: 'System Admin',
          lastModifiedAt: '2024-01-10T11:15:00Z',
        },
        {
          id: '6',
          key: 'ai_recommendation_enabled',
          name: 'AI Recommendations',
          description: 'Enable AI-powered course and content recommendations',
          category: 'ai',
          type: 'boolean',
          value: true,
          defaultValue: false,
          isActive: true,
          isPublic: false,
          isReadOnly: false,
          isEncrypted: false,
          dependencies: ['ai_model_endpoint', 'ai_api_key'],
          lastModifiedBy: 'AI Admin',
          lastModifiedAt: '2024-01-16T16:00:00Z',
        },
        {
          id: '7',
          key: 'cache_ttl_seconds',
          name: 'Cache TTL (Seconds)',
          description: 'Default time-to-live for cached items',
          category: 'performance',
          type: 'number',
          value: 3600,
          defaultValue: 1800,
          isActive: true,
          isPublic: false,
          isReadOnly: false,
          isEncrypted: false,
          validationRules: { min: 60, max: 86400 },
          lastModifiedBy: 'Performance Admin',
          lastModifiedAt: '2024-01-11T08:30:00Z',
        },
      ];

      setSettings(mockSettings);
    } catch (error) {
      toast.error('Failed to fetch system settings');
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSettings = settings.filter(setting => {
    const matchesCategory =
      activeCategory === 'all' || setting.category === activeCategory;
    const matchesSearch =
      setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAdvanced = showAdvanced || !setting.isReadOnly;

    return matchesCategory && matchesSearch && matchesAdvanced;
  });

  const handleSettingChange = (settingId: string, newValue: any) => {
    const newPendingChanges = new Map(pendingChanges);
    newPendingChanges.set(settingId, newValue);
    setPendingChanges(newPendingChanges);
  };

  const saveSettings = async () => {
    if (pendingChanges.size === 0) {
      toast.info('No changes to save');
      return;
    }

    setSaving(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update local state
      setSettings(prevSettings =>
        prevSettings.map(setting => {
          if (pendingChanges.has(setting.id)) {
            return {
              ...setting,
              value: pendingChanges.get(setting.id),
              lastModifiedBy: 'Current User',
              lastModifiedAt: new Date().toISOString(),
            };
          }
          return setting;
        })
      );

      setPendingChanges(new Map());
      toast.success(`${pendingChanges.size} settings saved successfully`);
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetSetting = (settingId: string) => {
    const setting = settings.find(s => s.id === settingId);
    if (setting) {
      handleSettingChange(settingId, setting.defaultValue);
      toast.info(`Reset ${setting.name} to default value`);
    }
  };

  const exportSettings = () => {
    const exportData = settings.map(setting => ({
      key: setting.key,
      name: setting.name,
      category: setting.category,
      type: setting.type,
      value: setting.isEncrypted ? '[ENCRYPTED]' : setting.value,
      defaultValue: setting.defaultValue,
      isActive: setting.isActive,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Settings exported successfully');
  };

  const renderSettingInput = (setting: SystemSetting) => {
    const currentValue = pendingChanges.has(setting.id)
      ? pendingChanges.get(setting.id)
      : setting.value;

    const hasChanged = pendingChanges.has(setting.id);

    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={setting.id}
              checked={currentValue}
              onCheckedChange={checked =>
                handleSettingChange(setting.id, checked)
              }
              disabled={setting.isReadOnly}
            />
            <Label htmlFor={setting.id} className="text-sm">
              {currentValue ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={currentValue}
            onChange={e =>
              handleSettingChange(setting.id, parseInt(e.target.value))
            }
            disabled={setting.isReadOnly}
            min={setting.validationRules?.min}
            max={setting.validationRules?.max}
            className={hasChanged ? 'border-orange-300' : ''}
          />
        );

      case 'text':
        return (
          <Textarea
            value={currentValue}
            onChange={e => handleSettingChange(setting.id, e.target.value)}
            disabled={setting.isReadOnly}
            rows={3}
            className={hasChanged ? 'border-orange-300' : ''}
          />
        );

      case 'email':
        return (
          <Input
            type="email"
            value={currentValue}
            onChange={e => handleSettingChange(setting.id, e.target.value)}
            disabled={setting.isReadOnly}
            className={hasChanged ? 'border-orange-300' : ''}
          />
        );

      case 'url':
        return (
          <Input
            type="url"
            value={currentValue}
            onChange={e => handleSettingChange(setting.id, e.target.value)}
            disabled={setting.isReadOnly}
            className={hasChanged ? 'border-orange-300' : ''}
          />
        );

      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <Input
              type="color"
              value={currentValue}
              onChange={e => handleSettingChange(setting.id, e.target.value)}
              disabled={setting.isReadOnly}
              className="h-10 w-16"
            />
            <Input
              type="text"
              value={currentValue}
              onChange={e => handleSettingChange(setting.id, e.target.value)}
              disabled={setting.isReadOnly}
              className={`flex-1 ${hasChanged ? 'border-orange-300' : ''}`}
            />
          </div>
        );

      default:
        return (
          <Input
            type="text"
            value={
              setting.isEncrypted && !editingSetting ? '••••••••' : currentValue
            }
            onChange={e => handleSettingChange(setting.id, e.target.value)}
            disabled={setting.isReadOnly}
            className={hasChanged ? 'border-orange-300' : ''}
            onFocus={() => setting.isEncrypted && setEditingSetting(setting.id)}
            onBlur={() => setEditingSetting(null)}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Configuration</h1>
          <p className="text-muted-foreground">
            Manage system settings and configurations
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {pendingChanges.size > 0 && (
            <Badge
              variant="outline"
              className="border-orange-200 bg-orange-50 text-orange-700"
            >
              {pendingChanges.size} unsaved changes
            </Badge>
          )}

          <Button variant="outline" onClick={exportSettings}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button
            onClick={saveSettings}
            disabled={saving || pendingChanges.size === 0}
            className="bg-primary hover:bg-primary/90"
          >
            {saving ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Search settings..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-advanced"
                checked={showAdvanced}
                onCheckedChange={setShowAdvanced}
              />
              <Label
                htmlFor="show-advanced"
                className="whitespace-nowrap text-sm"
              >
                Show Advanced
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        <Button
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveCategory('all')}
          size="sm"
          className="justify-start"
        >
          <Settings className="mr-2 h-4 w-4" />
          All
        </Button>

        {settingCategories.map(category => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? 'default' : 'outline'}
            onClick={() => setActiveCategory(category.id)}
            size="sm"
            className="justify-start"
          >
            <category.icon className="mr-2 h-4 w-4" />
            {category.name}
          </Button>
        ))}
      </div>

      {/* Settings List */}
      <div className="grid gap-4">
        {filteredSettings.map(setting => (
          <Card
            key={setting.id}
            className={
              pendingChanges.has(setting.id) ? 'border-orange-300' : ''
            }
          >
            <CardContent className="pt-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex items-center space-x-2">
                    <h3 className="font-semibold">{setting.name}</h3>

                    {setting.isReadOnly && (
                      <Badge variant="outline" className="text-xs">
                        <Lock className="mr-1 h-3 w-3" />
                        Read Only
                      </Badge>
                    )}

                    {setting.isEncrypted && (
                      <Badge variant="outline" className="text-xs">
                        <Shield className="mr-1 h-3 w-3" />
                        Encrypted
                      </Badge>
                    )}

                    {!setting.isActive && (
                      <Badge variant="outline" className="bg-gray-100 text-xs">
                        Disabled
                      </Badge>
                    )}
                  </div>

                  <p className="mb-2 text-sm text-muted-foreground">
                    {setting.description}
                  </p>

                  <div className="text-xs text-muted-foreground">
                    Key:{' '}
                    <code className="rounded bg-gray-100 px-1 py-0.5">
                      {setting.key}
                    </code>
                    {setting.dependencies &&
                      setting.dependencies.length > 0 && (
                        <span className="ml-4">
                          Depends on: {setting.dependencies.join(', ')}
                        </span>
                      )}
                  </div>
                </div>

                <div className="ml-4 flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setShowHistory(
                        showHistory === setting.id ? null : setting.id
                      )
                    }
                  >
                    <History className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetSetting(setting.id)}
                    disabled={setting.isReadOnly}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor={setting.id} className="text-sm font-medium">
                    Current Value
                  </Label>
                  <div className="mt-1">{renderSettingInput(setting)}</div>
                </div>

                {showHistory === setting.id && setting.valueHistory && (
                  <div className="border-t pt-4">
                    <h4 className="mb-2 text-sm font-medium">Change History</h4>
                    <div className="space-y-2">
                      {setting.valueHistory.map((history, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-xs text-muted-foreground"
                        >
                          <span>
                            Changed to: <code>{history.value}</code>
                            {history.reason && (
                              <span className="ml-2">({history.reason})</span>
                            )}
                          </span>
                          <span>
                            by {history.modifiedBy} on{' '}
                            {new Date(history.modifiedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSettings.length === 0 && (
        <div className="py-12 text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No settings found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or category filter.
          </p>
        </div>
      )}
    </div>
  );
}
