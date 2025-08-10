import { AdvancedTokenManager } from '@/lib/auth/token-manager';
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
  twoFactorEnabled: boolean;
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
  twoFactorEnabled: false,
  twoFactorToken: null,
};

const loadInitialState = (): AuthState => {
  if (typeof window === 'undefined') return initialState;

  try {
    const token = AdvancedTokenManager.getAccessToken();
    const refreshToken = AdvancedTokenManager.getRefreshToken();
    const userData = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_DATA);

    console.log('🔄 Loading initial auth state...', {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      hasUserData: !!userData,
      token: token?.substring(0, 20) + '...' || 'none',
    });

    if (token && userData) {
      console.log('✅ Restoring auth state from localStorage');
      return {
        ...initialState,
        user: JSON.parse(userData),
        token,
        refreshToken,
        isAuthenticated: true,
        lastActivity: new Date().toISOString(),
      };
    } else {
      console.log('❌ Cannot restore auth state - missing token or userData');
    }
  } catch (error) {
    console.error('Error loading auth state:', error);
    AdvancedTokenManager.clearTokens();
  }

  console.log('🔄 Using initial auth state (not authenticated)');
  return initialState;
};

const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitialState(),
  reducers: {
    loginStart: state => {
      state.isLoading = true;
      state.error = null;
      state.twoFactorEnabled = false;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken: string;
        expiresIn?: number;
        twoFactorEnabled?: boolean;
        twoFactorToken?: string | null;
      }>
    ) => {
      console.log('🚀 Redux loginSuccess action dispatched:', action.payload);
      const { user, token, refreshToken, expiresIn, twoFactorEnabled } =
        action.payload;

      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      state.lastActivity = new Date().toISOString();
      state.twoFactorEnabled = twoFactorEnabled || false;
      state.twoFactorToken = null;

      if (expiresIn) {
        state.sessionExpiry = new Date(
          Date.now() + expiresIn * 1000
        ).toISOString();
      }

      AdvancedTokenManager.setTokens({
        accessToken: token,
        refreshToken: refreshToken,
        expiresIn: expiresIn || 900,
        tokenType: 'Bearer',
      });
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
      state.twoFactorEnabled = true;
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
      state.twoFactorEnabled = false;
      state.twoFactorToken = null;

      AdvancedTokenManager.clearTokens();
    },

    refreshTokenSuccess: (
      state,
      action: PayloadAction<{
        token: string;
        expiresIn?: number;
        refreshToken: string;
      }>
    ) => {
      const { token, expiresIn, refreshToken } = action.payload;

      state.token = token;
      state.lastActivity = new Date().toISOString();

      if (expiresIn) {
        state.sessionExpiry = new Date(
          Date.now() + expiresIn * 1000
        ).toISOString();
      }

      AdvancedTokenManager.setTokens({
        accessToken: token,
        refreshToken: refreshToken,
        expiresIn: expiresIn || 900,
        tokenType: 'Bearer',
      });
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

      AdvancedTokenManager.clearTokens();
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
export const selectTwoFactorEnabled = (state: { auth: AuthState }) =>
  state.auth.twoFactorEnabled;
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
