import { baseApi } from '@/lib/api/base-api';
import type {
  ChatRoom,
  ChatMessage,
  ApiResponse,
  PaginationParams,
} from '@/lib/types';

export const chatApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Chat rooms
    getChatRooms: builder.query<
      ChatRoom[],
      { courseId?: string; userId?: string }
    >({
      query: params => ({
        url: '/chat/rooms',
        params,
      }),
      transformResponse: (response: ApiResponse<ChatRoom[]>) => response.data!,
      providesTags: ['Chat'],
    }),

    getChatRoom: builder.query<ChatRoom, string>({
      query: roomId => `/chat/rooms/${roomId}`,
      transformResponse: (response: ApiResponse<ChatRoom>) => response.data!,
      providesTags: (result, error, roomId) => [{ type: 'Chat', id: roomId }],
    }),

    createChatRoom: builder.mutation<
      ChatRoom,
      {
        name: string;
        description?: string;
        roomType: string;
        courseId?: string;
        isPrivate?: boolean;
      }
    >({
      query: data => ({
        url: '/chat/rooms',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<ChatRoom>) => response.data!,
      invalidatesTags: ['Chat'],
    }),

    // Messages
    getChatMessages: builder.query<
      {
        messages: ChatMessage[];
        total: number;
      },
      { roomId: string } & PaginationParams
    >({
      query: ({ roomId, ...params }) => ({
        url: `/chat/rooms/${roomId}/messages`,
        params,
      }),
      transformResponse: (
        response: ApiResponse<{ messages: ChatMessage[]; total: number }>
      ) => response.data!,
      providesTags: (result, error, { roomId }) => [
        { type: 'Chat', id: `messages-${roomId}` },
      ],
    }),

    sendMessage: builder.mutation<
      ChatMessage,
      {
        roomId: string;
        content: string;
        messageType?: string;
        replyToId?: string;
        attachments?: any[];
      }
    >({
      query: ({ roomId, ...data }) => ({
        url: `/chat/rooms/${roomId}/messages`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<ChatMessage>) => response.data!,
      invalidatesTags: (result, error, { roomId }) => [
        { type: 'Chat', id: `messages-${roomId}` },
      ],
    }),

    editMessage: builder.mutation<
      ChatMessage,
      {
        roomId: string;
        messageId: string;
        content: string;
      }
    >({
      query: ({ roomId, messageId, content }) => ({
        url: `/chat/rooms/${roomId}/messages/${messageId}`,
        method: 'PATCH',
        body: { content },
      }),
      transformResponse: (response: ApiResponse<ChatMessage>) => response.data!,
      invalidatesTags: (result, error, { roomId }) => [
        { type: 'Chat', id: `messages-${roomId}` },
      ],
    }),

    deleteMessage: builder.mutation<
      { message: string },
      {
        roomId: string;
        messageId: string;
      }
    >({
      query: ({ roomId, messageId }) => ({
        url: `/chat/rooms/${roomId}/messages/${messageId}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data!,
      invalidatesTags: (result, error, { roomId }) => [
        { type: 'Chat', id: `messages-${roomId}` },
      ],
    }),

    // Message reactions
    addReaction: builder.mutation<
      { message: string },
      {
        roomId: string;
        messageId: string;
        emoji: string;
      }
    >({
      query: ({ roomId, messageId, emoji }) => ({
        url: `/chat/rooms/${roomId}/messages/${messageId}/reactions`,
        method: 'POST',
        body: { emoji },
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data!,
      invalidatesTags: (result, error, { roomId }) => [
        { type: 'Chat', id: `messages-${roomId}` },
      ],
    }),

    removeReaction: builder.mutation<
      { message: string },
      {
        roomId: string;
        messageId: string;
        emoji: string;
      }
    >({
      query: ({ roomId, messageId, emoji }) => ({
        url: `/chat/rooms/${roomId}/messages/${messageId}/reactions/${emoji}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data!,
      invalidatesTags: (result, error, { roomId }) => [
        { type: 'Chat', id: `messages-${roomId}` },
      ],
    }),
  }),
});

export const {
  useGetChatRoomsQuery,
  useGetChatRoomQuery,
  useCreateChatRoomMutation,
  useGetChatMessagesQuery,
  useSendMessageMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
  useAddReactionMutation,
  useRemoveReactionMutation,
} = chatApi;
