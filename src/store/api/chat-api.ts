import { baseApi } from './base-api';
import { API_ENDPOINTS } from '@/constants';
import type { ChatRoom, ChatMessage, ChatParticipant } from '@/types';

export const chatApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get chat rooms
    getChatRooms: builder.query<ChatRoom[], void>({
      query: () => API_ENDPOINTS.CHAT.ROOMS,
      providesTags: ['Chat'],
    }),

    // Get room messages
    getRoomMessages: builder.query<
      ChatMessage[],
      { roomId: string; page?: number; limit?: number }
    >({
      query: ({ roomId, page = 1, limit = 50 }) => ({
        url: API_ENDPOINTS.CHAT.MESSAGES(roomId),
        params: { page, limit },
      }),
      providesTags: (result, error, { roomId }) => [
        { type: 'Message', id: roomId },
      ],
    }),

    // Get room participants
    getRoomParticipants: builder.query<ChatParticipant[], string>({
      query: roomId => API_ENDPOINTS.CHAT.PARTICIPANTS(roomId),
      providesTags: (result, error, roomId) => [{ type: 'Chat', id: roomId }],
    }),

    // Send message
    sendMessage: builder.mutation<
      ChatMessage,
      { roomId: string; content: string; messageType?: string }
    >({
      query: ({ roomId, content, messageType = 'text' }) => ({
        url: API_ENDPOINTS.CHAT.MESSAGES(roomId),
        method: 'POST',
        body: { content, messageType },
      }),
      invalidatesTags: (result, error, { roomId }) => [
        { type: 'Message', id: roomId },
      ],
    }),

    // Join room
    joinRoom: builder.mutation<void, string>({
      query: roomId => ({
        url: `${API_ENDPOINTS.CHAT.ROOMS}/${roomId}/join`,
        method: 'POST',
      }),
      invalidatesTags: ['Chat'],
    }),

    // Leave room
    leaveRoom: builder.mutation<void, string>({
      query: roomId => ({
        url: `${API_ENDPOINTS.CHAT.ROOMS}/${roomId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: ['Chat'],
    }),

    // Mark messages as read
    markMessagesAsRead: builder.mutation<
      void,
      { roomId: string; messageId: string }
    >({
      query: ({ roomId, messageId }) => ({
        url: `${API_ENDPOINTS.CHAT.MESSAGES(roomId)}/read`,
        method: 'PUT',
        body: { messageId },
      }),
      invalidatesTags: (result, error, { roomId }) => [
        { type: 'Chat', id: roomId },
      ],
    }),
  }),
});

export const {
  useGetChatRoomsQuery,
  useGetRoomMessagesQuery,
  useGetRoomParticipantsQuery,
  useSendMessageMutation,
  useJoinRoomMutation,
  useLeaveRoomMutation,
  useMarkMessagesAsReadMutation,
} = chatApi;
