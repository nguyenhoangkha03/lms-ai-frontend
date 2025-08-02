export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  roomType:
    | 'general'
    | 'course'
    | 'lesson'
    | 'study_group'
    | 'office_hours'
    | 'help_desk'
    | 'announcements'
    | 'private'
    | 'public';
  status: 'active' | 'inactive' | 'archived' | 'locked' | 'maintenance';
  courseId?: string;
  lessonId?: string;
  isActive: boolean;
  isPrivate: boolean;
  maxParticipants?: number;
  participantCount: number;
  messageCount: number;
  lastMessageAt?: string;
  lastMessageBy?: string;
  avatarUrl?: string;
  settings: ChatRoomSettings;
  moderationSettings: ModerationSettings;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ChatRoomSettings {
  allowFileSharing: boolean;
  allowReactions: boolean;
  allowThreads: boolean;
  allowMentions: boolean;
  allowPinning: boolean;
  messageRetention: number; // days
  slowMode: boolean;
  slowModeDelay: number; // seconds
  requireApproval: boolean;
  wordFilter: boolean;
  customEmojis: string[];
  allowedFileTypes: string[];
  maxFileSize: number; // MB
  anonymousAllowed: boolean;
  readReceipts: boolean;
  typingIndicators: boolean;
}

export interface ModerationSettings {
  autoModeration: boolean;
  wordBlacklist: string[];
  spamDetection: boolean;
  linkBlocking: boolean;
  imageModeration: boolean;
  maxMessageLength: number;
  maxMessagesPerMinute: number;
  warningThreshold: number;
  timeoutDuration: number;
  banDuration: number;
  autoDeleteSpam: boolean;
  requireKeywordApproval: string[];
  toxicityThreshold: number;
}

export interface ChatParticipant {
  id: string;
  roomId: string;
  userId: string;
  user?: User;
  role: 'owner' | 'admin' | 'moderator' | 'member' | 'guest';
  status: 'active' | 'inactive' | 'banned' | 'muted' | 'away' | 'busy';
  joinedAt: string;
  lastRead?: string;
  lastReadMessageId?: string;
  unreadCount: number;
  isMuted: boolean;
  isPinned: boolean;
  isTyping: boolean;
  lastActiveAt: string;
  nickname?: string;
  customColor?: string;
  permissions: string[];
  notificationSettings: NotificationSettings;
  bannedAt?: string;
  bannedBy?: string;
  banReason?: string;
  banExpiresAt?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  sender?: User;
  content: string;
  messageType:
    | 'text'
    | 'image'
    | 'video'
    | 'audio'
    | 'file'
    | 'link'
    | 'code'
    | 'system'
    | 'announcement'
    | 'poll';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'deleted';
  replyToId?: string;
  replyTo?: ChatMessage;
  threadId?: string;
  attachments?: ChatFile[];
  mentions?: string[];
  reactions?: Record<string, ChatReaction>;
  isEdited: boolean;
  editedAt?: string;
  originalContent?: string;
  isDeleted: boolean;
  isPinned: boolean;
  pinnedAt?: string;
  pinnedBy?: string;
  isFlagged: boolean;
  flaggedAt?: string;
  flaggedBy?: string;
  flagReason?: string;
  readBy?: string[];
  deliveredTo?: string[];
  searchContent?: string; // Processed content for search
  createdAt: string;
  updatedAt: string;
}

export interface ChatReaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface ChatFile {
  id: string;
  messageId: string;
  uploadedBy: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  fileExtension: string;
  fileCategory: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
  thumbnailUrl?: string;
  duration?: number; // for audio/video
  metadata: Record<string, any>;
  status: 'uploading' | 'processing' | 'ready' | 'failed' | 'deleted';
  downloadCount: number;
  expiresAt?: string;
  isPublic: boolean;
  description?: string;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  parentMessageId: string;
  roomId: string;
  title?: string;
  description?: string;
  isActive: boolean;
  isPinned: boolean;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  replyCount: number;
  lastReplyAt?: string;
  lastReplyBy?: string;
  participants: string[];
  tags?: string[];
  createdBy: string;
  createdAt: string;
}

