import { baseApi } from '@/lib/api/base-api';

// ==================== TYPES AND INTERFACES ====================

export interface MessageParticipant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'teacher';
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  senderName: string;
  sentAt: string;
  messageType: 'text' | 'file' | 'image' | 'audio';
  isRead: boolean;
  readAt?: string;
  attachments: MessageAttachment[];
  editedAt?: string;
  replyToId?: string;
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadUrl: string;
  uploadedAt: string;
}

export interface Conversation {
  id: string;
  participants: MessageParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  lastActivityAt: string;
  subject?: string;
  courseId?: string;
  courseName?: string;
  isArchived: boolean;
  createdAt: string;
  createdBy: string;
}

export interface CreateConversationRequest {
  participantIds: string[];
  initialMessage: string;
  subject?: string;
  courseId?: string;
}

export interface SendMessageRequest {
  content: string;
  attachments?: string[];
  messageType?: 'text' | 'file' | 'image' | 'audio';
  replyToId?: string;
}

export interface BulkMessageRequest {
  recipientIds: string[];
  subject: string;
  content: string;
  courseId?: string;
  attachments?: string[];
}

export interface SearchMessageRequest {
  query: string;
  conversationId?: string;
  limit?: number;
  messageType?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

// ==================== API ENDPOINTS ====================

export const teacherMessagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all conversations
    getConversations: builder.query<
      { conversations: Conversation[]; totalCount: number },
      { limit?: number; offset?: number; archived?: boolean }
    >({
      query: ({ limit = 20, offset = 0, archived = false }) => ({
        url: '/teacher/messages/conversations',
        params: { limit, offset, archived },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: { conversations: Conversation[]; totalCount: number };
      }) => response.data,
      providesTags: ['Conversations'],
    }),

    // Get messages in a conversation
    getMessages: builder.query<
      { messages: Message[]; hasMore: boolean },
      { conversationId: string; limit?: number; before?: string }
    >({
      query: ({ conversationId, limit = 50, before }) => ({
        url: `/teacher/messages/conversations/${conversationId}/messages`,
        params: { limit, before },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: { messages: Message[]; hasMore: boolean };
      }) => response.data,
      providesTags: (result, error, { conversationId }) => [
        { type: 'Messages', id: conversationId },
      ],
    }),

    // Create new conversation
    createConversation: builder.mutation<Conversation, CreateConversationRequest>({
      query: (conversationData) => ({
        url: '/teacher/messages/conversations',
        method: 'POST',
        body: conversationData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Conversation;
      }) => response.data,
      invalidatesTags: ['Conversations'],
    }),

    // Send message
    sendMessage: builder.mutation<
      Message,
      { conversationId: string; messageData: SendMessageRequest }
    >({
      query: ({ conversationId, messageData }) => ({
        url: `/teacher/messages/conversations/${conversationId}/messages`,
        method: 'POST',
        body: messageData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Message;
      }) => response.data,
      invalidatesTags: (result, error, { conversationId }) => [
        'Conversations',
        { type: 'Messages', id: conversationId },
      ],
    }),

    // Mark conversation as read
    markConversationAsRead: builder.mutation<void, string>({
      query: (conversationId) => ({
        url: `/teacher/messages/conversations/${conversationId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Conversations'],
    }),

    // Archive conversation
    archiveConversation: builder.mutation<void, string>({
      query: (conversationId) => ({
        url: `/teacher/messages/conversations/${conversationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Conversations'],
    }),

    // Send bulk message
    sendBulkMessage: builder.mutation<{ sentCount: number }, BulkMessageRequest>({
      query: (bulkMessageData) => ({
        url: '/teacher/messages/bulk-message',
        method: 'POST',
        body: bulkMessageData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: { sentCount: number };
      }) => response.data,
      invalidatesTags: ['Conversations'],
    }),

    // Get unread count
    getUnreadCount: builder.query<{ unreadCount: number }, void>({
      query: () => '/teacher/messages/unread-count',
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: { unreadCount: number };
      }) => response.data,
      providesTags: ['UnreadCount'],
    }),

    // Search messages
    searchMessages: builder.query<
      { results: Message[]; totalCount: number },
      SearchMessageRequest
    >({
      query: ({ query, conversationId, limit = 20, messageType, dateRange }) => ({
        url: '/teacher/messages/search',
        params: {
          query,
          conversationId,
          limit,
          messageType,
          dateFrom: dateRange?.from,
          dateTo: dateRange?.to,
        },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: { results: Message[]; totalCount: number };
      }) => response.data,
    }),

    // Upload message attachment
    uploadMessageAttachment: builder.mutation<
      MessageAttachment,
      { file: File; conversationId?: string }
    >({
      query: ({ file, conversationId }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (conversationId) {
          formData.append('conversationId', conversationId);
        }

        return {
          url: '/teacher/messages/upload-attachment',
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: MessageAttachment;
      }) => response.data,
    }),

    // Delete message
    deleteMessage: builder.mutation<void, { conversationId: string; messageId: string }>({
      query: ({ conversationId, messageId }) => ({
        url: `/teacher/messages/conversations/${conversationId}/messages/${messageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Messages', id: conversationId },
      ],
    }),

    // Edit message
    editMessage: builder.mutation<
      Message,
      { conversationId: string; messageId: string; content: string }
    >({
      query: ({ conversationId, messageId, content }) => ({
        url: `/teacher/messages/conversations/${conversationId}/messages/${messageId}`,
        method: 'PUT',
        body: { content },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Message;
      }) => response.data,
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Messages', id: conversationId },
      ],
    }),

    // Get conversation details
    getConversationDetails: builder.query<Conversation, string>({
      query: (conversationId) => `/teacher/messages/conversations/${conversationId}`,
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Conversation;
      }) => response.data,
      providesTags: (result, error, id) => [{ type: 'Conversations', id }],
    }),

    // Add participants to conversation
    addParticipants: builder.mutation<
      void,
      { conversationId: string; participantIds: string[] }
    >({
      query: ({ conversationId, participantIds }) => ({
        url: `/teacher/messages/conversations/${conversationId}/participants`,
        method: 'POST',
        body: { participantIds },
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Conversations', id: conversationId },
        { type: 'Messages', id: conversationId },
      ],
    }),

    // Remove participant from conversation
    removeParticipant: builder.mutation<
      void,
      { conversationId: string; participantId: string }
    >({
      query: ({ conversationId, participantId }) => ({
        url: `/teacher/messages/conversations/${conversationId}/participants/${participantId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Conversations', id: conversationId },
        { type: 'Messages', id: conversationId },
      ],
    }),

    // Get message statistics
    getMessageStatistics: builder.query<
      {
        totalConversations: number;
        unreadCount: number;
        todayMessages: number;
        responseTime: number; // average in minutes
        mostActiveStudents: {
          studentId: string;
          studentName: string;
          messageCount: number;
        }[];
      },
      void
    >({
      query: () => '/teacher/messages/statistics',
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: any;
      }) => response.data,
      providesTags: ['MessageStatistics'],
    }),
  }),
});

// Export hooks
export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useCreateConversationMutation,
  useSendMessageMutation,
  useMarkConversationAsReadMutation,
  useArchiveConversationMutation,
  useSendBulkMessageMutation,
  useGetUnreadCountQuery,
  useSearchMessagesQuery,
  useUploadMessageAttachmentMutation,
  useDeleteMessageMutation,
  useEditMessageMutation,
  useGetConversationDetailsQuery,
  useAddParticipantsMutation,
  useRemoveParticipantMutation,
  useGetMessageStatisticsQuery,
} = teacherMessagesApi;