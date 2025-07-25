import { baseApi } from '@/lib/api/base-api';
import type {
  User,
  UserProfile,
  StudentProfile,
  TeacherProfile,
  ApiResponse,
  PaginationParams,
} from '@/lib/types';

export const userApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getUsers: builder.query<
      {
        users: User[];
        total: number;
      },
      PaginationParams & { role?: string; status?: string }
    >({
      query: params => ({
        url: '/users',
        params,
      }),
      transformResponse: (
        response: ApiResponse<{ users: User[]; total: number }>
      ) => response.data!,
      providesTags: ['User'],
    }),

    getUserById: builder.query<User, string>({
      query: id => `/users/${id}`,
      transformResponse: (response: ApiResponse<User>) => response.data!,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    updateUser: builder.mutation<User, { id: string; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: ApiResponse<User>) => response.data!,
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),

    deleteUser: builder.mutation<{ message: string }, string>({
      query: id => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data!,
      invalidatesTags: ['User'],
    }),

    // Profile management
    getUserProfile: builder.query<UserProfile, string>({
      query: userId => `/users/${userId}/profile`,
      transformResponse: (response: ApiResponse<UserProfile>) => response.data!,
      providesTags: (result, error, userId) => [
        { type: 'User', id: `profile-${userId}` },
      ],
    }),

    updateUserProfile: builder.mutation<
      UserProfile,
      {
        userId: string;
        data: Partial<UserProfile>;
      }
    >({
      query: ({ userId, data }) => ({
        url: `/users/${userId}/profile`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: ApiResponse<UserProfile>) => response.data!,
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: `profile-${userId}` },
      ],
    }),

    getStudentProfile: builder.query<StudentProfile, string>({
      query: userId => `/users/${userId}/student-profile`,
      transformResponse: (response: ApiResponse<StudentProfile>) =>
        response.data!,
      providesTags: (result, error, userId) => [
        { type: 'User', id: `student-${userId}` },
      ],
    }),

    updateStudentProfile: builder.mutation<
      StudentProfile,
      {
        userId: string;
        data: Partial<StudentProfile>;
      }
    >({
      query: ({ userId, data }) => ({
        url: `/users/${userId}/student-profile`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: ApiResponse<StudentProfile>) =>
        response.data!,
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: `student-${userId}` },
      ],
    }),

    getTeacherProfile: builder.query<TeacherProfile, string>({
      query: userId => `/users/${userId}/teacher-profile`,
      transformResponse: (response: ApiResponse<TeacherProfile>) =>
        response.data!,
      providesTags: (result, error, userId) => [
        { type: 'User', id: `teacher-${userId}` },
      ],
    }),

    updateTeacherProfile: builder.mutation<
      TeacherProfile,
      {
        userId: string;
        data: Partial<TeacherProfile>;
      }
    >({
      query: ({ userId, data }) => ({
        url: `/users/${userId}/teacher-profile`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: ApiResponse<TeacherProfile>) =>
        response.data!,
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: `teacher-${userId}` },
      ],
    }),

    uploadAvatar: builder.mutation<
      { avatarUrl: string },
      { userId: string; file: File }
    >({
      query: ({ userId, file }) => {
        const formData = new FormData();
        formData.append('avatar', file);

        return {
          url: `/users/${userId}/avatar`,
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      transformResponse: (response: ApiResponse<{ avatarUrl: string }>) =>
        response.data!,
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetStudentProfileQuery,
  useUpdateStudentProfileMutation,
  useGetTeacherProfileQuery,
  useUpdateTeacherProfileMutation,
  useUploadAvatarMutation,
} = userApi;
