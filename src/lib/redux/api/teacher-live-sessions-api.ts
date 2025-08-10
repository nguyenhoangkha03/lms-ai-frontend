import { baseApi } from '@/lib/api/base-api';

// ==================== TYPES AND INTERFACES ====================

export interface LiveSessionMaterial {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'image' | 'code' | 'markdown' | 'link';
  url: string;
  size?: number;
  uploadedAt?: string;
}

export interface LiveSessionAttendee {
  studentId: string;
  studentName: string;
  studentEmail?: string;
  joinedAt?: string;
  leftAt?: string;
  duration?: number;
  participated: boolean;
}

export interface LiveSessionChat {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: 'teacher' | 'student' | 'system';
}

export interface LiveSessionPoll {
  id: string;
  question: string;
  options: string[];
  type: 'multiple_choice' | 'single_choice' | 'open_text';
  isActive: boolean;
  responses: {
    studentId: string;
    response: string | string[];
    timestamp: string;
  }[];
  createdAt: string;
}

export interface LiveSessionSettings {
  allowChat: boolean;
  allowMicrophone: boolean;
  allowCamera: boolean;
  allowScreenShare: boolean;
  recordSession: boolean;
  requireApproval: boolean;
}

export interface LiveSession {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  scheduledAt: string;
  duration: number; // in minutes
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  roomId: string;
  maxParticipants: number;
  currentParticipants: number;
  isRecorded: boolean;
  recordingUrl?: string;
  meetingUrl?: string;
  materials: LiveSessionMaterial[];
  attendance: LiveSessionAttendee[];
  chat?: LiveSessionChat[];
  polls?: LiveSessionPoll[];
  whiteboard?: any;
  settings: LiveSessionSettings;
  createdAt: string;
  updatedAt?: string;
}

export interface LiveSessionStatistics {
  totalSessions: number;
  scheduledSessions: number;
  liveSessions: number;
  completedSessions: number;
  totalParticipants: number;
  averageAttendance: number;
  totalDuration: number; // minutes
  recordedSessions: number;
  upcomingSessions: {
    id: string;
    title: string;
    scheduledAt: string;
    courseName: string;
  }[];
  recentActivity: {
    sessionId: string;
    action: string;
    timestamp: string;
    details: string;
  }[];
}

export interface CreateLiveSessionRequest {
  title: string;
  description: string;
  courseId: string;
  scheduledAt: string;
  duration: number;
  maxParticipants?: number;
  isRecorded?: boolean;
  materials?: Omit<LiveSessionMaterial, 'id'>[];
  settings?: Partial<LiveSessionSettings>;
}

export interface UpdateLiveSessionRequest extends Partial<CreateLiveSessionRequest> {
  status?: 'scheduled' | 'live' | 'completed' | 'cancelled';
}

export interface CreatePollRequest {
  question: string;
  options: string[];
  type?: 'multiple_choice' | 'single_choice' | 'open_text';
  duration?: number;
}

export interface SendChatMessageRequest {
  message: string;
  type?: 'announcement' | 'question' | 'response';
}

// ==================== API ENDPOINTS ====================

