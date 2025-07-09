import { Middleware } from '@reduxjs/toolkit';
import { checkSessionExpiry, updateLastActivity } from '../slices/auth';
import { TokenManager } from '@/lib/auth/token-manager';

export const authMiddleware: Middleware = store => next => action => {
  const result = next(action);
  const state = store.getState() as any;

  // Chặn vòng lặp vô hạn do dispatch auth/updateLastActivity
  // Dùng để cập nhật thời gian hoạt động mới nhất dựa vào hành động
  if (
    state.auth.isAuthenticated &&
    !(action as any).type.includes('auth/updateLastActivity')
  ) {
    store.dispatch(updateLastActivity());
  }

  // Kiểm tra so sánh thời gian session, nếu người dùng hành động
  if (state.auth.isAuthenticated) {
    store.dispatch(checkSessionExpiry());
  }

  // Lên lịch refresh token
  if (
    (action as any).type === 'auth/setCredentials' &&
    (action as any).payload.token
  ) {
    const tokenManager = TokenManager.getInstance();
    tokenManager.scheduleTokenRefresh((action as any).payload.token);
  }

  return result;
};

// Kiểm tra session 60 giây, kể cả không thao tác
export const startSessionMonitor = (store: any) => {
  setInterval(() => {
    const state = store.getState();

    if (state.auth.isAuthenticated) {
      store.dispatch(checkSessionExpiry());
    }
  }, 60000);
};
