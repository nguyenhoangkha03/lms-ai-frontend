'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';

const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
];

const TRACK_INTERVAL = 30000; // 30 seconds

export function ActivityTracker() {
  const { isAuthenticated, updateUser } = useAuth();
  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout>(null);

  const updateActivity = () => {
    lastActivityRef.current = Date.now();
  };

  const trackActivity = () => {
    if (!isAuthenticated) return;

    // Update user's last activity
    updateUser({ lastLoginAt: new Date().toISOString() });

    // Store in localStorage for session monitoring
    localStorage.setItem('last_activity', lastActivityRef.current.toString());
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // Add activity event listeners
    ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Start activity tracking interval
    timerRef.current = setInterval(trackActivity, TRACK_INTERVAL);

    return () => {
      // Clean up event listeners
      ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });

      // Clear interval
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isAuthenticated]);

  return null; // This is a background component
}
