import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatRoom, ChatMessage, ChatParticipant } from '@/types';

interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: Record<string, ChatMessage[]>;
  participants: Record<string, ChatParticipant[]>;
  typingUsers: Record<string, string[]>;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  unreadCounts: Record<string, number>;
  lastReadMessages: Record<string, string>;
}

const initialState: ChatState = {
  rooms: [],
  currentRoom: null,
  messages: {},
  participants: {},
  typingUsers: {},
  isConnected: false,
  isLoading: false,
  error: null,
  unreadCounts: {},
  lastReadMessages: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setRooms: (state, action: PayloadAction<ChatRoom[]>) => {
      state.rooms = action.payload;
      state.error = null;
    },

    addRoom: (state, action: PayloadAction<ChatRoom>) => {
      const existingIndex = state.rooms.findIndex(
        r => r.id === action.payload.id
      );
      if (existingIndex > -1) {
        state.rooms[existingIndex] = action.payload;
      } else {
        state.rooms.push(action.payload);
      }
    },

    updateRoom: (state, action: PayloadAction<ChatRoom>) => {
      const index = state.rooms.findIndex(r => r.id === action.payload.id);
      if (index > -1) {
        state.rooms[index] = action.payload;
      }
      if (state.currentRoom?.id === action.payload.id) {
        state.currentRoom = action.payload;
      }
    },

    setCurrentRoom: (state, action: PayloadAction<ChatRoom | null>) => {
      state.currentRoom = action.payload;
    },

    setMessages: (
      state,
      action: PayloadAction<{ roomId: string; messages: ChatMessage[] }>
    ) => {
      const { roomId, messages } = action.payload;
      state.messages[roomId] = messages;
    },

    addMessage: (
      state,
      action: PayloadAction<{ roomId: string; message: ChatMessage }>
    ) => {
      const { roomId, message } = action.payload;
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      state.messages[roomId].push(message);

      // Update unread count if not current room
      if (state.currentRoom?.id !== roomId) {
        state.unreadCounts[roomId] = (state.unreadCounts[roomId] || 0) + 1;
      }
    },

    updateMessage: (
      state,
      action: PayloadAction<{ roomId: string; message: ChatMessage }>
    ) => {
      const { roomId, message } = action.payload;
      if (state.messages[roomId]) {
        const index = state.messages[roomId].findIndex(
          m => m.id === message.id
        );
        if (index > -1) {
          state.messages[roomId][index] = message;
        }
      }
    },

    removeMessage: (
      state,
      action: PayloadAction<{ roomId: string; messageId: string }>
    ) => {
      const { roomId, messageId } = action.payload;
      if (state.messages[roomId]) {
        state.messages[roomId] = state.messages[roomId].filter(
          m => m.id !== messageId
        );
      }
    },

    setParticipants: (
      state,
      action: PayloadAction<{ roomId: string; participants: ChatParticipant[] }>
    ) => {
      const { roomId, participants } = action.payload;
      state.participants[roomId] = participants;
    },

    addParticipant: (
      state,
      action: PayloadAction<{ roomId: string; participant: ChatParticipant }>
    ) => {
      const { roomId, participant } = action.payload;
      if (!state.participants[roomId]) {
        state.participants[roomId] = [];
      }
      const existingIndex = state.participants[roomId].findIndex(
        p => p.userId === participant.userId
      );
      if (existingIndex > -1) {
        state.participants[roomId][existingIndex] = participant;
      } else {
        state.participants[roomId].push(participant);
      }
    },

    removeParticipant: (
      state,
      action: PayloadAction<{ roomId: string; userId: string }>
    ) => {
      const { roomId, userId } = action.payload;
      if (state.participants[roomId]) {
        state.participants[roomId] = state.participants[roomId].filter(
          p => p.userId !== userId
        );
      }
    },

    setTypingUsers: (
      state,
      action: PayloadAction<{ roomId: string; userIds: string[] }>
    ) => {
      const { roomId, userIds } = action.payload;
      state.typingUsers[roomId] = userIds;
    },

    addTypingUser: (
      state,
      action: PayloadAction<{ roomId: string; userId: string }>
    ) => {
      const { roomId, userId } = action.payload;
      if (!state.typingUsers[roomId]) {
        state.typingUsers[roomId] = [];
      }
      if (!state.typingUsers[roomId].includes(userId)) {
        state.typingUsers[roomId].push(userId);
      }
    },

    removeTypingUser: (
      state,
      action: PayloadAction<{ roomId: string; userId: string }>
    ) => {
      const { roomId, userId } = action.payload;
      if (state.typingUsers[roomId]) {
        state.typingUsers[roomId] = state.typingUsers[roomId].filter(
          id => id !== userId
        );
      }
    },

    setUnreadCount: (
      state,
      action: PayloadAction<{ roomId: string; count: number }>
    ) => {
      const { roomId, count } = action.payload;
      state.unreadCounts[roomId] = count;
    },

    markAsRead: (
      state,
      action: PayloadAction<{ roomId: string; messageId: string }>
    ) => {
      const { roomId, messageId } = action.payload;
      state.unreadCounts[roomId] = 0;
      state.lastReadMessages[roomId] = messageId;
    },

    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },

    setChatLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setChatError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearChat: state => {
      state.rooms = [];
      state.currentRoom = null;
      state.messages = {};
      state.participants = {};
      state.typingUsers = {};
      state.unreadCounts = {};
      state.lastReadMessages = {};
      state.error = null;
    },
  },
});

export const {
  setRooms,
  addRoom,
  updateRoom,
  setCurrentRoom,
  setMessages,
  addMessage,
  updateMessage,
  removeMessage,
  setParticipants,
  addParticipant,
  removeParticipant,
  setTypingUsers,
  addTypingUser,
  removeTypingUser,
  setUnreadCount,
  markAsRead,
  setConnected,
  setChatLoading,
  setChatError,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;
