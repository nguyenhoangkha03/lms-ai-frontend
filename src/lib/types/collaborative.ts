export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'course_based';
  status: 'active' | 'inactive' | 'archived';
  creatorId: string;
  courseId?: string;
  avatarUrl?: string;
  inviteCode: string;
  maxMembers: number;
  memberCount: number;
  isPrivate: boolean;
  requiresApproval: boolean;
  tags: string[];
  schedule?: {
    type: 'weekly' | 'daily' | 'custom';
    days: string[];
    time: string;
    timezone: string;
  };
  goals: string[];
  rules: string[];
  statistics: {
    totalSessions: number;
    totalNotes: number;
    totalProjects: number;
    avgRating: number;
  };
  lastActivityAt: string;
  createdAt: string;
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  course?: {
    id: string;
    title: string;
    thumbnail?: string;
  };
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: 'owner' | 'moderator' | 'member';
    status: 'active' | 'pending' | 'invited';
    contributionScore: number;
  }>;
}

export interface CollaborativeNote {
  id: string;
  title: string;
  content: string;
  contentHtml: string;
  type: 'shared' | 'personal' | 'template' | 'pinned';
  status: 'active' | 'archived' | 'deleted';
  authorId: string;
  studyGroupId: string;
  courseId?: string;
  lessonId?: string;
  tags: string[];
  isPinned: boolean;
  isTemplate: boolean;
  templateId?: string;
  version: number;
  lastEditedAt: string;
  lastEditedBy: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  collaborators: Array<{
    id: string;
    userId: string;
    permission: 'read' | 'write' | 'admin';
    status: 'active' | 'pending' | 'declined';
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
  }>;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canShare: boolean;
  };
}

export interface GroupProject {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'review' | 'completed' | 'cancelled';
  leaderId: string;
  studyGroupId: string;
  courseId?: string;
  startDate: string;
  dueDate: string;
  completedAt?: string;
  progressPercentage: number;
  objectives: string[];
  deliverables: string[];
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    dueDate: string;
    isCompleted: boolean;
    completedAt?: string;
  }>;
  members: Array<{
    id: string;
    userId: string;
    role: 'leader' | 'member' | 'reviewer';
    status: 'active' | 'inactive' | 'pending';
    contributionScore: number;
    tasksCompleted: number;
    responsibilities: string[];
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'review' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assigneeId?: string;
    dueDate?: string;
    completedAt?: string;
    estimatedHours?: number;
    actualHours?: number;
    dependencies: string[];
  }>;
  statistics: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    totalHours: number;
    efficiency: number;
  };
}

export interface SharedWhiteboard {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  studyGroupId: string;
  status: 'active' | 'archived';
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  isLocked: boolean;
  defaultPermission: 'read' | 'write';
  canvasData: any;
  thumbnailUrl?: string;
  version: number;
  lastEditedAt: string;
  lastEditedBy: string;
  elements: Array<{
    id: string;
    type: 'rectangle' | 'circle' | 'line' | 'text' | 'image' | 'sticky_note';
    elementData: any;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    zIndex: number;
    color: string;
    strokeWidth: number;
    opacity: number;
    isLocked: boolean;
  }>;
  permissions: Array<{
    userId: string;
    permission: 'read' | 'write' | 'admin';
  }>;
}

export interface PeerReview {
  id: string;
  title: string;
  description: string;
  type: 'assignment' | 'project' | 'presentation' | 'code';
  status: 'setup' | 'submission' | 'review' | 'completed';
  creatorId: string;
  courseId?: string;
  assignmentId?: string;
  dueDate: string;
  reviewersPerSubmission: number;
  submissionsPerReviewer: number;
  isAnonymous: boolean;
  allowSelfReview: boolean;
  criteria: Array<{
    id: string;
    name: string;
    description: string;
    weight: number;
    maxScore: number;
  }>;
  rubric: any;
  instructions: string;
  submissions: Array<{
    id: string;
    submitterId: string;
    content: string;
    attachments: any[];
    status: 'draft' | 'submitted' | 'reviewed';
    submittedAt?: string;
    averageScore?: number;
    reviewsReceived: number;
    reviewsCompleted: number;
  }>;
  feedbacks: Array<{
    id: string;
    submissionId: string;
    reviewerId: string;
    feedback: string;
    score: number;
    criteriaScores: Record<string, number>;
    status: 'draft' | 'submitted';
    submittedAt?: string;
    isHelpful?: boolean;
  }>;
}
