import {
  FileUpload,
  FileProcessingStatus,
  FileAccessLevel,
  FileVersion,
  CDNConfiguration,
  FileSecurityScan,
} from '@/lib/types/file-management';
import { baseApi } from '@/lib/api/base-api';

export const fileManagementApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // File CRUD Operations
    getFiles: builder.query<
      {
        files: FileUpload[];
        total: number;
        currentPage: number;
        totalPages: number;
      },
      {
        page?: number;
        limit?: number;
        fileType?: string;
        accessLevel?: FileAccessLevel;
        processingStatus?: FileProcessingStatus;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        userId?: string;
        courseId?: string;
        lessonId?: string;
      }
    >({
      query: params => ({
        url: '',
        params,
      }),
      providesTags: ['File'],
    }),

    getFileById: builder.query<FileUpload, string>({
      query: id => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'File', id }],
    }),

    updateFileMetadata: builder.mutation<
      FileUpload,
      {
        id: string;
        data: Partial<FileUpload>;
      }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'File', id }],
    }),

    deleteFile: builder.mutation<void, string>({
      query: id => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['File', 'FileStatistics'],
    }),

    // File Upload Operations
    uploadFile: builder.mutation<
      FileUpload,
      {
        file: File;
        relatedType?: string;
        relatedId?: string;
        accessLevel?: FileAccessLevel;
        isTemporary?: boolean;
        metadata?: Record<string, any>;
        onProgress?: (progress: number) => void;
      }
    >({
      query: ({
        file,
        relatedType,
        relatedId,
        accessLevel,
        isTemporary,
        metadata,
      }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (relatedType) formData.append('relatedType', relatedType);
        if (relatedId) formData.append('relatedId', relatedId);
        if (accessLevel) formData.append('accessLevel', accessLevel);
        if (isTemporary !== undefined)
          formData.append('isTemporary', String(isTemporary));
        if (metadata) formData.append('metadata', JSON.stringify(metadata));

        return {
          url: '/upload',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['File', 'FileStatistics'],
    }),

    uploadMultipleFiles: builder.mutation<
      FileUpload[],
      {
        files: File[];
        relatedType?: string;
        relatedId?: string;
        accessLevel?: FileAccessLevel;
        isTemporary?: boolean;
        metadata?: Record<string, any>;
        onProgress?: (progress: number) => void;
      }
    >({
      query: ({
        files,
        relatedType,
        relatedId,
        accessLevel,
        isTemporary,
        metadata,
      }) => {
        const formData = new FormData();
        files.forEach((file, index) => {
          formData.append(`files`, file);
        });
        if (relatedType) formData.append('relatedType', relatedType);
        if (relatedId) formData.append('relatedId', relatedId);
        if (accessLevel) formData.append('accessLevel', accessLevel);
        if (isTemporary !== undefined)
          formData.append('isTemporary', String(isTemporary));
        if (metadata) formData.append('metadata', JSON.stringify(metadata));

        return {
          url: '/upload/multiple',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['File', 'FileStatistics'],
    }),

    // Media Processing Operations
    processImage: builder.mutation<
      FileUpload,
      {
        id: string;
        operations: {
          resize?: { width?: number; height?: number; quality?: number };
          optimize?: boolean;
          thumbnails?: Array<{ width: number; height: number; suffix: string }>;
          watermark?: { text?: string; image?: string; position?: string };
          format?: 'webp' | 'jpeg' | 'png';
        };
      }
    >({
      query: ({ id, operations }) => ({
        url: `/${id}/process/image`,
        method: 'POST',
        body: operations,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'File', id }],
    }),

    processVideo: builder.mutation<
      FileUpload,
      {
        id: string;
        operations: {
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
    >({
      query: ({ id, operations }) => ({
        url: `/${id}/process/video`,
        method: 'POST',
        body: operations,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'File', id }],
    }),

    getProcessingStatus: builder.query<
      {
        status: FileProcessingStatus;
        progress: number;
        error?: string;
        processedVersions: any[];
        startedAt?: string;
        completedAt?: string;
      },
      string
    >({
      query: id => `/${id}/processing-status`,
      providesTags: (result, error, id) => [{ type: 'ProcessingStatus', id }],
    }),

    // File Access and Security
    generateAccessUrl: builder.mutation<
      {
        url: string;
        expiresAt: string;
      },
      {
        id: string;
        expiresIn?: number; // seconds
        permissions?: string[];
      }
    >({
      query: ({ id, expiresIn, permissions }) => ({
        url: `/${id}/access-url`,
        method: 'POST',
        body: { expiresIn, permissions },
      }),
    }),

    moderateFile: builder.mutation<
      FileUpload,
      {
        id: string;
        action: 'approve' | 'reject' | 'flag';
        reason?: string;
        notes?: string;
      }
    >({
      query: ({ id, action, reason, notes }) => ({
        url: `/${id}/moderate`,
        method: 'POST',
        body: { action, reason, notes },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'File', id }],
    }),

    // File Streaming and CDN
    getStreamingUrl: builder.query<
      {
        streamUrl: string;
        qualities: string[];
        subtitles?: Array<{ language: string; url: string }>;
      },
      string
    >({
      query: id => `/stream/${id}`,
    }),

    getDownloadUrl: builder.query<
      {
        downloadUrl: string;
        fileName: string;
        size: number;
      },
      string
    >({
      query: id => `/download/${id}`,
    }),

    // Bulk Operations
    bulkDeleteFiles: builder.mutation<{ deletedCount: number }, string[]>({
      query: fileIds => ({
        url: '/bulk',
        method: 'DELETE',
        body: { fileIds },
      }),
      invalidatesTags: ['File', 'FileStatistics'],
    }),

    bulkUpdateAccessLevel: builder.mutation<
      { updatedCount: number },
      {
        fileIds: string[];
        accessLevel: FileAccessLevel;
      }
    >({
      query: ({ fileIds, accessLevel }) => ({
        url: '/bulk/access-level',
        method: 'PATCH',
        body: { fileIds, accessLevel },
      }),
      invalidatesTags: ['File'],
    }),

    // File Statistics and Analytics
    getFileStatistics: builder.query<
      {
        totalFiles: number;
        totalSize: number;
        filesByType: Record<string, number>;
        filesByAccessLevel: Record<string, number>;
        uploadsByMonth: Array<{ month: string; count: number; size: number }>;
        topUploaders: Array<{
          userId: string;
          userName: string;
          count: number;
        }>;
        processingStats: Record<FileProcessingStatus, number>;
      },
      {
        timeRange?: string;
        userId?: string;
        courseId?: string;
      }
    >({
      query: params => ({
        url: '/statistics/overview',
        params,
      }),
      providesTags: ['FileStatistics'],
    }),

    getStorageStatistics: builder.query<
      {
        totalStorage: number;
        usedStorage: number;
        availableStorage: number;
        storageByType: Record<string, number>;
        storageByUser: Array<{
          userId: string;
          userName: string;
          storage: number;
        }>;
        storageGrowth: Array<{ date: string; size: number }>;
        cdnUsage: {
          bandwidth: number;
          requests: number;
          cachingRatio: number;
        };
      },
      void
    >({
      query: () => '/statistics/storage',
      providesTags: ['FileStatistics'],
    }),

    // File Versions and History
    getFileVersions: builder.query<FileVersion[], string>({
      query: fileId => `/versions/${fileId}`,
      providesTags: (result, error, fileId) => [
        { type: 'FileVersion', id: fileId },
      ],
    }),

    createFileVersion: builder.mutation<
      FileVersion,
      {
        fileId: string;
        file: File;
        versionNotes?: string;
      }
    >({
      query: ({ fileId, file, versionNotes }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (versionNotes) formData.append('versionNotes', versionNotes);

        return {
          url: `/versions/${fileId}`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { fileId }) => [
        { type: 'FileVersion', id: fileId },
      ],
    }),

    restoreFileVersion: builder.mutation<
      FileUpload,
      {
        fileId: string;
        versionId: string;
      }
    >({
      query: ({ fileId, versionId }) => ({
        url: `/versions/${fileId}/${versionId}/restore`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { fileId }) => [
        { type: 'File', id: fileId },
        { type: 'FileVersion', id: fileId },
      ],
    }),

    // Security Scanning
    scanFile: builder.mutation<
      FileSecurityScan,
      {
        id: string;
        scanTypes: Array<'virus' | 'malware' | 'content' | 'metadata'>;
      }
    >({
      query: ({ id, scanTypes }) => ({
        url: `/${id}/security-scan`,
        method: 'POST',
        body: { scanTypes },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'SecurityScan', id },
      ],
    }),

    getSecurityScanResults: builder.query<FileSecurityScan, string>({
      query: fileId => `/security-scan/${fileId}`,
      providesTags: (result, error, fileId) => [
        { type: 'SecurityScan', id: fileId },
      ],
    }),

    // Admin Operations
    getPendingModeration: builder.query<
      {
        files: FileUpload[];
        total: number;
      },
      {
        page?: number;
        limit?: number;
        fileType?: string;
      }
    >({
      query: params => ({
        url: '/admin/pending-moderation',
        params,
      }),
      providesTags: ['File'],
    }),

    // CDN Management
    getCDNConfiguration: builder.query<CDNConfiguration, void>({
      query: () => '/cdn/configuration',
      providesTags: ['CDNConfig'],
    }),

    updateCDNConfiguration: builder.mutation<
      CDNConfiguration,
      Partial<CDNConfiguration>
    >({
      query: config => ({
        url: '/cdn/configuration',
        method: 'PATCH',
        body: config,
      }),
      invalidatesTags: ['CDNConfig'],
    }),

    purgeFromCDN: builder.mutation<
      { success: boolean },
      {
        urls: string[];
        type?: 'url' | 'tag' | 'all';
      }
    >({
      query: ({ urls, type = 'url' }) => ({
        url: '/cdn/purge',
        method: 'POST',
        body: { urls, type },
      }),
    }),
  }),
});

export const {
  // File CRUD
  useGetFilesQuery,
  useGetFileByIdQuery,
  useUpdateFileMetadataMutation,
  useDeleteFileMutation,

  // File Upload
  useUploadFileMutation,
  useUploadMultipleFilesMutation,

  // Media Processing
  useProcessImageMutation,
  useProcessVideoMutation,
  useGetProcessingStatusQuery,

  // Access and Security
  useGenerateAccessUrlMutation,
  useModerateFileMutation,

  // Streaming and CDN
  useGetStreamingUrlQuery,
  useGetDownloadUrlQuery,

  // Bulk Operations
  useBulkDeleteFilesMutation,
  useBulkUpdateAccessLevelMutation,

  // Statistics
  useGetFileStatisticsQuery,
  useGetStorageStatisticsQuery,

  // Versions
  useGetFileVersionsQuery,
  useCreateFileVersionMutation,
  useRestoreFileVersionMutation,

  // Security
  useScanFileMutation,
  useGetSecurityScanResultsQuery,

  // Admin
  useGetPendingModerationQuery,

  // CDN
  useGetCDNConfigurationQuery,
  useUpdateCDNConfigurationMutation,
  usePurgeFromCDNMutation,
} = fileManagementApi;
