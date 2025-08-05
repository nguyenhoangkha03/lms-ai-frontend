'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Settings,
  Minimize2,
  X,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw,
  Lightbulb,
  Target,
  Brain,
  MessageSquare,
  Volume2,
  VolumeX,
  MoreVertical,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import {
  useCreateConversationMutation,
  useGetConversationQuery,
  useSendMessageMutation,
  useAskTutorQuestionMutation,
  useRequestHintMutation,
  useCreateTutoringSessionMutation,
  useGetTutoringSessionQuery,
  useEndTutoringSessionMutation,
} from '@/lib/redux/api/intelligent-tutoring-api';
import { type ChatbotMessage } from '@/lib/types/intelligent-tutoring';
import { useAuth } from '@/hooks/use-auth';

interface AITutorInterfaceProps {
  mode?: 'adaptive' | 'guided' | 'exploratory' | 'assessment';
  courseId?: string;
  lessonId?: string;
  isMinimized?: boolean;
  onToggleMinimized?: () => void;
  onClose?: () => void;
  className?: string;
  showVoiceControls?: boolean;
  showSettings?: boolean;
}

export function AITutorInterface({
  mode = 'adaptive',
  courseId,
  lessonId,
  isMinimized = false,
  onToggleMinimized,
  onClose,
  className = '',
  showVoiceControls = true,
  showSettings = true,
}: AITutorInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // State management
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Settings state
  const [tutorSettings, setTutorSettings] = useState({
    autoSpeak: false,
    voiceSpeed: 1,
    difficulty: 'medium',
    helpfulness: 'balanced',
    enableHints: true,
    enableExplanations: true,
    contextAware: true,
  });

  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const speechRecognition = useRef<any>(null);

  // API hooks
  const [createConversation] = useCreateConversationMutation();
  const [sendMessage, { isLoading: isSendingMessage }] =
    useSendMessageMutation();
  const [askTutorQuestion] = useAskTutorQuestionMutation();
  const [requestHint] = useRequestHintMutation();
  const [createTutoringSession] = useCreateTutoringSessionMutation();
  const [endTutoringSession] = useEndTutoringSessionMutation();

  const { data: conversationData, refetch: refetchConversation } =
    useGetConversationQuery(conversationId!, {
      skip: !conversationId,
      pollingInterval: 2000, // Poll every 2 seconds for new messages
    });

  const { data: sessionData } = useGetTutoringSessionQuery(sessionId!, {
    skip: !sessionId,
  });

  // Initialize conversation and session
  useEffect(() => {
    initializeTutorSession();
  }, [mode, courseId, lessonId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [conversationData?.messages]);

  // Initialize speech recognition if available
  useEffect(() => {
    if (showVoiceControls && 'webkitSpeechRecognition' in window) {
      speechRecognition.current = new (window as any).webkitSpeechRecognition();
      speechRecognition.current.continuous = false;
      speechRecognition.current.interimResults = false;
      speechRecognition.current.lang = 'en-US';

      speechRecognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      speechRecognition.current.onerror = () => {
        setIsListening(false);
        toast({
          title: 'Voice Recognition Error',
          description: 'Unable to recognize speech. Please try again.',
          variant: 'destructive',
        });
      };

      speechRecognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [showVoiceControls]);

  const initializeTutorSession = async () => {
    try {
      // Create a new conversation
      const conversationResult = await createConversation({
        courseId,
        conversationType: 'academic_help',
        context: {
          currentCourse: courseId,
          currentLesson: lessonId,
          mode,
        },
      }).unwrap();

      setConversationId(conversationResult.id);

      // Create a tutoring session
      const sessionResult = await createTutoringSession({
        mode,
        context: {
          currentCourse: courseId,
          currentLesson: lessonId,
          difficulty:
            tutorSettings.difficulty === 'easy'
              ? 1
              : tutorSettings.difficulty === 'hard'
                ? 3
                : 2,
          learningObjectives: [],
        },
      }).unwrap();

      setSessionId(sessionResult.id);

      // Send welcome message
      await sendWelcomeMessage(conversationResult.id);
    } catch (error) {
      console.error('Failed to initialize tutor session:', error);
      toast({
        title: 'Connection Error',
        description: 'Unable to connect to AI tutor. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const sendWelcomeMessage = async (convId: string) => {
    const welcomeMessage = getWelcomeMessage();

    try {
      await sendMessage({
        conversationId: convId,
        content: welcomeMessage,
        messageType: 'text',
      }).unwrap();
    } catch (error) {
      console.error('Failed to send welcome message:', error);
    }
  };

  const getWelcomeMessage = () => {
    const modeMessages = {
      adaptive:
        "Hi! I'm your AI tutor. I'll adapt to your learning style and pace. What would you like to learn about today?",
      guided:
        "Welcome! I'll guide you through your lessons step by step. Let's start with your current topic.",
      exploratory:
        "Hello! I'm here to help you explore new concepts. Ask me anything you're curious about!",
      assessment:
        "Hi! I'll help you prepare for assessments and review key concepts. What topic should we focus on?",
    };

    return modeMessages[mode] || modeMessages.adaptive;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId || isSendingMessage) return;

    const userMessage = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Send user message
      await sendMessage({
        conversationId,
        content: userMessage,
        messageType: 'text',
      }).unwrap();

      // Get AI response
      const response = await askTutorQuestion({
        question: userMessage,
        context: {
          courseId,
          lessonId,
          difficulty:
            tutorSettings.difficulty === 'easy'
              ? 1
              : tutorSettings.difficulty === 'hard'
                ? 3
                : 2,
        },
      }).unwrap();

      // Speak response if auto-speak is enabled
      if (tutorSettings.autoSpeak && response.content) {
        speakText(response.content);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Message Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = () => {
    if (!speechRecognition.current) {
      toast({
        title: 'Voice Not Supported',
        description: 'Voice recognition is not supported in your browser.',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      speechRecognition.current.stop();
      setIsListening(false);
    } else {
      speechRecognition.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = tutorSettings.voiceSpeed;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleRequestHint = async () => {
    if (!conversationId) return;

    try {
      const hint = await requestHint({
        context: `Course: ${courseId}, Lesson: ${lessonId}`,
        studentLevel:
          tutorSettings.difficulty === 'easy'
            ? 1
            : tutorSettings.difficulty === 'hard'
              ? 3
              : 2,
      }).unwrap();

      await sendMessage({
        conversationId,
        content: `💡 **Hint:** ${hint.hintText}`,
        messageType: 'text',
      }).unwrap();
    } catch (error) {
      console.error('Failed to get hint:', error);
      toast({
        title: 'Hint Error',
        description: 'Unable to get hint. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied!',
      description: 'Message copied to clipboard.',
    });
  };

  const handleRateMessage = async (
    messageId: string,
    rating: 'positive' | 'negative'
  ) => {
    // In a real implementation, this would call an API to rate the message
    toast({
      title: 'Thank you!',
      description: 'Your feedback helps improve the AI tutor.',
    });
  };

  const handleEndSession = async () => {
    if (sessionId) {
      try {
        await endTutoringSession({
          sessionId,
          feedback: {
            satisfaction: 5, // This could be collected from user
            helpful: true,
          },
        }).unwrap();

        toast({
          title: 'Session Ended',
          description: 'Your tutoring session has been saved.',
        });

        if (onClose) {
          onClose();
        }
      } catch (error) {
        console.error('Failed to end session:', error);
      }
    }
  };

  const renderMessage = (message: ChatbotMessage) => {
    const isUser = message.sender === 'user';
    const isSystem = message.sender === 'system';

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'flex gap-3 p-4',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {!isUser && (
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-blue-500 text-white">
            <Bot className="h-4 w-4" />
          </div>
        )}

        <div
          className={cn(
            'max-w-[80%] rounded-lg px-3 py-2',
            isUser
              ? 'bg-blue-500 text-white'
              : isSystem
                ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                : 'bg-gray-100 dark:bg-gray-800'
          )}
        >
          <div className="text-sm">{message.content}</div>

          {message.aiMetadata?.sources &&
            message.aiMetadata.sources.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {message.aiMetadata.sources.map((source, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {source}
                  </Badge>
                ))}
              </div>
            )}

          {message.educationalContent?.concepts && (
            <div className="mt-2">
              <p className="text-xs font-medium">Key Concepts:</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {message.educationalContent.concepts.map((concept, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {concept}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {!isUser && !isSystem && (
            <div className="mt-2 flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyMessage(message.content)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy message</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRateMessage(message.id, 'positive')}
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Helpful</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRateMessage(message.id, 'negative')}
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Not helpful</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {tutorSettings.autoSpeak && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => speakText(message.content)}
                      >
                        <Volume2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Speak message</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}

          <div className="mt-1 text-xs text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>

        {isUser && (
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-gray-500 text-white">
            {user?.displayName?.charAt(0) || 'U'}
          </div>
        )}
      </motion.div>
    );
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn('fixed bottom-4 right-4 z-50', className)}
      >
        <Button
          onClick={onToggleMinimized}
          className="h-12 w-12 rounded-full shadow-lg"
          size="sm"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'fixed bottom-4 right-4 z-50 h-[600px] w-96 shadow-xl',
        className
      )}
    >
      <Card className="flex h-full flex-col">
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-500" />
              <div>
                <CardTitle className="text-sm">AI Tutor</CardTitle>
                <CardDescription className="text-xs capitalize">
                  {mode} mode
                  {sessionData && (
                    <>
                      {' '}
                      • {Math.round(sessionData.sessionMetrics.duration / 60)}
                      min
                    </>
                  )}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {sessionData && (
                <Badge variant="outline" className="text-xs">
                  Session Active
                </Badge>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleRequestHint}>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Get Hint
                  </DropdownMenuItem>
                  {showSettings && (
                    <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleEndSession}>
                    <X className="mr-2 h-4 w-4" />
                    End Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {onToggleMinimized && (
                <Button variant="ghost" size="sm" onClick={onToggleMinimized}>
                  <Minimize2 className="h-4 w-4" />
                </Button>
              )}

              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Session Insights */}
          {sessionData && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                Understanding:{' '}
                {Math.round(sessionData.insights.understandingLevel * 100)}%
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                Engagement:{' '}
                {Math.round(sessionData.insights.engagementLevel * 100)}%
              </div>
            </div>
          )}
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {conversationData?.messages?.map(renderMessage)}

              {isTyping && (
                <div className="flex gap-3 p-4">
                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-blue-500 text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 dark:bg-gray-800">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                disabled={isSendingMessage}
                className="pr-20"
              />

              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                {showVoiceControls && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleVoiceInput}
                          className={cn(
                            'h-6 w-6 p-0',
                            isListening && 'text-red-500'
                          )}
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
                  </TooltipProvider>
                )}

                {isSpeaking && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={stopSpeaking}
                          className="h-6 w-6 p-0 text-blue-500"
                        >
                          <VolumeX className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Stop speaking</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isSendingMessage}
              size="sm"
            >
              {isSendingMessage ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRequestHint}
              className="text-xs"
            >
              <Lightbulb className="mr-1 h-3 w-3" />
              Hint
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue('Can you explain this concept?')}
              className="text-xs"
            >
              <MessageSquare className="mr-1 h-3 w-3" />
              Explain
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setInputValue('Can you give me practice problems?')
              }
              className="text-xs"
            >
              <Target className="mr-1 h-3 w-3" />
              Practice
            </Button>
          </div>
        </div>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Tutor Settings</DialogTitle>
            <DialogDescription>
              Customize your tutoring experience
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-speak">Auto-speak responses</Label>
              <Switch
                id="auto-speak"
                checked={tutorSettings.autoSpeak}
                onCheckedChange={checked =>
                  setTutorSettings(prev => ({ ...prev, autoSpeak: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Voice Speed</Label>
              <Select
                value={tutorSettings.voiceSpeed.toString()}
                onValueChange={value =>
                  setTutorSettings(prev => ({
                    ...prev,
                    voiceSpeed: parseFloat(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">Slow</SelectItem>
                  <SelectItem value="1">Normal</SelectItem>
                  <SelectItem value="1.5">Fast</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <Select
                value={tutorSettings.difficulty}
                onValueChange={value =>
                  setTutorSettings(prev => ({ ...prev, difficulty: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tutoring Style</Label>
              <Select
                value={tutorSettings.helpfulness}
                onValueChange={value =>
                  setTutorSettings(prev => ({ ...prev, helpfulness: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gentle">Gentle & Encouraging</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="direct">Direct & Efficient</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="enable-hints">Enable hints</Label>
              <Switch
                id="enable-hints"
                checked={tutorSettings.enableHints}
                onCheckedChange={checked =>
                  setTutorSettings(prev => ({ ...prev, enableHints: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="context-aware">Context-aware responses</Label>
              <Switch
                id="context-aware"
                checked={tutorSettings.contextAware}
                onCheckedChange={checked =>
                  setTutorSettings(prev => ({ ...prev, contextAware: checked }))
                }
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default AITutorInterface;
