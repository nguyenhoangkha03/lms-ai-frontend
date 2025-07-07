import { baseApi } from './base-api';
import { API_ENDPOINTS } from '@/constants';
import type {
  User,
  UserProfile,
  UpdateProfileFormData,
  ChangePasswordFormData,
} from '@/types';

export const userApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get user profile
    getUserProfile: builder.query<UserProfile, void>({
      query: () => API_ENDPOINTS.USERS.PROFILE,
      providesTags: ['User'],
    }),

    // Update user profile
    updateUserProfile: builder.mutation<UserProfile, UpdateProfileFormData>({
      query: profileData => ({
        url: API_ENDPOINTS.USERS.UPDATE_PROFILE,
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),

    // Change password
    changePassword: builder.mutation<
      { message: string },
      ChangePasswordFormData
    >({
      query: passwordData => ({
        url: API_ENDPOINTS.USERS.CHANGE_PASSWORD,
        method: 'PUT',
        body: passwordData,
      }),
    }),

    // Upload avatar
    uploadAvatar: builder.mutation<{ avatarUrl: string }, FormData>({
      query: formData => ({
        url: API_ENDPOINTS.USERS.UPLOAD_AVATAR,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),

    // Get user preferences
    getUserPreferences: builder.query<Record<string, any>, void>({
      query: () => API_ENDPOINTS.USERS.PREFERENCES,
      providesTags: ['User'],
    }),

    // Update user preferences
    updateUserPreferences: builder.mutation<
      Record<string, any>,
      Record<string, any>
    >({
      query: preferences => ({
        url: API_ENDPOINTS.USERS.PREFERENCES,
        method: 'PUT',
        body: preferences,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
} = userApi;
