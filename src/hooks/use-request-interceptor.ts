import { useEffect } from 'react';
import { apiClient } from '@/lib/api/api-client';
import { useAuth } from '@/hooks/use-auth';

export const useRequestInterceptor = () => {
  const { updateLastActivity } = useAuth();

  useEffect(() => {
    const instance = apiClient.getInstance();

    // Add request interceptor for activity tracking
    const requestInterceptor = instance.interceptors.request.use(config => {
      // Update user activity on each API request
      updateLastActivity();
      return config;
    });

    // Cleanup
    return () => {
      instance.interceptors.request.eject(requestInterceptor);
    };
  }, [updateLastActivity]);
};
