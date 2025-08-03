import { baseApi } from '@/lib/api/base-api';
import {
  ForumCategory,
  ForumPost,
  ForumStats,
  ForumTag,
  ForumThread,
  ModerationReport,
  SearchResult,
  UserReputation,
} from '@/lib/types/forum';

export const forumApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Categories
    getCategories: builder.query<ForumCategory[], void>({
      query: () => 'categories',
      providesTags: ['ForumCategory'],
    }),

    getCategoryById: builder.query<ForumCategory, string>({
      query: id => `categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'ForumCategory', id }],
    }),

    getCategoryBySlug: builder.query<ForumCategory, string>({
      query: slug => `categories/slug/${slug}`,
      providesTags: (result, error, slug) => [
        { type: 'ForumCategory', id: slug },
      ],
    }),

    getCategoryHierarchy: builder.query<ForumCategory[], void>({
      query: () => 'categories/hierarchy',
      providesTags: ['ForumCategory'],
    }),

    createCategory: builder.mutation<ForumCategory, Partial<ForumCategory>>({
      query: category => ({
        url: 'categories',
        method: 'POST',
        body: category,
      }),
      invalidatesTags: ['ForumCategory'],
    }),

    updateCategory: builder.mutation<
      ForumCategory,
      { categoryId: string } & Partial<ForumCategory>
    >({
      query: ({ categoryId, ...updates }) => ({
        url: `categories/${categoryId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { categoryId }) => [
        { type: 'ForumCategory', id: categoryId },
        'ForumCategory',
      ],
    }),

    deleteCategory: builder.mutation<void, { categoryId: string }>({
      query: ({ categoryId }) => ({
        url: `categories/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ForumCategory'],
    }),

    // Threads
    getThreads: builder.query<
      ForumThread[],
      {
        category?: string;
        type?: 'question' | 'discussion' | 'announcement';
        sort?: 'recent' | 'popular' | 'trending';
        search?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: params => ({
        url: 'threads',
        params,
      }),
      providesTags: ['ForumThread'],
    }),

    getThreadById: builder.query<ForumThread, string>({
      query: id => `threads/${id}`,
      providesTags: (result, error, id) => [{ type: 'ForumThread', id }],
    }),

    getThreadBySlug: builder.query<ForumThread, string>({
      query: slug => `threads/slug/${slug}`,
      providesTags: (result, error, slug) => [
        { type: 'ForumThread', id: slug },
      ],
    }),

    createThread: builder.mutation<
      ForumThread,
      Partial<ForumThread> & {
        categoryId: string;
        title: string;
        content: string;
        type: 'question' | 'discussion' | 'announcement';
        tags?: string[];
      }
    >({
      query: thread => ({
        url: 'threads',
        method: 'POST',
        body: thread,
      }),
      invalidatesTags: ['ForumThread', 'ForumStats'],
    }),

    updateThread: builder.mutation<
      ForumThread,
      { threadId: string } & Partial<ForumThread>
    >({
      query: ({ threadId, ...updates }) => ({
        url: `threads/${threadId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { threadId }) => [
        { type: 'ForumThread', id: threadId },
        'ForumThread',
      ],
    }),

    deleteThread: builder.mutation<void, { threadId: string }>({
      query: ({ threadId }) => ({
        url: `threads/${threadId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ForumThread', 'ForumStats'],
    }),

    lockThread: builder.mutation<
      void,
      { threadId: string; unlock?: boolean; reason?: string }
    >({
      query: ({ threadId, unlock, reason }) => ({
        url: `threads/${threadId}/${unlock ? 'unlock' : 'lock'}`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { threadId }) => [
        { type: 'ForumThread', id: threadId },
      ],
    }),

    pinThread: builder.mutation<void, { threadId: string; unpin?: boolean }>({
      query: ({ threadId, unpin }) => ({
        url: `threads/${threadId}/${unpin ? 'unpin' : 'pin'}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { threadId }) => [
        { type: 'ForumThread', id: threadId },
        'ForumThread',
      ],
    }),

    resolveThread: builder.mutation<void, { threadId: string }>({
      query: ({ threadId }) => ({
        url: `threads/${threadId}/resolve`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { threadId }) => [
        { type: 'ForumThread', id: threadId },
      ],
    }),

    // Posts
    getThreadPosts: builder.query<
      ForumPost[],
      {
        threadId?: string;
        sort?: 'oldest' | 'newest' | 'score';
        page?: number;
        limit?: number;
      }
    >({
      query: ({ threadId, ...params }) => ({
        url: `posts/thread/${threadId}`,
        params,
      }),
      providesTags: (result, error, { threadId }) => [
        { type: 'ForumPost', id: `thread-${threadId}` },
      ],
    }),

    getPostById: builder.query<ForumPost, string>({
      query: id => `posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'ForumPost', id }],
    }),

    createPost: builder.mutation<
      ForumPost,
      {
        threadId: string;
        content: string;
        type: 'answer' | 'comment';
        parentId?: string;
      }
    >({
      query: post => ({
        url: 'posts',
        method: 'POST',
        body: post,
      }),
      invalidatesTags: (result, error, { threadId }) => [
        { type: 'ForumPost', id: `thread-${threadId}` },
        { type: 'ForumThread', id: threadId },
        'ForumStats',
      ],
    }),

    updatePost: builder.mutation<
      ForumPost,
      { postId: string } & Partial<ForumPost> & {
          editReason?: string;
        }
    >({
      query: ({ postId, ...updates }) => ({
        url: `posts/${postId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'ForumPost', id: postId },
      ],
    }),

    deletePost: builder.mutation<void, { postId: string }>({
      query: ({ postId }) => ({
        url: `posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'ForumPost', id: postId },
        'ForumThread',
        'ForumStats',
      ],
    }),

    acceptAnswer: builder.mutation<void, { threadId: string; postId: string }>({
      query: ({ postId }) => ({
        url: `posts/${postId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { threadId, postId }) => [
        { type: 'ForumThread', id: threadId },
        { type: 'ForumPost', id: `thread-${threadId}` },
        { type: 'ForumPost', id: postId },
      ],
    }),

    // Voting
    voteOnThread: builder.mutation<
      void,
      { threadId: string; voteType: 'up' | 'down' | null }
    >({
      query: ({ threadId, voteType }) => ({
        url: `votes/threads/${threadId}`,
        method: voteType ? 'POST' : 'DELETE',
        body: voteType ? { voteType } : undefined,
      }),
      invalidatesTags: (result, error, { threadId }) => [
        { type: 'ForumThread', id: threadId },
      ],
    }),

    voteOnPost: builder.mutation<
      void,
      { postId: string; voteType: 'up' | 'down' | null }
    >({
      query: ({ postId, voteType }) => ({
        url: `votes/posts/${postId}`,
        method: voteType ? 'POST' : 'DELETE',
        body: voteType ? { voteType } : undefined,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'ForumPost', id: postId },
      ],
    }),

    getPostVotes: builder.query<
      {
        upvotes: number;
        downvotes: number;
        userVote?: 'up' | 'down' | null;
      },
      string
    >({
      query: postId => `votes/posts/${postId}`,
    }),

    getUserVoteOnPost: builder.query<
      { voteType?: 'up' | 'down' | null },
      string
    >({
      query: postId => `votes/posts/${postId}/user`,
    }),

    markHelpful: builder.mutation<void, { postId: string }>({
      query: ({ postId }) => ({
        url: `posts/${postId}/helpful`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'ForumPost', id: postId },
      ],
    }),

    // Tags
    getAllTags: builder.query<ForumTag[], void>({
      query: () => 'tags',
      providesTags: ['ForumTag'],
    }),

    getTagById: builder.query<ForumTag, string>({
      query: id => `tags/${id}`,
      providesTags: (result, error, id) => [{ type: 'ForumTag', id }],
    }),

    getPopularTags: builder.query<ForumTag[], { limit?: number }>({
      query: params => ({
        url: 'tags/popular',
        params,
      }),
      providesTags: ['ForumTag'],
    }),

    getRecentTags: builder.query<ForumTag[], { limit?: number }>({
      query: params => ({
        url: 'tags/recent',
        params,
      }),
      providesTags: ['ForumTag'],
    }),

    searchTags: builder.query<ForumTag[], string>({
      query: query => ({
        url: 'tags/search',
        params: { q: query },
      }),
      providesTags: ['ForumTag'],
    }),

    createTag: builder.mutation<
      ForumTag,
      {
        name: string;
        description: string;
        color: string;
      }
    >({
      query: tag => ({
        url: 'tags',
        method: 'POST',
        body: tag,
      }),
      invalidatesTags: ['ForumTag'],
    }),

    updateTag: builder.mutation<
      ForumTag,
      { tagId: string } & Partial<ForumTag>
    >({
      query: ({ tagId, ...updates }) => ({
        url: `tags/${tagId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { tagId }) => [
        { type: 'ForumTag', id: tagId },
        'ForumTag',
      ],
    }),

    deleteTag: builder.mutation<void, { tagId: string }>({
      query: ({ tagId }) => ({
        url: `tags/${tagId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ForumTag'],
    }),

    // Search
    searchForum: builder.query<
      {
        results: SearchResult[];
        totalCount: number;
        searchTime: number;
        counts: {
          total: number;
          threads: number;
          posts: number;
        };
      },
      {
        query: string;
        categories?: string[];
        tags?: string[];
        authors?: string[];
        dateFrom?: Date;
        dateTo?: Date;
        sortBy?: 'relevance' | 'date' | 'score' | 'replies';
        contentType?: 'all' | 'threads' | 'posts';
        threadTypes?: string[];
        status?: string[];
        hasAcceptedAnswer?: boolean;
        minScore?: number;
        minReplies?: number;
        page?: number;
        limit?: number;
      }
    >({
      query: params => ({
        url: 'search',
        params: {
          ...params,
          dateFrom: params.dateFrom?.toISOString(),
          dateTo: params.dateTo?.toISOString(),
        },
      }),
    }),

    getSearchSuggestions: builder.query<
      Array<{
        id: string;
        text: string;
        type: 'query' | 'tag' | 'user' | 'category';
        count?: number;
      }>,
      string
    >({
      query: query => ({
        url: 'search/suggestions',
        params: { q: query },
      }),
    }),

    // Statistics
    getStats: builder.query<ForumStats, void>({
      query: () => 'statistics',
      providesTags: ['ForumStats'],
    }),

    getOverviewStats: builder.query<ForumStats, void>({
      query: () => 'statistics/overview',
      providesTags: ['ForumStats'],
    }),

    getTrendStats: builder.query<any[], { period?: 'day' | 'week' | 'month' }>({
      query: params => ({
        url: 'statistics/trends',
        params,
      }),
      providesTags: ['ForumStats'],
    }),

    // User Reputation
    getUserReputation: builder.query<UserReputation, string>({
      query: userId => `users/${userId}/reputation`,
      providesTags: (result, error, userId) => [
        { type: 'UserReputation', id: userId },
      ],
    }),

    getReputationLeaderboard: builder.query<
      Array<{
        id: string;
        name: string;
        avatar?: string;
        reputation: number;
        rank: number;
      }>,
      { limit?: number; period?: 'all' | 'month' | 'week' }
    >({
      query: params => ({
        url: 'reputation/leaderboard',
        params,
      }),
      providesTags: ['UserReputation'],
    }),

    // Moderation
    reportPost: builder.mutation<
      void,
      {
        postId: string;
        reason:
          | 'spam'
          | 'inappropriate'
          | 'harassment'
          | 'misinformation'
          | 'copyright'
          | 'other';
        details: string;
      }
    >({
      query: ({ postId, ...report }) => ({
        url: `moderation/reports/posts/${postId}`,
        method: 'POST',
        body: report,
      }),
      invalidatesTags: ['ModerationReport'],
    }),

    getModerationReports: builder.query<
      ModerationReport[],
      {
        status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
        page?: number;
        limit?: number;
      }
    >({
      query: params => ({
        url: 'moderation/reports',
        params,
      }),
      providesTags: ['ModerationReport'],
    }),

    handleReport: builder.mutation<
      void,
      {
        reportId: string;
        action: 'approve' | 'dismiss';
        moderatorNotes?: string;
      }
    >({
      query: ({ reportId, ...body }) => ({
        url: `moderation/reports/${reportId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ModerationReport'],
    }),

    takeModerationAction: builder.mutation<
      void,
      {
        targetId: string;
        targetType: 'thread' | 'post';
        action: 'hide' | 'delete' | 'lock' | 'pin' | 'feature' | 'warn' | 'ban';
        reason: string;
        moderatorNotes?: string;
        duration?: number;
        notifyUser?: boolean;
        escalate?: boolean;
      }
    >({
      query: actionData => ({
        url: 'moderation/actions',
        method: 'POST',
        body: actionData,
      }),
      invalidatesTags: ['ForumThread', 'ForumPost', 'ModerationReport'],
    }),

    getModerationHistory: builder.query<
      Array<{
        id: string;
        type: string;
        reason: string;
        moderator: {
          id: string;
          name: string;
        };
        createdAt: string;
        targetContent?: string;
        duration?: number;
        severity: 'low' | 'medium' | 'high';
      }>,
      { page?: number; limit?: number }
    >({
      query: params => ({
        url: 'moderation/history',
        params,
      }),
    }),

    hidePost: builder.mutation<void, { postId: string; reason?: string }>({
      query: ({ postId, reason }) => ({
        url: `posts/${postId}/hide`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'ForumPost', id: postId },
      ],
    }),

    // Bookmarks
    bookmarkThread: builder.mutation<void, { threadId: string }>({
      query: ({ threadId }) => ({
        url: `threads/${threadId}/bookmark`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { threadId }) => [
        { type: 'ForumThread', id: threadId },
      ],
    }),

    getUserBookmarks: builder.query<
      ForumThread[],
      { page?: number; limit?: number }
    >({
      query: params => ({
        url: 'bookmarks',
        params,
      }),
      providesTags: ['ForumThread'],
    }),

    // User Activity
    getUserActivity: builder.query<
      Array<{
        id: string;
        type:
          | 'thread_created'
          | 'post_created'
          | 'vote_cast'
          | 'answer_accepted';
        content: string;
        createdAt: string;
        thread?: {
          id: string;
          title: string;
          slug: string;
        };
      }>,
      { userId: string; page?: number; limit?: number }
    >({
      query: ({ userId, ...params }) => ({
        url: `users/${userId}/activity`,
        params,
      }),
    }),

    // Thread Subscriptions
    subscribeToThread: builder.mutation<void, { threadId: string }>({
      query: ({ threadId }) => ({
        url: `threads/${threadId}/subscribe`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { threadId }) => [
        { type: 'ForumThread', id: threadId },
      ],
    }),

    unsubscribeFromThread: builder.mutation<void, { threadId: string }>({
      query: ({ threadId }) => ({
        url: `threads/${threadId}/unsubscribe`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { threadId }) => [
        { type: 'ForumThread', id: threadId },
      ],
    }),

    getUserSubscriptions: builder.query<
      ForumThread[],
      { page?: number; limit?: number }
    >({
      query: params => ({
        url: 'subscriptions',
        params,
      }),
      providesTags: ['ForumThread'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Categories
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useGetCategoryBySlugQuery,
  useGetCategoryHierarchyQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,

  // Threads
  useGetThreadsQuery,
  useGetThreadByIdQuery,
  useGetThreadBySlugQuery,
  useCreateThreadMutation,
  useUpdateThreadMutation,
  useDeleteThreadMutation,
  useLockThreadMutation,
  usePinThreadMutation,
  useResolveThreadMutation,

  // Posts
  useGetThreadPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useAcceptAnswerMutation,

  // Voting
  useVoteOnThreadMutation,
  useVoteOnPostMutation,
  useGetPostVotesQuery,
  useGetUserVoteOnPostQuery,
  useMarkHelpfulMutation,

  // Tags
  useGetAllTagsQuery,
  useGetTagByIdQuery,
  useGetPopularTagsQuery,
  useGetRecentTagsQuery,
  useSearchTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,

  // Search
  useSearchForumQuery,
  useGetSearchSuggestionsQuery,

  // Statistics
  useGetStatsQuery,
  useGetOverviewStatsQuery,
  useGetTrendStatsQuery,

  // User Reputation
  useGetUserReputationQuery,
  useGetReputationLeaderboardQuery,

  // Moderation
  useReportPostMutation,
  useGetModerationReportsQuery,
  useHandleReportMutation,
  useTakeModerationActionMutation,
  useGetModerationHistoryQuery,
  useHidePostMutation,

  // Bookmarks
  useBookmarkThreadMutation,
  useGetUserBookmarksQuery,

  // User Activity
  useGetUserActivityQuery,

  // Subscriptions
  useSubscribeToThreadMutation,
  useUnsubscribeFromThreadMutation,
  useGetUserSubscriptionsQuery,
} = forumApi;
