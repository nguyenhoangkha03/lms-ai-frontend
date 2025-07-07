'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useModal } from '@/hooks/use-modal';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AUTH_CONFIG } from '@/constants';

const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry
const CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds

export function SessionTimeout() {
  const { isAuthenticated, logout, refreshToken } = useAuth();
  const { isOpen, openModal, closeModal } = useModal('session-timeout');
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const checkSession = useCallback(() => {
    if (!isAuthenticated) return;

    const expiryTime = localStorage.getItem('session_expiry');
    if (!expiryTime) return;

    const currentTime = Date.now();
    const expiry = parseInt(expiryTime);
    const timeUntilExpiry = expiry - currentTime;

    if (timeUntilExpiry <= 0) {
      // Session expired
      logout();
      return;
    }

    if (timeUntilExpiry <= WARNING_TIME && !isOpen) {
      // Show warning
      setTimeLeft(Math.floor(timeUntilExpiry / 1000));
      openModal();
    }

    if (isOpen && timeUntilExpiry > WARNING_TIME) {
      // Close warning if session was extended
      closeModal();
    }
  }, [isAuthenticated, logout, isOpen, openModal, closeModal]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(checkSession, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [isAuthenticated, checkSession]);

  useEffect(() => {
    if (!isOpen) return;

    const countdown = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [isOpen, logout]);

  const handleExtendSession = async () => {
    try {
      await refreshToken();
      closeModal();

      // Update session expiry
      const newExpiry = Date.now() + AUTH_CONFIG.sessionTimeout;
      localStorage.setItem('session_expiry', newExpiry.toString());
    } catch (error) {
      logout();
    }
  };

  const handleLogout = () => {
    logout();
    closeModal();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Session Expiring Soon</DialogTitle>
          <DialogDescription>
            Your session will expire in {formatTime(timeLeft)}. Would you like
            to extend your session?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            Logout
          </Button>
          <Button onClick={handleExtendSession} className="w-full sm:w-auto">
            Extend Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
