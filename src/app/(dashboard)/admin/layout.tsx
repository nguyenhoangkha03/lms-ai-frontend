'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Crown, Menu, X } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    redirect('/login');
  }

  // Show access denied if not admin
  if (user?.userType !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="mx-auto max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <Shield className="h-10 w-10 text-red-600" />
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              Access Restricted
            </h2>
            <p className="mb-6 text-muted-foreground">
              You don't have administrator privileges to access this area.
            </p>
            <div className="flex items-center justify-center space-x-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-600">
              <Crown className="h-4 w-4" />
              <span className="font-medium">Administrator access required</span>
            </div>
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <div className="hidden lg:block">
          <AdminSidebar
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        </div>
        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="fixed left-4 top-4 z-50 h-10 w-10 p-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <AdminSidebar collapsed={false} />
          </SheetContent>
        </Sheet>
        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60">
                  <Crown className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Admin Panel</h1>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {user && (
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Administrator
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Page Content */}
          <main
            className={cn(
              'flex-1 overflow-auto',
              'lg:pl-0', // No padding on desktop since sidebar is separate
              'relative' // For mobile menu overlay
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
