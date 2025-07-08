import { Middleware } from '@reduxjs/toolkit';
import { checkSessionExpiry, updateLastActivity } from '../slices/auth';
import { TokenManager } from '@/lib/auth/token-manager';

export const authMiddleware: Middleware = store => next => action => {
  const result = next(action);
  const state = store.getState() as any;

  // Update last activity for authenticated users
  if (
    state.auth.isAuthenticated &&
    !(action as any).type.includes('auth/updateLastActivity')
  ) {
    store.dispatch(updateLastActivity());
  }

  // Check session expiry periodically
  if (state.auth.isAuthenticated) {
    store.dispatch(checkSessionExpiry());
  }

  // Schedule token refresh
  if (
    (action as any).type === 'auth/setCredentials' &&
    (action as any).payload.token
  ) {
    const tokenManager = TokenManager.getInstance();
    tokenManager.scheduleTokenRefresh((action as any).payload.token);
  }

  return result;
};

// Session timeout checker
export const startSessionMonitor = (store: any) => {
  setInterval(() => {
    const state = store.getState();

    if (state.auth.isAuthenticated) {
      store.dispatch(checkSessionExpiry());
    }
  }, 60000); // Check every minute
};
