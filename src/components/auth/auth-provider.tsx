'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { startSessionMonitor } from '@/store/middleware/auth-middleware';
import { store } from '@/store';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isInitialized } = useAuth();

  useEffect(() => {
    // Start session monitoring
    startSessionMonitor(store);
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="loading-spinner h-8 w-8" />
          <p className="text-muted-foreground text-sm">Initializing...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
