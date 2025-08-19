'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings,
  Globe,
  Mail,
  Bell,
  Shield,
  Palette,
  Database,
  Key,
  Upload,
  Download,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Mock settings data - in real implementation, this would come from API
  const [settings, setSettings] = useState({
    general: {
      siteName: 'LMS Platform',
      siteDescription: 'A comprehensive learning management system',
      siteUrl: 'https://lms.example.com',
      adminEmail: 'admin@example.com',
      timezone: 'UTC',
      language: 'en',
      maintenanceMode: false,
    },
    email: {
      smtpHost: 'smtp.example.com',
      smtpPort: '587',
      smtpUsername: 'noreply@example.com',
      smtpPassword: '••••••••',
      fromName: 'LMS Platform',
      fromEmail: 'noreply@example.com',
      enableEmailVerification: true,
      enableWelcomeEmail: true,
    },
    notifications: {
      enablePushNotifications: true,
      enableEmailNotifications: true,
      enableSmsNotifications: false,
      notificationSound: true,
      digestFrequency: 'daily',
    },
    security: {
      passwordMinLength: 8,
      requireSpecialChars: true,
      enableTwoFactor: true,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      enableCaptcha: true,
    },
    appearance: {
      theme: 'light',
      primaryColor: '#2563eb',
      logoUrl: '',
      faviconUrl: '',
      customCss: '',
    },
    integrations: {
      googleAnalytics: 'GA-XXXXXXXXX',
      facebookPixel: '',
      zoomApiKey: '••••••••',
      stripePublicKey: 'pk_test_••••••••',
      stripeSecretKey: '••••••••',
    },
  });

  const handleSave = () => {
    // In real implementation, this would save to API
    toast.success('Settings saved successfully');
  };

  const handleReset = () => {
    // In real implementation, this would reset to defaults
    toast.success('Settings reset to defaults');
  };

  if (!user || user.userType !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Settings className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to access system settings.
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
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, siteName: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={settings.general.siteUrl}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, siteUrl: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, siteDescription: e.target.value }
                  }))}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.general.adminEmail}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, adminEmail: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.general.timezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.general.language}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable maintenance mode to prevent user access
                  </p>
                </div>
                <Switch
                  checked={settings.general.maintenanceMode}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, maintenanceMode: checked }
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={settings.email.smtpHost}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      email: { ...prev.email, smtpHost: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={settings.email.smtpPort}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      email: { ...prev.email, smtpPort: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">SMTP Username</Label>
                  <Input
                    id="smtpUsername"
                    value={settings.email.smtpUsername}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      email: { ...prev.email, smtpUsername: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={settings.email.smtpPassword}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      email: { ...prev.email, smtpPassword: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={settings.email.fromName}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      email: { ...prev.email, fromName: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      email: { ...prev.email, fromEmail: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Require email verification for new users
                    </p>
                  </div>
                  <Switch
                    checked={settings.email.enableEmailVerification}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      email: { ...prev.email, enableEmailVerification: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Welcome Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Send welcome email to new users
                    </p>
                  </div>
                  <Switch
                    checked={settings.email.enableWelcomeEmail}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      email: { ...prev.email, enableWelcomeEmail: checked }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.enablePushNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, enablePushNotifications: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.enableEmailNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, enableEmailNotifications: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.enableSmsNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, enableSmsNotifications: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notification Sound</Label>
                    <p className="text-sm text-muted-foreground">
                      Play sound for notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.notificationSound}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, notificationSound: checked }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="digestFrequency">Email Digest Frequency</Label>
                <Select value={settings.notifications.digestFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, passwordMinLength: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Special Characters</Label>
                    <p className="text-sm text-muted-foreground">
                      Passwords must contain special characters
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.requireSpecialChars}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, requireSpecialChars: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable 2FA for enhanced security
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.enableTwoFactor}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, enableTwoFactor: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>CAPTCHA Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable CAPTCHA for login and registration
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.enableCaptcha}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, enableCaptcha: checked }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, maxLoginAttempts: parseInt(e.target.value) }
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="mr-2 h-5 w-5" />
                Appearance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={settings.appearance.theme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input
                    id="primaryColor"
                    type="color"
                    value={settings.appearance.primaryColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, primaryColor: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={settings.appearance.logoUrl}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, logoUrl: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faviconUrl">Favicon URL</Label>
                  <Input
                    id="faviconUrl"
                    value={settings.appearance.faviconUrl}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, faviconUrl: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customCss">Custom CSS</Label>
                <Textarea
                  id="customCss"
                  value={settings.appearance.customCss}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, customCss: e.target.value }
                  }))}
                  rows={5}
                  placeholder="Enter custom CSS rules..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Key className="mr-2 h-5 w-5" />
                  API Keys & Integrations
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKeys(!showApiKeys)}
                >
                  {showApiKeys ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Hide Keys
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Show Keys
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
                  <Input
                    id="googleAnalytics"
                    value={settings.integrations.googleAnalytics}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      integrations: { ...prev.integrations, googleAnalytics: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebookPixel">Facebook Pixel ID</Label>
                  <Input
                    id="facebookPixel"
                    value={settings.integrations.facebookPixel}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      integrations: { ...prev.integrations, facebookPixel: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="zoomApiKey">Zoom API Key</Label>
                  <Input
                    id="zoomApiKey"
                    type={showApiKeys ? 'text' : 'password'}
                    value={settings.integrations.zoomApiKey}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      integrations: { ...prev.integrations, zoomApiKey: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                  <Input
                    id="stripePublicKey"
                    value={settings.integrations.stripePublicKey}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      integrations: { ...prev.integrations, stripePublicKey: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                <Input
                  id="stripeSecretKey"
                  type={showApiKeys ? 'text' : 'password'}
                  value={settings.integrations.stripeSecretKey}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    integrations: { ...prev.integrations, stripeSecretKey: e.target.value }
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}