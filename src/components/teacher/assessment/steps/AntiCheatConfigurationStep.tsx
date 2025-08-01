'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Camera,
  Mic,
  Lock,
  AlertTriangle,
  Settings,
  Activity,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';

import { AntiCheatSettings } from '@/types/assessment';

interface AntiCheatConfigurationStepProps {
  data: AntiCheatSettings;
  onUpdate: (data: AntiCheatSettings) => void;
  errors: Record<string, string>;
}

const SECURITY_PRESETS = [
  {
    id: 'disabled',
    name: 'Disabled',
    description: 'No anti-cheat measures',
    icon: XCircle,
    color: 'gray',
    settings: {
      proctoring: { enabled: false },
      lockdown: { fullscreenMode: false, preventTabSwitching: false },
      monitoring: { trackFocusLoss: false, trackTabSwitching: false },
      violations: { suspiciousActivityThreshold: 10 },
    },
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'Light monitoring with warnings',
    icon: Shield,
    color: 'blue',
    settings: {
      proctoring: { enabled: false },
      lockdown: { fullscreenMode: true, preventTabSwitching: true },
      monitoring: {
        trackFocusLoss: true,
        trackTabSwitching: true,
        trackCopyPaste: true,
      },
      violations: {
        suspiciousActivityThreshold: 5,
        warningSystem: {
          enabled: true,
          maxWarnings: 3,
          warningTypes: ['tab_switch', 'window_blur'],
        },
      },
    },
  },
  {
    id: 'moderate',
    name: 'Moderate',
    description: 'Standard proctoring with recording',
    icon: Camera,
    color: 'yellow',
    settings: {
      proctoring: {
        enabled: true,
        requireWebcam: true,
        recordSession: true,
        voiceDetection: true,
      },
      lockdown: {
        fullscreenMode: true,
        preventTabSwitching: true,
        blockExternalApps: true,
      },
      monitoring: { trackMouseMovement: true, screenshotInterval: 300 },
      violations: {
        suspiciousActivityThreshold: 3,
        autoSubmitOnViolation: false,
      },
    },
  },
  {
    id: 'strict',
    name: 'Strict',
    description: 'Full proctoring with identity verification',
    icon: Lock,
    color: 'red',
    settings: {
      proctoring: {
        enabled: true,
        requireWebcam: true,
        requireMicrophone: true,
        recordSession: true,
        identityVerification: true,
        faceDetection: true,
        environmentScan: true,
        voiceDetection: true,
      },
      lockdown: {
        fullscreenMode: true,
        preventTabSwitching: true,
        preventWindowSwitching: true,
        blockExternalApps: true,
        preventVirtualMachine: true,
        preventMultipleMonitors: true,
        allowedApplications: [],
      },
      monitoring: {
        trackMouseMovement: true,
        trackKeystrokes: true,
        screenshotInterval: 180,
        heartbeatInterval: 15,
      },
      violations: {
        suspiciousActivityThreshold: 2,
        autoSubmitOnViolation: true,
        penaltySystem: {
          enabled: true,
          penaltyPerViolation: 10,
          maxPenalty: 25,
        },
      },
    },
  },
];

const VIOLATION_TYPES = [
  {
    id: 'tab_switch',
    label: 'Tab Switching',
    description: 'Student switches to another browser tab',
  },
  {
    id: 'window_blur',
    label: 'Window Focus Loss',
    description: 'Assessment window loses focus',
  },
  {
    id: 'fullscreen_exit',
    label: 'Fullscreen Exit',
    description: 'Student exits fullscreen mode',
  },
  {
    id: 'copy_attempt',
    label: 'Copy Attempt',
    description: 'Student tries to copy content',
  },
  {
    id: 'paste_attempt',
    label: 'Paste Attempt',
    description: 'Student tries to paste content',
  },
  {
    id: 'right_click',
    label: 'Right Click',
    description: 'Student right-clicks in assessment',
  },
  {
    id: 'suspicious_behavior',
    label: 'Suspicious Behavior',
    description: 'AI detects unusual patterns',
  },
  {
    id: 'face_not_detected',
    label: 'Face Not Detected',
    description: 'No face visible in webcam',
  },
  {
    id: 'multiple_faces',
    label: 'Multiple Faces',
    description: 'Multiple people detected',
  },
  {
    id: 'voice_detected',
    label: 'Voice Detected',
    description: 'Unauthorized voice activity',
  },
];

export const AntiCheatConfigurationStep: React.FC<
  AntiCheatConfigurationStepProps
