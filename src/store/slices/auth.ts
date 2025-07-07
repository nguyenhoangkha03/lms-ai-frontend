import { AUTH_CONFIG } from '@/constants';
import { User } from '@/types';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean; // Đã kiểm tra xong chưa? (🔍 quá trình kiểm tra đã xong chưa?)
  lastActivity: number;
  sessionExpiry: number | null;
  loginAttempts: number;
  isLocked: boolean;
  lockUntil: number | null;
  twoFactorRequired: boolean;
  permissions: string[];
  roles: string[];
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  isInitialized: false,
  lastActivity: Date.now(),
  sessionExpiry: null,
  loginAttempts: 0,
  isLocked: false,
  lockUntil: null,
  twoFactorRequired: false,
  permissions: [],
  roles: [],
};

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
      const refreshToken = localStorage.getItem(AUTH_CONFIG.refreshTokenKey);
      const userData = localStorage.getItem(AUTH_CONFIG.userKey);

      if (token && userData) {
        const user = JSON.parse(userData);

        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          return { user, token, refreshToken };
        }
      }

      return null;
    } catch (error) {
      return rejectWithValue('Failed to initialize auth');
    }
  }
);

export const refreshAuthToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const { refreshToken } = state.auth;

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Token refresh failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken: string;
        permissions?: string[];
        roles?: string[];
      }>
    ) => {
      const {
        user,
        token,
        refreshToken,
        permissions = [],
        roles = [],
      } = action.payload;

      state.user = user;
      state.token = token;

      if (refreshToken) {
        state.refreshToken = refreshToken;
      }

      state.permissions = permissions;
      state.roles = roles;
      state.isAuthenticated = true;
      state.error = null;
      state.isInitialized = true;
      state.lastActivity = Date.now();
      state.sessionExpiry = Date.now() + AUTH_CONFIG.sessionTimeout;
      state.loginAttempts = 0;
      state.isLocked = false;
      state.lockUntil = null;
      state.twoFactorRequired = false;
    },

    setTokens: (
      state,
      action: PayloadAction<{ token: string; refreshToken: string }>
    ) => {
      const { token, refreshToken } = action.payload;
      state.token = token;
      state.refreshToken = refreshToken;
      state.sessionExpiry = Date.now() + AUTH_CONFIG.sessionTimeout;

      localStorage.setItem(AUTH_CONFIG.tokenKey, token);
      localStorage.setItem(AUTH_CONFIG.refreshTokenKey, refreshToken);
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(state.user));
      }
    },

    setPermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
    },

    setRoles: (state, action: PayloadAction<string[]>) => {
      state.roles = action.payload;
    },

    updateLastActivity: state => {
      state.lastActivity = Date.now();
      state.sessionExpiry = Date.now() + AUTH_CONFIG.sessionTimeout;
    },

    incrementLoginAttempts: state => {
      state.loginAttempts += 1;

      // Lock account after 5 failed attempts
      if (state.loginAttempts >= 5) {
        state.isLocked = true;
        state.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
      }
    },

    resetLoginAttempts: state => {
      state.loginAttempts = 0;
      state.isLocked = false;
      state.lockUntil = null;
    },

    setTwoFactorRequired: (state, action: PayloadAction<boolean>) => {
      state.twoFactorRequired = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    checkSessionExpiry: state => {
      if (state.sessionExpiry && Date.now() > state.sessionExpiry) {
        // Session expired, logout
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.permissions = [];
        state.roles = [];
        state.error = 'Session expired';

        // Clear localStorage
        localStorage.removeItem(AUTH_CONFIG.tokenKey);
        localStorage.removeItem(AUTH_CONFIG.refreshTokenKey);
        localStorage.removeItem(AUTH_CONFIG.userKey);
      }
    },

    logout: state => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.permissions = [];
      state.roles = [];
      state.error = null;
      state.isLoading = false;
      state.isInitialized = true;
      state.twoFactorRequired = false;

      // Clear localStorage
      localStorage.removeItem(AUTH_CONFIG.tokenKey);
      localStorage.removeItem(AUTH_CONFIG.refreshTokenKey);
      localStorage.removeItem(AUTH_CONFIG.userKey);

      // Clear cookies
      document.cookie = `${AUTH_CONFIG.tokenKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    },

    initialize: state => {
      state.isInitialized = true;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(initializeAuth.pending, state => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;

        if (action.payload) {
          const { user, token, refreshToken } = action.payload;
          state.user = user;
          state.token = token;
          state.refreshToken = refreshToken;
          state.isAuthenticated = true;
          state.lastActivity = Date.now();
          state.sessionExpiry = Date.now() + AUTH_CONFIG.sessionTimeout;
        }
      })
      .addCase(initializeAuth.rejected, state => {
        state.isLoading = false;
        state.isInitialized = true;
      })
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        const { token, refreshToken } = action.payload;
        state.token = token;
        state.refreshToken = refreshToken;
        state.sessionExpiry = Date.now() + AUTH_CONFIG.sessionTimeout;

        localStorage.setItem(AUTH_CONFIG.tokenKey, token);
        localStorage.setItem(AUTH_CONFIG.refreshTokenKey, refreshToken);
      })
      .addCase(refreshAuthToken.rejected, state => {
        // Token refresh failed, logout user
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.permissions = [];
        state.roles = [];

        localStorage.removeItem(AUTH_CONFIG.tokenKey);
        localStorage.removeItem(AUTH_CONFIG.refreshTokenKey);
        localStorage.removeItem(AUTH_CONFIG.userKey);
      });
  },
});

export const {
  setCredentials,
  setTokens,
  updateUser,
  setPermissions,
  setRoles,
  updateLastActivity,
  incrementLoginAttempts,
  resetLoginAttempts,
  setTwoFactorRequired,
  setLoading,
  setError,
  checkSessionExpiry,
  logout,
  initialize,
} = authSlice.actions;

export default authSlice.reducer;
