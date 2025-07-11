'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean; // Bắt buộc đăng nhập
  redirectIfAuthenticated?: boolean; // Người đăng nhập sẽ bị redirect
  redirectTo?: string;
}

export function AuthLayout({
  children,
  requireAuth = false,
  redirectIfAuthenticated = false,
  redirectTo,
}: AuthLayoutProps) {
  const { isAuthenticated, isLoading, isInitialized, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    if (requireAuth && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Đã đăng nhập mà vào trang như login và register
    if (redirectIfAuthenticated && isAuthenticated && user) {
      const destination = redirectTo || getDashboardRoute(user.userType);
      router.push(destination);
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    isInitialized,
    requireAuth,
    redirectIfAuthenticated,
    router,
    user,
    redirectTo,
  ]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if requirements aren't met
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (redirectIfAuthenticated && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