export const teacherLiveSessionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all live sessions
    getLiveSessions: builder.query<
      {
        sessions: LiveSession[];
        totalCount: number;
        summary: {
          scheduled: number;
          live: number;
          completed: number;
        };
      },
      { status?: string; courseId?: string }
    >({
      query: ({ status, courseId }) => ({
        url: '/teacher/live-sessions',
        params: { status, courseId },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: {
          sessions: LiveSession[];
          totalCount: number;
          summary: {
            scheduled: number;
            live: number;
            completed: number;
          };
        };
      }) => response.data,
      providesTags: ['LiveSessions'],
    }),

    // Get live session by ID
    getLiveSessionById: builder.query<LiveSession, string>({
      query: (sessionId) => `/teacher/live-sessions/${sessionId}`,
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: LiveSession;
      }) => response.data,
      providesTags: (result, error, id) => [{ type: 'LiveSessions', id }],
    }),

    // Create new live session
    createLiveSession: builder.mutation<LiveSession, CreateLiveSessionRequest>({
      query: (sessionData) => ({
        url: '/teacher/live-sessions',
        method: 'POST',
        body: sessionData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: LiveSession;
      }) => response.data,
      invalidatesTags: ['LiveSessions'],
    }),

    // Update live session
    updateLiveSession: builder.mutation<
      LiveSession,
      { id: string; updates: UpdateLiveSessionRequest }
    >({
      query: ({ id, updates }) => ({
        url: `/teacher/live-sessions/${id}`,
        method: 'PUT',
        body: updates,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: LiveSession;
      }) => response.data,
      invalidatesTags: (result, error, { id }) => [
        'LiveSessions',
        { type: 'LiveSessions', id },
      ],
    }),

    // Delete live session
    deleteLiveSession: builder.mutation<void, string>({
      query: (sessionId) => ({
        url: `/teacher/live-sessions/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LiveSessions'],
    }),

    // Start live session
    startLiveSession: builder.mutation<
      { meetingUrl: string },
      string
    >({
      query: (sessionId) => ({
        url: `/teacher/live-sessions/${sessionId}/start`,
        method: 'POST',
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: { meetingUrl: string };
      }) => response.data,
      invalidatesTags: (result, error, sessionId) => [
        'LiveSessions',
        { type: 'LiveSessions', id: sessionId },
      ],
    }),

    // End live session
    endLiveSession: builder.mutation<
      { recordingUrl?: string },
      string
    >({
      query: (sessionId) => ({
        url: `/teacher/live-sessions/${sessionId}/end`,
        method: 'POST',
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: { recordingUrl?: string };
      }) => response.data,
      invalidatesTags: (result, error, sessionId) => [
        'LiveSessions',
        { type: 'LiveSessions', id: sessionId },
      ],
    }),

    // Get session attendance
    getSessionAttendance: builder.query<
      {
        sessionId: string;
        totalInvited: number;
        totalAttended: number;
        attendanceRate: number;
        attendance: LiveSessionAttendee[];
      },
      string
    >({
      query: (sessionId) => `/teacher/live-sessions/${sessionId}/attendance`,
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: {
          sessionId: string;
          totalInvited: number;
          totalAttended: number;
          attendanceRate: number;
          attendance: LiveSessionAttendee[];
        };
      }) => response.data,
      providesTags: (result, error, sessionId) => [
        { type: 'SessionAttendance', id: sessionId },
      ],
    }),

    // Send chat message
    sendChatMessage: builder.mutation<
      LiveSessionChat,
      { sessionId: string; messageData: SendChatMessageRequest }
    >({
      query: ({ sessionId, messageData }) => ({
        url: `/teacher/live-sessions/${sessionId}/chat`,
        method: 'POST',
        body: messageData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: LiveSessionChat;
      }) => response.data,
      invalidatesTags: (result, error, { sessionId }) => [
        { type: 'LiveSessions', id: sessionId },
      ],
    }),

    // Create poll
    createPoll: builder.mutation<
      LiveSessionPoll,
      { sessionId: string; pollData: CreatePollRequest }
    >({
      query: ({ sessionId, pollData }) => ({
        url: `/teacher/live-sessions/${sessionId}/polls`,
        method: 'POST',
        body: pollData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: LiveSessionPoll;
      }) => response.data,
      invalidatesTags: (result, error, { sessionId }) => [
        { type: 'LiveSessions', id: sessionId },
      ],
    }),

    // Get live session statistics
    getLiveSessionStatistics: builder.query<LiveSessionStatistics, void>({
      query: () => '/teacher/live-sessions/statistics',
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: LiveSessionStatistics;
      }) => response.data,
      providesTags: ['LiveSessionStatistics'],
    }),
  }),
});

// Export hooks
export const {
  useGetLiveSessionsQuery,
  useGetLiveSessionByIdQuery,
  useCreateLiveSessionMutation,
  useUpdateLiveSessionMutation,
  useDeleteLiveSessionMutation,
  useStartLiveSessionMutation,
  useEndLiveSessionMutation,
  useGetSessionAttendanceQuery,
  useSendChatMessageMutation,
  useCreatePollMutation,
  useGetLiveSessionStatisticsQuery,
} = teacherLiveSessionsApi;