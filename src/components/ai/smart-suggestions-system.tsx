'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Brain,
  Target,
  TrendingUp,
  Lightbulb,
  Play,
  AlertTriangle,
  X,
  Minimize2,
  Bell,
  Settings,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Bookmark,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ToastAction } from '@/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  useGetSmartSuggestionsQuery,
  useRecordSuggestionInteractionMutation,
} from '@/lib/redux/api/ai-recommendation-api';
import { SmartSuggestion } from '@/lib/types/ai-recommendation';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const suggestionTypeIcons = {
  real_time: Zap,
  contextual: Target,
  behavioral: Brain,
  predictive: TrendingUp,
};

const suggestionTypeColors = {
  real_time: 'text-red-600 bg-red-100 dark:bg-red-900/20',
  contextual: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  behavioral: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
  predictive: 'text-green-600 bg-green-100 dark:bg-green-900/20',
};

const priorityConfig = {
  urgent: {
    color: 'text-red-600 bg-red-100 border-red-200',
    icon: AlertTriangle,
    duration: 10000,
  },
  high: {
    color: 'text-orange-600 bg-orange-100 border-orange-200',
    icon: Zap,
    duration: 8000,
  },
  medium: {
    color: 'text-blue-600 bg-blue-100 border-blue-200',
    icon: Lightbulb,
    duration: 6000,
  },
  low: {
    color: 'text-gray-600 bg-gray-100 border-gray-200',
    icon: Eye,
    duration: 4000,
  },
};

const actionTypeHandlers = {
  navigate: (data: any, router: any) => {
    if (data.url) {
      router.push(data.url);
    }
  },
  show_content: (data: any) => {
    // Show content modal or panel
    console.log('Show content:', data);
  },
  start_session: (data: any) => {
    // Start learning session
    console.log('Start session:', data);
  },
  reminder: (data: any) => {
    // Set reminder
    console.log('Set reminder:', data);
  },
  notification: (data: any) => {
    // Show notification
    console.log('Send notification:', data);
  },
};

interface SmartSuggestionsSystemProps {
  className?: string;
  maxSuggestions?: number;
  enableNotifications?: boolean;
  enableRealTime?: boolean;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'center';
  autoShow?: boolean;
  showSettings?: boolean;
}

interface SuggestionSettings {
  enabled: boolean;
  showPopups: boolean;
  showBanners: boolean;
  showToasts: boolean;
  playSound: boolean;
  autoHide: boolean;
  hideDelay: number;
  maxVisible: number;
  priority: {
    urgent: boolean;
    high: boolean;
    medium: boolean;
    low: boolean;
  };
  types: {
    real_time: boolean;
    contextual: boolean;
    behavioral: boolean;
    predictive: boolean;
  };
}

