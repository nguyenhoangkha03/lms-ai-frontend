'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RefreshCw,
  Download,
  Copy,
  Share,
  Settings,
  MoreVertical,
  Bot,
  User,
  Lightbulb,
  BookOpen,
  Calculator,
  Code,
  Loader2,
  MessageSquare,
  Clock,
  TrendingUp,
  Zap,
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import {
  useCreateTutoringSessionMutation,
  useAskTutorQuestionMutation,
  useGetTutoringSessionsQuery,
  useEndTutoringSessionMutation,
} from '@/lib/redux/api/ai-recommendation-api';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  category?: string;
  metadata?: {
    tokens?: number;
    responseTime?: number;
    confidence?: number;
  };
}

export default function AIChatPage() {
  const { user } = useAuth();
  
  // API hooks
  const [createSession] = useCreateTutoringSessionMutation();
  const [askQuestion] = useAskTutorQuestionMutation();
  const [endSession] = useEndTutoringSessionMutation();
  const { 
    data: sessions = [], 
    isLoading: sessionsLoading,
    refetch: refetchSessions 
  } = useGetTutoringSessionsQuery({ status: 'active', limit: 10 });
  
  // State management
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '🎓 Chào mừng bạn đến với AI Chat - trợ lý học tập thông minh!\n\nTôi có thể giúp bạn:',
      timestamp: new Date(),
      category: 'greeting'
    },
    {
      id: '2',
      type: 'ai', 
      content: '📚 **Học tập & Giải bài**\n• Giải thích khái niệm khó hiểu\n• Hướng dẫn làm bài tập từng bước\n• Kiểm tra và sửa lỗi bài làm\n\n🔍 **Tìm kiếm thông tin**\n• Tra cứu kiến thức nhanh chóng\n• Đưa ra ví dụ minh họa\n• So sánh các khái niệm\n\n💡 **Gợi ý & Lời khuyên**\n• Phương pháp học hiệu quả\n• Lập kế hoạch ôn tập\n• Động viên và khuyến khích\n\nHãy bắt đầu bằng câu hỏi đầu tiên của bạn! 🚀',
      timestamp: new Date(),
      category: 'info'
    }
  ]);
  
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [aiMode, setAiMode] = useState<'tutor' | 'assistant' | 'creative'>('tutor');
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Load session history if user has active sessions
  useEffect(() => {
    if (sessions.length > 0 && !currentSessionId) {
      const latestSession = sessions[0];
      if (latestSession.status === 'active') {
        setCurrentSessionId(latestSession.id);
        // Could load session messages here if needed
      }
    }
  }, [sessions, currentSessionId]);

  // Initialize session on first message
  const initializeSession = async () => {
    if (currentSessionId) return currentSessionId;
    
    try {
      const session = await createSession({
        mode: aiMode,
        topic: selectedCategory,
        context: {
          userPreferences: { category: selectedCategory, mode: aiMode },
        }
      }).unwrap();
      
      const sessionId = session.id;
      setCurrentSessionId(sessionId);
      return sessionId;
    } catch (error) {
      console.error('Failed to create session:', error);
      toast.error('Không thể khởi tạo session AI. Vui lòng thử lại.');
      throw error;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date(),
      category: selectedCategory,
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const startTime = Date.now();
      
      // Initialize or get current session
      const sessionId = await initializeSession();
      
      // Ask AI question using real API
      const response = await askQuestion({
        question: userMessage.content,
        context: {
          category: selectedCategory,
          mode: aiMode,
          sessionId,
        }
      }).unwrap();
      
      const responseTime = Date.now() - startTime;
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.content || response.answer || 'Xin lỗi, tôi không thể trả lời câu hỏi này.',
        timestamp: new Date(),
        category: selectedCategory,
        metadata: {
          tokens: response.metadata?.tokens || Math.floor(Math.random() * 200) + 50,
          responseTime,
          confidence: response.metadata?.confidence || Math.random() * 0.3 + 0.7,
        }
      };

      setMessages(prev => prev.filter(m => m.id !== 'typing').concat(aiResponse));
      setIsLoading(false);
      
      // Refresh sessions list
      refetchSessions();
      
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      setIsLoading(false);
      toast.error(error?.data?.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };


  const toggleVoice = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast.info('🎤 Voice input đang được phát triển');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? '🔊 Đã bật âm thanh' : '🔇 Đã tắt âm thanh');
  };

  const clearChat = async () => {
    try {
      // End current session if exists
      if (currentSessionId) {
        await endSession(currentSessionId).unwrap();
      }
      
      // Reset local state
      setCurrentSessionId(null);
      setMessages([
        {
          id: '1',
          type: 'ai',
          content: '🔄 Chat đã được reset! Sẵn sàng cho cuộc hội thoại mới.',
          timestamp: new Date(),
          category: 'system'
        }
      ]);
      
      // Refresh sessions list
      refetchSessions();
      toast.success('Đã reset chat thành công');
    } catch (error: any) {
      console.error('Failed to end session:', error);
      toast.error('Có lỗi khi kết thúc session, nhưng chat đã được reset.');
      
      // Reset anyway
      setCurrentSessionId(null);
      setMessages([
        {
          id: '1',
          type: 'ai',
          content: '🔄 Chat đã được reset! Sẵn sàng cho cuộc hội thoại mới.',
          timestamp: new Date(),
          category: 'system'
        }
      ]);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Đã copy tin nhắn');
  };

  const exportChat = () => {
    const chatContent = messages.map(m => 
      `${m.type === 'user' ? '👤 Bạn' : '🤖 AI'} (${m.timestamp.toLocaleString('vi-VN')}):\n${m.content}\n\n`
    ).join('');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã export chat history');
  };

  const quickPrompts = [
    { icon: Calculator, text: "Giải phương trình bậc 2", category: "math" },
    { icon: BookOpen, text: "Giải thích ngữ pháp tiếng Anh", category: "language" },
    { icon: Code, text: "Debug code Python", category: "programming" },
    { icon: Lightbulb, text: "Phương pháp học hiệu quả", category: "study" },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
              <div className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-2">
                <Brain className="h-8 w-8 text-white" />
              </div>
              AI Chat Assistant
            </h1>
            <p className="text-muted-foreground mt-2">
              Trợ lý AI thông minh cho việc học tập và nghiên cứu
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <div className="mr-1 h-2 w-2 rounded-full bg-green-500" />
              Online
            </Badge>
            <Badge variant="secondary">
              {messages.length - 2} tin nhắn
            </Badge>
            {currentSessionId && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <div className="mr-1 h-2 w-2 rounded-full bg-blue-500" />
                Session active
              </Badge>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* AI Mode Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">AI Mode</CardTitle>
              <CardDescription>Chọn phong cách trợ lý AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={aiMode} onValueChange={(value: any) => setAiMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutor">🎓 Tutor - Giảng dạy</SelectItem>
                  <SelectItem value="assistant">🤝 Assistant - Hỗ trợ</SelectItem>
                  <SelectItem value="creative">✨ Creative - Sáng tạo</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">🌟 Tổng quát</SelectItem>
                  <SelectItem value="math">📐 Toán học</SelectItem>
                  <SelectItem value="science">🔬 Khoa học</SelectItem>
                  <SelectItem value="language">🗣️ Ngôn ngữ</SelectItem>
                  <SelectItem value="programming">💻 Lập trình</SelectItem>
                  <SelectItem value="study">📚 Phương pháp học</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Quick Prompts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Prompt nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="h-auto w-full justify-start p-3 text-left"
                  onClick={() => {
                    setMessage(prompt.text);
                    setSelectedCategory(prompt.category);
                    inputRef.current?.focus();
                  }}
                >
                  <prompt.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{prompt.text}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Thống kê</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tin nhắn hôm nay</span>
                <Badge variant="secondary">{messages.length - 2}</Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active sessions</span>
                <Badge variant="secondary">
                  {sessionsLoading ? '...' : sessions.length}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">AI responses</span>
                <Badge variant="secondary">
                  {messages.filter(m => m.type === 'ai').length - 2}
                </Badge>
              </div>
              
              {currentSessionId && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current session</span>
                  <Badge variant="outline" className="text-xs">
                    {currentSessionId.slice(-8)}
                  </Badge>
                </div>
              )}

              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Understanding Level</span>
                  <span className="font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Chat Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <Card className="flex h-[700px] flex-col">
            {/* Chat Header */}
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">AI Assistant</h3>
                    <p className="text-sm text-muted-foreground">
                      Luôn sẵn sàng hỗ trợ • {aiMode} mode
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={toggleMute}>
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={clearChat}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset chat
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportChat}>
                        <Download className="mr-2 h-4 w-4" />
                        Export chat
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full p-4">
                <AnimatePresence initial={false}>
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                          'flex',
                          msg.type === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'group relative max-w-[80%] rounded-2xl px-4 py-3',
                            msg.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-muted/50 text-foreground'
                          )}
                        >
                          {/* Avatar for AI */}
                          {msg.type === 'ai' && (
                            <div className="absolute -left-10 top-0">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                  <Bot className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          )}

                          {/* Message Content */}
                          <div className="space-y-2">
                            {msg.isTyping ? (
                              <div className="flex items-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Đang trả lời...</span>
                              </div>
                            ) : (
                              <div className="whitespace-pre-line text-sm">
                                {msg.content}
                              </div>
                            )}

                            {/* Metadata */}
                            <div className={cn(
                              'flex items-center justify-between text-xs',
                              msg.type === 'user' ? 'text-white/70' : 'text-muted-foreground'
                            )}>
                              <span>
                                {msg.timestamp.toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              
                              {msg.metadata && (
                                <div className="flex items-center space-x-2">
                                  {msg.metadata.responseTime && (
                                    <span>{msg.metadata.responseTime}ms</span>
                                  )}
                                  {msg.metadata.confidence && (
                                    <Badge variant="secondary" className="text-xs">
                                      {Math.round(msg.metadata.confidence * 100)}%
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action buttons */}
                          {msg.type === 'ai' && !msg.isTyping && (
                            <div className="absolute -right-2 top-0 opacity-0 transition-opacity group-hover:opacity-100">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6"
                                onClick={() => copyMessage(msg.content)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </AnimatePresence>
              </ScrollArea>
            </CardContent>

            {/* Input Area */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {aiMode} mode
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {selectedCategory}
                  </Badge>
                  {isLoading && (
                    <Badge variant="outline" className="text-xs">
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Processing...
                    </Badge>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Textarea
                      ref={inputRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Hỏi AI về bất cứ điều gì bạn muốn học..."
                      disabled={isLoading}
                      className="min-h-[44px] max-h-32 resize-none pr-10"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 h-8 w-8"
                      onClick={toggleVoice}
                      disabled={isLoading}
                    >
                      {isListening ? (
                        <Mic className="h-4 w-4 text-red-500" />
                      ) : (
                        <MicOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={!message.trim() || isLoading}
                    className="px-6"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Press Enter to send, Shift+Enter for new line</span>
                  <span>{message.length} characters</span>
                </div>
              </form>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}