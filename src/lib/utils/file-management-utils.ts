import {
  FileType,
  FileAccessLevel,
  FileProcessingStatus,
} from '@/lib/types/file-management';

export function getFileTypeFromMimeType(mimeType: string): FileType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';

  if (
    mimeType.includes('pdf') ||
    mimeType.includes('document') ||
    mimeType.includes('text') ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('presentation')
  ) {
    return 'document';
  }

  if (
    mimeType.includes('zip') ||
    mimeType.includes('rar') ||
    mimeType.includes('tar') ||
    mimeType.includes('archive')
  ) {
    return 'archive';
  }

  return 'other';
}

export function getFileTypeFromExtension(filename: string): FileType {
  const extension = filename.toLowerCase().split('.').pop() || '';

  const imageExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'svg',
    'bmp',
    'ico',
  ];
  const videoExtensions = [
    'mp4',
    'avi',
    'mov',
    'wmv',
    'flv',
    'webm',
    'mkv',
    'm4v',
  ];
  const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'];
  const documentExtensions = [
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'txt',
    'rtf',
    'odt',
  ];
  const archiveExtensions = ['zip', 'rar', 'tar', 'gz', '7z', 'bz2'];

  if (imageExtensions.includes(extension)) return 'image';
  if (videoExtensions.includes(extension)) return 'video';
  if (audioExtensions.includes(extension)) return 'audio';
  if (documentExtensions.includes(extension)) return 'document';
  if (archiveExtensions.includes(extension)) return 'archive';

  return 'other';
}

export function validateFileSize(file: File, maxSizeMB: number): string | null {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size exceeds ${maxSizeMB}MB limit`;
  }
  return null;
}

export function validateFileType(
  file: File,
  allowedTypes: string[]
): string | null {
  if (allowedTypes.includes('*')) return null;

  const isAllowed = allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1));
    }
    if (type.startsWith('.')) {
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    }
    return file.type === type;
  });

  if (!isAllowed) {
    return `File type not supported. Allowed types: ${allowedTypes.join(', ')}`;
  }

  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function calculateUploadProgress(loaded: number, total: number): number {
  return Math.round((loaded / total) * 100);
}

export function estimateRemainingTime(
  loaded: number,
  total: number,
  startTime: number
): number {
  const elapsed = Date.now() - startTime;
  const progress = loaded / total;

  if (progress === 0) return 0;

  const estimatedTotal = elapsed / progress;
  return Math.max(0, estimatedTotal - elapsed);
}

export function formatRemainingTime(milliseconds: number): string {
  const seconds = Math.ceil(milliseconds / 1000);

  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)}m`;
  return `${Math.ceil(seconds / 3600)}h`;
}

export async function generateFileChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function createFilePreview(file: File): Promise<string | null> {
  return new Promise(resolve => {
    if (!file.type.startsWith('image/')) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export function getAccessLevelColor(accessLevel: FileAccessLevel): string {
  switch (accessLevel) {
    case 'public':
      return 'text-green-600 border-green-600';
    case 'enrolled_only':
      return 'text-blue-600 border-blue-600';
    case 'premium_only':
      return 'text-purple-600 border-purple-600';
    case 'private':
      return 'text-red-600 border-red-600';
    default:
      return 'text-gray-600 border-gray-600';
  }
}

/**
 * Get processing status color for UI
 */
export function getProcessingStatusColor(status: FileProcessingStatus): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600';
    case 'processing':
      return 'text-blue-600';
    case 'completed':
      return 'text-green-600';
    case 'failed':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Generate secure download URL with expiration
 */
export function generateSecureDownloadUrl(
  fileId: string,
  baseUrl: string,
  token: string,
  expiresIn: number = 3600
): string {
  const expiresAt = Date.now() + expiresIn * 1000;
  const params = new URLSearchParams({
    token,
    expires: expiresAt.toString(),
    file: fileId,
  });

  return `${baseUrl}/secure-download?${params.toString()}`;
}

/**
 * Parse media duration from seconds to readable format
 */
export function formatMediaDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Extract video resolution from dimension string
 */
export function parseVideoResolution(
  resolution: string
): { width: number; height: number } | null {
  const match = resolution.match(/(\d+)x(\d+)/);
  if (match) {
    return {
      width: parseInt(match[1]),
      height: parseInt(match[2]),
    };
  }
  return null;
}

/**
 * Get quality label from resolution
 */
export function getQualityLabel(resolution: string): string {
  const parsed = parseVideoResolution(resolution);
  if (!parsed) return resolution;

  const { height } = parsed;

  if (height >= 2160) return '4K';
  if (height >= 1440) return '2K';
  if (height >= 1080) return '1080p';
  if (height >= 720) return '720p';
  if (height >= 480) return '480p';
  if (height >= 360) return '360p';

  return `${height}p`;
}

/**
 * Calculate optimal thumbnail size
 */
export function calculateThumbnailSize(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  let width = maxWidth;
  let height = width / aspectRatio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Validate image dimensions
 */
export function validateImageDimensions(
  width: number,
  height: number,
  maxWidth?: number,
  maxHeight?: number,
  minWidth?: number,
  minHeight?: number
): string | null {
  if (maxWidth && width > maxWidth) {
    return `Image width exceeds maximum of ${maxWidth}px`;
  }

  if (maxHeight && height > maxHeight) {
    return `Image height exceeds maximum of ${maxHeight}px`;
  }

  if (minWidth && width < minWidth) {
    return `Image width below minimum of ${minWidth}px`;
  }

  if (minHeight && height < minHeight) {
    return `Image height below minimum of ${minHeight}px`;
  }

  return null;
}

/**
 * Check if file is streamable
 */
export function isStreamableFile(
  fileType: FileType,
  mimeType: string
): boolean {
  if (fileType === 'video') {
    return ['video/mp4', 'video/webm', 'video/ogg'].includes(mimeType);
  }

  if (fileType === 'audio') {
    return ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac'].includes(
      mimeType
    );
  }

  return false;
}

/**
 * Generate streaming manifest URL
 */
export function generateStreamingManifestUrl(
  fileId: string,
  baseUrl: string,
  format: 'hls' | 'dash' = 'hls'
): string {
  const extension = format === 'hls' ? 'm3u8' : 'mpd';
  return `${baseUrl}/stream/${fileId}/manifest.${extension}`;
}

/**
 * Default processing options by file type
 */
export function getDefaultProcessingOptions(fileType: FileType) {
  switch (fileType) {
    case 'image':
      return {
        optimize: true,
        thumbnails: [
          { width: 150, height: 150, suffix: 'thumb' },
          { width: 300, height: 300, suffix: 'medium' },
          { width: 800, height: 600, suffix: 'large' },
        ],
        format: 'webp' as const,
        quality: 85,
      };

    case 'video':
      return {
        transcode: {
          quality: 'medium' as const,
          format: 'mp4',
          codec: 'h264',
        },
        thumbnails: {
          count: 3,
          size: { width: 320, height: 180 },
        },
        streaming: {
          enabled: true,
          adaptive: true,
          qualities: ['1080p', '720p', '480p', '360p'],
        },
      };

    case 'audio':
      return {
        transcode: {
          quality: 'medium' as const,
          format: 'mp3',
          bitrate: 128,
        },
        normalize: true,
        thumbnail: true,
      };

    default:
      return {};
  }
}
