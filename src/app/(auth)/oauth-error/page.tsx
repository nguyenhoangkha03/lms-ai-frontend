'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { ROUTES } from '@/lib/constants/constants';
import Link from 'next/link';

export default function OAuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get error message from URL params
  const errorMessage = searchParams.get('message') || 'An unknown error occurred';
  const errorCode = searchParams.get('code');

  const getErrorDisplay = (message: string, code?: string | null) => {
    // Map common OAuth errors to user-friendly messages
    const errorMappings: Record<string, { title: string; description: string; suggestion: string }> = {
      'access_denied': {
        title: 'Permission Denied',
        description: 'You denied permission to access your account.',
        suggestion: 'To sign in with this provider, you need to grant permission to access your basic profile information.'
      },
      'invalid_request': {
        title: 'Invalid Request',
        description: 'There was an issue with the authentication request.',
        suggestion: 'Please try signing in again. If the problem persists, contact support.'
      },
      'server_error': {
        title: 'Server Error',
        description: 'The authentication provider encountered an error.',
        suggestion: 'Please try again in a few moments. If the issue continues, contact support.'
      },
      'temporarily_unavailable': {
        title: 'Service Unavailable',
        description: 'The authentication service is temporarily unavailable.',
        suggestion: 'Please try again in a few minutes or use email/password login.'
      },
      'OAuth failed': {
        title: 'Authentication Failed',
        description: 'Unable to complete social login.',
        suggestion: 'Please try again or use email/password login instead.'
      }
    };

    // Check if we have a specific mapping
    const mapping = errorMappings[code || ''] || errorMappings[message] || null;
    
    if (mapping) {
      return mapping;
    }

    // Default error display
    return {
      title: 'Sign In Failed',
      description: message,
      suggestion: 'Please try signing in again. If the problem continues, try using email and password instead.'
    };
  };

  const errorDisplay = getErrorDisplay(errorMessage, errorCode);

  const handleRetryLogin = () => {
    router.push(ROUTES.LOGIN);
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-red-900">
            {errorDisplay.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorDisplay.description}
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <p className="font-medium mb-2">💡 What can you do?</p>
            <p>{errorDisplay.suggestion}</p>
          </div>

          {/* Error details for debugging (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground">
                Technical Details (Dev Only)
              </summary>
              <div className="mt-2 p-2 bg-muted rounded font-mono">
                <p><strong>Error:</strong> {errorMessage}</p>
                {errorCode && <p><strong>Code:</strong> {errorCode}</p>}
                <p><strong>URL:</strong> {window.location.href}</p>
              </div>
            </details>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <Button onClick={handleRetryLogin} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleGoHome}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Homepage
            </Button>
            
            <Button variant="ghost" asChild className="w-full">
              <Link href={ROUTES.REGISTER}>
                Create New Account Instead
              </Link>
            </Button>
          </div>

          {/* Support link */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Need help?{' '}
              <Link 
                href="/support" 
                className="text-primary hover:underline"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}