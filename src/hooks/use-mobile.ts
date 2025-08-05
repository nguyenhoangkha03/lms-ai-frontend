'use client';

import { useState, useEffect, useCallback } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

interface ViewportInfo {
  width: number;
  height: number;
  deviceType: DeviceType;
  orientation: Orientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  isOnline: boolean;
  pixelRatio: number;
}

type OrientationLockType =
  | 'any'
  | 'natural'
  | 'landscape'
  | 'portrait'
  | 'portrait-primary'
  | 'portrait-secondary'
  | 'landscape-primary'
  | 'landscape-secondary';

interface TouchInfo {
  isTouch: boolean;
  maxTouchPoints: number;
  canHover: boolean;
  hasFinePointer: boolean;
}

interface ScreenOrientationExtended extends ScreenOrientation {
  lock(orientation: OrientationLockType): Promise<void>;
}

// Mobile breakpoints
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

// Device detection utilities
const getDeviceType = (width: number): DeviceType => {
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
};

const getOrientation = (width: number, height: number): Orientation => {
  return width > height ? 'landscape' : 'portrait';
};

const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
};

const getNetworkStatus = (): boolean => {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
};

/**
 * Hook for responsive viewport information
 */
export function useViewport(): ViewportInfo {
  const [viewport, setViewport] = useState<ViewportInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        deviceType: 'desktop',
        orientation: 'landscape',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        isOnline: true,
        pixelRatio: 1,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const deviceType = getDeviceType(width);

    return {
      width,
      height,
      deviceType,
      orientation: getOrientation(width, height),
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      isTouchDevice: isTouchDevice(),
      isOnline: getNetworkStatus(),
      pixelRatio: window.devicePixelRatio || 1,
    };
  });

  const updateViewport = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const deviceType = getDeviceType(width);

    setViewport(prev => ({
      ...prev,
      width,
      height,
      deviceType,
      orientation: getOrientation(width, height),
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      pixelRatio: window.devicePixelRatio || 1,
    }));
  }, []);

  const updateNetworkStatus = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      isOnline: getNetworkStatus(),
    }));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Update viewport on resize
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    // Update network status
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateNetworkStatus);
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, [updateViewport, updateNetworkStatus]);

  return viewport;
}

/**
 * Hook for touch capabilities detection
 */
export function useTouch(): TouchInfo {
  const [touchInfo, setTouchInfo] = useState<TouchInfo>(() => ({
    isTouch: false,
    maxTouchPoints: 0,
    canHover: true,
    hasFinePointer: true,
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateTouchInfo = () => {
      const isTouch = isTouchDevice();
      const maxTouchPoints = navigator.maxTouchPoints || 0;

      // Media queries for hover and pointer
      const canHover = window.matchMedia('(hover: hover)').matches;
      const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

      setTouchInfo({
        isTouch,
        maxTouchPoints,
        canHover,
        hasFinePointer,
      });
    };

    updateTouchInfo();

    // Listen for media query changes
    const hoverQuery = window.matchMedia('(hover: hover)');
    const pointerQuery = window.matchMedia('(pointer: fine)');

    hoverQuery.addEventListener('change', updateTouchInfo);
    pointerQuery.addEventListener('change', updateTouchInfo);

    return () => {
      hoverQuery.removeEventListener('change', updateTouchInfo);
      pointerQuery.removeEventListener('change', updateTouchInfo);
    };
  }, []);

  return touchInfo;
}

/**
 * Hook for mobile-specific features
 */
export function useMobile() {
  const viewport = useViewport();
  const touchInfo = useTouch();

  // Device capabilities
  const canInstallPWA = useCallback(() => {
    if (typeof window === 'undefined') return false;

    // Check for beforeinstallprompt event support
    return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
  }, []);

  const canShare = useCallback(() => {
    if (typeof navigator === 'undefined') return false;
    return 'share' in navigator;
  }, []);

  const canVibrate = useCallback(() => {
    if (typeof navigator === 'undefined') return false;
    return 'vibrate' in navigator;
  }, []);

  const getConnectionInfo = useCallback(() => {
    if (typeof navigator === 'undefined') return null;

    // @ts-ignore
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (!connection) return null;

    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      saveData: connection.saveData,
    };
  }, []);

  // Screen utilities
  const lockOrientation = useCallback(
    async (orientation: OrientationLockType) => {
      if (typeof screen === 'undefined' || !screen.orientation) return false;

      try {
        const orientationAPI = screen.orientation as ScreenOrientationExtended;
        await orientationAPI.lock(orientation);
        return true;
      } catch (error) {
        console.warn('Orientation lock failed:', error);
        return false;
      }
    },
    []
  );

  const unlockOrientation = useCallback(() => {
    if (typeof screen === 'undefined' || !screen.orientation) return;
    screen.orientation.unlock();
  }, []);

  // Haptic feedback
  const vibrate = useCallback(
    (pattern: number | number[]) => {
      if (!canVibrate()) return false;

      try {
        navigator.vibrate(pattern);
        return true;
      } catch (error) {
        console.warn('Vibration failed:', error);
        return false;
      }
    },
    [canVibrate]
  );

  // Native sharing
  const share = useCallback(
    async (data: ShareData) => {
      if (!canShare()) return false;

      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.warn('Sharing failed:', error);
        return false;
      }
    },
    [canShare]
  );

  return {
    // Viewport info
    ...viewport,

    // Touch info
    ...touchInfo,

    // Capabilities
    canInstallPWA: canInstallPWA(),
    canShare: canShare(),
    canVibrate: canVibrate(),

    // Connection info
    connection: getConnectionInfo(),

    // Utilities
    lockOrientation,
    unlockOrientation,
    vibrate,
    share,

    // Helper flags
    shouldOptimizeForTouch: touchInfo.isTouch && !touchInfo.hasFinePointer,
    shouldShowMobileUI:
      viewport.isMobile || (touchInfo.isTouch && !touchInfo.canHover),
    isLowPowerMode: getConnectionInfo()?.saveData || false,
  };
}

/**
 * Hook for responsive breakpoint matching
 */
export function useBreakpoint() {
  const { width } = useViewport();

  return {
    isXs: width < 480,
    isSm: width >= 480 && width < 768,
    isMd: width >= 768 && width < 1024,
    isLg: width >= 1024 && width < 1280,
    isXl: width >= 1280 && width < 1536,
    is2Xl: width >= 1536,

    // Convenience flags
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,

    // Current breakpoint
    current:
      width < 480
        ? 'xs'
        : width < 768
          ? 'sm'
          : width < 1024
            ? 'md'
            : width < 1280
              ? 'lg'
              : width < 1536
                ? 'xl'
                : '2xl',
  };
}
