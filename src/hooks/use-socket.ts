import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG, SOCKET_EVENTS } from '@/lib/constants';
import { useAuth } from './use-auth';

interface UseSocketOptions {
  autoConnect?: boolean;
  namespace?: string;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { autoConnect = true, namespace = '/' } = options;
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = () => {
    if (socketRef.current?.connected) return;

    const socket = io(`${API_CONFIG.socketURL}${namespace}`, {
      auth: {
        userId: user?.id,
      },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setConnected(true);
      setError(null);
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('Socket disconnected');
    });

    socket.on('connect_error', err => {
      setError(err.message);
      console.error('Socket connection error:', err);
    });

    socketRef.current = socket;
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  };

  const emit = (event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);

      return () => {
        socketRef.current?.off(event, callback);
      };
    }

    return () => {};
  };

  const joinRoom = (roomId: string) => {
    emit(SOCKET_EVENTS.JOIN_ROOM, { roomId });
  };

  const leaveRoom = (roomId: string) => {
    emit(SOCKET_EVENTS.LEAVE_ROOM, { roomId });
  };

  const sendMessage = (roomId: string, message: string, type = 'text') => {
    emit(SOCKET_EVENTS.NEW_MESSAGE, {
      roomId,
      content: message,
      messageType: type,
    });
  };

  useEffect(() => {
    if (isAuthenticated && autoConnect && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, autoConnect, user]);

  return {
    socket: socketRef.current,
    connected,
    error,
    connect,
    disconnect,
    emit,
    on,
    joinRoom,
    leaveRoom,
    sendMessage,
  };
};
