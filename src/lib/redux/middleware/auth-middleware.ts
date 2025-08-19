import { createListenerMiddleware } from '@reduxjs/toolkit';
import { toast } from 'sonner';
import {
  loginSuccess,
  logout,
  sessionExpired,
  refreshTokenSuccess,
} from '../slices/auth-slice';
import { AdvancedTokenManager } from '@/lib/auth/token-manager';

export const authMiddleware = createListenerMiddleware();

authMiddleware.startListening({
  actionCreator: loginSuccess,
  effect: async (action, listenerApi) => {
    const { user, accessToken, refreshToken, expiresIn } = action.payload;

    // Store tokens using AdvancedTokenManager
    AdvancedTokenManager.setTokens({
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresIn: expiresIn || 900, // 15 minutes default
      tokenType: 'Bearer',
    });

    // Store user data
    localStorage.setItem('user_data', JSON.stringify(user));

    // Track login event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'login', {
        method: user?.userType,
        user_id: user?.id,
      });
    }
  },
});

authMiddleware.startListening({
  actionCreator: logout,
  effect: async (action, listenerApi) => {
    // Clear tokens and user data
    AdvancedTokenManager.clearTokens();

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

authMiddleware.startListening({
  actionCreator: sessionExpired,
  effect: async (action, listenerApi) => {
    // Clear all data
    AdvancedTokenManager.clearTokens();

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

authMiddleware.startListening({
  actionCreator: refreshTokenSuccess,
  effect: async (action, listenerApi) => {
    const { accessToken, refreshToken, expiresIn } = action.payload;

    AdvancedTokenManager.setTokens({
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresIn: expiresIn || 900, // 15 minutes default
      tokenType: 'Bearer',
    });
  },
});
