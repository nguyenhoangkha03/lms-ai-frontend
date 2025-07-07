import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './';
import { socket } from '@/store/middleware/websocket';
import { SOCKET_EVENTS } from '@/constants';

export const useWebSocket = () => {
  const dispatch = useAppDispatch();
  const isConnected = useAppSelector(state => state.chat?.isConnected);
  const isAuthenticated = useAppSelector(state => state.auth?.isAuthenticated);

  const emit = useCallback((event: string, data?: any) => {
    if (socket && socket.connected) {
      socket.emit(event, data);
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
    (roomId: string, content: string) => {
      emit(SOCKET_EVENTS.SEND_MESSAGE, { roomId, content });
    },
    [emit]
  );

  const startTyping = useCallback(
    (roomId: string) => {
      emit(SOCKET_EVENTS.USER_TYPING, { roomId });
    },
    [emit]
  );

  const stopTyping = useCallback(
    (roomId: string) => {
      emit(SOCKET_EVENTS.USER_STOPPED_TYPING, { roomId });
    },
    [emit]
  );

  return {
    isConnected,
    emit,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
  };
};
