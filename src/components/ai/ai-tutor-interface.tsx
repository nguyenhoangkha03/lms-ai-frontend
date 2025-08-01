'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Brain,
  User,
  Bot,
  Lightbulb,
  HelpCircle,
  BookOpen,
  Target,
  Zap,
  Star,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  X,
  Minimize2,
  Maximize2,
  Settings,
  Download,
  Share2,
  Copy,
  Sparkles,
  Clock,
  MessageCircle,
  FileText,
  Paperclip,
  Smile,
  RotateCcw,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  useGetTutoringSessionsQuery,
  useCreateTutoringSessionMutation,
  useAskTutorQuestionMutation,
  useEndTutoringSessionMutation,
} from '@/lib/redux/api/ai-recommendation-api';
import {
  AITutoringSession,
  TutoringMessage,
} from '@/lib/types/ai-recommendation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const messageTypeIcons = {
  text: MessageCircle,
  question: HelpCircle,
  explanation: Lightbulb,
  hint: Target,
  encouragement: Star,
  correction: Zap,
  summary: FileText,
};

const messageTypeColors = {
  text: 'text-blue-600 bg-blue-100',
  question: 'text-purple-600 bg-purple-100',
  explanation: 'text-green-600 bg-green-100',
  hint: 'text-orange-600 bg-orange-100',
  encouragement: 'text-pink-600 bg-pink-100',
  correction: 'text-red-600 bg-red-100',
  summary: 'text-teal-600 bg-teal-100',
};

const modeIcons = {
  adaptive: Brain,
  guided: Target,
  exploratory: Lightbulb,
  assessment: FileText,
};

interface AITutorInterfaceProps {
  className?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  currentContext?: {
    courseId?: string;
    lessonId?: string;
    assessmentId?: string;
    topic?: string;
  };
  mode?: 'adaptive' | 'guided' | 'exploratory' | 'assessment';
  showVoiceControls?: boolean;
  showSettings?: boolean;
}