> = ({ data, onUpdate, errors }) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Apply preset
  const applyPreset = (preset: (typeof SECURITY_PRESETS)[0]) => {
    const newSettings: AntiCheatSettings = {
      proctoring: {
        enabled: preset.settings.proctoring.enabled || false,
        requireWebcam: preset.settings.proctoring.requireWebcam || false,
        requireMicrophone:
          preset.settings.proctoring.requireMicrophone || false,
        recordSession: preset.settings.proctoring.recordSession || false,
        identityVerification:
          preset.settings.proctoring.identityVerification || false,
        faceDetection: preset.settings.proctoring.faceDetection || false,
        voiceDetection: preset.settings.proctoring.voiceDetection || false,
        environmentScan: preset.settings.proctoring.environmentScan || false,
      },
      lockdown: {
        fullscreenMode: preset.settings.lockdown.fullscreenMode || false,
        preventTabSwitching:
          preset.settings.lockdown.preventTabSwitching || false,
        preventWindowSwitching:
          preset.settings.lockdown.preventWindowSwitching || false,
        blockExternalApps: preset.settings.lockdown.blockExternalApps || false,
        allowedApplications: preset.settings.lockdown.allowedApplications || [],
        preventVirtualMachine:
          preset.settings.lockdown.preventVirtualMachine || false,
        preventMultipleMonitors:
          preset.settings.lockdown.preventMultipleMonitors || false,
      },
      monitoring: {
        trackMouseMovement:
          preset.settings.monitoring.trackMouseMovement || false,
        trackKeystrokes: preset.settings.monitoring.trackKeystrokes || false,
        trackFocusLoss: preset.settings.monitoring.trackFocusLoss || false,
        trackTabSwitching:
          preset.settings.monitoring.trackTabSwitching || false,
        trackCopyPaste: preset.settings.monitoring.trackCopyPaste || false,
        screenshotInterval:
          preset.settings.monitoring.screenshotInterval || 300,
        heartbeatInterval: preset.settings.monitoring.heartbeatInterval || 30,
      },
      violations: {
        suspiciousActivityThreshold:
          preset.settings.violations.suspiciousActivityThreshold || 5,
        autoSubmitOnViolation:
          preset.settings.violations.autoSubmitOnViolation || false,
        warningSystem: {
          enabled: preset.settings.violations.warningSystem?.enabled || false,
          maxWarnings:
            preset.settings.violations.warningSystem?.maxWarnings || 3,
          warningTypes: preset.settings.violations.warningSystem
            ?.warningTypes || ['tab_switch', 'window_blur'],
        },
        penaltySystem: {
          enabled: preset.settings.violations.penaltySystem?.enabled || false,
          penaltyPerViolation:
            preset.settings.violations.penaltySystem?.penaltyPerViolation || 5,
          maxPenalty:
            preset.settings.violations.penaltySystem?.maxPenalty || 25,
        },
      },
    };

    onUpdate(newSettings);
    setSelectedPreset(preset.id);
  };

  // Update specific setting
  const updateSetting = (
    category: keyof AntiCheatSettings,
    field: string,
    value: any
  ) => {
    const newData = {
      ...data,
      [category]: {
        ...data[category],
        [field]: value,
      },
    };
    onUpdate(newData);
    setSelectedPreset(''); // Clear preset when manually editing
  };

  // Update nested setting
  const updateNestedSetting = (
    category: keyof AntiCheatSettings,
    subCategory: string,
    field: string,
    value: any
  ) => {
    const newData = {
      ...data,
      [category]: {
        ...data[category],
        [subCategory]: {
          ...(data[category] as any)[subCategory],
          [field]: value,
        },
      },
    };
    onUpdate(newData);
    setSelectedPreset(''); // Clear preset when manually editing
  };

  // Calculate security level
  const calculateSecurityLevel = (): {
    level: string;
    score: number;
    color: string;
  } => {
    let score = 0;

    // Proctoring features
    if (data.proctoring.enabled) score += 20;
    if (data.proctoring.requireWebcam) score += 15;
    if (data.proctoring.recordSession) score += 10;
    if (data.proctoring.identityVerification) score += 15;
    if (data.proctoring.faceDetection) score += 10;

    // Lockdown features
    if (data.lockdown.fullscreenMode) score += 5;
    if (data.lockdown.preventTabSwitching) score += 10;
    if (data.lockdown.blockExternalApps) score += 15;
    if (data.lockdown.preventVirtualMachine) score += 10;

    // Monitoring features
    if (data.monitoring.trackFocusLoss) score += 5;
    if (data.monitoring.trackTabSwitching) score += 5;
    if (data.monitoring.trackMouseMovement) score += 5;
    if (data.monitoring.trackKeystrokes) score += 10;

    if (score >= 80) return { level: 'Maximum', score, color: 'red' };
    if (score >= 60) return { level: 'High', score, color: 'orange' };
    if (score >= 40) return { level: 'Moderate', score, color: 'yellow' };
    if (score >= 20) return { level: 'Basic', score, color: 'blue' };
    return { level: 'Minimal', score, color: 'gray' };
  };

  const securityLevel = calculateSecurityLevel();

  return (
    <div className="space-y-6">
      {/* Header with Security Level */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Anti-Cheat & Proctoring</h3>
          <p className="text-sm text-muted-foreground">
            Configure security measures to prevent cheating during assessments
          </p>
        </div>

        <div className="text-right">
          <div className="mb-1 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Security Level</span>
          </div>
          <Badge
            variant="outline"
            className={`text-${securityLevel.color}-600 border-${securityLevel.color}-200`}
          >
            {securityLevel.level} ({securityLevel.score}%)
          </Badge>
        </div>
      </div>

      {/* Security Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Security Presets
          </CardTitle>
          <CardDescription>
            Choose a preset configuration or customize your own settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {SECURITY_PRESETS.map(preset => {
              const IconComponent = preset.icon;
              const isSelected = selectedPreset === preset.id;

              return (
                <Card
                  key={preset.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? 'bg-primary/5 ring-2 ring-primary'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => applyPreset(preset)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div
                        className={`h-12 w-12 rounded-lg bg-${preset.color}-100 flex items-center justify-center`}
                      >
                        <IconComponent
                          className={`h-6 w-6 text-${preset.color}-600`}
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{preset.name}</h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {preset.description}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Tabs defaultValue="proctoring" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="proctoring" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Proctoring
          </TabsTrigger>
          <TabsTrigger value="lockdown" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Lockdown
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="violations" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Violations
          </TabsTrigger>
        </TabsList>

        {/* Proctoring Settings */}
        <TabsContent value="proctoring">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Proctoring Configuration
              </CardTitle>
              <CardDescription>
                Configure webcam and microphone monitoring settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable Proctoring */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Enable Proctoring
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Activate webcam and microphone monitoring during assessment
                  </p>
                </div>
                <Switch
                  checked={data.proctoring.enabled}
                  onCheckedChange={value =>
                    updateSetting('proctoring', 'enabled', value)
                  }
                />
              </div>

              {data.proctoring.enabled && (
                <>
                  <Separator />

                  {/* Webcam Settings */}
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 font-medium">
                      <Camera className="h-4 w-4" />
                      Webcam Settings
                    </h4>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">
                            Require Webcam
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Students must have a working webcam
                          </p>
                        </div>
                        <Switch
                          checked={data.proctoring.requireWebcam}
                          onCheckedChange={value =>
                            updateSetting('proctoring', 'requireWebcam', value)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">
                            Record Session
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Record entire assessment session
                          </p>
                        </div>
                        <Switch
                          checked={data.proctoring.recordSession}
                          onCheckedChange={value =>
                            updateSetting('proctoring', 'recordSession', value)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">
                            Face Detection
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Ensure face is visible at all times
                          </p>
                        </div>
                        <Switch
                          checked={data.proctoring.faceDetection}
                          onCheckedChange={value =>
                            updateSetting('proctoring', 'faceDetection', value)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">
                            Identity Verification
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Verify student identity before start
                          </p>
                        </div>
                        <Switch
                          checked={data.proctoring.identityVerification}
                          onCheckedChange={value =>
                            updateSetting(
                              'proctoring',
                              'identityVerification',
                              value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Microphone Settings */}
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 font-medium">
                      <Mic className="h-4 w-4" />
                      Microphone Settings
                    </h4>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">
                            Require Microphone
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Students must have a working microphone
                          </p>
                        </div>
                        <Switch
                          checked={data.proctoring.requireMicrophone}
                          onCheckedChange={value =>
                            updateSetting(
                              'proctoring',
                              'requireMicrophone',
                              value
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">
                            Voice Detection
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Monitor for unauthorized voices
                          </p>
                        </div>
                        <Switch
                          checked={data.proctoring.voiceDetection}
                          onCheckedChange={value =>
                            updateSetting('proctoring', 'voiceDetection', value)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Environment Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">
                          Environment Scan
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Require students to scan their testing environment
                        </p>
                      </div>
                      <Switch
                        checked={data.proctoring.environmentScan}
                        onCheckedChange={value =>
                          updateSetting('proctoring', 'environmentScan', value)
                        }
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lockdown Settings */}
        <TabsContent value="lockdown">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Browser Lockdown
              </CardTitle>
              <CardDescription>
                Control browser behavior and restrict access to external
                resources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Fullscreen Mode
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Force assessment to run in fullscreen
                    </p>
                  </div>
                  <Switch
                    checked={data.lockdown.fullscreenMode}
                    onCheckedChange={value =>
                      updateSetting('lockdown', 'fullscreenMode', value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Prevent Tab Switching
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Block switching to other browser tabs
                    </p>
                  </div>
                  <Switch
                    checked={data.lockdown.preventTabSwitching}
                    onCheckedChange={value =>
                      updateSetting('lockdown', 'preventTabSwitching', value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Prevent Window Switching
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Block switching to other applications
                    </p>
                  </div>
                  <Switch
                    checked={data.lockdown.preventWindowSwitching}
                    onCheckedChange={value =>
                      updateSetting('lockdown', 'preventWindowSwitching', value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Block External Apps
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Prevent access to other applications
                    </p>
                  </div>
                  <Switch
                    checked={data.lockdown.blockExternalApps}
                    onCheckedChange={value =>
                      updateSetting('lockdown', 'blockExternalApps', value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Prevent Virtual Machine
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Block assessment in virtual machines
                    </p>
                  </div>
                  <Switch
                    checked={data.lockdown.preventVirtualMachine}
                    onCheckedChange={value =>
                      updateSetting('lockdown', 'preventVirtualMachine', value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Single Monitor Only
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Require single monitor setup
                    </p>
                  </div>
                  <Switch
                    checked={data.lockdown.preventMultipleMonitors}
                    onCheckedChange={value =>
                      updateSetting(
                        'lockdown',
                        'preventMultipleMonitors',
                        value
                      )
                    }
                  />
                </div>
              </div>

              {/* Allowed Applications */}
              {data.lockdown.blockExternalApps && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Label className="text-base font-medium">
                      Allowed Applications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Specify applications that students are allowed to use
                      during the assessment
                    </p>
                    <Textarea
                      placeholder="Enter application names, one per line (e.g., Calculator, Notepad)"
                      value={data.lockdown.allowedApplications.join('\n')}
                      onChange={e =>
                        updateSetting(
                          'lockdown',
                          'allowedApplications',
                          e.target.value.split('\n').filter(app => app.trim())
                        )
                      }
                      rows={4}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Settings */}
        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Monitoring
              </CardTitle>
              <CardDescription>
                Track student behavior and system interactions during assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Track Focus Loss
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Monitor when window loses focus
                    </p>
                  </div>
                  <Switch
                    checked={data.monitoring.trackFocusLoss}
                    onCheckedChange={value =>
                      updateSetting('monitoring', 'trackFocusLoss', value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Track Tab Switching
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Monitor browser tab changes
                    </p>
                  </div>
                  <Switch
                    checked={data.monitoring.trackTabSwitching}
                    onCheckedChange={value =>
                      updateSetting('monitoring', 'trackTabSwitching', value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Track Copy/Paste
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Monitor copy and paste activities
                    </p>
                  </div>
                  <Switch
                    checked={data.monitoring.trackCopyPaste}
                    onCheckedChange={value =>
                      updateSetting('monitoring', 'trackCopyPaste', value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Track Mouse Movement
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Monitor mouse activity patterns
                    </p>
                  </div>
                  <Switch
                    checked={data.monitoring.trackMouseMovement}
                    onCheckedChange={value =>
                      updateSetting('monitoring', 'trackMouseMovement', value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Track Keystrokes
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Monitor typing patterns and speed
                    </p>
                  </div>
                  <Switch
                    checked={data.monitoring.trackKeystrokes}
                    onCheckedChange={value =>
                      updateSetting('monitoring', 'trackKeystrokes', value)
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* Monitoring Intervals */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Screenshot Interval: {data.monitoring.screenshotInterval}{' '}
                    seconds
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    How often to take automatic screenshots (0 to disable)
                  </p>
                  <Slider
                    value={[data.monitoring.screenshotInterval]}
                    onValueChange={value =>
                      updateSetting(
                        'monitoring',
                        'screenshotInterval',
                        value[0]
                      )
                    }
                    max={600}
                    min={0}
                    step={30}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Disabled</span>
                    <span>1 min</span>
                    <span>5 min</span>
                    <span>10 min</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Heartbeat Interval: {data.monitoring.heartbeatInterval}{' '}
                    seconds
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    How often to check student connection status
                  </p>
                  <Slider
                    value={[data.monitoring.heartbeatInterval]}
                    onValueChange={value =>
                      updateSetting('monitoring', 'heartbeatInterval', value[0])
                    }
                    max={120}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10s</span>
                    <span>30s</span>
                    <span>60s</span>
                    <span>120s</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Violations Settings */}
        <TabsContent value="violations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Violation Handling
              </CardTitle>
              <CardDescription>
                Configure how to handle suspicious activities and violations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Threshold Settings */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Suspicious Activity Threshold:{' '}
                  {data.violations.suspiciousActivityThreshold}
                </Label>
                <p className="text-sm text-muted-foreground">
                  Number of violations before flagging as suspicious
                </p>
                <Slider
                  value={[data.violations.suspiciousActivityThreshold]}
                  onValueChange={value =>
                    updateSetting(
                      'violations',
                      'suspiciousActivityThreshold',
                      value[0]
                    )
                  }
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 (Strict)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Lenient)</span>
                </div>
              </div>

              <Separator />

              {/* Auto Submit */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    Auto Submit on Violation
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically submit assessment when threshold is reached
                  </p>
                </div>
                <Switch
                  checked={data.violations.autoSubmitOnViolation}
                  onCheckedChange={value =>
                    updateSetting('violations', 'autoSubmitOnViolation', value)
                  }
                />
              </div>

              <Separator />

              {/* Warning System */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      Enable Warning System
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Show warnings to students before flagging violations
                    </p>
                  </div>
                  <Switch
                    checked={data.violations.warningSystem.enabled}
                    onCheckedChange={value =>
                      updateNestedSetting(
                        'violations',
                        'warningSystem',
                        'enabled',
                        value
                      )
                    }
                  />
                </div>

                {data.violations.warningSystem.enabled && (
                  <>
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Maximum Warnings:{' '}
                        {data.violations.warningSystem.maxWarnings}
                      </Label>
                      <Slider
                        value={[data.violations.warningSystem.maxWarnings]}
                        onValueChange={value =>
                          updateNestedSetting(
                            'violations',
                            'warningSystem',
                            'maxWarnings',
                            value[0]
                          )
                        }
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Warning Types
                      </Label>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {VIOLATION_TYPES.map(violation => (
                          <div
                            key={violation.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div>
                              <Label className="text-xs font-medium">
                                {violation.label}
                              </Label>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {violation.description}
                              </p>
                            </div>
                            <Switch
                              checked={data.violations.warningSystem.warningTypes.includes(
                                violation.id
                              )}
                              onCheckedChange={checked => {
                                const currentTypes =
                                  data.violations.warningSystem.warningTypes;
                                const newTypes = checked
                                  ? [...currentTypes, violation.id]
                                  : currentTypes.filter(
                                      type => type !== violation.id
                                    );
                                updateNestedSetting(
                                  'violations',
                                  'warningSystem',
                                  'warningTypes',
                                  newTypes
                                );
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Separator />

              {/* Penalty System */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      Enable Penalty System
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Deduct points for violations during assessment
                    </p>
                  </div>
                  <Switch
                    checked={data.violations.penaltySystem.enabled}
                    onCheckedChange={value =>
                      updateNestedSetting(
                        'violations',
                        'penaltySystem',
                        'enabled',
                        value
                      )
                    }
                  />
                </div>

                {data.violations.penaltySystem.enabled && (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Penalty Per Violation (%)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={
                          data.violations.penaltySystem.penaltyPerViolation
                        }
                        onChange={e =>
                          updateNestedSetting(
                            'violations',
                            'penaltySystem',
                            'penaltyPerViolation',
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Percentage of total score to deduct per violation
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Maximum Penalty (%)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={data.violations.penaltySystem.maxPenalty}
                        onChange={e =>
                          updateNestedSetting(
                            'violations',
                            'penaltySystem',
                            'maxPenalty',
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum total penalty that can be applied
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Security Summary
          </CardTitle>
          <CardDescription>
            Overview of configured security measures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Proctoring Summary */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                <span className="text-sm font-medium">Proctoring</span>
              </div>
              <div className="space-y-1">
                {data.proctoring.enabled ? (
                  <>
                    {data.proctoring.requireWebcam && (
                      <Badge variant="secondary" className="text-xs">
                        Webcam Required
                      </Badge>
                    )}
                    {data.proctoring.recordSession && (
                      <Badge variant="secondary" className="text-xs">
                        Recording
                      </Badge>
                    )}
                    {data.proctoring.identityVerification && (
                      <Badge variant="secondary" className="text-xs">
                        ID Verification
                      </Badge>
                    )}
                    {data.proctoring.faceDetection && (
                      <Badge variant="secondary" className="text-xs">
                        Face Detection
                      </Badge>
                    )}
                  </>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Disabled
                  </Badge>
                )}
              </div>
            </div>

            {/* Lockdown Summary */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="text-sm font-medium">Lockdown</span>
              </div>
              <div className="space-y-1">
                {data.lockdown.fullscreenMode && (
                  <Badge variant="secondary" className="text-xs">
                    Fullscreen
                  </Badge>
                )}
                {data.lockdown.preventTabSwitching && (
                  <Badge variant="secondary" className="text-xs">
                    No Tab Switch
                  </Badge>
                )}
                {data.lockdown.blockExternalApps && (
                  <Badge variant="secondary" className="text-xs">
                    App Blocking
                  </Badge>
                )}
                {data.lockdown.preventVirtualMachine && (
                  <Badge variant="secondary" className="text-xs">
                    No VM
                  </Badge>
                )}
              </div>
            </div>

            {/* Monitoring Summary */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm font-medium">Monitoring</span>
              </div>
              <div className="space-y-1">
                {data.monitoring.trackFocusLoss && (
                  <Badge variant="secondary" className="text-xs">
                    Focus Tracking
                  </Badge>
                )}
                {data.monitoring.trackCopyPaste && (
                  <Badge variant="secondary" className="text-xs">
                    Copy/Paste
                  </Badge>
                )}
                {data.monitoring.trackKeystrokes && (
                  <Badge variant="secondary" className="text-xs">
                    Keystrokes
                  </Badge>
                )}
                {data.monitoring.screenshotInterval > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Screenshots ({data.monitoring.screenshotInterval}s)
                  </Badge>
                )}
              </div>
            </div>

            {/* Violations Summary */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Violations</span>
              </div>
              <div className="space-y-1">
                <Badge variant="secondary" className="text-xs">
                  Threshold: {data.violations.suspiciousActivityThreshold}
                </Badge>
                {data.violations.autoSubmitOnViolation && (
                  <Badge variant="destructive" className="text-xs">
                    Auto Submit
                  </Badge>
                )}
                {data.violations.warningSystem.enabled && (
                  <Badge variant="secondary" className="text-xs">
                    Warnings: {data.violations.warningSystem.maxWarnings}
                  </Badge>
                )}
                {data.violations.penaltySystem.enabled && (
                  <Badge variant="secondary" className="text-xs">
                    Penalty: {data.violations.penaltySystem.penaltyPerViolation}
                    %
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Security Level Progress */}
          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Security Level</span>
              <span className="text-sm text-muted-foreground">
                {securityLevel.score}/100
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  securityLevel.color === 'red'
                    ? 'bg-red-500'
                    : securityLevel.color === 'orange'
                      ? 'bg-orange-500'
                      : securityLevel.color === 'yellow'
                        ? 'bg-yellow-500'
                        : securityLevel.color === 'blue'
                          ? 'bg-blue-500'
                          : 'bg-gray-400'
                }`}
                style={{ width: `${securityLevel.score}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {securityLevel.level} security level configured
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
            <div className="space-y-2">
              <h4 className="font-medium text-amber-800">
                Important Considerations
              </h4>
              <ul className="space-y-1 text-sm text-amber-700">
                <li>
                  • Higher security levels may impact student experience and
                  require better devices
                </li>
                <li>
                  • Proctoring features require student camera/microphone
                  permissions
                </li>
                <li>
                  • Browser lockdown may not work on all devices or browsers
                </li>
                <li>• Test your configuration before deploying to students</li>
                <li>
                  • Consider accessibility needs when enabling strict measures
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {Object.keys(errors).some(key => key.startsWith('antiCheat')) && (
        <div className="space-y-2">
          {Object.entries(errors)
            .filter(([key]) => key.startsWith('antiCheat'))
            .map(([key, error]) => (
              <div
                key={key}
                className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
              >
                {error}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