export const SmartSuggestionsSystem: React.FC<SmartSuggestionsSystemProps> = ({
  className,
  maxSuggestions = 5,
  enableNotifications = true,
  enableRealTime = true,
  position = 'top-right',
  autoShow = true,
  showSettings = true,
}) => {
  const router = useRouter();
  const { toast } = useToast();

  // Local state
  const [visibleSuggestions, setVisibleSuggestions] = useState<Set<string>>(
    new Set()
  );
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(
    new Set()
  );
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [settings, setSettings] = useState<SuggestionSettings>({
    enabled: true,
    showPopups: true,
    showBanners: true,
    showToasts: true,
    playSound: false,
    autoHide: true,
    hideDelay: 5000,
    maxVisible: 3,
    priority: {
      urgent: true,
      high: true,
      medium: true,
      low: false,
    },
    types: {
      real_time: true,
      contextual: true,
      behavioral: true,
      predictive: false,
    },
  });

  // API hooks
  const {
    data: suggestions = [],
    isLoading,
    refetch,
  } = useGetSmartSuggestionsQuery({
    type: Object.keys(settings.types)
      .filter(key => settings.types[key as keyof typeof settings.types])
      .join(','),
    priority: Object.keys(settings.priority)
      .filter(key => settings.priority[key as keyof typeof settings.priority])
      .join(','),
    active: true,
  });

  const [recordInteraction] = useRecordSuggestionInteractionMutation();

  // Filter suggestions based on settings
  const filteredSuggestions = suggestions
    .filter(suggestion => {
      if (!settings.enabled) return false;
      if (dismissedSuggestions.has(suggestion.id)) return false;
      if (
        !settings.priority[
          suggestion.priority as keyof typeof settings.priority
        ]
      )
        return false;
      if (
        !settings.types[
          suggestion.suggestionType as keyof typeof settings.types
        ]
      )
        return false;

      // Check timing conditions
      if (
        suggestion.timing.showAt &&
        new Date(suggestion.timing.showAt) > new Date()
      )
        return false;
      if (
        suggestion.timing.hideAt &&
        new Date(suggestion.timing.hideAt) < new Date()
      )
        return false;

      return true;
    })
    .slice(0, maxSuggestions);

  // Handle suggestion interaction
  const handleSuggestionInteraction = useCallback(
    async (
      suggestion: SmartSuggestion,
      action: 'shown' | 'clicked' | 'dismissed',
      feedback?: string
    ) => {
      try {
        await recordInteraction({
          id: suggestion.id,
          action,
          feedback,
        });

        if (action === 'clicked') {
          // Execute the suggestion action
          const handler = actionTypeHandlers[suggestion.actionType];
          if (handler) {
            handler(suggestion.actionData, router);
          }
        }

        if (action === 'dismissed') {
          setDismissedSuggestions(prev => new Set([...prev, suggestion.id]));
          setVisibleSuggestions(prev => {
            const newSet = new Set(prev);
            newSet.delete(suggestion.id);
            return newSet;
          });
        }
      } catch (error) {
        console.error('Failed to record suggestion interaction:', error);
      }
    },
    [recordInteraction, router]
  );

  // Auto-show suggestions
  useEffect(() => {
    if (!autoShow || !settings.enabled) return;

    filteredSuggestions.forEach(suggestion => {
      if (!visibleSuggestions.has(suggestion.id) && !suggestion.isShown) {
        // Check if we should show this suggestion
        const shouldShow = checkSuggestionConditions(suggestion);
        if (shouldShow) {
          showSuggestion(suggestion);
        }
      }
    });
  }, [filteredSuggestions, autoShow, settings.enabled, visibleSuggestions]);

  // Check suggestion conditions
  const checkSuggestionConditions = (suggestion: SmartSuggestion): boolean => {
    // Check maximum visible limit
    if (visibleSuggestions.size >= settings.maxVisible) return false;

    // Check timing conditions
    const now = new Date();
    if (suggestion.timing.showAt && new Date(suggestion.timing.showAt) > now)
      return false;
    if (suggestion.timing.hideAt && new Date(suggestion.timing.hideAt) < now)
      return false;

    // Check personalization conditions
    if (suggestion.personalization.conditions) {
      // Evaluate custom conditions (this would be more complex in a real implementation)
      const conditions = suggestion.personalization.conditions;
      if (
        conditions.minRelevanceScore &&
        suggestion.personalization.relevanceScore < conditions.minRelevanceScore
      ) {
        return false;
      }
    }

    return true;
  };

  // Show suggestion based on display mode
  const showSuggestion = useCallback(
    (suggestion: SmartSuggestion) => {
      if (!settings.enabled) return;

      setVisibleSuggestions(prev => new Set([...prev, suggestion.id]));
      handleSuggestionInteraction(suggestion, 'shown');

      // Play sound if enabled
      if (settings.playSound) {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore errors
      }

      // Handle different display modes
      switch (suggestion.displayMode) {
        case 'toast':
          if (settings.showToasts) {
            showToastSuggestion(suggestion);
          }
          break;
        case 'popup':
          if (settings.showPopups) {
            // Popup is handled by the main render
          }
          break;
        case 'banner':
          if (settings.showBanners) {
            // Banner is handled by the main render
          }
          break;
        case 'inline':
          // Inline suggestions are handled by the parent component
          break;
      }

      // Auto-hide if enabled
      if (settings.autoHide && suggestion.timing.showDuration) {
        setTimeout(() => {
          hideSuggestion(suggestion.id);
        }, suggestion.timing.showDuration);
      } else if (settings.autoHide) {
        setTimeout(() => {
          hideSuggestion(suggestion.id);
        }, settings.hideDelay);
      }
    },
    [settings, handleSuggestionInteraction]
  );

  // Show toast suggestion
  const showToastSuggestion = (suggestion: SmartSuggestion) => {
    const PriorityIcon = priorityConfig[suggestion.priority].icon;

    toast({
      title: (
        <div className="flex items-center space-x-2">
          <PriorityIcon className="h-4 w-4" />
          <span>{suggestion.title}</span>
        </div>
      ),
      description: suggestion.message,
      action: (
        <ToastAction
          altText="Take action"
          onClick={() => handleSuggestionInteraction(suggestion, 'clicked')}
        >
          {suggestion.actionType === 'navigate' ? 'Go' : 'Do it'}
        </ToastAction>
      ),
      duration: priorityConfig[suggestion.priority].duration,
    });
  };

  // Hide suggestion
  const hideSuggestion = (suggestionId: string) => {
    setVisibleSuggestions(prev => {
      const newSet = new Set(prev);
      newSet.delete(suggestionId);
      return newSet;
    });
  };

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  // Render suggestion card
  const renderSuggestionCard = (suggestion: SmartSuggestion) => {
    const TypeIcon = suggestionTypeIcons[suggestion.suggestionType];
    const PriorityIcon = priorityConfig[suggestion.priority].icon;
    const priorityColor = priorityConfig[suggestion.priority].color;

    return (
      <motion.div
        key={suggestion.id}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn(
          'group relative overflow-hidden rounded-xl border-2 bg-background shadow-lg',
          'w-full max-w-sm backdrop-blur-sm',
          priorityColor,
          suggestion.displayMode === 'banner' && 'w-full max-w-2xl'
        )}
      >
        {/* Priority indicator */}
        <div className="absolute left-0 top-0 h-full w-1 bg-current opacity-50" />

        {/* Dismiss button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => handleSuggestionInteraction(suggestion, 'dismissed')}
        >
          <X className="h-3 w-3" />
        </Button>

        <div className="p-4">
          {/* Header */}
          <div className="mb-3 flex items-start space-x-3">
            <div className="bg-current/10 rounded-lg p-2">
              <TypeIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center space-x-2">
                <h4 className="font-semibold text-foreground">
                  {suggestion.title}
                </h4>
                <Badge variant="outline" className="text-xs">
                  <PriorityIcon className="mr-1 h-3 w-3" />
                  {suggestion.priority}
                </Badge>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {suggestion.message}
              </p>
            </div>
          </div>

          {/* Personalization info */}
          <div className="mb-3 rounded-lg bg-muted/50 p-3">
            <div className="flex items-start space-x-2">
              <Brain className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  AI Insight:
                </p>
                <p className="text-xs text-muted-foreground">
                  Relevance:{' '}
                  {Math.round(suggestion.personalization.relevanceScore * 100)}%
                </p>
                {suggestion.personalization.behaviorTriggers.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestion.personalization.behaviorTriggers
                      .slice(0, 2)
                      .map((trigger, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs"
                        >
                          {trigger}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() =>
                  handleSuggestionInteraction(suggestion, 'clicked')
                }
                className="relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  {suggestion.actionType === 'navigate' && (
                    <ArrowRight className="mr-2 h-3 w-3" />
                  )}
                  {suggestion.actionType === 'show_content' && (
                    <Eye className="mr-2 h-3 w-3" />
                  )}
                  {suggestion.actionType === 'start_session' && (
                    <Play className="mr-2 h-3 w-3" />
                  )}
                  {suggestion.actionType === 'reminder' && (
                    <Bell className="mr-2 h-3 w-3" />
                  )}
                  {suggestion.actionType === 'notification' && (
                    <MessageSquare className="mr-2 h-3 w-3" />
                  )}
                  {getActionLabel(suggestion.actionType)}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Save suggestion for later
                  toast({
                    title: 'Saved',
                    description: 'Suggestion saved for later',
                  });
                }}
              >
                <Bookmark className="h-3 w-3" />
              </Button>
            </div>

            {/* Feedback */}
            <div className="flex items-center space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-50 hover:text-green-600 hover:opacity-100"
                    onClick={() =>
                      handleSuggestionInteraction(
                        suggestion,
                        'dismissed',
                        'helpful'
                      )
                    }
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Helpful</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-50 hover:text-red-600 hover:opacity-100"
                    onClick={() =>
                      handleSuggestionInteraction(
                        suggestion,
                        'dismissed',
                        'not_helpful'
                      )
                    }
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Not helpful</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Timing info */}
          {(suggestion.timing.showDuration || settings.autoHide) && (
            <div className="mt-2 text-xs text-muted-foreground">
              <Progress
                value={100}
                className="mb-1 h-1"
                style={{
                  animation: `shrink ${suggestion.timing.showDuration || settings.hideDelay}ms linear forwards`,
                }}
              />
              Auto-hide in{' '}
              {Math.round(
                (suggestion.timing.showDuration || settings.hideDelay) / 1000
              )}
              s
            </div>
          )}
        </div>

        {/* Hover effect */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </motion.div>
    );
  };

  // Get action label
  const getActionLabel = (actionType: string): string => {
    switch (actionType) {
      case 'navigate':
        return 'Go';
      case 'show_content':
        return 'View';
      case 'start_session':
        return 'Start';
      case 'reminder':
        return 'Remind';
      case 'notification':
        return 'Notify';
      default:
        return 'Do it';
    }
  };

  // Render settings dialog
  const renderSettingsDialog = () => (
    <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Suggestion Settings</DialogTitle>
          <DialogDescription>
            Customize how AI suggestions are displayed and behave
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* General settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">General</h4>

            <div className="flex items-center justify-between">
              <label className="text-sm">Enable suggestions</label>
              <Switch
                checked={settings.enabled}
                onCheckedChange={checked =>
                  setSettings(prev => ({ ...prev, enabled: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Auto-hide suggestions</label>
              <Switch
                checked={settings.autoHide}
                onCheckedChange={checked =>
                  setSettings(prev => ({ ...prev, autoHide: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Play notification sound</label>
              <Switch
                checked={settings.playSound}
                onCheckedChange={checked =>
                  setSettings(prev => ({ ...prev, playSound: checked }))
                }
              />
            </div>
          </div>

          {/* Display settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Display</h4>

            <div className="flex items-center justify-between">
              <label className="text-sm">Show popups</label>
              <Switch
                checked={settings.showPopups}
                onCheckedChange={checked =>
                  setSettings(prev => ({ ...prev, showPopups: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Show toast notifications</label>
              <Switch
                checked={settings.showToasts}
                onCheckedChange={checked =>
                  setSettings(prev => ({ ...prev, showToasts: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Show banners</label>
              <Switch
                checked={settings.showBanners}
                onCheckedChange={checked =>
                  setSettings(prev => ({ ...prev, showBanners: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Maximum visible suggestions</label>
              <Slider
                value={[settings.maxVisible]}
                onValueChange={([value]) =>
                  setSettings(prev => ({ ...prev, maxVisible: value }))
                }
                max={10}
                min={1}
                step={1}
              />
              <div className="text-xs text-muted-foreground">
                Currently: {settings.maxVisible}
              </div>
            </div>

            {settings.autoHide && (
              <div className="space-y-2">
                <label className="text-sm">Auto-hide delay (seconds)</label>
                <Slider
                  value={[settings.hideDelay / 1000]}
                  onValueChange={([value]) =>
                    setSettings(prev => ({ ...prev, hideDelay: value * 1000 }))
                  }
                  max={30}
                  min={1}
                  step={1}
                />
                <div className="text-xs text-muted-foreground">
                  Currently: {settings.hideDelay / 1000}s
                </div>
              </div>
            )}
          </div>

          {/* Priority filters */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Priority Levels</h4>

            {Object.entries(settings.priority).map(([priority, enabled]) => (
              <div key={priority} className="flex items-center justify-between">
                <label className="text-sm capitalize">{priority}</label>
                <Switch
                  checked={enabled}
                  onCheckedChange={checked =>
                    setSettings(prev => ({
                      ...prev,
                      priority: { ...prev.priority, [priority]: checked },
                    }))
                  }
                />
              </div>
            ))}
          </div>

          {/* Type filters */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Suggestion Types</h4>

            {Object.entries(settings.types).map(([type, enabled]) => (
              <div key={type} className="flex items-center justify-between">
                <label className="text-sm capitalize">
                  {type.replace('_', ' ')}
                </label>
                <Switch
                  checked={enabled}
                  onCheckedChange={checked =>
                    setSettings(prev => ({
                      ...prev,
                      types: { ...prev.types, [type]: checked },
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (!settings.enabled || isLoading) {
    return null;
  }

  const visibleSuggestionItems = filteredSuggestions.filter(
    s =>
      visibleSuggestions.has(s.id) &&
      (s.displayMode === 'popup' || s.displayMode === 'banner')
  );

  return (
    <TooltipProvider>
      <div className={cn('fixed z-50', getPositionClasses(), className)}>
        {/* Minimized state */}
        {isMinimized ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative"
          >
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 rounded-full border-2 bg-background/95 shadow-lg backdrop-blur-sm"
              onClick={() => setIsMinimized(false)}
            >
              <div className="relative">
                <Sparkles className="h-4 w-4" />
                {visibleSuggestionItems.length > 0 && (
                  <div className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {visibleSuggestionItems.length}
                  </div>
                )}
              </div>
            </Button>
          </motion.div>
        ) : (
          /* Expanded state */
          <div className="w-full max-w-sm space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-1">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-medium">Smart Suggestions</span>
                {visibleSuggestionItems.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {visibleSuggestionItems.length}
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-1">
                {showSettings && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setShowSettingsDialog(true)}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Settings</TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setIsMinimized(true)}
                    >
                      <Minimize2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Minimize</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Suggestions */}
            <AnimatePresence mode="popLayout">
              {visibleSuggestionItems.length > 0 ? (
                <div className="space-y-3">
                  {visibleSuggestionItems.map(renderSuggestionCard)}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-6 text-center text-muted-foreground"
                >
                  <Brain className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm">No suggestions right now</p>
                  <p className="text-xs">
                    Keep learning and I'll help you optimize!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Settings dialog */}
        {renderSettingsDialog()}
      </div>

      {/* Custom CSS for progress animation */}
      <style jsx>{`
        @keyframes shrink {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
    </TooltipProvider>
  );
};
