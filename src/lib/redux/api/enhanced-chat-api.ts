import { baseApi } from '@/lib/api/base-api';
import type {
  ChatRoom,
  ChatMessage,
  ChatParticipant,
  MessageThread,
  ChatFile,
  ChatModeration,
  ChatModerationAppeal,
  ChatSearchParams,
  ChatSearchResult,
  CreateRoomRequest,
  JoinRoomRequest,
  SendMessageRequest,
  ChatApiResponse,
  ChatRoomAnalytics,
  NotificationSettings,
} from '@/lib/types/chat';
import { PaginationParams } from '@/lib/types';

export const enhancedChatApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // =================== CHAT ROOMS ===================

    // Get user's chat rooms with filtering
    getUserChatRooms: builder.query<
      ChatRoom[],
      {
        roomType?: ChatRoom['roomType'];
        courseId?: string;
        status?: ChatRoom['status'];
        search?: string;
      }
    >({
      query: params => ({
        url: '/chat/rooms',
        params,
      }),
      transformResponse: (response: ChatApiResponse<ChatRoom[]>) =>
        response.data,
      providesTags: ['ChatRoom'],
    }),

    // Get public rooms for discovery
    getPublicRooms: builder.query<
      { rooms: ChatRoom[]; total: number },
      PaginationParams & { search?: string; category?: string }
    >({
      query: params => ({
        url: '/chat/rooms/search',
        params,
      }),
      transformResponse: (
        response: ChatApiResponse<{ rooms: ChatRoom[]; total: number }>
      ) => response.data,
      providesTags: ['ChatRoom'],
    }),

    // Get room details with participants
    getChatRoomDetails: builder.query<
      ChatRoom & { participants: ChatParticipant[] },
      string
    >({
      query: roomId => `/chat/rooms/${roomId}`,
      transformResponse: (
        response: ChatApiResponse<
          ChatRoom & { participants: ChatParticipant[] }
        >
      ) => response.data,
      providesTags: (result, error, roomId) => [
        { type: 'ChatRoom', id: roomId },
      ],
    }),

    // Create new chat room
    createChatRoom: builder.mutation<ChatRoom, CreateRoomRequest>({
      query: data => ({
        url: '/chat/rooms',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ChatApiResponse<ChatRoom>) => response.data,
      invalidatesTags: ['ChatRoom'],
    }),

    // Update room settings
    updateChatRoom: builder.mutation<
      ChatRoom,
      { roomId: string; updates: Partial<CreateRoomRequest> }
    >({
      query: ({ roomId, updates }) => ({
        url: `/chat/rooms/${roomId}`,
        method: 'PUT',
        body: updates,
      }),
      transformResponse: (response: ChatApiResponse<ChatRoom>) => response.data,
      invalidatesTags: (result, error, { roomId }) => [
        { type: 'ChatRoom', id: roomId },
        'ChatRoom',
      ],
    }),

    // Delete/Archive room
    deleteChatRoom: builder.mutation<{ message: string }, string>({
      query: roomId => ({
        url: `/chat/rooms/${roomId}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ChatApiResponse<{ message: string }>) =>
        response.data,
      invalidatesTags: ['ChatRoom'],
    }),

    // Join room
    joinChatRoom: builder.mutation<ChatParticipant, JoinRoomRequest>({
      query: ({ roomId, ...data }) => ({
        url: `/chat/rooms/${roomId}/join`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ChatApiResponse<ChatParticipant>) =>
        response.data,
      invalidatesTags: (result, error, { roomId }) => [
        { type: 'ChatRoom', id: roomId },
        'ChatRoom',
      ],
    }),

    // Leave room
    leaveChatRoom: builder.mutation<{ message: string }, string>({
      query: roomId => ({
        url: `/chat/rooms/${roomId}/leave`,
        method: 'POST',
      }),
      transformResponse: (response: ChatApiResponse<{ message: string }>) =>
        response.data,
      invalidatesTags: (result, error, roomId) => [
        { type: 'ChatRoom', id: roomId },
        'ChatRoom',
      ],
    }),

    // Invite users to room
    inviteToRoom: builder.mutation<
      { message: string },
      { roomId: string; userIds: string[]; message?: string }
    >({
      query: ({ roomId, ...data }) => ({
        url: `/chat/rooms/${roomId}/invite`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ChatApiResponse<{ message: string }>) =>
        response.data,
    }),

    // =================== ROOM PARTICIPANTS ===================

    // Get room participants
    getRoomParticipants: builder.query<
      ChatParticipant[],
      { roomId: string; role?: string; status?: string }
    >({
      query: ({ roomId, ...params }) => ({
        url: `/chat/rooms/${roomId}/participants`,
        params,
      }),
      transformResponse: (response: ChatApiResponse<ChatParticipant[]>) =>
        response.data,
      providesTags: (result, error, { roomId }) => [
        { type: 'ChatParticipant', id: roomId },
      ],
    }),

    // Update participant role
    updateParticipantRole: builder.mutation<
      ChatParticipant,
      { roomId: string; userId: string; role: ChatParticipant['role'] }
    >({
      query: ({ roomId, userId, role }) => ({
        url: `/chat/rooms/${roomId}/participants/${userId}/role`,
        method: 'PUT',
        body: { role },
      }),
      transformResponse: (response: ChatApiResponse<ChatParticipant>) =>
        response.data,
      invalidatesTags: (result, error, { roomId }) => [
        { type: 'ChatParticipant', id: roomId },
      ],
    }),

    // Remove participant
    removeParticipant: builder.mutation<
      { message: string },
      { roomId: string; userId: string; reason?: string }
    >({
      query: ({ roomId, userId, reason }) => ({
        url: `/chat/rooms/${roomId}/participants/${userId}`,
        method: 'DELETE',
        body: reason ? { reason } : undefined,
      }),
      transformResponse: (response: ChatApiResponse<{ message: string }>) =>
        response.data,
      invalidatesTags: (result, error, { roomId }) => [
        { type: 'ChatParticipant', id: roomId },
      ],
    }),

    // =================== MESSAGES ===================

    // Get room messages with advanced filtering
    getRoomMessages: builder.query<
      { messages: ChatMessage[]; total: number; hasMore: boolean },
      {
        roomId: string;
        page?: number;
        limit?: number;
        before?: string; // message ID
        after?: string; // message ID
        senderId?: string;
        messageType?: ChatMessage['messageType'];
        isPinned?: boolean;
        hasAttachments?: boolean;
        search?: string;
      }
    >({
      query: ({ roomId, ...params }) => ({
        url: `/chat/rooms/${roomId}/messages`,
        params,
      }),
      transformResponse: (
        response: ChatApiResponse<{
          messages: ChatMessage[];
          total: number;
          hasMore: boolean;
        }>
      ) => response.data,
      providesTags: (result, error, { roomId }) => [
        { type: 'ChatMessage', id: roomId },
      ],
      // Merge with existing messages for infinite scroll
      serializeQueryArgs: ({ queryArgs }) => {
        const { roomId } = queryArgs;
        return roomId;
      },
      merge: (currentCache, newData, { arg }) => {
        if (arg.page === 1 || !arg.page) {
          return newData;
        }
        return {
          ...newData,
          messages: [...currentCache.messages, ...newData.messages],
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.roomId !== previousArg?.roomId;
      },
    }),

    // Send message
    sendChatMessage: builder.mutation<
      ChatMessage,
      { roomId: string } & SendMessageRequest
    >({
      query: ({ roomId, ...data }) => ({
        url: `/chat/rooms/${roomId}/messages`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ChatApiResponse<ChatMessage>) =>
        response.data,
      // Optimistic update
      onQueryStarted: async (
        { roomId, ...newMessage },
        { dispatch, queryFulfilled, getState }
      ) => {
        // Create temporary message for optimistic update
        const tempMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          roomId,
          senderId: 'current-user', // Get from auth state
          content: newMessage.content,
          messageType: newMessage.messageType || 'text',
          status: 'sending',
          isEdited: false,
          isDeleted: false,
          isPinned: false,
          isFlagged: false,
          reactions: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          replyToId: newMessage.replyToId,
          threadId: newMessage.threadId,
          mentions: newMessage.mentions,
          attachments: [],
        };

        // Optimistically update the cache
        const patchResult = dispatch(
          enhancedChatApi.util.updateQueryData(
            'getRoomMessages',
            { roomId },
            draft => {
              draft.messages.push(tempMessage);
              draft.total += 1;
            }
          )
        );

        try {
          const { data: realMessage } = await queryFulfilled;
          // Replace temp message with real one
          dispatch(
            enhancedChatApi.util.updateQueryData(
              'getRoomMessages',
              { roomId },
              draft => {
                const index = draft.messages.findIndex(
                  m => m.id === tempMessage.id
                );
                if (index >= 0) {
                  draft.messages[index] = realMessage;
                }
              }
            )
          );
        } catch {
          // Revert optimistic update on error
          patchResult.undo();
        }
      },
    }),

    // Edit message
    editChatMessage: builder.mutation<
      ChatMessage,
      { roomId: string; messageId: string; content: string }
    >({
      query: ({ roomId, messageId, content }) => ({
        url: `/chat/rooms/${roomId}/messages/${messageId}`,
        method: 'PATCH',
        body: { content },
      }),
      transformResponse: (response: ChatApiResponse<ChatMessage>) =>
        response.data,
      invalidatesTags: (result, error, { roomId }) => [
        { type: 'ChatMessage', id: roomId },
      ],
    }),

    // Delete message
    deleteChatMessage: builder.mutation<
      { message: string },
      { roomId: string; messageId: string }
    >({
      query: ({ roomId, messageId }) => ({
        url: `/chat/rooms/${roomId}/messages/${messageId}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ChatApiResponse<{ message: string }>) =>
        response.data,
      invalidatesTags: (result, error, { roomId }) => [
        { type: 'ChatMessage', id: roomId },
      ],
    }),

    // Pin/Unpin message
    pinMessage: builder.mutation<
      ChatMessage,
      { roomId: string; messageId: string; pin: boolean }
    >({
      query: ({ roomId, messageId, pin }) => ({
        url: `/chat/rooms/${roomId}/messages/${messageId}/pin`,
        method: pin ? 'POST' : 'DELETE',
      }),
      transformResponse: (response: ChatApiResponse<ChatMessage>) =>
        response.data,
      invalidatesTags: (result, error, { roomId }) => [
        { type: 'ChatMessage', id: roomId },
      ],
    }),

    // Get pinned messages
    getPinnedMessages: builder.query<ChatMessage[], string>({
      query: roomId => `/chat/rooms/${roomId}/pinned`,
      transformResponse: (response: ChatApiResponse<ChatMessage[]>) =>
        response.data,
      providesTags: (result, error, roomId) => [
        { type: 'ChatMessage', id: `pinned-${roomId}` },
      ],
    }),

    // =================== MESSAGE REACTIONS ===================

    // Add reaction
    addMessageReaction: builder.mutation<
      { message: string },
      { roomId: string; messageId: string; emoji: string }
    >({
      query: ({ roomId, messageId, emoji }) => ({
        url: `/chat/rooms/${roomId}/messages/${messageId}/reactions`,
        method: 'POST',
        body: { emoji },
      }),
      transformResponse: (response: ChatApiResponse<{ message: string }>) =>
        response.data,
      // Optimistic update for reactions
      onQueryStarted: async (
        { roomId, messageId, emoji },
        { dispatch, queryFulfilled, getState }
      ) => {
        const patchResult = dispatch(
          enhancedChatApi.util.updateQueryData(
            'getRoomMessages',
            { roomId },
            draft => {
              const message = draft.messages.find(m => m.id === messageId);
              if (message) {
                if (!message.reactions) message.reactions = {};
                if (!message.reactions[emoji])
                  message.reactions[emoji] = { users: [], count: 0, emoji };

                // Add current user if not already there
                const currentUserId = 'current-user'; // Get from auth state
                if (!message.reactions[emoji].users.includes(currentUserId)) {
                  message.reactions[emoji].users.push(currentUserId);
                  message.reactions[emoji].count += 1;
                }
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Remove reaction
    removeMessageReaction: builder.mutation<
      { message: string },
      { roomId: string; messageId: string; emoji: string }
    >({
      query: ({ roomId, messageId, emoji }) => ({
        url: `/chat/rooms/${roomId}/messages/${messageId}/reactions/${emoji}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ChatApiResponse<{ message: string }>) =>
        response.data,
      // Optimistic update for reaction removal
      onQueryStarted: async (
        { roomId, messageId, emoji },
        { dispatch, queryFulfilled }
      ) => {
        const patchResult = dispatch(
          enhancedChatApi.util.updateQueryData(
            'getRoomMessages',
            { roomId },
            draft => {
              const message = draft.messages.find(m => m.id === messageId);
              if (message && message.reactions && message.reactions[emoji]) {
                const currentUserId = 'current-user'; // Get from auth state
                const userIndex =
                  message.reactions[emoji].users.indexOf(currentUserId);
                if (userIndex >= 0) {
                  message.reactions[emoji].users.splice(userIndex, 1);
                  message.reactions[emoji].count -= 1;

                  // Remove emoji if no users left
                  if (message.reactions[emoji].count === 0) {
                    delete message.reactions[emoji];
                  }
                }
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // =================== MESSAGE THREADS ===================

    // Get thread messages
    getThreadMessages: builder.query<
      { messages: ChatMessage[]; thread: MessageThread },
      { threadId: string; page?: number; limit?: number }
    >({
      query: ({ threadId, ...params }) => ({
        url: `/chat/threads/${threadId}/messages`,
        params,
      }),
      transformResponse: (
        response: ChatApiResponse<{
          messages: ChatMessage[];
          thread: MessageThread;
        }>
      ) => response.data,
      providesTags: (result, error, { threadId }) => [
        { type: 'ChatThread', id: threadId },
      ],
    }),

    // Create thread from message
    createMessageThread: builder.mutation<
      MessageThread,
      { roomId: string; parentMessageId: string; title?: string }
    >({
      query: ({ roomId, ...data }) => ({
        url: `/chat/rooms/${roomId}/threads`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ChatApiResponse<MessageThread>) =>
        response.data,
      invalidatesTags: ['ChatThread'],
    }),

    // Reply to thread
    replyToThread: builder.mutation<
      ChatMessage,
      { threadId: string } & SendMessageRequest
    >({
      query: ({ threadId, ...data }) => ({
        url: `/chat/threads/${threadId}/reply`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ChatApiResponse<ChatMessage>) =>
        response.data,
      invalidatesTags: (result, error, { threadId }) => [
        { type: 'ChatThread', id: threadId },
      ],
    }),

    // Resolve thread
    resolveThread: builder.mutation<
      MessageThread,
      { threadId: string; resolved: boolean }
    >({
      query: ({ threadId, resolved }) => ({
        url: `/chat/threads/${threadId}/resolve`,
        method: 'PATCH',
        body: { resolved },
      }),
      transformResponse: (response: ChatApiResponse<MessageThread>) =>
        response.data,
      invalidatesTags: (result, error, { threadId }) => [
        { type: 'ChatThread', id: threadId },
      ],
    }),

    // =================== FILE SHARING ===================

    // Upload file to chat
    uploadChatFile: builder.mutation<
      ChatFile,
      { roomId: string; file: File; description?: string }
    >({
      query: ({ roomId, file, description }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (description) formData.append('description', description);

        return {
          url: `/chat/upload`,
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      transformResponse: (response: ChatApiResponse<ChatFile>) => response.data,
    }),

    // Get shared files in room
    getRoomFiles: builder.query<
      { files: ChatFile[]; total: number },
      {
        roomId: string;
        page?: number;
        limit?: number;
        fileType?: string;
        search?: string;
      }
    >({
      query: ({ roomId, ...params }) => ({
        url: `/chat/rooms/${roomId}/files`,
        params,
      }),
      transformResponse: (
        response: ChatApiResponse<{ files: ChatFile[]; total: number }>
      ) => response.data,
      providesTags: (result, error, { roomId }) => [
        { type: 'ChatFile', id: roomId },
      ],
    }),

    // =================== SEARCH ===================

    // Search messages
    searchMessages: builder.query<
      { results: ChatSearchResult[]; total: number },
      ChatSearchParams & PaginationParams
    >({
      query: params => ({
        url: '/chat/search',
        method: 'POST',
        body: params,
      }),
      transformResponse: (
        response: ChatApiResponse<{
          results: ChatSearchResult[];
          total: number;
        }>
      ) => response.data,
      providesTags: ['ChatSearch'],
    }),

    // =================== MODERATION ===================

    // Take moderation action
    takeModerationAction: builder.mutation<
      ChatModeration,
      {
        roomId: string;
        userId: string;
        actionType: ChatModeration['actionType'];
        reason: string;
        duration?: number;
        messageId?: string;
        severity?: ChatModeration['severity'];
      }
    >({
      query: data => ({
        url: '/chat/moderation/action',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ChatApiResponse<ChatModeration>) =>
        response.data,
      invalidatesTags: ['ChatModeration'],
    }),

    // Get moderation history
    getModerationHistory: builder.query<
      ChatModeration[],
      { roomId: string; userId?: string; actionType?: string }
    >({
      query: ({ roomId, ...params }) => ({
        url: `/chat/moderation/history/${roomId}`,
        params,
      }),
      transformResponse: (response: ChatApiResponse<ChatModeration[]>) =>
        response.data,
      providesTags: (result, error, { roomId }) => [
        { type: 'ChatModeration', id: roomId },
      ],
    }),

    // Check user moderation status
    getUserModerationStatus: builder.query<
      {
        isBanned: boolean;
        isMuted: boolean;
        warnings: number;
        currentRestrictions: ChatModeration[];
      },
      { roomId: string; userId: string }
    >({
      query: ({ roomId, userId }) =>
        `/chat/moderation/user/${userId}/status/${roomId}`,
      transformResponse: (
        response: ChatApiResponse<{
          isBanned: boolean;
          isMuted: boolean;
          warnings: number;
          currentRestrictions: ChatModeration[];
        }>
      ) => response.data,
      providesTags: (result, error, { roomId, userId }) => [
        { type: 'ChatModeration', id: `${roomId}-${userId}` },
      ],
    }),

    // Appeal moderation action
    appealModerationAction: builder.mutation<
      ChatModerationAppeal,
      { moderationId: string; reason: string }
    >({
      query: ({ moderationId, reason }) => ({
        url: `/chat/moderation/appeal/${moderationId}`,
        method: 'POST',
        body: { reason },
      }),
      transformResponse: (response: ChatApiResponse<ChatModerationAppeal>) =>
        response.data,
      invalidatesTags: ['ChatModeration'],
    }),

    // Review appeal (moderator/admin only)
    reviewModerationAppeal: builder.mutation<
      ChatModerationAppeal,
      {
        moderationId: string;
        status: 'approved' | 'rejected';
        reviewNotes?: string;
      }
    >({
      query: ({ moderationId, ...data }) => ({
        url: `/chat/moderation/appeal/${moderationId}/review`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ChatApiResponse<ChatModerationAppeal>) =>
        response.data,
      invalidatesTags: ['ChatModeration'],
    }),

    // =================== ANALYTICS ===================

    // Get room analytics
    getRoomAnalytics: builder.query<
      ChatRoomAnalytics,
      { roomId: string; timeframe?: '24h' | '7d' | '30d' | '90d' }
    >({
      query: ({ roomId, timeframe = '7d' }) => ({
        url: `/chat/rooms/${roomId}/analytics`,
        params: { timeframe },
      }),
      transformResponse: (response: ChatApiResponse<ChatRoomAnalytics>) =>
        response.data,
      providesTags: (result, error, { roomId }) => [
        { type: 'ChatAnalytics', id: roomId },
      ],
    }),

    // =================== NOTIFICATIONS ===================

    // Mark messages as read
    markMessagesAsRead: builder.mutation<
      { message: string },
      { roomId: string; messageIds?: string[]; lastReadMessageId?: string }
    >({
      query: ({ roomId, ...data }) => ({
        url: `/chat/rooms/${roomId}/read`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ChatApiResponse<{ message: string }>) =>
        response.data,
      // Update unread counts optimistically
      onQueryStarted: async ({ roomId }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          enhancedChatApi.util.updateQueryData(
            'getUserChatRooms',
            {},
            draft => {
              const room = draft.find(r => r.id === roomId);
              if (room) {
                // Reset unread count for this room
                // This would need to be implemented based on how unread counts are stored
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Update chat room notification settings
    updateChatNotificationSettings: builder.mutation<
      { message: string },
      { roomId: string; settings: Partial<NotificationSettings> }
    >({
      query: ({ roomId, settings }) => ({
        url: `/chat/rooms/${roomId}/notifications`,
        method: 'PUT',
        body: settings,
      }),
      transformResponse: (response: ChatApiResponse<{ message: string }>) =>
        response.data,
    }),

    // =================== CONTACTS & DIRECT MESSAGES ===================

    // Get suggested contacts
    getSuggestedContacts: builder.query<
      Array<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
        role: string;
        relationshipType: 'course_mate' | 'study_group_member' | 'teacher' | 'frequent_contact';
        relationshipDetails: {
          sharedCourses?: string[];
          studyGroups?: string[];
          messageCount?: number;
          lastInteraction?: Date;
        };
        onlineStatus: 'online' | 'offline' | 'away';
        canDirectMessage: boolean;
      }>,
      { limit?: number }
    >({
      query: (params = {}) => ({
        url: '/chat/rooms/suggested-contacts',
        params,
      }),
      transformResponse: (response: ChatApiResponse<{ suggestions: any[] }>) =>
        response.data.suggestions,
      providesTags: ['ChatRoom'],
    }),

    // Create or get direct message room
    createDirectMessageRoom: builder.mutation<
      ChatRoom,
      { userId: string }
    >({
      query: ({ userId }) => ({
        url: `/chat/rooms/direct-message/${userId}`,
        method: 'POST',
      }),
      transformResponse: (response: ChatApiResponse<{ room: ChatRoom }>) =>
        response.data.room,
      invalidatesTags: ['ChatRoom'],
    }),

    // Check direct message permission
    checkDirectMessagePermission: builder.query<
      {
        canMessage: boolean;
        reason?: string;
        restrictions?: string[];
        requiresApproval?: boolean;
      },
      { userId: string }
    >({
      query: ({ userId }) => ({
        url: `/chat/rooms/direct-message-permission/${userId}`,
      }),
      transformResponse: (response: ChatApiResponse<{ permission: any }>) =>
        response.data.permission,
    }),
  }),
});

// Export hooks
export const {
  // Room management
  useGetUserChatRoomsQuery,
  useGetPublicRoomsQuery,
  useGetChatRoomDetailsQuery,
  useCreateChatRoomMutation,
  useUpdateChatRoomMutation,
  useDeleteChatRoomMutation,
  useJoinChatRoomMutation,
  useLeaveChatRoomMutation,
  useInviteToRoomMutation,

  // Participants
  useGetRoomParticipantsQuery,
  useUpdateParticipantRoleMutation,
  useRemoveParticipantMutation,

  // Messages
  useGetRoomMessagesQuery,
  useSendChatMessageMutation,
  useEditChatMessageMutation,
  useDeleteChatMessageMutation,
  usePinMessageMutation,
  useGetPinnedMessagesQuery,

  // Reactions
  useAddMessageReactionMutation,
  useRemoveMessageReactionMutation,

  // Threads
  useGetThreadMessagesQuery,
  useCreateMessageThreadMutation,
  useReplyToThreadMutation,
  useResolveThreadMutation,

  // Files
  useUploadChatFileMutation,
  useGetRoomFilesQuery,

  // Search
  useSearchMessagesQuery,

  // Moderation
  useTakeModerationActionMutation,
  useGetModerationHistoryQuery,
  useGetUserModerationStatusQuery,
  useAppealModerationActionMutation,
  useReviewModerationAppealMutation,

  // Analytics
  useGetRoomAnalyticsQuery,

  // Notifications
  useMarkMessagesAsReadMutation,
  useUpdateChatNotificationSettingsMutation,

  // Contact & Direct Messages
  useGetSuggestedContactsQuery,
  useCreateDirectMessageRoomMutation,
  useCheckDirectMessagePermissionQuery,
} = enhancedChatApi;
