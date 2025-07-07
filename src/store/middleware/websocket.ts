import { Middleware } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG, SOCKET_EVENTS } from '@/constants';
import {
  setConnected,
  addMessage,
  addTypingUser,
  removeTypingUser,
} from '../slices/chat';
import { addNotification } from '../slices/notification';
import { updateProgress } from '../slices/lesson';

// cấu trúc action
export interface WebSocketAction {
  type: string;
  meta?: {
    websocket?: {
      event: string;
      data?: any;
    };
  };
  payload?: any;
}

let socket: Socket | null = null;

// nếu return true thì hãy coi action trong đối số là WebSocketAction
function isWebSocketAction(action: unknown): action is WebSocketAction {
  return typeof action === 'object' && action !== null && 'type' in action;
}

export const websocketMiddleware: Middleware = store => next => action => {
  if (isWebSocketAction(action)) {
    const { type, meta } = action;

    if (type === 'auth/setCredentials') {
      const { token } = action.payload;
      connectSocket(token, store);
    }

    if (type === 'auth/logout') {
      disconnectSocket();
    }

    if (meta?.websocket) {
      const { event, data } = meta.websocket;

      if (socket && socket.connected) {
        socket.emit(event, data);
      }
    }
  }

  return next(action);
};

function connectSocket(token: string, store: any) {
  if (socket) {
    socket.disconnect();
  }

  socket = io(API_CONFIG.baseUrl, {
    auth: {
      token,
    },
    transports: ['websocket'],
    timeout: 20000,
    forceNew: true,
  });

  socket.on(SOCKET_EVENTS.CONNECT, () => {
    console.log('WebSocket connected');
    store.dispatch(setConnected(true));
  });

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    console.log('WebSocket disconnected');
    store.dispatch(setConnected(false));
  });

  socket.on(SOCKET_EVENTS.ERROR, error => {
    console.error('WebSocket error:', error);
    store.dispatch(setConnected(false));
  });

  // Chat events
  socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, message => {
    store.dispatch(
      addMessage({
        roomId: message.roomId,
        message,
      })
    );
  });

  socket.on(SOCKET_EVENTS.USER_TYPING, ({ roomId, userId }) => {
    store.dispatch(addTypingUser({ roomId, userId }));
  });

  socket.on(SOCKET_EVENTS.USER_STOPPED_TYPING, ({ roomId, userId }) => {
    store.dispatch(removeTypingUser({ roomId, userId }));
  });

  // Notification events
  socket.on(SOCKET_EVENTS.NEW_NOTIFICATION, notification => {
    store.dispatch(addNotification(notification));
  });

  // Learning progress events
  socket.on(SOCKET_EVENTS.PROGRESS_UPDATE, ({ lessonId, progress }) => {
    store.dispatch(updateProgress({ lessonId, updates: progress }));
  });

  // Live lesson events
  socket.on(SOCKET_EVENTS.LESSON_UPDATE, update => {
    // Handle live lesson updates
    console.log('Lesson update:', update);
  });
}

function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Export socket instance for direct usage
export { socket };
