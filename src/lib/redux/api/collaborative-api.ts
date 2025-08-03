import { baseApi } from '@/lib/api/base-api';
import {
  CollaborativeNote,
  GroupProject,
  PeerReview,
  SharedWhiteboard,
  StudyGroup,
} from '@/lib/types/collaborative';

export const collaborativeApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Study Groups
    getStudyGroups: builder.query<
      StudyGroup[],
      {
        search?: string;
        type?: 'public' | 'private' | 'course_based';
        status?: 'active' | 'inactive' | 'archived';
        limit?: number;
        page?: number;
      }
    >({
      query: params => ({
        url: 'study-groups',
        params,
      }),
      providesTags: ['StudyGroup'],
    }),

    getMyStudyGroups: builder.query<StudyGroup[], void>({
      query: () => 'study-groups/my-groups',
      providesTags: ['StudyGroup'],
    }),

    getSuggestedStudyGroups: builder.query<StudyGroup[], void>({
      query: () => 'study-groups/suggested',
      providesTags: ['StudyGroup'],
    }),

    getStudyGroupById: builder.query<StudyGroup, string>({
      query: id => `study-groups/${id}`,
      providesTags: (result, error, id) => [{ type: 'StudyGroup', id }],
    }),

    getStudyGroupStats: builder.query<any, string>({
      query: id => `study-groups/${id}/statistics`,
      providesTags: (result, error, id) => [
        { type: 'StudyGroup', id: `${id}-stats` },
      ],
    }),

    getStudyGroupAnalytics: builder.query<
      any,
      {
        groupId: string;
        timeRange: '7d' | '30d' | '90d' | 'custom';
        dateFrom?: string;
        dateTo?: string;
      }
    >({
      query: ({ groupId, ...params }) => ({
        url: `study-groups/${groupId}/analytics`,
        params,
      }),
      providesTags: (result, error, { groupId }) => [
        { type: 'StudyGroup', id: `${groupId}-analytics` },
      ],
    }),

    createStudyGroup: builder.mutation<StudyGroup, Partial<StudyGroup>>({
      query: studyGroup => ({
        url: 'study-groups',
        method: 'POST',
        body: studyGroup,
      }),
      invalidatesTags: ['StudyGroup'],
    }),

    updateStudyGroup: builder.mutation<
      StudyGroup,
      { groupId: string } & Partial<StudyGroup>
    >({
      query: ({ groupId, ...updates }) => ({
        url: `study-groups/${groupId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { groupId }) => [
        { type: 'StudyGroup', id: groupId },
        'StudyGroup',
      ],
    }),

    deleteStudyGroup: builder.mutation<void, { groupId: string }>({
      query: ({ groupId }) => ({
        url: `study-groups/${groupId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StudyGroup'],
    }),

    joinStudyGroup: builder.mutation<
      void,
      { groupId?: string; inviteCode?: string }
    >({
      query: params => ({
        url: 'study-groups/join',
        method: 'POST',
        body: params,
      }),
      invalidatesTags: ['StudyGroup'],
    }),

    leaveStudyGroup: builder.mutation<void, { groupId: string }>({
      query: ({ groupId }) => ({
        url: `study-groups/${groupId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: ['StudyGroup'],
    }),

    generateInviteCode: builder.mutation<
      { inviteCode: string },
      { groupId: string }
    >({
      query: ({ groupId }) => ({
        url: `study-groups/${groupId}/invite-code`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { groupId }) => [
        { type: 'StudyGroup', id: groupId },
      ],
    }),

    inviteUsersToGroup: builder.mutation<
      void,
      {
        groupId: string;
        emails: string[];
        message?: string;
      }
    >({
      query: ({ groupId, ...body }) => ({
        url: `study-groups/${groupId}/invite-users`,
        method: 'POST',
        body,
      }),
    }),

    getStudyGroupMembers: builder.query<any[], string>({
      query: groupId => `study-groups/${groupId}/members`,
      providesTags: (result, error, groupId) => [
        { type: 'GroupMember', id: groupId },
      ],
    }),

    // Collaborative Notes
    getCollaborativeNotes: builder.query<
      CollaborativeNote[],
      {
        studyGroupId?: string;
        search?: string;
        /**
         * The type of the note which can be one of the following:
         * - 'shared': A note shared with others.
         * - 'personal': A personal note visible only to the creator.
         * - 'template': A note used as a template for creating other notes.
         * - 'pinned': A note that is pinned for easy access.
         */
        type?: 'shared' | 'personal' | 'template' | 'pinned';
        sort?: 'recent' | 'title' | 'created';
        limit?: number;
        page?: number;
      }
    >({
      query: params => ({
        url: 'collaborative-notes',
        params,
      }),
      providesTags: ['CollaborativeNote'],
    }),

    getNoteById: builder.query<CollaborativeNote, string>({
      query: id => `collaborative-notes/${id}`,
      providesTags: (result, error, id) => [{ type: 'CollaborativeNote', id }],
    }),

    getNoteTemplates: builder.query<CollaborativeNote[], void>({
      query: () => 'collaborative-notes/templates',
      providesTags: ['CollaborativeNote'],
    }),

    createCollaborativeNote: builder.mutation<
      CollaborativeNote,
      Partial<CollaborativeNote> & {
        studyGroupId: string;
      }
    >({
      query: note => ({
        url: 'collaborative-notes',
        method: 'POST',
        body: note,
      }),
      invalidatesTags: ['CollaborativeNote'],
    }),

    updateCollaborativeNote: builder.mutation<
      CollaborativeNote,
      {
        noteId: string;
      } & Partial<CollaborativeNote>
    >({
      query: ({ noteId, ...updates }) => ({
        url: `collaborative-notes/${noteId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { noteId }) => [
        { type: 'CollaborativeNote', id: noteId },
        'CollaborativeNote',
      ],
    }),

    deleteCollaborativeNote: builder.mutation<void, { noteId: string }>({
      query: ({ noteId }) => ({
        url: `collaborative-notes/${noteId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CollaborativeNote'],
    }),

    shareNote: builder.mutation<
      void,
      {
        noteId: string;
        emails: string[];
        permission: 'read' | 'write';
        message?: string;
      }
    >({
      query: ({ noteId, ...body }) => ({
        url: `collaborative-notes/${noteId}/share`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { noteId }) => [
        { type: 'CollaborativeNote', id: noteId },
      ],
    }),

    duplicateNote: builder.mutation<CollaborativeNote, { noteId: string }>({
      query: ({ noteId }) => ({
        url: `collaborative-notes/${noteId}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: ['CollaborativeNote'],
    }),

    createNoteFromTemplate: builder.mutation<
      CollaborativeNote,
      {
        templateId: string;
        studyGroupId: string;
        title: string;
      }
    >({
      query: ({ templateId, ...body }) => ({
        url: `collaborative-notes/from-template/${templateId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CollaborativeNote'],
    }),

    // Group Projects
    getGroupProjects: builder.query<
      GroupProject[],
      {
        studyGroupId?: string;
        search?: string;
        status?:
          | 'planning'
          | 'active'
          | 'review'
          | 'completed'
          | 'cancelled'
          | 'pinned'
          | 'overdue';
        limit?: number;
        page?: number;
      }
    >({
      query: params => ({
        url: 'group-projects',
        params,
      }),
      providesTags: ['GroupProject'],
    }),

    getProjectById: builder.query<GroupProject, string>({
      query: id => `group-projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'GroupProject', id }],
    }),

    createGroupProject: builder.mutation<
      GroupProject,
      Partial<GroupProject> & {
        studyGroupId: string;
      }
    >({
      query: project => ({
        url: 'group-projects',
        method: 'POST',
        body: project,
      }),
      invalidatesTags: ['GroupProject'],
    }),

    updateGroupProject: builder.mutation<
      GroupProject,
      {
        projectId: string;
      } & Partial<GroupProject>
    >({
      query: ({ projectId, ...updates }) => ({
        url: `group-projects/${projectId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'GroupProject', id: projectId },
        'GroupProject',
      ],
    }),

    deleteGroupProject: builder.mutation<void, { projectId: string }>({
      query: ({ projectId }) => ({
        url: `group-projects/${projectId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['GroupProject'],
    }),

    assignProjectMember: builder.mutation<
      void,
      {
        projectId: string;
        userId: string;
        role: 'leader' | 'member' | 'reviewer';
      }
    >({
      query: ({ projectId, ...body }) => ({
        url: `group-projects/${projectId}/members`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'GroupProject', id: projectId },
      ],
    }),

    // Shared Whiteboards
    getSharedWhiteboards: builder.query<
      SharedWhiteboard[],
      {
        studyGroupId?: string;
        limit?: number;
        page?: number;
      }
    >({
      query: params => ({
        url: 'whiteboards',
        params,
      }),
      providesTags: ['SharedWhiteboard'],
    }),

    getWhiteboardById: builder.query<SharedWhiteboard, string>({
      query: id => `whiteboards/${id}`,
      providesTags: (result, error, id) => [{ type: 'SharedWhiteboard', id }],
    }),

    createSharedWhiteboard: builder.mutation<
      SharedWhiteboard,
      Partial<SharedWhiteboard> & {
        studyGroupId: string;
      }
    >({
      query: whiteboard => ({
        url: 'whiteboards',
        method: 'POST',
        body: whiteboard,
      }),
      invalidatesTags: ['SharedWhiteboard'],
    }),

    updateSharedWhiteboard: builder.mutation<
      SharedWhiteboard,
      {
        whiteboardId: string;
      } & Partial<SharedWhiteboard>
    >({
      query: ({ whiteboardId, ...updates }) => ({
        url: `whiteboards/${whiteboardId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { whiteboardId }) => [
        { type: 'SharedWhiteboard', id: whiteboardId },
      ],
    }),

    deleteSharedWhiteboard: builder.mutation<void, { whiteboardId: string }>({
      query: ({ whiteboardId }) => ({
        url: `whiteboards/${whiteboardId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SharedWhiteboard'],
    }),

    createWhiteboardElement: builder.mutation<
      void,
      {
        whiteboardId: string;
        element: any;
      }
    >({
      query: ({ whiteboardId, element }) => ({
        url: `whiteboards/${whiteboardId}/elements`,
        method: 'POST',
        body: element,
      }),
      invalidatesTags: (result, error, { whiteboardId }) => [
        { type: 'SharedWhiteboard', id: whiteboardId },
      ],
    }),

    updateWhiteboardElement: builder.mutation<
      void,
      {
        elementId: string;
        updates: any;
      }
    >({
      query: ({ elementId, updates }) => ({
        url: `whiteboards/elements/${elementId}`,
        method: 'PATCH',
        body: updates,
      }),
    }),

    deleteWhiteboardElement: builder.mutation<void, { elementId: string }>({
      query: ({ elementId }) => ({
        url: `whiteboards/elements/${elementId}`,
        method: 'DELETE',
      }),
    }),

    // Peer Reviews
    getPeerReviews: builder.query<
      PeerReview[],
      {
        courseId?: string;
        assignmentId?: string;
        status?: string;
        limit?: number;
        page?: number;
      }
    >({
      query: params => ({
        url: 'peer-reviews',
        params,
      }),
      providesTags: ['PeerReview'],
    }),

    getPeerReviewById: builder.query<PeerReview, string>({
      query: id => `peer-reviews/${id}`,
      providesTags: (result, error, id) => [{ type: 'PeerReview', id }],
    }),

    createPeerReview: builder.mutation<PeerReview, Partial<PeerReview>>({
      query: peerReview => ({
        url: 'peer-reviews',
        method: 'POST',
        body: peerReview,
      }),
      invalidatesTags: ['PeerReview'],
    }),

    submitPeerReview: builder.mutation<
      void,
      {
        reviewId: string;
        content: string;
        attachments?: any[];
      }
    >({
      query: ({ reviewId, ...body }) => ({
        url: `peer-reviews/${reviewId}/submit`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { reviewId }) => [
        { type: 'PeerReview', id: reviewId },
      ],
    }),

    submitPeerFeedback: builder.mutation<
      void,
      {
        submissionId: string;
        feedback: string;
        score: number;
        criteriaScores: Record<string, number>;
      }
    >({
      query: ({ submissionId, ...body }) => ({
        url: `peer-reviews/submissions/${submissionId}/feedback`,
        method: 'POST',
        body,
      }),
    }),

    // Utility
    getUserCourses: builder.query<any[], void>({
      query: () => 'courses/enrolled',
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Study Groups
  useGetStudyGroupsQuery,
  useGetMyStudyGroupsQuery,
  useGetSuggestedStudyGroupsQuery,
  useGetStudyGroupByIdQuery,
  useGetStudyGroupStatsQuery,
  useCreateStudyGroupMutation,
  useUpdateStudyGroupMutation,
  useDeleteStudyGroupMutation,
  useJoinStudyGroupMutation,
  useLeaveStudyGroupMutation,
  useInviteUsersToGroupMutation,
  useGetStudyGroupMembersQuery,
  useGetStudyGroupAnalyticsQuery,

  // Collaborative Notes
  useGetCollaborativeNotesQuery,
  useGetNoteByIdQuery,
  useGetNoteTemplatesQuery,
  useCreateCollaborativeNoteMutation,
  useUpdateCollaborativeNoteMutation,
  useDeleteCollaborativeNoteMutation,
  useShareNoteMutation,
  useDuplicateNoteMutation,
  useCreateNoteFromTemplateMutation,

  // Group Projects
  useGetGroupProjectsQuery,
  useGetProjectByIdQuery,
  useCreateGroupProjectMutation,
  useUpdateGroupProjectMutation,
  useDeleteGroupProjectMutation,
  useAssignProjectMemberMutation,

  // Shared Whiteboards
  useGetSharedWhiteboardsQuery,
  useGetWhiteboardByIdQuery,
  useCreateSharedWhiteboardMutation,
  useUpdateSharedWhiteboardMutation,
  useDeleteSharedWhiteboardMutation,
  useCreateWhiteboardElementMutation,
  useUpdateWhiteboardElementMutation,
  useDeleteWhiteboardElementMutation,

  // Peer Reviews
  useGetPeerReviewsQuery,
  useGetPeerReviewByIdQuery,
  useCreatePeerReviewMutation,
  useSubmitPeerReviewMutation,
  useSubmitPeerFeedbackMutation,

  // Utility
  useGetUserCoursesQuery,
} = collaborativeApi;
