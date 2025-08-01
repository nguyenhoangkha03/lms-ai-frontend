export interface VideoSession {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  courseId?: string;
  lessonId?: string;
  sessionType:
    | 'meeting'
    | 'webinar'
    | 'lecture'
    | 'tutorial'
    | 'office_hours'
    | 'study_group'
    | 'exam'
    | 'workshop';
  status:
    | 'scheduled'
    | 'live'
    | 'completed'
    | 'cancelled'
    | 'postponed'
    | 'failed';
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  maxParticipants: number;
  currentParticipants: number;
  totalParticipants: number;
  provider:
    | 'webrtc'
    | 'zoom'
    | 'teams'
    | 'meet'
    | 'jitsi'
    | 'bigbluebutton'
    | 'custom';
  meetingUrl?: string;
  meetingId?: string;
  passcode?: string;
  dialInInfo?: string;
  isRecording: boolean;
  recordingUrl?: string;
  recordingDuration?: number;
  recordingSize?: number;
  requiresRegistration: boolean;
  waitingRoomEnabled: boolean;
  settings: SessionSettings;
  securitySettings: SecuritySettings;
  breakoutRooms?: BreakoutRoom[];
  polls?: Poll[];
  analytics?: SessionAnalytics;
  qualityMetrics?: QualityMetrics;
  agenda?: string;
  notes?: string;
  summary?: string;
  followUpActions?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface VideoParticipant {
  id: string;
  sessionId: string;
  userId: string;
  role:
    | 'owner'
    | 'admin'
    | 'moderator'
    | 'member'
    | 'guest'
    | 'attendee'
    | 'presenter'
    | 'co_host'
    | 'host';
  connectionStatus:
    | 'connected'
    | 'connecting'
    | 'disconnected'
    | 'reconnecting'
    | 'failed';
  joinedAt: string;
  leftAt?: string;
  duration: number;
  isMuted: boolean;
  videoDisabled: boolean;
  isScreenSharing: boolean;
  handRaised: boolean;
  handRaisedAt?: string;
  breakoutRoomId?: string;
  lastPingAt: string;
  audioLevel: number;
  videoQuality: 'high' | 'medium' | 'low';
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
  device: DeviceInfo;
  permissions: ParticipantPermissions;
  activities: ParticipantActivity[];
  attentionScore?: number;
  engagementLevel: 'high' | 'medium' | 'low';
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface SessionSettings {
  allowChat: boolean;
  allowScreenShare: boolean;
  allowRecording: boolean;
  muteOnEntry: boolean;
  videoOnEntry: boolean;
  waitingRoom: boolean;
  autoAdmit: boolean;
  allowBreakoutRooms: boolean;
  allowPolls: boolean;
  allowWhiteboard: boolean;
  allowFileSharing: boolean;
  allowAnnotations: boolean;
  enableCaptions: boolean;
  enableTranscription: boolean;
  maxParticipants: number;
  sessionTimeout: number;
  participantTimeout: number;
  qualitySettings: QualitySettings;
}

export interface SecuritySettings {
  requirePassword: boolean;
  password?: string;
  requireWaitingRoom: boolean;
  onlyAuthenticatedUsers: boolean;
  enableLobby: boolean;
  moderatorApproval: boolean;
  disallowAnonymous: boolean;
  ipWhitelist?: string[];
  allowedDomains?: string[];
  sessionLock: boolean;
  screenWatermark: boolean;
  disableRecordingDownload: boolean;
  preventScreenshots: boolean;
  endToEndEncryption: boolean;
}

export interface BreakoutRoom {
  id: string;
  sessionId: string;
  name: string;
  maxParticipants: number;
  currentParticipants: number;
  participants: string[]; // participant IDs
  status: 'active' | 'inactive' | 'closed';
  createdAt: string;
  closedAt?: string;
  settings: {
    allowReturn: boolean;
    timeLimit?: number;
    moderatorMessage?: string;
  };
}

export interface Poll {
  id: string;
  sessionId: string;
  question: string;
  options: PollOption[];
  type: 'single_choice' | 'multiple_choice' | 'yes_no' | 'rating' | 'text';
  status: 'draft' | 'active' | 'ended';
  anonymous: boolean;
  showResults: boolean;
  allowComments: boolean;
  timeLimit?: number;
  createdAt: string;
  endedAt?: string;
  responses: PollResponse[];
  results: PollResults;
}

export interface PollOption {
  id: string;
  text: string;
  order: number;
}

export interface PollResponse {
  id: string;
  pollId: string;
  participantId: string;
  selectedOptions: string[];
  textResponse?: string;
  comment?: string;
  submittedAt: string;
}

export interface PollResults {
  totalResponses: number;
  optionCounts: Record<string, number>;
  averageRating?: number;
  textResponses: string[];
}

export interface WhiteboardElement {
  id: string;
  whiteboardId: string;
  type:
    | 'line'
    | 'rectangle'
    | 'circle'
    | 'text'
    | 'arrow'
    | 'freehand'
    | 'image'
    | 'sticky_note';
  x: number;
  y: number;
  width?: number;
  height?: number;
  data: Record<string, any>;
  style: {
    strokeColor: string;
    fillColor?: string;
    strokeWidth: number;
    opacity: number;
    fontSize?: number;
    fontFamily?: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface Whiteboard {
  id: string;
  sessionId?: string;
  title: string;
  width: number;
  height: number;
  backgroundColor: string;
  elements: WhiteboardElement[];
  collaborators: WhiteboardCollaborator[];
  permissions: WhiteboardPermissions;
  version: number;
  isShared: boolean;
  isLocked: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WhiteboardCollaborator {
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canShare: boolean;
    canComment: boolean;
  };
  joinedAt: string;
}

export interface WhiteboardPermissions {
  isPublic: boolean;
  allowAnonymous: boolean;
  requiresLogin: boolean;
  editPermission: 'owner' | 'moderators' | 'all_participants';
  viewPermission: 'owner' | 'moderators' | 'all_participants' | 'public';
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  participantId: string;
  userId: string;
  joinedAt: string;
  leftAt?: string;
  duration: number;
  reconnections: number;
  status: 'present' | 'late' | 'absent' | 'excused';
  notes?: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
    coordinates?: [number, number];
  };
  engagementScore: number;
  participationLevel: 'high' | 'medium' | 'low';
  interactions: {
    chatMessages: number;
    handsRaised: number;
    pollResponses: number;
    whiteboardInteractions: number;
    screenShares: number;
  };
}

export interface SessionAnalytics {
  totalParticipants: number;
  peakParticipants: number;
  averageDuration: number;
  attendanceRate: number;
  engagementScore: number;
  chatMessages: number;
  pollsCreated: number;
  screenShares: number;
  whiteboardUse: number;
  recordingViews?: number;
  qualityIssues: number;
  networkProblems: number;
  dropoutRate: number;
  participantSatisfaction?: number;
}

export interface QualityMetrics {
  audioQuality: {
    average: number;
    poor: number;
    fair: number;
    good: number;
    excellent: number;
  };
  videoQuality: {
    average: number;
    low: number;
    medium: number;
    high: number;
  };
  networkStability: {
    packetLoss: number;
    latency: number;
    jitter: number;
    bandwidth: number;
  };
  devicePerformance: {
    cpuUsage: number;
    memoryUsage: number;
    batteryLevel?: number;
  };
}

export interface DeviceInfo {
  type: 'desktop' | 'laptop' | 'tablet' | 'mobile';
  os: string;
  browser: string;
  version: string;
  hasCamera: boolean;
  hasMicrophone: boolean;
  hasSpeakers: boolean;
  screenResolution: string;
  bandwidth: number;
}

export interface ParticipantPermissions {
  canUnmute: boolean;
  canTurnOnVideo: boolean;
  canScreenShare: boolean;
  canChat: boolean;
  canUseWhiteboard: boolean;
  canCreatePolls: boolean;
  canManageBreakoutRooms: boolean;
  canRecord: boolean;
  canInviteOthers: boolean;
  canEndSession: boolean;
}

export interface ParticipantActivity {
  type:
    | 'join'
    | 'leave'
    | 'mute'
    | 'unmute'
    | 'video_on'
    | 'video_off'
    | 'screen_share_start'
    | 'screen_share_stop'
    | 'hand_raise'
    | 'hand_lower'
    | 'chat_message'
    | 'poll_response'
    | 'breakout_join'
    | 'breakout_leave';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface QualitySettings {
  videoResolution: '360p' | '480p' | '720p' | '1080p' | 'auto';
  videoFrameRate: number;
  audioBitrate: number;
  videoBitrate: number;
  adaptiveBitrate: boolean;
  enableHD: boolean;
  enableLowLatency: boolean;
}

// API DTOs
export interface CreateVideoSessionDto {
  title: string;
  description?: string;
  courseId?: string;
  lessonId?: string;
  sessionType: VideoSession['sessionType'];
  scheduledStart: string;
  scheduledEnd: string;
  maxParticipants: number;
  provider: VideoSession['provider'];
  requiresRegistration: boolean;
  waitingRoomEnabled: boolean;
  settings: Partial<SessionSettings>;
  securitySettings: Partial<SecuritySettings>;
  agenda?: string;
}

export interface UpdateVideoSessionDto extends Partial<CreateVideoSessionDto> {
  status?: VideoSession['status'];
  actualStart?: string;
  actualEnd?: string;
  notes?: string;
  summary?: string;
  followUpActions?: string[];
}

export interface JoinSessionDto {
  sessionId: string;
  displayName?: string;
  password?: string;
}

export interface CreateBreakoutRoomsDto {
  sessionId: string;
  rooms: Array<{
    name: string;
    maxParticipants: number;
    participants?: string[];
  }>;
  settings: {
    allowReturn: boolean;
    timeLimit?: number;
    moderatorMessage?: string;
  };
}

// Response types
export interface SessionListResponse {
  sessions: VideoSession[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SessionDetailResponse extends VideoSession {
  participants: VideoParticipant[];
  attendanceRecords: AttendanceRecord[];
  analytics: SessionAnalytics;
  qualityMetrics: QualityMetrics;
}

export interface AttendanceResponse {
  records: AttendanceRecord[];
  summary: {
    totalParticipants: number;
    attendanceRate: number;
    averageDuration: number;
    onTimeRate: number;
  };
}

// Socket events
export interface SocketEvents {
  // Session events
  'session:join': { sessionId: string; participantId: string };
  'session:leave': { sessionId: string; participantId: string };
  'session:start': { sessionId: string };
  'session:end': { sessionId: string };
  'session:update': { sessionId: string; data: Partial<VideoSession> };

  // Participant events
  'participant:join': { sessionId: string; participant: VideoParticipant };
  'participant:leave': { sessionId: string; participantId: string };
  'participant:update': {
    sessionId: string;
    participantId: string;
    data: Partial<VideoParticipant>;
  };
  'participant:mute': { sessionId: string; participantId: string };
  'participant:unmute': { sessionId: string; participantId: string };
  'participant:video_on': { sessionId: string; participantId: string };
  'participant:video_off': { sessionId: string; participantId: string };
  'participant:hand_raise': { sessionId: string; participantId: string };
  'participant:hand_lower': { sessionId: string; participantId: string };

  // Breakout room events
  'breakout:create': { sessionId: string; rooms: BreakoutRoom[] };
  'breakout:assign': {
    sessionId: string;
    participantId: string;
    roomId: string;
  };
  'breakout:close': { sessionId: string; roomId?: string };
  'breakout:return': { sessionId: string; participantId: string };

  // Chat events
  'chat:message': { sessionId: string; message: any };
  'chat:typing': { sessionId: string; participantId: string };

  // Poll events
  'poll:create': { sessionId: string; poll: Poll };
  'poll:start': { sessionId: string; pollId: string };
  'poll:end': { sessionId: string; pollId: string };
  'poll:response': {
    sessionId: string;
    pollId: string;
    response: PollResponse;
  };

  // Whiteboard events
  'whiteboard:element_add': {
    whiteboardId: string;
    element: WhiteboardElement;
  };
  'whiteboard:element_update': {
    whiteboardId: string;
    elementId: string;
    data: Partial<WhiteboardElement>;
  };
  'whiteboard:element_delete': { whiteboardId: string; elementId: string };
  'whiteboard:clear': { whiteboardId: string };

  // Screen sharing events
  'screen:share_start': { sessionId: string; participantId: string };
  'screen:share_stop': { sessionId: string; participantId: string };

  // Recording events
  'recording:start': { sessionId: string };
  'recording:stop': { sessionId: string };
  'recording:ready': { sessionId: string; recordingUrl: string };

  // Quality events
  'quality:update': {
    sessionId: string;
    participantId: string;
    metrics: Partial<QualityMetrics>;
  };
  'quality:issue': { sessionId: string; participantId: string; issue: string };
}
