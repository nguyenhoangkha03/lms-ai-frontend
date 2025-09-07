'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isEdited: boolean;
  replyToId?: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatSocketEvents {
  new_message: (message: ChatMessage) => void;
  'message:updated': (message: ChatMessage) => void;
  'message:deleted': (messageId: string, roomId: string) => void;
  'room:joined': (roomId: string) => void;
  'room:left': (roomId: string) => void;
  'user:typing': (data: {
    userId: string;
    userName: string;
    roomId: string;
  }) => void;
  'user:stopped-typing': (data: { userId: string; roomId: string }) => void;
  'user:online': (userId: string) => void;
  'user:offline': (userId: string) => void;
}

export const useChatSocket = () => {
  const { user, token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Event handlers
  const eventHandlers = useRef<Partial<ChatSocketEvents>>({});

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    // Initialize socket connection
    console.log('🔑 Connecting with token:', token ? 'Present' : 'Missing');
    const socket = io(
      (process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001') + '/chat',
      {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        upgrade: true,
      }
    );

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      console.log('Chat socket connected');
    });

    socket.on('disconnect', reason => {
      setIsConnected(false);
      console.log('Chat socket disconnected:', reason);

      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        socket.connect();
      }
    });

    socket.on('connect_error', error => {
      setConnectionError(error.message);
      console.error('🚨 Chat socket connection error:', error);
      console.error('🚨 Error details:', {
        message: error.message,
        description: error.description,
        type: error.type,
        data: error.data
      });
    });

    // Set up event listeners for chat events
    Object.entries(eventHandlers.current).forEach(([event, handler]) => {
      if (handler) {
        socket.on(event, handler);
      }
    });

    return () => {
      socket.disconnect();
      setIsConnected(false);
    };
  }, [user, token]);

  // Join room
  const joinRoom = (roomId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('room:join', { roomId });
    }
  };

  // Leave room
  const leaveRoom = (roomId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('room:leave', { roomId });
    }
  };

  // Send message
  const sendMessage = (
    roomId: string,
    content: string,
    messageType: 'text' | 'image' | 'file' = 'text'
  ) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('message:send', {
        roomId,
        content,
        messageType,
      });
    }
  };

  // Start typing
  const startTyping = (roomId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('user:start-typing', { roomId });
    }
  };

  // Stop typing
  const stopTyping = (roomId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('user:stop-typing', { roomId });
    }
  };

  // Mark message as read
  const markMessageAsRead = (messageId: string, roomId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('message:read', { messageId, roomId });
    }
  };

  // Subscribe to events
  const on = <K extends keyof ChatSocketEvents>(
    event: K,
    handler: ChatSocketEvents[K]
  ) => {
    eventHandlers.current[event] = handler;

    if (socketRef.current?.connected) {
      socketRef.current.on(event, handler);
    }
  };

  // Unsubscribe from events
  const off = <K extends keyof ChatSocketEvents>(event: K) => {
    delete eventHandlers.current[event];

    if (socketRef.current?.connected) {
      socketRef.current.off(event);
    }
  };

  return {
    isConnected,
    connectionError,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    markMessageAsRead,
    on,
    off,
  };
};
