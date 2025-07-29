import { tokenManager } from '@/lib/api/client';
import { LOCAL_STORAGE_KEYS } from '@/lib/constants/constants';
import { User } from '@/lib/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: string[];
  lastActivity: string | null;
  sessionExpiry: string | null;
  twoFactorRequired: boolean;
  twoFactorToken: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  permissions: [],
  lastActivity: null,
  sessionExpiry: null,
  twoFactorRequired: false,
  twoFactorToken: null,
};

// load from localstorage
const loadInitialState = (): AuthState => {
  if (typeof window === 'undefined') return initialState;

  try {
    const token = tokenManager.getToken();
    const refreshToken = tokenManager.getRefreshToken();
    const userData = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_DATA);

    if (token && userData) {
      return {
        ...initialState,
        user: JSON.parse(userData),
        token,
        refreshToken,
        isAuthenticated: true,
        lastActivity: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error('Error loading auth state:', error);
    tokenManager.clearTokens();
  }

  return initialState;
};

const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitialState(),
  reducers: {
    loginStart: state => {
      state.isLoading = true;
      state.error = null;
      state.twoFactorRequired = false;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken: string;
        expiresIn?: number;
        twoFactorRequired?: boolean;
        twoFactorToken?: string | null;
      }>
    ) => {
      const { user, token, refreshToken, expiresIn } = action.payload;

      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      state.lastActivity = new Date().toISOString();
      state.twoFactorRequired = false;
      state.twoFactorToken = null;

      if (expiresIn) {
        state.sessionExpiry = new Date(
          Date.now() + expiresIn * 1000
        ).toISOString();
      }

      tokenManager.setToken(token);
      tokenManager.setRefreshToken(refreshToken);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    },

    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
    },

    login2FARequired: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.twoFactorRequired = true;
      state.twoFactorToken = action.payload;
      state.error = null;
    },

    logout: state => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.permissions = [];
      state.lastActivity = null;
      state.sessionExpiry = null;
      state.twoFactorRequired = false;
      state.twoFactorToken = null;

      tokenManager.clearTokens();
    },

    refreshTokenSuccess: (
      state,
      action: PayloadAction<{
        token: string;
        expiresIn?: number;
      }>
    ) => {
      const { token, expiresIn } = action.payload;

      state.token = token;
      state.lastActivity = new Date().toISOString();

      if (expiresIn) {
        state.sessionExpiry = new Date(
          Date.now() + expiresIn * 1000
        ).toISOString();
      }

      tokenManager.setToken(token);
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.USER_DATA,
          JSON.stringify(state.user)
        );
      }
    },

    updateUserAvatar: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.avatarUrl = action.payload;
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.USER_DATA,
          JSON.stringify(state.user)
        );
      }
    },

    setPermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
    },

    updateLastActivity: state => {
      state.lastActivity = new Date().toISOString();
    },

    clearError: state => {
      state.error = null;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    extendSession: (state, action: PayloadAction<number>) => {
      const expiresIn = action.payload;
      state.sessionExpiry = new Date(
        Date.now() + expiresIn * 1000
      ).toISOString();
      state.lastActivity = new Date().toISOString();
    },

    sessionExpired: state => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = 'Session expired. Please login again.';
      state.sessionExpiry = null;

      tokenManager.clearTokens();
    },

    registerStart: state => {
      state.isLoading = true;
      state.error = null;
    },

    registerSuccess: state => {
      state.isLoading = false;
      state.error = null;
    },

    registerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  login2FARequired,
  logout,
  refreshTokenSuccess,
  updateUser,
  updateUserAvatar,
  setPermissions,
  updateLastActivity,
  clearError,
  setError,
  setLoading,
  extendSession,
  sessionExpired,
  registerStart,
  registerSuccess,
  registerFailure,
} = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectUserRole = (state: { auth: AuthState }) =>
  state.auth.user?.userType;
export const selectPermissions = (state: { auth: AuthState }) =>
  state.auth.permissions;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectTwoFactorRequired = (state: { auth: AuthState }) =>
  state.auth.twoFactorRequired;
export const selectSessionExpiry = (state: { auth: AuthState }) =>
  state.auth.sessionExpiry;

// Permission checkers
export const selectHasPermission = (
  state: { auth: AuthState },
  permission: string
) => state.auth.permissions.includes(permission);
export const selectIsRole = (state: { auth: AuthState }, role: string) =>
  state.auth.user?.userType === role;
export const selectIsStudent = (state: { auth: AuthState }) =>
  state.auth.user?.userType === 'student';
export const selectIsTeacher = (state: { auth: AuthState }) =>
  state.auth.user?.userType === 'teacher';
export const selectIsAdmin = (state: { auth: AuthState }) =>
  state.auth.user?.userType === 'admin';

export default authSlice.reducer;
