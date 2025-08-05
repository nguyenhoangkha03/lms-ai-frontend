export type FileType =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'archive'
  | 'other';

export type FileAccessLevel =
  | 'public'
  | 'enrolled_only'
  | 'premium_only'
  | 'private';

export type FileProcessingStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export type FileModerationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'flagged';

export type FileRelatedType =
  | 'course_thumbnail'
  | 'course_trailer'
  | 'lesson_video'
  | 'lesson_attachment'
  | 'user_avatar'
  | 'user_cover'
  | 'assignment_submission'
  | 'certificate'
  | 'forum_attachment'
  | 'chat_file'
  | 'system_resource';

export interface FileUpload {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy: string;
  updatedBy?: string;

  // Basic file information
  originalName: string;
  storedName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileType: FileType;
  extension: string;
  checksum: string;

  // Access and permissions
  accessLevel: FileAccessLevel;
  isActive: boolean;
  isPublic: boolean;
  isTemporary: boolean;
  expiresAt?: string;

  // Relationships
  lessonId?: string;
  courseId?: string;
  uploaderId: string;
  relatedType?: FileRelatedType;

  // Media-specific properties
  duration?: number; // for video/audio
  resolution?: string; // for video/images
  bitrate?: number; // for video/audio

  // Processing and optimization
  optimizedPath?: string;
  thumbnailPath?: string;
  processingStatus: FileProcessingStatus;
  processingError?: string;
  processedVersions: ProcessedVersion[];
  processingStartedAt?: string;
  processingCompletedAt?: string;

  // Usage tracking
  downloadCount: number;
  viewCount: number;
  lastDownloadedAt?: string;
  lastViewedAt?: string;

  // Moderation
  isFlagged: boolean;
  moderatedBy?: string;
  moderatedAt?: string;
  moderationNotes?: string;
  moderationStatus?: FileModerationStatus;

  // URLs and access
  fileUrl: string;
  downloadUrl?: string;
  streamingUrl?: string;
  cdnUrl?: string;

  // Metadata and settings
  settings: FileSettings;
  metadata: FileMetadata;
  uploadedAt: string;

  // Security
  securityScan?: FileSecurityScan;
  accessHistory?: FileAccessLog[];
}

export interface ProcessedVersion {
  id: string;
  type: 'thumbnail' | 'optimized' | 'transcoded' | 'compressed';
  format: string;
  size: number;
  path: string;
  url: string;
  quality?: string;
  resolution?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface FileSettings {
  allowDownload: boolean;
  allowStreaming: boolean;
  allowSharing: boolean;
  passwordProtected: boolean;
  password?: string;
  maxDownloads?: number;
  trackAccess: boolean;
  enableThumbnails: boolean;
  enableTranscoding: boolean;
  watermark?: {
    enabled: boolean;
    text?: string;
    image?: string;
    position:
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right'
      | 'center';
    opacity: number;
  };
  cdn?: {
    enabled: boolean;
    purgeOnUpdate: boolean;
    cacheControl: string;
    edgeLocations: string[];
  };
}

export interface FileMetadata {
  title?: string;
  description?: string;
  tags: string[];
  category?: string;
  language?: string;
  author?: string;
  copyright?: string;
  license?: string;

  // Technical metadata
  encoding?: string;
  colorSpace?: string;
  aspectRatio?: string;
  frameRate?: number;

  // SEO metadata
  altText?: string;
  caption?: string;

  // Custom metadata
  customFields: Record<string, any>;

  // Analytics metadata
  analyticsTracking: boolean;
  conversionGoals: string[];
}

export interface FileVersion {
  id: string;
  fileId: string;
  versionNumber: number;
  originalName: string;
  filePath: string;
  fileSize: number;
  checksum: string;
  createdAt: string;
  createdBy: string;
  versionNotes?: string;
  isActive: boolean;
  changes: VersionChange[];
}

export interface VersionChange {
  type: 'metadata' | 'content' | 'settings' | 'processing';
  field: string;
  oldValue: any;
  newValue: any;
  description: string;
}

export interface FileSecurityScan {
  id: string;
  fileId: string;
  scanType: 'virus' | 'malware' | 'content' | 'metadata' | 'comprehensive';
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;

  results: {
    virusScan?: {
      clean: boolean;
      threats: SecurityThreat[];
      engine: string;
      version: string;
    };
    malwareScan?: {
      clean: boolean;
      threats: SecurityThreat[];
      engine: string;
      version: string;
    };
    contentScan?: {
      appropriate: boolean;
      flags: ContentFlag[];
      confidence: number;
    };
    metadataScan?: {
      clean: boolean;
      issues: MetadataIssue[];
    };
  };

