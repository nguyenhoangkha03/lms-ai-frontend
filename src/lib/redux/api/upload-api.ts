import { baseApi } from '@/lib/api/base-api';
import {
  DocumentType,
  DocumentUploadResponse,
  UploadedDocument,
} from '@/lib/types';

export const uploadApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    uploadTeacherDocument: builder.mutation<
      DocumentUploadResponse,
      {
        file: File;
        documentType: DocumentType;
        userId: string;
        metadata?: Record<string, any>;
      }
    >({
      query: ({ file, documentType, userId, metadata }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentType);
        formData.append('userId', userId);
        if (metadata) {
          formData.append('metadata', JSON.stringify(metadata));
        }

        return {
          url: '/upload/teacher/document',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['TeacherDocuments'],
    }),

    getTeacherDocuments: builder.query<
      {
        success: boolean;
        message: string;
        documents: UploadedDocument[];
      },
      void
    >({
      query: () => '/upload/teacher/documents',
      providesTags: ['TeacherDocuments'],
    }),

    downloadTeacherDocument: builder.mutation<Blob, string>({
      query: documentId => ({
        url: `/upload/teacher/document/${documentId}/download`,
        method: 'GET',
        responseHandler: (response: any) => response.blob(),
      }),
    }),

    deleteTeacherDocument: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: documentId => ({
        url: `/upload/teacher/document/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TeacherDocuments'],
    }),
  }),
});

export const {
  useUploadTeacherDocumentMutation,
  useGetTeacherDocumentsQuery,
  useDownloadTeacherDocumentMutation,
  useDeleteTeacherDocumentMutation,
} = uploadApi;
