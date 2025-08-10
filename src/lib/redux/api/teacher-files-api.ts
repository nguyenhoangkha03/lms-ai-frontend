import { baseApi } from '@/lib/api/base-api';

// ==================== TYPES AND INTERFACES ====================
// Based on actual file management controller

export interface FileUpload {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  fileType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'ARCHIVE' | 'OTHER';
  accessLevel: 'public' | 'private' | 'restricted';
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
  tags: string[];
  metadata: Record<string, any>;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingError?: string;
  downloadUrl?: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  cdnUrl?: string;
  folder?: string;
  isArchived: boolean;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileStatistics {
  totalFiles: number;
  totalSize: number;
  filesByType: {
    images: number;
    videos: number;
    documents: number;
    audio: number;
    other: number;
  };
  storageUsed: number;
  storageLimit: number;
  recentUploads: number;
  processingQueue: number;
}

export interface UploadFileRequest {
  file: File;
  description?: string;
  tags?: string[];
  accessLevel?: 'public' | 'private' | 'restricted';
  folder?: string;
  metadata?: Record<string, any>;
}

export interface UpdateFileRequest {
  id: string;
  originalName?: string;
  description?: string;
  tags?: string[];
  accessLevel?: 'public' | 'private' | 'restricted';
  folder?: string;
  metadata?: Record<string, any>;
}

export interface FileQueryParams {
  search?: string;
  fileType?: string;
  accessLevel?: string;
  folder?: string;
  tags?: string[];
  uploadedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ProcessingStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  variants?: {
    thumbnail?: string;
    preview?: string;
    optimized?: string;
  };
}

export interface AccessUrlRequest {
  expiresIn?: number; // seconds
  accessType?: 'view' | 'download' | 'stream';
}

export interface BulkDeleteRequest {
  fileIds: string[];
  permanent?: boolean;
}

export interface BulkUpdateAccessRequest {
  fileIds: string[];
  accessLevel: 'public' | 'private' | 'restricted';
}

export interface ImageProcessingRequest {
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill';
  };
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  generateThumbnail?: boolean;
}

export interface VideoProcessingRequest {
  transcode?: {
    resolution?: '720p' | '1080p' | '4K';
    bitrate?: string;
    format?: 'mp4' | 'webm';
  };
  generateThumbnail?: boolean;
  extractAudio?: boolean;
}

// ==================== API ENDPOINTS ====================
// Based on actual file management controller endpoints

