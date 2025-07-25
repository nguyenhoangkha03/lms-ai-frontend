import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { toast } from 'sonner';
import {
  loginSuccess,
  logout,
  sessionExpired,
  refreshTokenSuccess,
} from '../slices/auth-slice';
import { tokenManager } from '@/lib/api/client';
import type { RootState } from '../store';

export const authMiddleware = createListenerMiddleware();

// Handle login success
authMiddleware.startListening({
  actionCreator: loginSuccess,
  effect: async (action, listenerApi) => {
    const { user, token, refreshToken } = action.payload;

    // Store tokens
    tokenManager.setToken(token);
    tokenManager.setRefreshToken(refreshToken);

    // Store user data
    localStorage.setItem('user_data', JSON.stringify(user));

    // Track login event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'login', {
        method: user.userType,
        user_id: user.id,
      });
    }
  },
});

// Handle logout
authMiddleware.startListening({
  actionCreator: logout,
  effect: async (action, listenerApi) => {
    // Clear tokens and user data
    tokenManager.clearTokens();

    // Clear any other stored data
    const keysToRemove = [
      'user_data',
      'recent_courses',
      'draft_messages',
      'sidebar_collapsed',
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Invalidate all cached API data
    listenerApi.dispatch({ type: 'api/invalidateTags', payload: ['User'] });

    // Track logout event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'logout');
    }
  },
});

// Handle session expiry
authMiddleware.startListening({
  actionCreator: sessionExpired,
  effect: async (action, listenerApi) => {
    // Clear all data
    tokenManager.clearTokens();

    // Show session expired message
    toast.error('Your session has expired. Please login again.');

    // Redirect to login after a delay
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }, 2000);
  },
});

// Handle token refresh
authMiddleware.startListening({
  actionCreator: refreshTokenSuccess,
  effect: async (action, listenerApi) => {
    const { token } = action.payload;
    tokenManager.setToken(token);
  },
});
