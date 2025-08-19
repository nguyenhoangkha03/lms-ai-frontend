'use client';

import React, { useEffect } from 'react';
import { ReduxProvider } from './redux-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { NotificationProvider } from '@/contexts/notification-context';
import { SocketProvider } from '@/contexts/socket-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { AdvancedTokenManager } from '@/lib/auth/token-manager';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Initialize Token Manager on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🚀 Initializing TokenManager...');
      AdvancedTokenManager.initialize();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ReduxProvider>
          <AuthProvider>
            <SocketProvider>
              <NotificationProvider>
                <ProgressBar />
                {children}
                <Toaster position="top-right" expand richColors closeButton />
              </NotificationProvider>
            </SocketProvider>
          </AuthProvider>
        </ReduxProvider>
      </ThemeProvider>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
