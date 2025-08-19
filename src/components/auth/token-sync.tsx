'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdvancedTokenManager } from '@/lib/auth/token-manager';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  selectAuth,
  loginSuccess,
  sessionExpired,
} from '@/lib/redux/slices/auth-slice';

export default function TokenSyncComponent() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const router = useRouter();

  //   console.log('KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK');

  useEffect(() => {
    const initializeTokenSync = async () => {
      AdvancedTokenManager.initialize();

      const accessToken = AdvancedTokenManager.getAccessToken();
      const refreshToken = AdvancedTokenManager.getRefreshToken();
      const userData = localStorage.getItem('user_data');

      console.log('KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK');

      if (accessToken && refreshToken && userData && !auth.isAuthenticated) {
        try {
          const user = JSON.parse(userData);
          console.log('🔄 Syncing auth state from cookies/localStorage');

          const validation = AdvancedTokenManager.validateAccessToken();
          if (validation.isValid) {
            dispatch(
              loginSuccess({
                user,
                accessToken: accessToken,
                refreshToken,
                expiresIn: AdvancedTokenManager.getTimeUntilExpiry(),
              })
            );
          } else if (validation.needsRefresh) {
            // Try to refresh token
            const refreshSuccess =
              await AdvancedTokenManager.refreshTokenSilently();
            if (refreshSuccess) {
              const newToken = AdvancedTokenManager.getAccessToken();
              if (newToken) {
                dispatch(
                  loginSuccess({
                    user,
                    accessToken: newToken,
                    refreshToken,
                    expiresIn: AdvancedTokenManager.getTimeUntilExpiry(),
                  })
                );
              }
            } else {
              // Refresh failed, clear state
              dispatch(sessionExpired());
            }
          } else {
            // Token is invalid, clear state
            dispatch(sessionExpired());
          }
        } catch (error) {
          console.error('Error syncing auth state:', error);
          AdvancedTokenManager.clearTokens();
          dispatch(sessionExpired());
        }
      }

      // Listen to session expiry events from TokenManager
      const handleSessionExpired = (event: CustomEvent) => {
        console.log('🚫 Session expired event received:', event.detail);
        dispatch(sessionExpired());
      };

      window.addEventListener(
        'auth:session-expired',
        handleSessionExpired as EventListener
      );

      // Set up periodic sync check (every 5 minutes) - less frequent than TokenManager
      const syncInterval = setInterval(
        () => {
          const currentToken = AdvancedTokenManager.getAccessToken();
          const currentRefreshToken = AdvancedTokenManager.getRefreshToken();

          // If we have an authenticated user in Redux but no tokens at all, clear state
          if (auth.isAuthenticated && !currentToken && !currentRefreshToken) {
            console.log('🚫 No valid tokens available, clearing auth state');
            dispatch(sessionExpired());
          }
        },
        5 * 60 * 1000
      ); // 5 minutes

      return () => {
        clearInterval(syncInterval);
        window.removeEventListener(
          'auth:session-expired',
          handleSessionExpired as EventListener
        );
      };
    };

    initializeTokenSync();
  }, [dispatch, auth.isAuthenticated]);

  // Handle session expiry
  useEffect(() => {
    if (auth.error === 'Session expired. Please login again.') {
      console.log(
        '🚫 Handling session expiry, clearing tokens and redirecting'
      );

      // Clear everything
      AdvancedTokenManager.clearTokens();

      // Don't redirect if already on login page or public pages
      const currentPath = window.location.pathname;
      const publicPaths = [
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/',
        '/about',
        '/features',
        '/pricing',
        '/contact',
      ];
      const isPublicPath = publicPaths.some(path =>
        currentPath.startsWith(path)
      );

      if (!isPublicPath) {
        console.log(`🔄 Redirecting to login from ${currentPath}`);
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      }
    }
  }, [auth.error, router]);

  return null; // This component doesn't render anything
}
