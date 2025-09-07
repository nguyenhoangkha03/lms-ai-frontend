'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/use-auth';
import { AdvancedTokenManager } from '@/lib/auth/token-manager';

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

interface ChatSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (
    roomId: string,
    content: string,
    messageType?: 'text' | 'image' | 'file'
  ) => void;
  startTyping: (roomId: string) => void;
  stopTyping: (roomId: string) => void;
  markMessageAsRead: (messageId: string, roomId: string) => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler?: (...args: any[]) => void) => void;
}

const ChatSocketContext = createContext<ChatSocketContextType | undefined>(
  undefined
);

export function ChatSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  const token = AdvancedTokenManager.getAccessToken();

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to be ready
    if (!isAuthenticated || !user || !token) {
      return;
    }

    // Add small delay to ensure token is stable
    const timer = setTimeout(() => {
      // Try different WebSocket URL formats
      const baseUrl =
        process.env.NEXT_PUBLIC_WS_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        'http://localhost:3001';
      const wsUrl = baseUrl + '/chat';

      const socket = io(wsUrl, {
        auth: {
          token,
        },
        transports: ['polling', 'websocket'], // Polling trước, sau đó upgrade lên WebSocket
        upgrade: true,
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        setIsConnected(true);
        setConnectionError(null);
      });

      socket.on('disconnect', reason => {
        setIsConnected(false);
      });

      socket.on('connect_error', error => {
        setConnectionError(error.message);
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      if (socketRef.current) {
        socketRef.current.disconnect();
        setIsConnected(false);
        socketRef.current = null;
      }
    };
  }, [user, token, isAuthenticated]);

  const joinRoom = (roomId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_room', { roomId });
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_room', { roomId });
    }
  };

  const sendMessage = (
    roomId: string,
    content: string,
    messageType: 'text' | 'image' | 'file' = 'text'
  ) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', {
        roomId,
        content,
        type: messageType,
      });
    }
  };

  const startTyping = (roomId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_start', { roomId });
    }
  };

  const stopTyping = (roomId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_stop', { roomId });
    }
  };

  const markMessageAsRead = (messageId: string, roomId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_messages_read', {
        messageIds: [messageId],
        roomId,
      });
    }
  };

  const on = (event: string, handler: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  };

  const off = (event: string, handler?: (...args: any[]) => void) => {
    if (socketRef.current) {
      if (handler) {
        socketRef.current.off(event, handler);
      } else {
        socketRef.current.off(event);
      }
    }
  };

  return (
    <ChatSocketContext.Provider
      value={{
        socket: socketRef.current,
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
      }}
    >
      {children}
    </ChatSocketContext.Provider>
  );
}

export function useChatSocketContext() {
  const context = useContext(ChatSocketContext);
  if (context === undefined) {
    throw new Error(
      'useChatSocketContext must be used within a ChatSocketProvider'
    );
  }
  return context;
}
