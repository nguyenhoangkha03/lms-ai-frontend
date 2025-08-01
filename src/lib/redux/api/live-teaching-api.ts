import { baseApi } from '@/lib/api/base-api';
import type {
  VideoSession,
  VideoParticipant,
  AttendanceRecord,
  BreakoutRoom,
  Poll,
  Whiteboard,
  WhiteboardElement,
  CreateVideoSessionDto,
  UpdateVideoSessionDto,
  JoinSessionDto,
  CreateBreakoutRoomsDto,
  SessionListResponse,
  SessionDetailResponse,
  AttendanceResponse,
} from '@/lib/types/live-teaching';

export const liveTeachingApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Video Session Management
    createVideoSession: builder.mutation<VideoSession, CreateVideoSessionDto>({
      query: data => ({
        url: '/video/sessions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['VideoSession'],
    }),

    getVideoSessions: builder.query<
      SessionListResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        sessionType?: string;
      }
    >({
      query: params => ({
        url: '/video/sessions',
        params,
      }),
      providesTags: ['VideoSession'],
    }),

    getVideoSession: builder.query<SessionDetailResponse, string>({
      query: sessionId => ({
        url: `/video/sessions/${sessionId}`,
      }),
      providesTags: (result, error, sessionId) => [
        { type: 'VideoSession', id: sessionId },
      ],
    }),

    updateVideoSession: builder.mutation<
      VideoSession,
      {
        sessionId: string;
        data: UpdateVideoSessionDto;
      }
    >({
      query: ({ sessionId, data }) => ({
        url: `/video/sessions/${sessionId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { sessionId }) => [
        { type: 'VideoSession', id: sessionId },
      ],
    }),

    deleteVideoSession: builder.mutation<void, string>({
      query: sessionId => ({
        url: `/video/sessions/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VideoSession'],
    }),

    // Session Control
    startVideoSession: builder.mutation<VideoSession, string>({
      query: sessionId => ({
        url: `/video/sessions/${sessionId}/start`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, sessionId) => [
        { type: 'VideoSession', id: sessionId },
      ],
    }),

    endVideoSession: builder.mutation<VideoSession, string>({
      query: sessionId => ({
        url: `/video/sessions/${sessionId}/end`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, sessionId) => [
        { type: 'VideoSession', id: sessionId },
      ],
    }),

    joinVideoSession: builder.mutation<
      {
        session: VideoSession;
        participant: VideoParticipant;
        token: string;
      },
      JoinSessionDto
    >({
      query: data => ({
        url: `/video/sessions/${data.sessionId}/join`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { sessionId }) => [
        { type: 'VideoSession', id: sessionId },
        'SessionParticipant',
      ],
    }),

    leaveVideoSession: builder.mutation<void, string>({
      query: sessionId => ({
        url: `/video/sessions/${sessionId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, sessionId) => [
        { type: 'VideoSession', id: sessionId },
        'SessionParticipant',
      ],
    }),

    // Participant Management
    getSessionParticipants: builder.query<VideoParticipant[], string>({
      query: sessionId => ({
        url: `/video/sessions/${sessionId}/participants`,
      }),
      providesTags: ['SessionParticipant'],
    }),

    updateParticipant: builder.mutation<
      VideoParticipant,
      {
        sessionId: string;
        participantId: string;
        data: Partial<VideoParticipant>;
      }
    >({
      query: ({ sessionId, participantId, data }) => ({
        url: `/video/sessions/${sessionId}/participants/${participantId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['SessionParticipant'],
    }),

    removeParticipant: builder.mutation<
      void,
      {
        sessionId: string;
        participantId: string;
      }
    >({
      query: ({ sessionId, participantId }) => ({
        url: `/video/sessions/${sessionId}/participants/${participantId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SessionParticipant'],
    }),

    // Breakout Rooms
    createBreakoutRooms: builder.mutation<
      BreakoutRoom[],
      CreateBreakoutRoomsDto
    >({
      query: data => ({
        url: `/video/sessions/${data.sessionId}/breakout-rooms`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['BreakoutRoom'],
    }),

    getBreakoutRooms: builder.query<BreakoutRoom[], string>({
      query: sessionId => ({
        url: `/video/sessions/${sessionId}/breakout-rooms`,
      }),
      providesTags: ['BreakoutRoom'],
    }),

    assignToBreakoutRoom: builder.mutation<
      void,
      {
        sessionId: string;
        roomId: string;
        participantIds: string[];
      }
    >({
      query: ({ sessionId, roomId, participantIds }) => ({
        url: `/video/sessions/${sessionId}/breakout-rooms/${roomId}/assign`,
        method: 'POST',
        body: { participantIds },
      }),
      invalidatesTags: ['BreakoutRoom', 'SessionParticipant'],
    }),

    closeBreakoutRooms: builder.mutation<
      void,
      {
        sessionId: string;
        roomId?: string;
      }
    >({
      query: ({ sessionId, roomId }) => ({
        url: `/video/sessions/${sessionId}/breakout-rooms`,
        method: 'DELETE',
        body: roomId ? { roomId } : {},
      }),
      invalidatesTags: ['BreakoutRoom'],
    }),

    // Attendance Management
    getSessionAttendance: builder.query<AttendanceResponse, string>({
      query: sessionId => ({
        url: `/video/sessions/${sessionId}/attendance`,
      }),
      providesTags: ['Attendance'],
    }),

    exportAttendance: builder.mutation<
      Blob,
      {
        sessionId: string;
        format: 'csv' | 'excel' | 'pdf';
      }
    >({
      query: ({ sessionId, format }) => ({
        url: `/video/sessions/${sessionId}/attendance/export`,
        method: 'GET',
        params: { format },
        responseHandler: (response: Response) => response.blob(),
      }),
    }),

    updateAttendanceRecord: builder.mutation<
      AttendanceRecord,
      {
        sessionId: string;
        participantId: string;
        data: Partial<AttendanceRecord>;
      }
    >({
      query: ({ sessionId, participantId, data }) => ({
        url: `/video/sessions/${sessionId}/attendance/${participantId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),

    // Polls
    createPoll: builder.mutation<
      Poll,
      {
        sessionId: string;
        poll: Partial<Poll>;
      }
    >({
      query: ({ sessionId, poll }) => ({
        url: `/video/sessions/${sessionId}/polls`,
        method: 'POST',
        body: poll,
      }),
      invalidatesTags: ['Poll'],
    }),

    getSessionPolls: builder.query<Poll[], string>({
      query: sessionId => ({
        url: `/video/sessions/${sessionId}/polls`,
      }),
      providesTags: ['Poll'],
    }),

    startPoll: builder.mutation<
      Poll,
      {
        sessionId: string;
        pollId: string;
      }
    >({
      query: ({ sessionId, pollId }) => ({
        url: `/video/sessions/${sessionId}/polls/${pollId}/start`,
        method: 'POST',
      }),
      invalidatesTags: ['Poll'],
    }),

    endPoll: builder.mutation<
      Poll,
      {
        sessionId: string;
        pollId: string;
      }
    >({
      query: ({ sessionId, pollId }) => ({
        url: `/video/sessions/${sessionId}/polls/${pollId}/end`,
        method: 'POST',
      }),
      invalidatesTags: ['Poll'],
    }),

    respondToPoll: builder.mutation<
      void,
      {
        sessionId: string;
        pollId: string;
        response: {
          selectedOptions: string[];
          textResponse?: string;
          comment?: string;
        };
      }
    >({
      query: ({ sessionId, pollId, response }) => ({
        url: `/video/sessions/${sessionId}/polls/${pollId}/respond`,
        method: 'POST',
        body: response,
      }),
      invalidatesTags: ['Poll'],
    }),

    // Whiteboard Management
    createWhiteboard: builder.mutation<
      Whiteboard,
      {
        sessionId?: string;
        title: string;
        width?: number;
        height?: number;
      }
    >({
      query: data => ({
        url: '/whiteboards',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Whiteboard'],
    }),

    getWhiteboards: builder.query<
      Whiteboard[],
      {
        sessionId?: string;
        search?: string;
      }
    >({
      query: params => ({
        url: '/whiteboards',
        params,
      }),
      providesTags: ['Whiteboard'],
    }),

    getWhiteboard: builder.query<Whiteboard, string>({
      query: whiteboardId => ({
        url: `/whiteboards/${whiteboardId}`,
      }),
      providesTags: (result, error, whiteboardId) => [
        { type: 'Whiteboard', id: whiteboardId },
      ],
    }),

    updateWhiteboard: builder.mutation<
      Whiteboard,
      {
        whiteboardId: string;
        data: Partial<Whiteboard>;
      }
    >({
      query: ({ whiteboardId, data }) => ({
        url: `/whiteboards/${whiteboardId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { whiteboardId }) => [
        { type: 'Whiteboard', id: whiteboardId },
      ],
    }),

    deleteWhiteboard: builder.mutation<void, string>({
      query: whiteboardId => ({
        url: `/whiteboards/${whiteboardId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Whiteboard'],
    }),

    // Whiteboard Elements
    createWhiteboardElement: builder.mutation<
      WhiteboardElement,
      {
        whiteboardId: string;
        element: Partial<WhiteboardElement>;
      }
    >({
      query: ({ whiteboardId, element }) => ({
        url: `/whiteboards/${whiteboardId}/elements`,
        method: 'POST',
        body: element,
      }),
      invalidatesTags: (result, error, { whiteboardId }) => [
        { type: 'Whiteboard', id: whiteboardId },
      ],
    }),

    updateWhiteboardElement: builder.mutation<
      WhiteboardElement,
      {
        elementId: string;
        data: Partial<WhiteboardElement>;
      }
    >({
      query: ({ elementId, data }) => ({
        url: `/whiteboards/elements/${elementId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Whiteboard'],
    }),

    deleteWhiteboardElement: builder.mutation<void, string>({
      query: elementId => ({
        url: `/whiteboards/elements/${elementId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Whiteboard'],
    }),

    // Session Analytics
    getSessionAnalytics: builder.query<
      any,
      {
        sessionId?: string;
        startDate?: string;
        endDate?: string;
        groupBy?: 'day' | 'week' | 'month';
      }
    >({
      query: params => ({
        url: '/video/sessions/analytics',
        params,
      }),
      providesTags: ['SessionAnalytics'],
    }),

    // Recording Management
    startRecording: builder.mutation<void, string>({
      query: sessionId => ({
        url: `/video/sessions/${sessionId}/recording/start`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, sessionId) => [
        { type: 'VideoSession', id: sessionId },
      ],
    }),

    stopRecording: builder.mutation<void, string>({
      query: sessionId => ({
        url: `/video/sessions/${sessionId}/recording/stop`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, sessionId) => [
        { type: 'VideoSession', id: sessionId },
      ],
    }),

    getRecordings: builder.query<
      any[],
      {
        sessionId?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/video/sessions/recordings',
        params,
      }),
    }),

    // Screen Sharing
    startScreenShare: builder.mutation<
      void,
      {
        sessionId: string;
        participantId: string;
      }
    >({
      query: ({ sessionId, participantId }) => ({
        url: `/video/sessions/${sessionId}/screen-share/start`,
        method: 'POST',
        body: { participantId },
      }),
      invalidatesTags: ['SessionParticipant'],
    }),

    stopScreenShare: builder.mutation<
      void,
      {
        sessionId: string;
        participantId: string;
      }
    >({
      query: ({ sessionId, participantId }) => ({
        url: `/video/sessions/${sessionId}/screen-share/stop`,
        method: 'POST',
        body: { participantId },
      }),
      invalidatesTags: ['SessionParticipant'],
    }),

    // Quality Monitoring
    reportQualityIssue: builder.mutation<
      void,
      {
        sessionId: string;
        participantId: string;
        issue: {
          type: 'audio' | 'video' | 'network' | 'performance';
          severity: 'low' | 'medium' | 'high' | 'critical';
          description: string;
          metrics?: any;
        };
      }
    >({
      query: ({ sessionId, participantId, issue }) => ({
        url: `/video/sessions/${sessionId}/quality/report`,
        method: 'POST',
        body: { participantId, issue },
      }),
    }),

    getQualityMetrics: builder.query<
      any,
      {
        sessionId: string;
        participantId?: string;
        timeRange?: string;
      }
    >({
      query: params => ({
        url: `/video/sessions/${params.sessionId}/quality/metrics`,
        params,
      }),
    }),

    // Upcoming sessions
    getUpcomingSessions: builder.query<
      VideoSession[],
      {
        limit?: number;
        timeframe?: 'today' | 'tomorrow' | 'week' | 'month';
      }
    >({
      query: params => ({
        url: '/video/sessions/upcoming',
        params,
      }),
      providesTags: ['VideoSession'],
    }),

    // Search sessions
    searchSessions: builder.query<
      SessionListResponse,
      {
        query: string;
        filters?: {
          status?: string;
          sessionType?: string;
          dateRange?: [string, string];
          hostId?: string;
          courseId?: string;
        };
        page?: number;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/video/sessions/search',
        params,
      }),
      providesTags: ['VideoSession'],
    }),
  }),
});

export const {
  // Session Management
  useCreateVideoSessionMutation,
  useGetVideoSessionsQuery,
  useGetVideoSessionQuery,
  useUpdateVideoSessionMutation,
  useDeleteVideoSessionMutation,

  // Session Control
  useStartVideoSessionMutation,
  useEndVideoSessionMutation,
  useJoinVideoSessionMutation,
  useLeaveVideoSessionMutation,

  // Participants
  useGetSessionParticipantsQuery,
  useUpdateParticipantMutation,
  useRemoveParticipantMutation,

  // Breakout Rooms
  useCreateBreakoutRoomsMutation,
  useGetBreakoutRoomsQuery,
  useAssignToBreakoutRoomMutation,
  useCloseBreakoutRoomsMutation,

  // Attendance
  useGetSessionAttendanceQuery,
  useExportAttendanceMutation,
  useUpdateAttendanceRecordMutation,

  // Polls
  useCreatePollMutation,
  useGetSessionPollsQuery,
  useStartPollMutation,
  useEndPollMutation,
  useRespondToPollMutation,

  // Whiteboard
  useCreateWhiteboardMutation,
  useGetWhiteboardsQuery,
  useGetWhiteboardQuery,
  useUpdateWhiteboardMutation,
  useDeleteWhiteboardMutation,
  useCreateWhiteboardElementMutation,
  useUpdateWhiteboardElementMutation,
  useDeleteWhiteboardElementMutation,

  // Analytics & Quality
  useGetSessionAnalyticsQuery,
  useStartRecordingMutation,
  useStopRecordingMutation,
  useGetRecordingsQuery,
  useStartScreenShareMutation,
  useStopScreenShareMutation,
  useReportQualityIssueMutation,
  useGetQualityMetricsQuery,

  // Utility
  useGetUpcomingSessionsQuery,
  useSearchSessionsQuery,
} = liveTeachingApi;
