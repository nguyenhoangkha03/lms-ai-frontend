import { FileAccessLevel } from '@/lib/types/file-management';

export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  VIDEO: 500 * 1024 * 1024, // 500MB
  AUDIO: 50 * 1024 * 1024, // 50MB
  DOCUMENT: 25 * 1024 * 1024, // 25MB
  ARCHIVE: 100 * 1024 * 1024, // 100MB
  DEFAULT: 10 * 1024 * 1024, // 10MB
} as const;

export const ALLOWED_MIME_TYPES = {
  IMAGE: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
  ],
  VIDEO: [
    'video/mp4',
    'video/webm',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/mkv',
    'video/m4v',
    'video/3gp',
  ],
  AUDIO: [
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/flac',
    'audio/aac',
    'audio/ogg',
    'audio/wma',
    'audio/m4a',
  ],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/rtf',
  ],
  ARCHIVE: [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-tar',
    'application/gzip',
    'application/x-7z-compressed',
  ],
} as const;

// File extensions
export const FILE_EXTENSIONS = {
  IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'],
  VIDEO: [
    '.mp4',
    '.webm',
    '.avi',
    '.mov',
    '.wmv',
    '.flv',
    '.mkv',
    '.m4v',
    '.3gp',
  ],
  AUDIO: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a'],
  DOCUMENT: [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.txt',
    '.csv',
    '.rtf',
  ],
  ARCHIVE: ['.zip', '.rar', '.tar', '.gz', '.7z', '.bz2'],
} as const;

// Processing configurations
export const PROCESSING_CONFIG = {
  IMAGE: {
    THUMBNAIL_SIZES: [
      { width: 64, height: 64, suffix: 'xs' },
      { width: 150, height: 150, suffix: 'sm' },
      { width: 300, height: 300, suffix: 'md' },
      { width: 600, height: 600, suffix: 'lg' },
      { width: 1200, height: 1200, suffix: 'xl' },
    ],
    OPTIMIZATION: {
      QUALITY: 85,
      PROGRESSIVE: true,
      STRIP_METADATA: true,
    },
    FORMATS: ['webp', 'jpeg', 'png'] as const,
  },
  VIDEO: {
    QUALITIES: [
      { name: '4K', resolution: '3840x2160', bitrate: 20000 },
      { name: '2K', resolution: '2560x1440', bitrate: 10000 },
      { name: '1080p', resolution: '1920x1080', bitrate: 5000 },
      { name: '720p', resolution: '1280x720', bitrate: 2500 },
      { name: '480p', resolution: '854x480', bitrate: 1000 },
      { name: '360p', resolution: '640x360', bitrate: 500 },
    ],
    FORMATS: ['mp4', 'webm'] as const,
    CODECS: ['h264', 'h265', 'vp9'] as const,
    THUMBNAIL_CONFIG: {
      COUNT: 3,
      INTERVAL: 10, // seconds
      SIZE: { width: 320, height: 180 },
    },
  },
  AUDIO: {
    QUALITIES: [
      { name: 'High', bitrate: 320, sampleRate: 48000 },
      { name: 'Medium', bitrate: 192, sampleRate: 44100 },
      { name: 'Low', bitrate: 128, sampleRate: 44100 },
    ],
    FORMATS: ['mp3', 'aac', 'ogg'] as const,
  },
} as const;

// Security scanning thresholds
export const SECURITY_CONFIG = {
  RISK_THRESHOLDS: {
    LOW: 30,
    MEDIUM: 60,
    HIGH: 80,
    CRITICAL: 95,
  },
  SCAN_TYPES: ['virus', 'malware', 'content', 'metadata'] as const,
  AUTO_SCAN_FILE_TYPES: ['executable', 'script', 'archive'] as const,
  QUARANTINE_THRESHOLD: 70,
  AUTO_DELETE_THRESHOLD: 95,
} as const;

// Access control configurations
export const ACCESS_CONTROL = {
  LEVELS: [
    {
      key: 'public' as FileAccessLevel,
      label: 'Public',
      description: 'Anyone can access',
      permissions: ['view', 'download', 'share'],
      icon: 'Globe',
      color: 'green',
    },
    {
      key: 'enrolled_only' as FileAccessLevel,
      label: 'Enrolled Only',
      description: 'Course students only',
      permissions: ['view', 'download', 'share'],
      icon: 'UserCheck',
      color: 'blue',
    },
    {
      key: 'premium_only' as FileAccessLevel,
      label: 'Premium Only',
      description: 'Premium members only',
      permissions: ['view', 'download'],
      icon: 'Users',
      color: 'purple',
    },
    {
      key: 'private' as FileAccessLevel,
      label: 'Private',
      description: 'Restricted access',
      permissions: ['edit', 'delete'],
      icon: 'Lock',
      color: 'red',
    },
  ],
  DEFAULT_LEVEL: 'enrolled_only' as FileAccessLevel,
} as const;

