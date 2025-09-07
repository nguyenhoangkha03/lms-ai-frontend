'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Brain,
  X,
  Minimize2,
  Maximize2,
  Send,
  Bot,
  MicOff,
  RefreshCw,
  Loader2,
  Paperclip,
  ImageIcon,
  Sparkles,
  Zap,
  Cpu,
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  image?: string; // Base64 image data for display
}

interface AIChatFloatProps {
  className?: string;
  defaultMinimized?: boolean;
}

export function AIChatFloat({
  className,
  defaultMinimized = true,
}: AIChatFloatProps) {
  // Remove useAuth dependency if it's causing render issues
  // const { user } = useAuth();

  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(defaultMinimized);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content:
        '👋 Chào bạn! Tôi là AI Assistant của LMS. Tôi có thể giúp bạn với:',
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'ai',
      content:
        '• Giải đáp thắc mắc về bài học\n• Hướng dẫn sử dụng hệ thống\n• Đưa ra gợi ý học tập\n• Hỗ trợ làm bài tập\n\nHãy hỏi tôi bất cứ điều gì!',
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Image handling functions
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = e => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message.trim() || (selectedImage ? `Phân tích ảnh này` : ''),
      timestamp: new Date(),
      image: selectedImage ? imagePreview : undefined, // Save image for display
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message.trim();
    const currentImage = selectedImage;
    setMessage('');
    clearSelectedImage();
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
      // Call real AI API with or without image
      const aiResponseText = currentImage
        ? await callAIAPIWithImage(currentMessage, currentImage)
        : await callAIAPI(currentMessage);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponseText,
        timestamp: new Date(),
      };

      setMessages(prev =>
        prev.filter(m => m.id !== 'typing').concat(aiResponse)
      );
      
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      setIsLoading(false);
      toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };

  // Call Flask AI API
  const callAIAPI = async (
    userInput: string,
    conversationId?: string
  ): Promise<string> => {
    try {
      console.log('🔄 Calling AI API:', userInput);

      const response = await fetch('http://127.0.0.1:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          conversationId: conversationId || 'default',
        }),
      });

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 API Response data:', data);

      if (data.success) {
        return data.data.message;
      } else {
        console.error('AI API Error:', data.message || data.error);
        return `❌ Lỗi AI: ${data.message || data.error}`;
      }
    } catch (error) {
      console.error('Network error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError')
      ) {
        return '🔌 Lỗi kết nối mạng:\n• Kiểm tra Flask server: http://localhost:5000/health\n• Kiểm tra CORS configuration\n• Thử refresh trình duyệt';
      }

      return `🔌 Lỗi kết nối: ${errorMessage}\n\nGợi ý:\n• Server Flask có đang chạy không?\n• Kiểm tra console để xem lỗi chi tiết`;
    }
  };

  const callAIAPIWithImage = async (
    userInput: string,
    imageFile: File,
    conversationId?: string
  ): Promise<string> => {
    try {
      console.log('🔄 Calling AI API with image:', userInput, imageFile.name);

      // Convert image to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data:image/jpeg;base64, prefix
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const response = await fetch('http://127.0.0.1:5000/api/chat/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          message: userInput || 'Phân tích ảnh này',
          image: base64,
          mimeType: imageFile.type,
          conversationId: conversationId || 'default',
        }),
      });

      console.log('📡 Image API Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Image API Response data:', data);

      if (data.success) {
        return data.data.message;
      } else {
        console.error('AI Image API Error:', data.message || data.error);
        return `❌ Lỗi phân tích ảnh: ${data.message || data.error}`;
      }
    } catch (error) {
      console.error('Image API Network error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError')
      ) {
        return '🔌 Lỗi kết nối mạng khi gửi ảnh:\n• Kiểm tra Flask server: http://localhost:5000/health\n• Kiểm tra CORS configuration\n• Thử refresh trình duyệt';
      }

      return `🔌 Lỗi kết nối ảnh: ${errorMessage}`;
    }
  };




  const toggleVoice = () => {
    toast.info('Tính năng nhận diện giọng nói đang được phát triển');
  };






  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'ai',
        content:
          '🔄 Cuộc trò chuyện đã được làm mới. Tôi có thể giúp gì cho bạn?',
        timestamp: new Date(),
      },
    ]);
    toast.success('Đã làm mới cuộc trò chuyện');
  };

  if (!mounted) {
    return null;
  }

  const chatFloat = (
    <TooltipProvider>
      <div
        className="fixed bottom-6 right-6"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          pointerEvents: 'auto',
        }}
      >
        <AnimatePresence>
          {/* Chat Window - Redesigned with modern glassmorphism */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20, rotateX: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20, rotateX: 15 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="mb-4 w-[600px] max-w-[calc(100vw-2rem)]"
              style={{ zIndex: 60 }}
            >
              <div
                className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl"
                style={{ zIndex: 60 }}
              >
                {/* Animated background blobs */}
                <motion.div
                  className="absolute -right-20 -top-20 h-40 w-40 rounded-full"
                  style={{
                    background:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    opacity: 0.1,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                <motion.div
                  className="absolute -bottom-20 -left-20 h-32 w-32 rounded-full"
                  style={{
                    background:
                      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    opacity: 0.1,
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [360, 180, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Header - Redesigned with modern styling */}
                <div className="relative bg-gradient-to-r from-indigo-500/80 via-purple-500/80 to-pink-500/80 p-4 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />

                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Enhanced Avatar */}
                      <div className="relative">
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/20 shadow-lg backdrop-blur-sm"
                        >
                          <div className="relative">
                            <Sparkles className="h-6 w-6 text-white" />
                            <motion.div
                              animate={{
                                scale: [0.8, 1.2, 0.8],
                                opacity: [0.5, 1, 0.5],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                              className="absolute inset-0"
                            >
                              <Zap className="h-6 w-6 text-yellow-300" />
                            </motion.div>
                          </div>
                        </motion.div>
                        {/* Status indicator */}
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-400 shadow-md"
                        />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white">
                          AI Learning Assistant
                        </h3>
                        <p className="flex items-center gap-1 text-sm text-white/80">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="h-2 w-2 rounded-full bg-green-400"
                          />
                          Sẵn sàng hỗ trợ học tập
                        </p>
                      </div>
                    </div>

                    {/* Control buttons with enhanced styling */}
                    <div className="flex items-center space-x-1">

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-white/20 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/30"
                            onClick={() => setIsMinimized(!isMinimized)}
                          >
                            <motion.div
                              animate={{ rotate: isMinimized ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {isMinimized ? (
                                <Maximize2 className="h-4 w-4" />
                              ) : (
                                <Minimize2 className="h-4 w-4" />
                              )}
                            </motion.div>
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="left"
                          className="border-gray-700 bg-gray-900 text-white"
                        >
                          {isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-white/20 text-white backdrop-blur-sm transition-all duration-200 hover:bg-red-400/50"
                            onClick={() => setIsOpen(false)}
                          >
                            <X className="h-4 w-4" />
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="left"
                          className="border-gray-700 bg-gray-900 text-white"
                        >
                          Đóng chat
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                {/* Messages - Enhanced with glassmorphism */}
                {!isMinimized && (
                  <div className="relative bg-white/50 backdrop-blur-sm">
                    <div className="flex h-[400px] flex-col">
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                          {messages.map((msg, index) => (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 20, scale: 0.8 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{
                                delay: index * 0.1,
                                type: 'spring',
                              }}
                              className={cn(
                                'flex',
                                msg.type === 'user'
                                  ? 'justify-end'
                                  : 'justify-start'
                              )}
                            >
                              <div
                                className={cn(
                                  'relative max-w-[80%] overflow-hidden p-4 text-sm',
                                  msg.type === 'user'
                                    ? 'rounded-3xl rounded-tr-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                                    : 'rounded-3xl rounded-tl-lg border border-gray-200/50 bg-white/80 text-gray-800 shadow-lg backdrop-blur-sm'
                                )}
                              >
                                {/* Message glow effect */}
                                {msg.type === 'user' && (
                                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                                )}

                                {/* AI message icon */}
                                {msg.type === 'ai' && (
                                  <div className="absolute -left-1 -top-1">
                                    <div className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md">
                                      <Sparkles className="z-10 h-3 w-3 text-white" />
                                      <motion.div
                                        animate={{
                                          rotate: [0, 360],
                                          scale: [0.8, 1.2, 0.8],
                                        }}
                                        transition={{
                                          duration: 3,
                                          repeat: Infinity,
                                          ease: 'easeInOut',
                                        }}
                                        className="absolute inset-0 opacity-50"
                                      >
                                        <GraduationCap className="h-3 w-3 text-yellow-300" />
                                      </motion.div>
                                    </div>
                                  </div>
                                )}
                                {msg.isTyping ? (
                                  <div className="relative flex items-center space-x-2">
                                    {/* Enhanced typing animation */}
                                    <div className="flex space-x-1">
                                      <motion.div
                                        className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                        animate={{
                                          scale: [1, 1.3, 1],
                                          opacity: [0.5, 1, 0.5],
                                        }}
                                        transition={{
                                          duration: 1,
                                          repeat: Infinity,
                                          delay: 0,
                                        }}
                                      />
                                      <motion.div
                                        className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                                        animate={{
                                          scale: [1, 1.3, 1],
                                          opacity: [0.5, 1, 0.5],
                                        }}
                                        transition={{
                                          duration: 1,
                                          repeat: Infinity,
                                          delay: 0.2,
                                        }}
                                      />
                                      <motion.div
                                        className="h-2 w-2 rounded-full bg-gradient-to-r from-pink-500 to-red-500"
                                        animate={{
                                          scale: [1, 1.3, 1],
                                          opacity: [0.5, 1, 0.5],
                                        }}
                                        transition={{
                                          duration: 1,
                                          repeat: Infinity,
                                          delay: 0.4,
                                        }}
                                      />
                                    </div>
                                    <span className="font-medium text-gray-600">
                                      AI đang suy nghĩ...
                                    </span>
                                  </div>
                                ) : (
                                  <div className="relative">
                                    {/* Display image if user message has image */}
                                    {msg.type === 'user' && msg.image && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="relative mb-3"
                                      >
                                        <img
                                          src={msg.image}
                                          alt="Uploaded"
                                          className="max-h-48 max-w-full rounded-2xl border border-white/30 object-contain shadow-lg"
                                        />
                                        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent" />
                                      </motion.div>
                                    )}

                                    {/* Message content */}
                                    {msg.type === 'user' ? (
                                      <div className="relative z-10 font-medium text-white">
                                        {msg.content}
                                      </div>
                                    ) : (
                                      <div className="prose prose-sm relative z-10 max-w-none text-gray-800">
                                        <ReactMarkdown
                                          remarkPlugins={[remarkGfm]}
                                          components={{
                                            p: ({ children }) => (
                                              <p className="mb-2 leading-relaxed last:mb-0">
                                                {children}
                                              </p>
                                            ),
                                            ul: ({ children }) => (
                                              <ul className="mb-2 ml-4 list-disc space-y-1">
                                                {children}
                                              </ul>
                                            ),
                                            ol: ({ children }) => (
                                              <ol className="mb-2 ml-4 list-decimal space-y-1">
                                                {children}
                                              </ol>
                                            ),
                                            li: ({ children }) => (
                                              <li className="text-gray-700">
                                                {children}
                                              </li>
                                            ),
                                            strong: ({ children }) => (
                                              <strong className="font-bold text-gray-900">
                                                {children}
                                              </strong>
                                            ),
                                            code: ({ children }) => (
                                              <code className="rounded-lg bg-gray-100 px-2 py-1 font-mono text-sm text-indigo-700">
                                                {children}
                                              </code>
                                            ),
                                            pre: ({ children }) => (
                                              <pre className="overflow-x-auto rounded-xl bg-gray-800 p-4 text-green-400">
                                                {children}
                                              </pre>
                                            ),
                                          }}
                                        >
                                          {msg.content}
                                        </ReactMarkdown>
                                      </div>
                                    )}

                                    {/* Enhanced timestamp */}
                                    <div
                                      className={cn(
                                        'mt-2 flex items-center gap-1 text-xs',
                                        msg.type === 'user'
                                          ? 'justify-end text-white/70'
                                          : 'justify-start text-gray-400'
                                      )}
                                    >
                                      <div
                                        className={cn(
                                          'h-1 w-1 rounded-full',
                                          msg.type === 'user'
                                            ? 'bg-white/50'
                                            : 'bg-gray-400'
                                        )}
                                      />
                                      {msg.timestamp.toLocaleTimeString(
                                        'vi-VN',
                                        {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        }
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>

                      {/* Enhanced separator */}
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                      {/* Enhanced Input Area */}
                      <div className="bg-white/90 p-4 backdrop-blur-sm">
                        {/* Stats row */}
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={clearChat}
                              className="inline-flex items-center rounded-full border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-all duration-200 hover:from-red-100 hover:to-orange-100"
                            >
                              <RefreshCw className="mr-1 h-3 w-3" />
                              Làm mới
                            </motion.button>
                            <Badge
                              variant="secondary"
                              className="border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 px-2 py-1 text-xs font-medium text-blue-700"
                            >
                              💬 {messages.length - 1} tin nhắn
                            </Badge>
                          </div>

                          {/* AI status indicator */}
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="h-2 w-2 rounded-full bg-green-400"
                            />
                            <span className="font-medium">AI Online</span>
                          </div>
                        </div>

                        {/* Enhanced Image preview */}
                        {imagePreview && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -10 }}
                            className="relative mb-3"
                          >
                            <div className="rounded-2xl border border-blue-200/50 bg-gradient-to-r from-blue-50 to-purple-50 p-3 backdrop-blur-sm">
                              <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                                    <ImageIcon className="h-3 w-3 text-white" />
                                  </div>
                                  <span className="text-sm font-semibold text-blue-700">
                                    Ảnh đã chọn
                                  </span>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1, rotate: 90 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={clearSelectedImage}
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 transition-colors hover:bg-red-200"
                                >
                                  <X className="h-3 w-3 text-red-600" />
                                </motion.button>
                              </div>
                              <div className="relative">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="max-h-32 max-w-full rounded-xl object-contain shadow-md"
                                />
                                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-transparent" />
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Enhanced Input Form */}
                        <form
                          onSubmit={handleSendMessage}
                          className="flex space-x-3"
                        >
                          <div className="relative flex-1">
                            <div className="relative">
                              <input
                                ref={inputRef}
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="💭 Hỏi AI về bất cứ điều gì..."
                                disabled={isLoading}
                                className="w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 pr-24 text-gray-800 placeholder-gray-500 backdrop-blur-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              />

                              {/* Input action buttons */}
                              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 space-x-1">
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-purple-200 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 transition-all duration-200 hover:from-purple-200 hover:to-pink-200"
                                  onClick={() => fileInputRef.current?.click()}
                                  disabled={isLoading}
                                >
                                  <ImageIcon className="h-4 w-4" />
                                </motion.button>
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 transition-all duration-200 hover:from-gray-200 hover:to-gray-300"
                                  onClick={toggleVoice}
                                  disabled={isLoading}
                                  title="Tính năng giọng nói đang phát triển"
                                >
                                  <MicOff className="h-4 w-4" />
                                </motion.button>
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Send Button */}
                          <motion.button
                            type="submit"
                            disabled={
                              (!message.trim() && !selectedImage) || isLoading
                            }
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              'flex h-12 w-12 items-center justify-center rounded-2xl font-medium shadow-lg transition-all duration-200',
                              (!message.trim() && !selectedImage) || isLoading
                                ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-xl'
                            )}
                          >
                            {isLoading ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: 'linear',
                                }}
                              >
                                <Loader2 className="h-5 w-5" />
                              </motion.div>
                            ) : (
                              <Send className="h-5 w-5" />
                            )}
                          </motion.button>
                        </form>

                        {/* Hidden file input */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Floating Button - Ultra modern design */}
        <div className="relative">
          {/* Pulsing rings */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
            style={{ zIndex: 50 }}
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.2, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-600"
            style={{ zIndex: 50 }}
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{
                  scale: 1.1,
                  rotate: isOpen ? 0 : [0, -10, 10, 0],
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative h-16 w-16 overflow-hidden rounded-full shadow-2xl transition-all duration-300"
                style={{
                  zIndex: 51,
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                }}
              >
                {/* Glass overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />

                {/* Floating particles inside button */}
                <motion.div
                  animate={{
                    x: [0, 8, -8, 0],
                    y: [0, -8, 8, 0],
                    scale: [1, 1.2, 0.8, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute right-2 top-2 h-2 w-2 rounded-full bg-yellow-300 opacity-70"
                />
                <motion.div
                  animate={{
                    x: [0, -6, 6, 0],
                    y: [0, 6, -6, 0],
                    scale: [1, 0.8, 1.2, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                  }}
                  className="absolute bottom-3 left-3 h-1.5 w-1.5 rounded-full bg-pink-300 opacity-60"
                />

                {/* Main icon */}
                <div className="relative z-10 flex h-full w-full items-center justify-center">
                  <AnimatePresence mode="wait">
                    {isOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.3, type: 'spring' }}
                        className="flex items-center justify-center text-white"
                      >
                        <X className="h-7 w-7" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="open"
                        initial={{ rotate: 180, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: -180, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.3, type: 'spring' }}
                        className="flex items-center justify-center text-white"
                      >
                        <div className="relative">
                          {/* Main icon */}
                          <motion.div
                            animate={{
                              rotate: [0, 360],
                            }}
                            transition={{
                              duration: 8,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          >
                            <Cpu className="h-7 w-7 text-white" />
                          </motion.div>

                          {/* Overlaid sparkles */}
                          <motion.div
                            animate={{
                              scale: [0.8, 1.2, 0.8],
                              rotate: [0, -360],
                              opacity: [0.6, 1, 0.6],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                            className="absolute inset-0"
                          >
                            <Sparkles className="h-7 w-7 text-yellow-300" />
                          </motion.div>

                          {/* Learning cap indicator */}
                          <motion.div
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.3, 0.8, 0.3],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay: 1,
                            }}
                            className="absolute -right-1 -top-1"
                          >
                            <GraduationCap className="h-3 w-3 text-pink-300" />
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Enhanced notification badge */}
                {!isOpen && messages.length > 2 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    whileHover={{ scale: 1.1 }}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-red-500 to-pink-500 shadow-lg"
                    style={{ zIndex: 52 }}
                  >
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-xs font-bold text-white"
                    >
                      {messages.filter(m => m.type === 'ai').length - 1}
                    </motion.span>
                  </motion.div>
                )}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              className="border-gray-700 bg-gray-900 px-3 py-2 text-sm font-medium text-white"
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Cpu className="h-4 w-4 text-blue-400" />
                  <Sparkles className="absolute -right-0.5 -top-0.5 h-2 w-2 text-yellow-400" />
                </div>
                {isOpen
                  ? '🔒 Đóng AI Learning Assistant'
                  : '🚀 Mở AI Learning Assistant'}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );

  const content = chatFloat;

  return createPortal(content, document.documentElement);
}