export interface ChatModeration {
  id: string;
  roomId: string;
  messageId?: string;
  userId: string;
  moderatorId: string;
  actionType:
    | 'warn'
    | 'mute'
    | 'kick'
    | 'ban'
    | 'delete_message'
    | 'edit_message';
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  duration?: number; // minutes
  expiresAt?: string;
  isActive: boolean;
  appealId?: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface ChatModerationAppeal {
  id: string;
  moderationId: string;
  userId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
}

export interface NotificationSettings {
  allMessages: boolean;
  mentions: boolean;
  reactions: boolean;
  replies: boolean;
  joins: boolean;
  leaves: boolean;
  promotions: boolean;
  announcements: boolean;
  directMessages: boolean;
  keywords: string[];
  soundEnabled: boolean;
  desktopNotifications: boolean;
  emailNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
  };
}

export interface ChatSearchParams {
  query: string;
  roomId?: string;
  senderId?: string;
  messageType?: string;
  dateFrom?: string;
  dateTo?: string;
  hasAttachments?: boolean;
  isPinned?: boolean;
  mentionsMe?: boolean;
  threadId?: string;
  tags?: string[];
}

export interface ChatSearchResult {
  message: ChatMessage;
  highlights: string[];
  context: {
    before: ChatMessage[];
    after: ChatMessage[];
  };
  relevanceScore: number;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  roomId: string;
  isTyping: boolean;
  timestamp: string;
}

export interface OnlinePresence {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
  currentRoom?: string;
  device: 'web' | 'mobile' | 'desktop';
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'student' | 'teacher' | 'admin';
  avatarUrl?: string;
  isActive: boolean;
  lastActiveAt?: string;
  profileStatus?: 'online' | 'away' | 'busy' | 'offline';
}

// Socket Events
export interface SocketEvents {
  // Room events
  'room:join': { roomId: string };
  'room:leave': { roomId: string };
  'room:user_joined': { roomId: string; user: User };
  'room:user_left': { roomId: string; userId: string };

  // Message events
  'message:send': Omit<ChatMessage, 'id' | 'createdAt' | 'updatedAt'>;
  'message:new': ChatMessage;
  'message:edit': { messageId: string; content: string; editedAt: string };
  'message:delete': { messageId: string; deletedAt: string };
  'message:pin': { messageId: string; pinnedBy: string; pinnedAt: string };
  'message:unpin': { messageId: string };
  'message:react': { messageId: string; emoji: string; userId: string };
  'message:unreact': { messageId: string; emoji: string; userId: string };

  // Thread events
  'thread:create': { parentMessageId: string; title?: string };
  'thread:reply': { threadId: string; message: ChatMessage };
  'thread:resolve': { threadId: string; resolvedBy: string };

  // Typing events
  'typing:start': { roomId: string; userId: string; userName: string };
  'typing:stop': { roomId: string; userId: string };

  // File events
  'file:upload': { roomId: string; file: ChatFile };
  'file:upload_progress': { roomId: string; fileId: string; progress: number };
  'file:upload_complete': { roomId: string; file: ChatFile };
  'file:upload_error': { roomId: string; fileId: string; error: string };

  // Moderation events
  'moderation:action': ChatModeration;
  'moderation:warning': { userId: string; reason: string; severity: string };

  // Presence events
  'presence:update': OnlinePresence;
  'presence:bulk': OnlinePresence[];
}

// API Request/Response types
export interface CreateRoomRequest {
  name: string;
  description?: string;
  roomType: ChatRoom['roomType'];
  courseId?: string;
  lessonId?: string;
  isPrivate?: boolean;
  maxParticipants?: number;
  settings?: Partial<ChatRoomSettings>;
  moderationSettings?: Partial<ModerationSettings>;
}

export interface JoinRoomRequest {
  roomId: string;
  password?: string;
  inviteCode?: string;
}

export interface SendMessageRequest {
  content: string;
  messageType?: ChatMessage['messageType'];
  replyToId?: string;
  threadId?: string;
  mentions?: string[];
  attachments?: string[]; // file IDs
}

export interface ChatApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ChatRoomAnalytics {
  messageCount: number;
  participantCount: number;
  activeParticipants: number;
  averageResponseTime: number;
  mostActiveUsers: Array<{
    userId: string;
    messageCount: number;
  }>;
  peakActivityHours: Array<{
    hour: number;
    messageCount: number;
  }>;
  topEmojis: Array<{
    emoji: string;
    count: number;
  }>;
  fileShareCount: number;
  threadCount: number;
}