export const teacherFilesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Upload single file
    uploadFile: builder.mutation<FileUpload, UploadFileRequest>({
      query: ({ file, ...data }) => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Append other fields
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              formData.append(key, JSON.stringify(value));
            } else if (typeof value === 'object') {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, String(value));
            }
          }
        });

        return {
          url: '/files/upload',
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: FileUpload;
      }) => response.data,
      invalidatesTags: ['Files', 'FileStatistics'],
    }),

    // Upload multiple files
    uploadMultipleFiles: builder.mutation<
      {
        totalFiles: number;
        successCount: number;
        failureCount: number;
        results: { success: boolean; error?: string; fileName?: string }[];
      },
      { files: File[]; metadata?: Record<string, any> }
    >({
      query: ({ files, metadata = {} }) => {
        const formData = new FormData();
        
        files.forEach((file) => {
          formData.append('files', file);
        });
        
        Object.entries(metadata).forEach(([key, value]) => {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        });

        return {
          url: '/files/upload/multiple',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Files', 'FileStatistics'],
    }),

    // Get files with filtering and pagination
    getFiles: builder.query<
      {
        files: FileUpload[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      },
      FileQueryParams
    >({
      query: (params) => ({
        url: '/files',
        params: {
          ...params,
          tags: params.tags ? JSON.stringify(params.tags) : undefined,
        },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: {
          files: FileUpload[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        };
      }) => response.data,
      providesTags: ['Files'],
    }),

    // Get file by ID
    getFileById: builder.query<
      FileUpload,
      { id: string; includeUrl?: boolean }
    >({
      query: ({ id, includeUrl = false }) => ({
        url: `/files/${id}`,
        params: { includeUrl },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: FileUpload;
      }) => response.data,
      providesTags: (result, error, { id }) => [{ type: 'Files', id }],
    }),

    // Update file metadata
    updateFile: builder.mutation<FileUpload, UpdateFileRequest>({
      query: ({ id, ...updates }) => ({
        url: `/files/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: FileUpload;
      }) => response.data,
      invalidatesTags: (result, error, { id }) => [
        'Files',
        { type: 'Files', id },
      ],
    }),

    // Delete file
    deleteFile: builder.mutation<void, string>({
      query: (id) => ({
        url: `/files/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Files', 'FileStatistics'],
    }),

    // Generate temporary access URL
    generateAccessUrl: builder.mutation<
      {
        accessUrl: string;
        expiresIn: number;
        expiresAt: string;
      },
      { id: string; accessData: AccessUrlRequest }
    >({
      query: ({ id, accessData }) => ({
        url: `/files/${id}/access-url`,
        method: 'POST',
        body: accessData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: {
          accessUrl: string;
          expiresIn: number;
          expiresAt: string;
        };
      }) => response.data,
    }),

    // Get file statistics
    getFileStatistics: builder.query<FileStatistics, void>({
      query: () => '/files/statistics/overview',
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: FileStatistics;
      }) => response.data,
      providesTags: ['FileStatistics'],
    }),

    // Process image
    processImage: builder.mutation<
      {
        message: string;
        fileId: string;
        estimatedTime: string;
      },
      { id: string; processingData: ImageProcessingRequest }
    >({
      query: ({ id, processingData }) => ({
        url: `/files/${id}/process/image`,
        method: 'POST',
        body: processingData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: {
          message: string;
          fileId: string;
          estimatedTime: string;
        };
      }) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: 'Files', id }],
    }),

    // Process video
    processVideo: builder.mutation<
      {
        message: string;
        fileId: string;
        estimatedTime: string;
      },
      { id: string; processingData: VideoProcessingRequest }
    >({
      query: ({ id, processingData }) => ({
        url: `/files/${id}/process/video`,
        method: 'POST',
        body: processingData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: {
          message: string;
          fileId: string;
          estimatedTime: string;
        };
      }) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: 'Files', id }],
    }),

    // Get processing status
    getProcessingStatus: builder.query<ProcessingStatus, string>({
      query: (id) => `/files/${id}/processing-status`,
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: ProcessingStatus;
      }) => response.data,
      providesTags: (result, error, id) => [{ type: 'ProcessingStatus', id }],
    }),

    // Bulk delete files
    bulkDeleteFiles: builder.mutation<void, BulkDeleteRequest>({
      query: (deleteData) => ({
        url: '/files/bulk',
        method: 'DELETE',
        body: deleteData,
      }),
      invalidatesTags: ['Files', 'FileStatistics'],
    }),

    // Bulk update access level (admin only)
    bulkUpdateAccessLevel: builder.mutation<
      {
        totalFiles: number;
        successCount: number;
        failureCount: number;
        results: { fileId: string; success: boolean; error?: string }[];
      },
      BulkUpdateAccessRequest
    >({
      query: (updateData) => ({
        url: '/files/bulk/access-level',
        method: 'PATCH',
        body: updateData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: {
          totalFiles: number;
          successCount: number;
          failureCount: number;
          results: { fileId: string; success: boolean; error?: string }[];
        };
      }) => response.data,
      invalidatesTags: ['Files'],
    }),

    // Download file (returns blob)
    downloadFile: builder.mutation<Blob, { id: string; accessType?: string }>({
      query: ({ id, accessType = 'download' }) => ({
        url: `/files/download/${id}`,
        params: { accessType },
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Get public file info (no auth required)
    getPublicFile: builder.query<FileUpload, string>({
      query: (id) => `/files/public/${id}`,
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: FileUpload;
      }) => response.data,
    }),
  }),
});

// Export hooks
export const {
  useUploadFileMutation,
  useUploadMultipleFilesMutation,
  useGetFilesQuery,
  useGetFileByIdQuery,
  useUpdateFileMutation,
  useDeleteFileMutation,
  useGenerateAccessUrlMutation,
  useGetFileStatisticsQuery,
  useProcessImageMutation,
  useProcessVideoMutation,
  useGetProcessingStatusQuery,
  useBulkDeleteFilesMutation,
  useBulkUpdateAccessLevelMutation,
  useDownloadFileMutation,
  useGetPublicFileQuery,
} = teacherFilesApi;