// CDN providers configuration
export const CDN_PROVIDERS = {
  CLOUDFLARE: {
    name: 'Cloudflare',
    baseUrl: 'https://cdnjs.cloudflare.com',
    features: ['optimization', 'security', 'analytics'],
    regions: ['global'],
  },
  AWS: {
    name: 'AWS CloudFront',
    baseUrl: 'https://cloudfront.net',
    features: ['optimization', 'security', 'streaming'],
    regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
  },
  AZURE: {
    name: 'Azure CDN',
    baseUrl: 'https://azureedge.net',
    features: ['optimization', 'security'],
    regions: ['global'],
  },
  GCP: {
    name: 'Google Cloud CDN',
    baseUrl: 'https://cdn.googleapis.com',
    features: ['optimization', 'streaming'],
    regions: ['global'],
  },
} as const;

// Upload constraints
export const UPLOAD_CONSTRAINTS = {
  MAX_FILES_PER_UPLOAD: 20,
  MAX_CONCURRENT_UPLOADS: 5,
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks
  RETRY_ATTEMPTS: 3,
  TIMEOUT: 30000, // 30 seconds
} as const;

// File categories
export const FILE_CATEGORIES = [
  { value: 'general', label: 'General', description: 'General purpose files' },
  {
    value: 'lesson',
    label: 'Lesson Material',
    description: 'Educational content for lessons',
  },
  {
    value: 'assignment',
    label: 'Assignment',
    description: 'Student assignments and submissions',
  },
  {
    value: 'resource',
    label: 'Resource',
    description: 'Learning resources and references',
  },
  {
    value: 'media',
    label: 'Media',
    description: 'Images, videos, and audio files',
  },
  {
    value: 'certificate',
    label: 'Certificate',
    description: 'Certificates and achievements',
  },
  { value: 'system', label: 'System', description: 'System generated files' },
] as const;

// Processing status messages
export const PROCESSING_MESSAGES = {
  pending: 'Waiting to be processed',
  processing: 'Processing in progress...',
  completed: 'Processing completed successfully',
  failed: 'Processing failed',
} as const;

