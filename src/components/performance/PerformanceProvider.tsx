'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import {
  performanceMonitor,
  performanceCache,
  serviceWorkerManager,
  type PerformanceMonitor as PerformanceMonitorType,
  type PerformanceCache as PerformanceCacheType,
  type ServiceWorkerManager as ServiceWorkerManagerType,
} from '@/lib/performance/code-splitting';

interface PerformanceContextType {
  cache: PerformanceCacheType;
  monitor: PerformanceMonitorType;
  serviceWorker: ServiceWorkerManagerType;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider');
  }
  return context;
};

interface PerformanceProviderProps {
  children: React.ReactNode;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({
  children,
}) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Initialize performance monitoring
    performanceMonitor.init();

    // Register service worker
    serviceWorkerManager.register();

    // Cleanup on unmount
    return () => {
      performanceMonitor.disconnect();
    };
  }, []);

  const value = {
    cache: performanceCache,
    monitor: performanceMonitor,
    serviceWorker: serviceWorkerManager,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};
