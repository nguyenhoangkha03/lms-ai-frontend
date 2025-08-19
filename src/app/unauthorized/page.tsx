'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { ROUTES } from '@/lib/constants/constants';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleGoHome = () => {
    if (user) {
      // Redirect based on user role
      switch (user.userType) {
        case 'student':
          router.push(ROUTES.STUDENT_DASHBOARD);
          break;
        case 'teacher':
          router.push(ROUTES.TEACHER_DASHBOARD);
          break;
        case 'admin':
          router.push(ROUTES.ADMIN_DASHBOARD);
          break;
        default:
          router.push(ROUTES.HOME);
      }
    } else {
      router.push(ROUTES.HOME);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {user && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                Signed in as: <span className="font-medium">{user.email}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Role: <span className="font-medium capitalize">{user.userType}</span>
              </p>
            </div>
          )}
          
          <div className="text-center text-sm text-muted-foreground">
            <p>
              The page you're trying to access requires different permissions.
              {!user && ' Please sign in with the appropriate account.'}
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={handleGoHome} 
              className="w-full"
              variant="default"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
            
            <Button 
              onClick={handleGoBack} 
              variant="outline" 
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            
            {user && (
              <Button 
                onClick={handleLogout} 
                variant="secondary" 
                className="w-full"
              >
                Sign Out & Login as Different User
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}