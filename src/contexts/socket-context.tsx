'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG, SOCKET_EVENTS } from '@/lib/constants/constants';
import { useAuth } from './auth-context';
import { toast } from 'sonner';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  error: string | null;

  connect: () => void;
  disconnect: () => void;

  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (data: any) => void) => () => void;
  off: (event: string, callback?: (data: any) => void) => void;

  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;

  sendMessage: (roomId: string, message: string, type?: string) => void;

  isConnected: () => boolean;
  getSocketId: () => string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean;
  namespace?: string;
}

export function SocketProvider({
  children,
  autoConnect = true,
  namespace = '/',
}: SocketProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const maxReconnectAttempts = 5;
  const reconnectDelay = 1000;

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;
    if (!isAuthenticated || !user?.id) return;

    try {
      const socket = io(`${API_CONFIG.socketURL}${namespace}`, {
        auth: {
          userId: user.id,
          userType: user.userType,
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: false,
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: reconnectDelay,
      });

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        setConnected(true);
        setError(null);
        setReconnectAttempts(0);
      });

      socket.on('disconnect', reason => {
        console.log('Socket disconnected:', reason);
        setConnected(false);

        if (reason === 'io server disconnect') {
          // Server initiated disconnect, reconnect manually
          socket.connect();
        }
      });

      socket.on('connect_error', err => {
        console.error('Socket connection error:', err.message);
        setError(err.message);
        setReconnectAttempts(prev => prev + 1);

        if (reconnectAttempts >= maxReconnectAttempts) {
          toast.error(
            'Connection failed. Please check your internet connection.'
          );
        }
      });

      socket.on('reconnect', attemptNumber => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        setConnected(true);
        setError(null);
        setReconnectAttempts(0);
        toast.success('Connection restored');
      });

      socket.on('reconnect_error', err => {
        console.error('Socket reconnection error:', err.message);
        setError(err.message);
      });

      socket.on('reconnect_failed', () => {
        console.error('Socket reconnection failed');
        setError('Reconnection failed');
        toast.error('Unable to reconnect. Please refresh the page.');
      });

      socket.on('auth_error', err => {
        console.error('Socket authentication error:', err);
        setError('Authentication failed');
        toast.error('Authentication failed. Please login again.');
      });

      socketRef.current = socket;
    } catch (err) {
      console.error('Failed to create socket connection:', err);
      setError('Failed to initialize connection');
    }
  }, [isAuthenticated, user, namespace, reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
      setError(null);
    }
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);

      return () => {
        socketRef.current?.off(event, callback);
      };
    }
    return () => {};
  }, []);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  const joinRoom = useCallback(
    (roomId: string) => {
      emit(SOCKET_EVENTS.JOIN_ROOM, { roomId });
    },
    [emit]
  );

  const leaveRoom = useCallback(
    (roomId: string) => {
      emit(SOCKET_EVENTS.LEAVE_ROOM, { roomId });
    },
    [emit]
  );

  const sendMessage = useCallback(
    (roomId: string, message: string, type = 'text') => {
      emit(SOCKET_EVENTS.NEW_MESSAGE, {
        roomId,
        content: message,
        messageType: type,
        timestamp: new Date().toISOString(),
      });
    },
    [emit]
  );

  const isConnected = useCallback(() => {
    return socketRef.current?.connected || false;
  }, []);

  const getSocketId = useCallback(() => {
    return socketRef.current?.id || null;
  }, []);

  useEffect(() => {
    if (isAuthenticated && user && autoConnect) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user, autoConnect, connect, disconnect]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const contextValue: SocketContextType = {
    socket: socketRef.current,
    connected,
    error,

    connect,
    disconnect,

    emit,
    on,
    off,

    joinRoom,
    leaveRoom,

    sendMessage,

    isConnected,
    getSocketId,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export function useSocketEvent(
  event: string,
  callback: (data: any) => void,
  deps: any[] = []
) {
  const { on } = useSocket();

  useEffect(() => {
    const unsubscribe = on(event, callback);
    return unsubscribe;
  }, [event, on, ...deps]);
}

export function useRoomConnection(roomId: string | null) {
  const { joinRoom, leaveRoom, connected } = useSocket();

  useEffect(() => {
    if (connected && roomId) {
      joinRoom(roomId);

      return () => {
        leaveRoom(roomId);
      };
    }

    return () => {};
  }, [connected, roomId, joinRoom, leaveRoom]);

  return { connected };
}
