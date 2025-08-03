'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Crown } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    redirect('/login');
  }

  // Show access denied if not admin
  if (user.userType !== 'admin') {
    return (
      <div className="container mx-auto py-8">
        <Card className="mx-auto max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold">Access Restricted</h2>
            <p className="mb-4 text-muted-foreground">
              You don't have administrator privileges to access this area.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm">
              <Crown className="h-4 w-4 text-amber-500" />
              <span>Administrator access required</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <div className="min-h-screen bg-background">{children}</div>;
}