// Error codes and messages
export const ERROR_CODES = {
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  PROCESSING_FAILED: 'PROCESSING_FAILED',
  SECURITY_SCAN_FAILED: 'SECURITY_SCAN_FAILED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

export const ERROR_MESSAGES = {
  [ERROR_CODES.FILE_TOO_LARGE]: 'File size exceeds the maximum allowed limit',
  [ERROR_CODES.INVALID_FILE_TYPE]: 'File type is not supported',
  [ERROR_CODES.UPLOAD_FAILED]: 'Failed to upload file',
  [ERROR_CODES.PROCESSING_FAILED]: 'Failed to process file',
  [ERROR_CODES.SECURITY_SCAN_FAILED]: 'Security scan failed',
  [ERROR_CODES.ACCESS_DENIED]: 'Access denied to this file',
  [ERROR_CODES.QUOTA_EXCEEDED]: 'Storage quota exceeded',
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection error',
} as const;

// Content moderation thresholds
export const CONTENT_MODERATION = {
  CONFIDENCE_THRESHOLDS: {
    INAPPROPRIATE: 0.7,
    VIOLENCE: 0.8,
    ADULT: 0.9,
    COPYRIGHT: 0.6,
    SPAM: 0.5,
  },
  AUTO_FLAG_THRESHOLD: 0.8,
  AUTO_REJECT_THRESHOLD: 0.95,
  REVIEW_REQUIRED_THRESHOLD: 0.6,
} as const;

// Analytics events
export const ANALYTICS_EVENTS = {
  FILE_UPLOADED: 'file_uploaded',
  FILE_DOWNLOADED: 'file_downloaded',
  FILE_VIEWED: 'file_viewed',
  FILE_SHARED: 'file_shared',
  FILE_DELETED: 'file_deleted',
  PROCESSING_STARTED: 'processing_started',
  PROCESSING_COMPLETED: 'processing_completed',
  SECURITY_SCAN_COMPLETED: 'security_scan_completed',
  THREAT_DETECTED: 'threat_detected',
  CONTENT_FLAGGED: 'content_flagged',
} as const;

// Streaming configurations
export const STREAMING_CONFIG = {
  PROTOCOLS: ['hls', 'dash'] as const,
  DEFAULT_PROTOCOL: 'hls' as const,
  SEGMENT_DURATION: 6, // seconds
  PLAYLIST_WINDOW: 5, // number of segments
  ADAPTIVE_BITRATE: {
    ENABLED: true,
    MIN_BANDWIDTH: 500, // kbps
    MAX_BANDWIDTH: 20000, // kbps
    INITIAL_BANDWIDTH: 2000, // kbps
  },
  DRM: {
    PROVIDERS: ['widevine', 'fairplay', 'playready'] as const,
    DEFAULT_PROVIDER: 'widevine' as const,
  },
} as const;

// Backup and versioning
export const VERSIONING_CONFIG = {
  MAX_VERSIONS: 10,
  AUTO_BACKUP: true,
  BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  RETENTION_DAYS: 30,
  COMPRESS_OLD_VERSIONS: true,
} as const;

// Performance monitoring
export const PERFORMANCE_METRICS = {
  UPLOAD_SPEED_THRESHOLD: 1024 * 1024, // 1MB/s
  PROCESSING_TIME_THRESHOLD: 60 * 1000, // 60 seconds
  CDN_RESPONSE_TIME_THRESHOLD: 500, // 500ms
  CACHE_HIT_RATIO_TARGET: 0.85, // 85%
} as const;

// Notification templates
export const NOTIFICATION_TEMPLATES = {
  UPLOAD_COMPLETED: {
    title: 'File Upload Completed',
    message: 'Your file "{fileName}" has been uploaded successfully.',
    type: 'success',
  },
  PROCESSING_COMPLETED: {
    title: 'File Processing Completed',
    message: 'Your file "{fileName}" has been processed and is ready to use.',
    type: 'success',
  },
  SECURITY_THREAT_DETECTED: {
    title: 'Security Threat Detected',
    message:
      'A security threat was detected in file "{fileName}". The file has been quarantined.',
    type: 'error',
  },
  CONTENT_FLAGGED: {
    title: 'Content Flagged for Review',
    message: 'Your file "{fileName}" has been flagged for content review.',
    type: 'warning',
  },
  QUOTA_WARNING: {
    title: 'Storage Quota Warning',
    message:
      'You are approaching your storage quota limit. Consider deleting unused files.',
    type: 'warning',
  },
} as const;

// API endpoints
export const API_ENDPOINTS = {
  UPLOAD: '/api/v1/files/upload',
  UPLOAD_MULTIPLE: '/api/v1/files/upload/multiple',
  DOWNLOAD: '/api/v1/files/download',
  STREAM: '/api/v1/files/stream',
  PROCESS_IMAGE: '/api/v1/files/{id}/process/image',
  PROCESS_VIDEO: '/api/v1/files/{id}/process/video',
  SECURITY_SCAN: '/api/v1/files/{id}/security-scan',
  MODERATE: '/api/v1/files/{id}/moderate',
  ACCESS_URL: '/api/v1/files/{id}/access-url',
  BULK_DELETE: '/api/v1/files/bulk',
  STATISTICS: '/api/v1/files/statistics/overview',
  CDN_CONFIG: '/api/v1/cdn/configuration',
  CDN_PURGE: '/api/v1/cdn/purge',
} as const;

// Default configurations for different user roles
export const ROLE_BASED_CONFIG = {
  admin: {
    maxFileSize: FILE_SIZE_LIMITS.VIDEO,
    allowedTypes: Object.values(ALLOWED_MIME_TYPES).flat(),
    canModerate: true,
    canViewAnalytics: true,
    canManageCDN: true,
    canBulkOperations: true,
  },
  teacher: {
    maxFileSize: FILE_SIZE_LIMITS.VIDEO,
    allowedTypes: [
      ...ALLOWED_MIME_TYPES.IMAGE,
      ...ALLOWED_MIME_TYPES.VIDEO,
      ...ALLOWED_MIME_TYPES.AUDIO,
      ...ALLOWED_MIME_TYPES.DOCUMENT,
    ],
    canModerate: false,
    canViewAnalytics: true,
    canManageCDN: false,
    canBulkOperations: true,
  },
  student: {
    maxFileSize: FILE_SIZE_LIMITS.DOCUMENT,
    allowedTypes: [...ALLOWED_MIME_TYPES.IMAGE, ...ALLOWED_MIME_TYPES.DOCUMENT],
    canModerate: false,
    canViewAnalytics: false,
    canManageCDN: false,
    canBulkOperations: false,
  },
} as const;

// Cache configurations
export const CACHE_CONFIG = {
  STATIC_ASSETS: {
    TTL: 365 * 24 * 60 * 60, // 1 year
    TYPES: ['image', 'video', 'audio'],
  },
  DYNAMIC_CONTENT: {
    TTL: 60 * 60, // 1 hour
    TYPES: ['document'],
  },
  CDN_PURGE_DELAY: 5 * 60 * 1000, // 5 minutes
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_AUTO_PROCESSING: true,
  ENABLE_SECURITY_SCANNING: true,
  ENABLE_CDN_INTEGRATION: true,
  ENABLE_STREAMING: true,
  ENABLE_VERSIONING: true,
  ENABLE_CONTENT_MODERATION: true,
  ENABLE_BULK_OPERATIONS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_NOTIFICATIONS: true,
} as const;

// Default metadata templates
export const METADATA_TEMPLATES = {
  image: {
    altText: '',
    caption: '',
    photographer: '',
    license: 'All Rights Reserved',
    tags: [],
  },
  video: {
    title: '',
    description: '',
    duration: 0,
    resolution: '',
    frameRate: 0,
    tags: [],
    subtitles: [],
  },
  audio: {
    title: '',
    artist: '',
    album: '',
    duration: 0,
    bitrate: 0,
    tags: [],
  },
  document: {
    title: '',
    author: '',
    subject: '',
    keywords: [],
    pageCount: 0,
    language: 'en',
  },
} as const;
