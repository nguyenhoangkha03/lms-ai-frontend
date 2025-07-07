'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Shield, Smartphone } from 'lucide-react';

interface TwoFactorAuthProps {
  onSubmit: (code: string) => Promise<void>;
  onResend?: () => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export function TwoFactorAuth({
  onSubmit,
  onResend,
  isLoading = false,
  error,
}: TwoFactorAuthProps) {
  const [code, setCode] = useState('');
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      await onSubmit(code);
    }
  };

  const handleResend = async () => {
    if (onResend) {
      setIsResending(true);
      try {
        await onResend();
      } finally {
        setIsResending(false);
      }
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <Shield className="text-primary h-6 w-6" />
        </div>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Authentication Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="000000"
              value={code}
              onChange={e =>
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              className="text-center text-lg tracking-widest"
              maxLength={6}
              autoComplete="one-time-code"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>

            {onResend && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleResend}
                disabled={isResending}
              >
                <Smartphone className="mr-2 h-4 w-4" />
                {isResending ? 'Sending...' : 'Resend Code'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