  riskScore: number; // 0-100
  recommendation: 'allow' | 'quarantine' | 'block';
  notes?: string;
}

export interface SecurityThreat {
  name: string;
  type: 'virus' | 'malware' | 'trojan' | 'ransomware' | 'suspicious';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string;
}

export interface ContentFlag {
  type: 'inappropriate' | 'violence' | 'adult' | 'copyright' | 'spam';
  confidence: number;
  description: string;
  location?: string;
}

export interface MetadataIssue {
  type: 'privacy' | 'location' | 'personal_info' | 'suspicious';
  field: string;
  value: string;
  risk: 'low' | 'medium' | 'high';
  description: string;
}

export interface FileAccessLog {
  id: string;
  fileId: string;
  userId: string;
  action: 'view' | 'download' | 'stream' | 'share' | 'edit';
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorReason?: string;
  metadata?: Record<string, any>;
}

export interface BulkFileOperation {
  id: string;
  type: 'delete' | 'move' | 'copy' | 'update_access' | 'process' | 'scan';
  fileIds: string[];
  parameters: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startedAt: string;
  completedAt?: string;
  results: {
    successful: string[];
    failed: Array<{ fileId: string; error: string }>;
  };
  createdBy: string;
}

export interface CDNConfiguration {
  enabled: boolean;
  provider: 'cloudflare' | 'aws' | 'azure' | 'gcp' | 'custom';

  settings: {
    baseUrl: string;
    apiKey: string;
    zoneId?: string;
    bucketName?: string;
    region?: string;

    caching: {
      defaultTtl: number;
      maxTtl: number;
      browserTtl: number;
      edgeTtl: number;
    };

    optimization: {
      autoMinify: boolean;
      compression: boolean;
      imageOptimization: boolean;
      webpConversion: boolean;
    };

    security: {
      hotlinkProtection: boolean;
      ddosProtection: boolean;
      wafEnabled: boolean;
      httpsRedirect: boolean;
    };

    analytics: {
      enabled: boolean;
      detailedLogging: boolean;
      realTimeStats: boolean;
    };
  };

  purgeRules: Array<{
    pattern: string;
    type: 'url' | 'tag' | 'header';
    condition: string;
  }>;

  edgeLocations: string[];
  status: 'active' | 'inactive' | 'error';
  lastSync: string;
  stats: {
    bandwidth: number;
    requests: number;
    cacheHitRatio: number;
    totalFiles: number;
    totalSize: number;
  };
}

export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  eta?: number;
  speed?: number;
}

export interface FileStreamingConfig {
  enabled: boolean;
  qualities: Array<{
    label: string;
    resolution: string;
    bitrate: number;
    format: string;
  }>;
  adaptiveBitrate: boolean;
  drm: {
    enabled: boolean;
    provider?: string;
    licenseUrl?: string;
  };
  subtitles: {
    enabled: boolean;
    autoGenerate: boolean;
    supportedLanguages: string[];
  };
  analytics: {
    enabled: boolean;
    trackViews: boolean;
    trackEngagement: boolean;
  };
}

// Filter and search interfaces
export interface FileFilter {
  fileType?: FileType[];
  accessLevel?: FileAccessLevel[];
  processingStatus?: FileProcessingStatus[];
  moderationStatus?: FileModerationStatus[];
  uploadDateRange?: {
    start: string;
    end: string;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  uploaderIds?: string[];
  courseIds?: string[];
  lessonIds?: string[];
}

export interface FileSearchQuery {
  query?: string;
  filters?: FileFilter;
  sortBy?:
    | 'createdAt'
    | 'updatedAt'
    | 'fileName'
    | 'fileSize'
    | 'downloadCount'
    | 'viewCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Component props interfaces
export interface FileUploadOptions {
  acceptedTypes: string[];
  maxFileSize: number; // in bytes
  maxFiles: number;
  allowMultiple: boolean;
  enablePreview: boolean;
  enableProgress: boolean;
  enableVersioning: boolean;
  autoProcess: boolean;
  uploadPath?: string;
  metadata?: Partial<FileMetadata>;
  settings?: Partial<FileSettings>;
}

export interface MediaProcessingOptions {
  image?: {
    resize?: { width?: number; height?: number; quality?: number };
    optimize?: boolean;
    thumbnails?: Array<{ width: number; height: number; suffix: string }>;
    watermark?: { text?: string; image?: string; position?: string };
    format?: 'webp' | 'jpeg' | 'png';
  };
  video?: {
    transcode?: {
      format?: string;
      quality?: 'low' | 'medium' | 'high' | 'ultra';
      resolution?: string;
      bitrate?: number;
    };
    thumbnails?: {
      count?: number;
      interval?: number;
      size?: { width: number; height: number };
    };
    streaming?: {
      enabled: boolean;
      qualities?: string[];
      adaptive?: boolean;
    };
    subtitles?: {
      generate?: boolean;
      languages?: string[];
    };
  };
}
