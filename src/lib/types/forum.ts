export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  isActive: boolean;
  isFeatured: boolean;
  isPrivate: boolean;
  requiresApproval: boolean;
  threadCount: number;
  postCount: number;
  lastActivityAt: string;
  lastPostId?: string;
  lastPostUserId?: string;
  parentId?: string;
  displayOrder: number;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ForumThread {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content?: string;
  contentHtml?: string;
  authorId: string;
  categoryId: string;
  type: 'question' | 'discussion' | 'announcement';
  status: 'active' | 'closed' | 'locked';
  isPinned: boolean;
  isFeatured: boolean;
  isLocked: boolean;
  isResolved: boolean;
  acceptedAnswerId?: string;
  viewCount: number;
  replyCount: number;
  upvoteCount: number;
  downvoteCount: number;
  score: number;
  lastActivityAt: string;
  lastPostId?: string;
  lastPostUserId?: string;
  lockedAt?: string;
  lockedBy?: string;
  lockReason?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    badges?: Array<{
      name: string;
      color: string;
      icon: string;
    }>;
    reputation: number;
  };
  category: {
    id: string;
    name: string;
    color: string;
  };
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  userVote?: 'up' | 'down' | null;
  isBookmarked?: boolean;
}

export interface ForumPost {
  id: string;
  threadId: string;
  authorId: string;
  parentId?: string;
  content: string;
  contentHtml: string;
  type: 'answer' | 'comment';
  status: 'active' | 'hidden' | 'deleted';
  isAccepted: boolean;
  isEdited: boolean;
  editedAt?: string;
  editedBy?: string;
  editReason?: string;
  upvoteCount: number;
  downvoteCount: number;
  score: number;
  helpfulCount: number;
  replyCount: number;
  isReported: boolean;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    reputation: number;
    badges?: Array<{
      name: string;
      color: string;
      icon: string;
    }>;
  };
  userVote?: 'up' | 'down' | null;
  isHelpful?: boolean;
  replies?: ForumPost[];
  attachments?: Array<{
    id: string;
    filename: string;
    fileUrl: string;
    mimeType: string;
    fileSize: number;
    thumbnailUrl?: string;
  }>;
  mentions?: string[];
}

export interface ForumTag {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  isActive: boolean;
  isFeatured: boolean;
  usageCount: number;
  createdAt: string;
  createdBy: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
}

export interface SearchResult {
  id: string;
  type: 'thread' | 'post';
  title: string;
  content: string;
  excerpt: string;
  url: string;
  score: number;
  relevanceScore: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    reputation: number;
  };
  thread?: {
    id: string;
    title: string;
    category: {
      name: string;
      color: string;
    };
    isResolved: boolean;
    replyCount: number;
  };
  highlightedContent: string;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

export interface ForumStats {
  totalThreads: number;
  totalPosts: number;
  totalUsers: number;
  activeUsers: number;
  todayPosts: number;
  topContributors: Array<{
    id: string;
    name: string;
    avatar?: string;
    postCount: number;
    reputation: number;
  }>;
  counts?: {
    total: number;
    threads: number;
    posts: number;
  };
}

export interface UserReputation {
  userId: string;
  score: number;
  rank: number;
  totalPosts: number;
  totalThreads: number;
  totalUpvotes: number;
  totalDownvotes: number;
  totalAcceptedAnswers: number;
  totalHelpfulVotes: number;
  bestAnswerStreak: number;
  currentAnswerStreak: number;
  lastActivityDate: string;
  todayPoints: number;
  weekPoints: number;
  monthPoints: number;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    badgeType: 'bronze' | 'silver' | 'gold' | 'platinum';
    iconUrl: string;
    color: string;
    points: number;
    earnedAt: string;
  }>;
  history: Array<{
    date: string;
    points: number;
    reason: string;
    relatedPostId?: string;
  }>;
}

export interface ModerationReport {
  id: string;
  postId: string;
  reporterId: string;
  reason:
    | 'spam'
    | 'inappropriate'
    | 'harassment'
    | 'misinformation'
    | 'copyright'
    | 'other';
  details: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  handledBy?: string;
  handledAt?: string;
  moderatorNotes?: string;
  createdAt: string;
  reporter: {
    id: string;
    name: string;
    avatar?: string;
  };
  post: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
    };
    thread: {
      id: string;
      title: string;
    };
  };
}
