import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '@/types';

interface UserState {
  profile: UserProfile | null;
  preferences: Record<string, any>;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  preferences: {},
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
      state.error = null;
    },

    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },

    setPreferences: (state, action: PayloadAction<Record<string, any>>) => {
      state.preferences = action.payload;
    },

    updatePreference: (
      state,
      action: PayloadAction<{ key: string; value: any }>
    ) => {
      const { key, value } = action.payload;
      state.preferences[key] = value;
    },

    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setUserError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearProfile: state => {
      state.profile = null;
      state.preferences = {};
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const {
  setProfile,
  updateProfile,
  setPreferences,
  updatePreference,
  setUserLoading,
  setUserError,
  clearProfile,
} = userSlice.actions;

export default userSlice.reducer;