export const AITutorInterface: React.FC<AITutorInterfaceProps> = ({
  className,
  isMinimized = false,
  onToggleMinimize,
  currentContext,
  mode = 'adaptive',
  showVoiceControls = true,
}) => {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Local state
  const [currentMessage, setCurrentMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showSettings, setShowSettingsDialog] = useState(false);
  const [selectedMode, setSelectedMode] = useState(mode);
  const [sessionSettings, setSessionSettings] = useState({
    voiceEnabled: true,
    autoSpeak: false,
    personality: 'friendly',
    difficultyLevel: 'adaptive',
    responseLength: 'medium',
    includeExamples: true,
    showSteps: true,
    encouragement: true,
  });

  // API hooks
  const {
    data: sessions = [],
    isLoading: sessionsLoading,
    refetch: refetchSessions,
  } = useGetTutoringSessionsQuery({ status: 'active', limit: 1 });

  const [createSession] = useCreateTutoringSessionMutation();
  const [askQuestion] = useAskTutorQuestionMutation();
  const [endSession] = useEndTutoringSessionMutation();

  const currentSession = sessions[0] || null;
  const messages = currentSession?.messages || [];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus input when not minimized
  useEffect(() => {
    if (!isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMinimized]);

  // Create session if none exists
  useEffect(() => {
    if (!currentSession && !sessionsLoading) {
      handleCreateSession();
    }
  }, [currentSession, sessionsLoading]);

  // Handle create session
  const handleCreateSession = async () => {
    try {
      await createSession({
        mode: selectedMode,
        topic: currentContext?.topic,
        context: {
          currentCourse: currentContext?.courseId,
          currentLesson: currentContext?.lessonId,
          currentAssessment: currentContext?.assessmentId,
          difficulty: 0.5,
          learningObjectives: [],
        },
      });
      refetchSessions();
    } catch (error) {
      toast({
        title: 'Session Error',
        description: 'Failed to create tutoring session',
        variant: 'destructive',
      });
    }
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !currentSession) return;

    const messageText = currentMessage.trim();
    setCurrentMessage('');

    try {
      await askQuestion({
        question: messageText,
        context: {
          sessionId: currentSession.id,
          mode: selectedMode,
          userPreferences: sessionSettings,
        },
      });
      refetchSessions();
    } catch (error) {
      toast({
        title: 'Message Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  // Handle voice input
  const handleVoiceInput = () => {
    if (
      !('webkitSpeechRecognition' in window) &&
      !('SpeechRecognition' in window)
    ) {
      toast({
        title: 'Voice Not Supported',
        description: 'Voice input is not supported in this browser',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCurrentMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: 'Voice Recognition Error',
        description: 'Failed to recognize speech',
        variant: 'destructive',
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Handle text-to-speech
  const handleSpeak = (text: string) => {
    if (!sessionSettings.voiceEnabled) return;

    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  };

  // Handle message feedback
  const handleMessageFeedback = (
    messageId: string,
    feedback: 'positive' | 'negative'
  ) => {
    // Implement feedback API call
    toast({
      title: 'Thank you!',
      description: `Your ${feedback} feedback helps improve the AI tutor`,
    });
  };

  // Render message
  const renderMessage = (message: TutoringMessage, index: number) => {
    const isUser = message.role === 'student';
    const isSystem = message.role === 'system';
    const MessageIcon = messageTypeIcons[message.messageType] || MessageCircle;

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={cn(
          'flex gap-3 rounded-lg p-4',
          isUser ? 'ml-8 bg-primary/5' : 'mr-8 bg-muted/50',
          isSystem &&
            'mx-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
        )}
      >
        {/* Avatar */}
        <Avatar className={cn('h-8 w-8', isUser ? 'order-2' : 'order-1')}>
          {isUser ? (
            <>
              <AvatarImage src="" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </>
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
              <Bot className="h-4 w-4 text-white" />
            </AvatarFallback>
          )}
        </Avatar>

        {/* Message content */}
        <div className={cn('flex-1 space-y-2', isUser ? 'order-1' : 'order-2')}>
          {/* Message header */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {isUser ? 'You' : isSystem ? 'System' : 'AI Tutor'}
            </span>

            {!isUser && !isSystem && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  messageTypeColors[message.messageType] || 'bg-gray-100'
                )}
              >
                <MessageIcon className="mr-1 h-3 w-3" />
                {message.messageType}
              </Badge>
            )}

            <span className="text-xs text-muted-foreground">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>

          {/* Message text */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="mb-2 whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          </div>

          {/* Message metadata */}
          {message.metadata && (
            <div className="mt-3 space-y-2">
              {/* Confidence score */}
              {message.metadata.confidence && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Confidence:
                  </span>
                  <Progress
                    value={message.metadata.confidence * 100}
                    className="h-1 w-20"
                  />
                  <span className="text-xs text-muted-foreground">
                    {Math.round(message.metadata.confidence * 100)}%
                  </span>
                </div>
              )}

              {/* Related concepts */}
              {message.metadata.relatedConcepts &&
                message.metadata.relatedConcepts.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="mr-2 text-xs text-muted-foreground">
                      Related:
                    </span>
                    {message.metadata.relatedConcepts.map((concept, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                )}

              {/* References */}
              {message.metadata.references &&
                message.metadata.references.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">
                      References:
                    </span>
                    {message.metadata.references.map((ref, idx) => (
                      <div key={idx} className="text-xs">
                        <button
                          className="text-primary hover:underline"
                          onClick={() => window.open(ref, '_blank')}
                        >
                          {ref}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          {/* Message actions */}
          {!isUser && !isSystem && (
            <div className="flex items-center gap-2 pt-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleSpeak(message.content)}
                  >
                    {isSpeaking ? (
                      <VolumeX className="h-3 w-3" />
                    ) : (
                      <Volume2 className="h-3 w-3" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Read aloud</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() =>
                      navigator.clipboard.writeText(message.content)
                    }
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy message</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-4" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs hover:text-green-600"
                    onClick={() =>
                      handleMessageFeedback(message.id, 'positive')
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
                    className="h-6 px-2 text-xs hover:text-red-600"
                    onClick={() =>
                      handleMessageFeedback(message.id, 'negative')
                    }
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Not helpful</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Quick actions
  const quickActions = [
    {
      icon: HelpCircle,
      label: 'Ask for help',
      message:
        'I need help understanding this concept. Can you explain it in simple terms?',
    },
    {
      icon: Lightbulb,
      label: 'Get a hint',
      message: 'Can you give me a hint to solve this problem?',
    },
    {
      icon: Target,
      label: 'Explain step-by-step',
      message: 'Can you break this down into step-by-step instructions?',
    },
    {
      icon: BookOpen,
      label: 'More examples',
      message: 'Can you show me more examples of this concept?',
    },
    {
      icon: Star,
      label: 'Check my work',
      message: 'Can you review my answer and provide feedback?',
    },
    {
      icon: RotateCcw,
      label: 'Start over',
      message: 'Let me try a different approach. Can you help me start over?',
    },
  ];

  if (isMinimized) {
    return (
      <Card
        className={cn('fixed bottom-4 right-4 z-50 w-80 shadow-lg', className)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
                    <Bot className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
              </div>
              <div>
                <CardTitle className="text-sm">AI Tutor</CardTitle>
                <CardDescription className="text-xs">
                  {currentSession?.status === 'active'
                    ? 'Ready to help'
                    : 'Offline'}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onToggleMinimize}
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        {messages.length > 0 && (
          <CardContent className="pt-0">
            <div className="text-xs text-muted-foreground">
              Last message:{' '}
              {new Date(
                messages[messages.length - 1]?.timestamp
              ).toLocaleTimeString()}
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card
        className={cn('flex h-[600px] w-full max-w-4xl flex-col', className)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
                    <Bot className="h-5 w-5 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-green-500">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  AI Tutor 24/7
                  <Badge variant="secondary" className="text-xs">
                    {React.createElement(modeIcons[selectedMode], {
                      className: 'h-3 w-3 mr-1',
                    })}
                    {selectedMode}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {currentSession?.status === 'active'
                    ? `Active session • ${messages.length} messages`
                    : 'Starting new session...'}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Session insights */}
              {currentSession?.insights && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <Brain className="mr-1 h-3 w-3" />
                      Insights
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1 text-xs">
                      <div>
                        Understanding:{' '}
                        {Math.round(
                          currentSession.insights.understandingLevel * 100
                        )}
                        %
                      </div>
                      <div>
                        Engagement:{' '}
                        {Math.round(
                          currentSession.insights.engagementLevel * 100
                        )}
                        %
                      </div>
                      <div>
                        Confidence:{' '}
                        {Math.round(
                          currentSession.insights.confidenceLevel * 100
                        )}
                        %
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Settings */}
              {showSettings && (
                <Dialog
                  open={showSettings}
                  onOpenChange={setShowSettingsDialog}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tutor Settings</DialogTitle>
                      <DialogDescription>
                        Customize your AI tutoring experience
                      </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="preferences" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="preferences">
                          Preferences
                        </TabsTrigger>
                        <TabsTrigger value="voice">Voice</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                      </TabsList>

                      <TabsContent value="preferences" className="space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">
                              Show step-by-step solutions
                            </label>
                            <Switch
                              checked={sessionSettings.showSteps}
                              onCheckedChange={checked =>
                                setSessionSettings(prev => ({
                                  ...prev,
                                  showSteps: checked,
                                }))
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">
                              Include examples
                            </label>
                            <Switch
                              checked={sessionSettings.includeExamples}
                              onCheckedChange={checked =>
                                setSessionSettings(prev => ({
                                  ...prev,
                                  includeExamples: checked,
                                }))
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">
                              Encouragement messages
                            </label>
                            <Switch
                              checked={sessionSettings.encouragement}
                              onCheckedChange={checked =>
                                setSessionSettings(prev => ({
                                  ...prev,
                                  encouragement: checked,
                                }))
                              }
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="voice" className="space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">
                              Voice responses
                            </label>
                            <Switch
                              checked={sessionSettings.voiceEnabled}
                              onCheckedChange={checked =>
                                setSessionSettings(prev => ({
                                  ...prev,
                                  voiceEnabled: checked,
                                }))
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">
                              Auto-speak responses
                            </label>
                            <Switch
                              checked={sessionSettings.autoSpeak}
                              onCheckedChange={checked =>
                                setSessionSettings(prev => ({
                                  ...prev,
                                  autoSpeak: checked,
                                }))
                              }
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="advanced" className="space-y-4">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">
                              Response length
                            </label>
                            <select
                              className="mt-1 w-full rounded-md border p-2"
                              value={sessionSettings.responseLength}
                              onChange={e =>
                                setSessionSettings(prev => ({
                                  ...prev,
                                  responseLength: e.target.value as any,
                                }))
                              }
                            >
                              <option value="short">Short</option>
                              <option value="medium">Medium</option>
                              <option value="detailed">Detailed</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-sm font-medium">
                              Difficulty level
                            </label>
                            <select
                              className="mt-1 w-full rounded-md border p-2"
                              value={sessionSettings.difficultyLevel}
                              onChange={e =>
                                setSessionSettings(prev => ({
                                  ...prev,
                                  difficultyLevel: e.target.value as any,
                                }))
                              }
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                              <option value="adaptive">Adaptive</option>
                            </select>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              )}

              {/* More actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      // Export conversation
                      const conversation = messages.map(m => ({
                        role: m.role,
                        content: m.content,
                        timestamp: m.timestamp,
                      }));
                      const dataStr = JSON.stringify(conversation, null, 2);
                      const dataUri =
                        'data:application/json;charset=utf-8,' +
                        encodeURIComponent(dataStr);
                      const exportFileDefaultName = `tutor-conversation-${Date.now()}.json`;
                      const linkElement = document.createElement('a');
                      linkElement.setAttribute('href', dataUri);
                      linkElement.setAttribute(
                        'download',
                        exportFileDefaultName
                      );
                      linkElement.click();
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Conversation
                  </DropdownMenuItem>

                  <DropdownMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Session
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => {
                      if (currentSession) {
                        endSession(currentSession.id);
                        refetchSessions();
                      }
                    }}
                    className="text-red-600"
                  >
                    <X className="mr-2 h-4 w-4" />
                    End Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Minimize button */}
              {onToggleMinimize && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={onToggleMinimize}
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Session metrics */}
          {currentSession?.sessionMetrics && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.round(currentSession.sessionMetrics.duration / 60)}min
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {currentSession.sessionMetrics.messagesCount} messages
              </div>
              <div className="flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                {currentSession.sessionMetrics.questionsAsked} questions
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {currentSession.sessionMetrics.hintsProvided} hints
              </div>
            </div>
          )}
        </CardHeader>

        {/* Messages area */}
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full px-4">
            <div className="space-y-4 py-4">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-8 text-center"
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">
                    Welcome to AI Tutor!
                  </h3>
                  <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
                    I'm here to help you learn 24/7. Ask me anything about your
                    studies, request explanations, or get hints for problems
                    you're working on.
                  </p>

                  {/* Quick actions */}
                  <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
                    {quickActions.slice(0, 4).map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-auto justify-start p-3"
                        onClick={() => setCurrentMessage(action.message)}
                      >
                        <action.icon className="mr-2 h-4 w-4" />
                        <span className="text-xs">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {messages.map((message, index) =>
                    renderMessage(message, index)
                  )}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        {/* Input area */}
        <div className="border-t p-4">
          {/* Quick actions bar */}
          {messages.length > 0 && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 whitespace-nowrap"
                  onClick={() => setCurrentMessage(action.message)}
                >
                  <action.icon className="mr-1 h-3 w-3" />
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Message input */}
          <div className="flex items-end gap-2">
            <div className="relative flex-1">
              <Textarea
                ref={inputRef as any}
                value={currentMessage}
                onChange={e => setCurrentMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask me anything about your studies..."
                className="resize-none pr-20"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />

              {/* Input actions */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1">
                {showVoiceControls && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'h-6 w-6 p-0',
                          isListening && 'animate-pulse text-red-600'
                        )}
                        onClick={handleVoiceInput}
                      >
                        {isListening ? (
                          <MicOff className="h-3 w-3" />
                        ) : (
                          <Mic className="h-3 w-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isListening ? 'Stop listening' : 'Voice input'}
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setShowEmoji(!showEmoji)}
                    >
                      <Smile className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add emoji</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Paperclip className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Attach file</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim()}
              className="h-10 px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Status indicators */}
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              {isListening && (
                <div className="flex items-center gap-1 text-red-600">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
                  Listening...
                </div>
              )}

              {isSpeaking && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Volume2 className="h-3 w-3" />
                  Speaking...
                </div>
              )}

              {currentSession?.status === 'active' && (
                <div className="flex items-center gap-1 text-green-600">
                  <div className="h-2 w-2 rounded-full bg-green-600" />
                  AI Tutor online
                </div>
              )}
            </div>

            <div>Press Enter to send, Shift+Enter for new line</div>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
};
