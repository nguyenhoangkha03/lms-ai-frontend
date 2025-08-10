'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Eye,
  Mail,
  Smartphone,
  Globe,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  Lock,
  Key,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Save,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface TeacherSettings {
  notifications: {
    email: {
      newStudentEnrollment: boolean;
      assignmentSubmissions: boolean;
      courseReviews: boolean;
      paymentUpdates: boolean;
      systemAnnouncements: boolean;
      marketingEmails: boolean;
    };
    push: {
      enabled: boolean;
      newMessages: boolean;
      liveClassReminders: boolean;
      deadlineAlerts: boolean;
    };
    frequency: 'realtime' | 'daily' | 'weekly' | 'monthly';
  };
  privacy: {
    profileVisibility: 'public' | 'students_only' | 'private';
    showEmail: boolean;
    showPhone: boolean;
    allowDirectMessages: boolean;
    requireApprovalForMessages: boolean;
  };
  teaching: {
    autoGrading: boolean;
    instantFeedback: boolean;
    allowStudentRating: boolean;
    showProgressToStudents: boolean;
    enableDiscussions: boolean;
    moderateComments: boolean;
  };
  accessibility: {
    theme: 'light' | 'dark' | 'system';
    fontSize: number;
    reducedMotion: boolean;
    highContrast: boolean;
    soundEnabled: boolean;
    screenReader: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    loginAlerts: boolean;
    sessionTimeout: number; // minutes
    allowMultipleSessions: boolean;
    ipRestrictions: string[];
  };
  data: {
    autoBackup: boolean;
    exportFormat: 'json' | 'csv' | 'pdf';
    dataRetention: number; // months
  };
}

const defaultSettings: TeacherSettings = {
  notifications: {
    email: {
      newStudentEnrollment: true,
      assignmentSubmissions: true,
      courseReviews: true,
      paymentUpdates: true,
      systemAnnouncements: true,
      marketingEmails: false,
    },
    push: {
      enabled: true,
      newMessages: true,
      liveClassReminders: true,
      deadlineAlerts: true,
    },
    frequency: 'realtime',
  },
  privacy: {
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowDirectMessages: true,
    requireApprovalForMessages: false,
  },
  teaching: {
    autoGrading: true,
    instantFeedback: true,
    allowStudentRating: true,
    showProgressToStudents: true,
    enableDiscussions: true,
    moderateComments: true,
  },
  accessibility: {
    theme: 'system',
    fontSize: 16,
    reducedMotion: false,
    highContrast: false,
    soundEnabled: true,
    screenReader: false,
  },
  security: {
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 60,
    allowMultipleSessions: true,
    ipRestrictions: [],
  },
  data: {
    autoBackup: true,
    exportFormat: 'json',
    dataRetention: 24,
  },
};

