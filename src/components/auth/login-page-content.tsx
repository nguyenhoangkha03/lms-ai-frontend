'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import { LoginForm } from './login-form';

export const LoginPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const verified = searchParams.get('verified');
  const message = searchParams.get('message');

  useEffect(() => {
    if (verified === 'true' && message) {
      toast({
        title: 'Email Verified Successfully!',
        description: decodeURIComponent(message),
      });
      
      // Clean up URL after showing toast
      if (window.history.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.delete('verified');
        url.searchParams.delete('message');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [verified, message, toast]);

  return (
    <div className="space-y-6">
      {/* Success Alert for Email Verification */}
      {verified === 'true' && message && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <strong>Email Verified!</strong> {decodeURIComponent(message)}. You can now login to access your account.
          </AlertDescription>
        </Alert>
      )}

      <LoginForm />
    </div>
  );
};