export default function TeacherSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<TeacherSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState('notifications');
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateSettings = (path: string, value: any) => {
    const keys = path.split('.');
    const newSettings = { ...settings };
    let current: any = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setHasChanges(false);
      toast({
        title: 'Settings Saved',
        description: 'Your preferences have been updated successfully.',
      });
    }, 1000);
  };

  const handleExportData = () => {
    toast({
      title: 'Export Started',
      description: 'Your data export will be ready shortly.',
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: 'Account Deletion',
      description: 'Account deletion request has been submitted.',
      variant: 'destructive',
    });
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Eye className="h-4 w-4" /> },
    { id: 'teaching', label: 'Teaching', icon: <SettingsIcon className="h-4 w-4" /> },
    { id: 'accessibility', label: 'Accessibility', icon: <Monitor className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
    { id: 'data', label: 'Data & Privacy', icon: <Download className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
                <SettingsIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Settings
                </h1>
                <p className="text-slate-600">
                  Manage your teaching preferences and account settings
                </p>
              </div>
            </div>

            {hasChanges && (
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Unsaved Changes
                </Badge>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Settings Navigation */}
          <div className="col-span-3">
            <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl sticky top-32">
              <CardContent className="p-2">
                <div className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg'
                          : 'text-slate-600 hover:bg-white/60'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="col-span-9">
            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Mail className="h-5 w-5" />
                      <span>Email Notifications</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(settings.notifications.email).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <Label className="text-slate-800">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </Label>
                          <p className="text-sm text-slate-500">
                            Get notified about {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => updateSettings(`notifications.email.${key}`, checked)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Smartphone className="h-5 w-5" />
                      <span>Push Notifications</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-800">Enable Push Notifications</Label>
                        <p className="text-sm text-slate-500">Allow browser notifications</p>
                      </div>
                      <Switch
                        checked={settings.notifications.push.enabled}
                        onCheckedChange={(checked) => updateSettings('notifications.push.enabled', checked)}
                      />
                    </div>

                    {settings.notifications.push.enabled && (
                      <>
                        <Separator />
                        {Object.entries(settings.notifications.push)
                          .filter(([key]) => key !== 'enabled')
                          .map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <Label className="text-slate-700">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </Label>
                            <Switch
                              checked={value as boolean}
                              onCheckedChange={(checked) => updateSettings(`notifications.push.${key}`, checked)}
                            />
                          </div>
                        ))}
                      </>
                    )}

                    <Separator />
                    
                    <div>
                      <Label className="text-slate-800">Notification Frequency</Label>
                      <Select 
                        value={settings.notifications.frequency}
                        onValueChange={(value) => updateSettings('notifications.frequency', value)}
                      >
                        <SelectTrigger className="bg-white/80 mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">Real-time</SelectItem>
                          <SelectItem value="daily">Daily Summary</SelectItem>
                          <SelectItem value="weekly">Weekly Summary</SelectItem>
                          <SelectItem value="monthly">Monthly Summary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Privacy Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-slate-800">Profile Visibility</Label>
                    <p className="text-sm text-slate-500 mb-2">Control who can see your profile</p>
                    <Select 
                      value={settings.privacy.profileVisibility}
                      onValueChange={(value) => updateSettings('privacy.profileVisibility', value)}
                    >
                      <SelectTrigger className="bg-white/80">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public - Anyone can see</SelectItem>
                        <SelectItem value="students_only">Students Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800">Contact Information</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-800">Show Email Address</Label>
                        <p className="text-sm text-slate-500">Display email on your public profile</p>
                      </div>
                      <Switch
                        checked={settings.privacy.showEmail}
                        onCheckedChange={(checked) => updateSettings('privacy.showEmail', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-800">Show Phone Number</Label>
                        <p className="text-sm text-slate-500">Display phone on your public profile</p>
                      </div>
                      <Switch
                        checked={settings.privacy.showPhone}
                        onCheckedChange={(checked) => updateSettings('privacy.showPhone', checked)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800">Messaging</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-800">Allow Direct Messages</Label>
                        <p className="text-sm text-slate-500">Let students message you directly</p>
                      </div>
                      <Switch
                        checked={settings.privacy.allowDirectMessages}
                        onCheckedChange={(checked) => updateSettings('privacy.allowDirectMessages', checked)}
                      />
                    </div>

                    {settings.privacy.allowDirectMessages && (
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-slate-800">Require Message Approval</Label>
                          <p className="text-sm text-slate-500">Review messages before they're delivered</p>
                        </div>
                        <Switch
                          checked={settings.privacy.requireApprovalForMessages}
                          onCheckedChange={(checked) => updateSettings('privacy.requireApprovalForMessages', checked)}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Teaching Settings */}
            {activeTab === 'teaching' && (
              <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <SettingsIcon className="h-5 w-5" />
                    <span>Teaching Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800">Grading & Feedback</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-800">Auto-Grading</Label>
                        <p className="text-sm text-slate-500">Automatically grade quiz submissions</p>
                      </div>
                      <Switch
                        checked={settings.teaching.autoGrading}
                        onCheckedChange={(checked) => updateSettings('teaching.autoGrading', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-800">Instant Feedback</Label>
                        <p className="text-sm text-slate-500">Show quiz results immediately</p>
                      </div>
                      <Switch
                        checked={settings.teaching.instantFeedback}
                        onCheckedChange={(checked) => updateSettings('teaching.instantFeedback', checked)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800">Student Interaction</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-800">Allow Student Ratings</Label>
                        <p className="text-sm text-slate-500">Let students rate your courses</p>
                      </div>
                      <Switch
                        checked={settings.teaching.allowStudentRating}
                        onCheckedChange={(checked) => updateSettings('teaching.allowStudentRating', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-800">Show Progress to Students</Label>
                        <p className="text-sm text-slate-500">Display detailed progress information</p>
                      </div>
                      <Switch
                        checked={settings.teaching.showProgressToStudents}
                        onCheckedChange={(checked) => updateSettings('teaching.showProgressToStudents', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-800">Enable Course Discussions</Label>
                        <p className="text-sm text-slate-500">Allow students to discuss course topics</p>
                      </div>
                      <Switch
                        checked={settings.teaching.enableDiscussions}
                        onCheckedChange={(checked) => updateSettings('teaching.enableDiscussions', checked)}
                      />
                    </div>

                    {settings.teaching.enableDiscussions && (
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-slate-800">Moderate Comments</Label>
                          <p className="text-sm text-slate-500">Review comments before publishing</p>
                        </div>
                        <Switch
                          checked={settings.teaching.moderateComments}
                          onCheckedChange={(checked) => updateSettings('teaching.moderateComments', checked)}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Accessibility Settings */}
            {activeTab === 'accessibility' && (
              <div className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Monitor className="h-5 w-5" />
                      <span>Display & Appearance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-slate-800">Theme</Label>
                      <div className="flex items-center space-x-4 mt-2">
                        {[
                          { value: 'light', icon: <Sun className="h-4 w-4" />, label: 'Light' },
                          { value: 'dark', icon: <Moon className="h-4 w-4" />, label: 'Dark' },
                          { value: 'system', icon: <Monitor className="h-4 w-4" />, label: 'System' },
                        ].map((theme) => (
                          <button
                            key={theme.value}
                            onClick={() => updateSettings('accessibility.theme', theme.value)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                              settings.accessibility.theme === theme.value
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {theme.icon}
                            <span>{theme.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-slate-800">Font Size</Label>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-slate-500">Small</span>
                        <Slider
                          value={[settings.accessibility.fontSize]}
                          onValueChange={([value]) => updateSettings('accessibility.fontSize', value)}
                          min={12}
                          max={24}
                          step={2}
                          className="flex-1"
                        />
                        <span className="text-sm text-slate-500">Large</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">Current: {settings.accessibility.fontSize}px</p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-slate-800">Reduced Motion</Label>
                          <p className="text-sm text-slate-500">Minimize animations and transitions</p>
                        </div>
                        <Switch
                          checked={settings.accessibility.reducedMotion}
                          onCheckedChange={(checked) => updateSettings('accessibility.reducedMotion', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-slate-800">High Contrast</Label>
                          <p className="text-sm text-slate-500">Increase color contrast for better visibility</p>
                        </div>
                        <Switch
                          checked={settings.accessibility.highContrast}
                          onCheckedChange={(checked) => updateSettings('accessibility.highContrast', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-slate-800">Sound Effects</Label>
                          <p className="text-sm text-slate-500">Play notification sounds</p>
                        </div>
                        <Switch
                          checked={settings.accessibility.soundEnabled}
                          onCheckedChange={(checked) => updateSettings('accessibility.soundEnabled', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-slate-800">Screen Reader Support</Label>
                          <p className="text-sm text-slate-500">Optimize for assistive technologies</p>
                        </div>
                        <Switch
                          checked={settings.accessibility.screenReader}
                          onCheckedChange={(checked) => updateSettings('accessibility.screenReader', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Account Security</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-800">Two-Factor Authentication</Label>
                        <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={settings.security.twoFactorEnabled}
                          onCheckedChange={(checked) => updateSettings('security.twoFactorEnabled', checked)}
                        />
                        {settings.security.twoFactorEnabled && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Enabled
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-800">Login Alerts</Label>
                        <p className="text-sm text-slate-500">Get notified of new login attempts</p>
                      </div>
                      <Switch
                        checked={settings.security.loginAlerts}
                        onCheckedChange={(checked) => updateSettings('security.loginAlerts', checked)}
                      />
                    </div>

                    <div>
                      <Label className="text-slate-800">Session Timeout</Label>
                      <p className="text-sm text-slate-500 mb-2">Automatically log out after inactivity</p>
                      <Select 
                        value={settings.security.sessionTimeout.toString()}
                        onValueChange={(value) => updateSettings('security.sessionTimeout', parseInt(value))}
                      >
                        <SelectTrigger className="bg-white/80">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="480">8 hours</SelectItem>
                          <SelectItem value="0">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-800">Multiple Sessions</Label>
                        <p className="text-sm text-slate-500">Allow login from multiple devices</p>
                      </div>
                      <Switch
                        checked={settings.security.allowMultipleSessions}
                        onCheckedChange={(checked) => updateSettings('security.allowMultipleSessions', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        className="bg-white/80"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        className="bg-white/80"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        className="bg-white/80"
                      />
                    </div>
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-600">
                      <Key className="h-4 w-4 mr-2" />
                      Update Password
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Data & Privacy Settings */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Download className="h-5 w-5" />
                      <span>Data Management</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-800">Auto Backup</Label>
                        <p className="text-sm text-slate-500">Automatically backup your course data</p>
                      </div>
                      <Switch
                        checked={settings.data.autoBackup}
                        onCheckedChange={(checked) => updateSettings('data.autoBackup', checked)}
                      />
                    </div>

                    <div>
                      <Label className="text-slate-800">Export Format</Label>
                      <Select 
                        value={settings.data.exportFormat}
                        onValueChange={(value) => updateSettings('data.exportFormat', value)}
                      >
                        <SelectTrigger className="bg-white/80 mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-slate-800">Data Retention</Label>
                      <p className="text-sm text-slate-500 mb-2">How long to keep your data</p>
                      <Select 
                        value={settings.data.dataRetention.toString()}
                        onValueChange={(value) => updateSettings('data.dataRetention', parseInt(value))}
                      >
                        <SelectTrigger className="bg-white/80">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">1 year</SelectItem>
                          <SelectItem value="24">2 years</SelectItem>
                          <SelectItem value="60">5 years</SelectItem>
                          <SelectItem value="0">Forever</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-semibold text-slate-800">Data Export</h3>
                      
                      <Button
                        onClick={handleExportData}
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export All Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-50/80 backdrop-blur-lg border-red-200/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-800">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Danger Zone</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-red-800 mb-2">Delete Account</h3>
                      <p className="text-sm text-red-600 mb-4">
                        This action cannot be undone. All your courses, student data, and earnings will be permanently deleted.
                      </p>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button variant="destructive" onClick={handleDeleteAccount}>
                              Yes, Delete Account
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}