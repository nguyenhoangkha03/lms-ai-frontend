import { lazy, ComponentType } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LazyComponentOptions {
  fallback?: ComponentType;
  delay?: number;
  retry?: number;
}

export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
) => {
  const { fallback: Fallback = LoadingSpinner, delay = 0, retry = 3 } = options;

  const LazyComponent = lazy(() => {
    let retryCount = 0;

    const loadWithRetry = async (): Promise<{ default: T }> => {
      try {
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        return await importFn();
      } catch (error) {
        if (retryCount < retry) {
          retryCount++;
          console.warn(`Retry loading component (${retryCount}/${retry})`);
          return loadWithRetry();
        }
        throw error;
      }
    };

    return loadWithRetry();
  });

  return LazyComponent;
};

export const LazyPages = {
  StudentDashboard: createLazyComponent(
    () => import('@/app/(dashboard)/student/page'),
    { delay: 100 }
  ),
  StudentAnalytics: createLazyComponent(
    () => import('@/app/(protected)/student/analytics/page')
  ),
  StudentProgress: createLazyComponent(
    () => import('@/app/(protected)/student/progress/page')
  ),
  StudentAchievements: createLazyComponent(
    () => import('@/app/(protected)/student/achievements/page')
  ),
  AITutor: createLazyComponent(
    () => import('@/app/(dashboard)/student/ai-tutor/page')
  ),
  LearningPath: createLazyComponent(
    () => import('@/app/(dashboard)/student/learning-path/page')
  ),
  PredictiveAnalytics: createLazyComponent(
    () => import('@/app/(dashboard)/student/predictive-analytics/page')
  ),

  TeacherDashboard: createLazyComponent(
    () => import('@/app/(protected)/teacher/dashboard/page')
  ),
  CourseCreate: createLazyComponent(
    () => import('@/app/(protected)/teacher/courses/create/page')
  ),
  AssessmentCreate: createLazyComponent(
    () => import('@/app/teacher/assessments/create/page')
  ),
  Gradebook: createLazyComponent(() => import('@/app/teacher/gradebook/page')),
  LiveSessions: createLazyComponent(
    () => import('@/app/teacher/live-sessions/page')
  ),

  AdminDashboard: createLazyComponent(
    () => import('@/app/(dashboard)/admin/page')
  ),
  UserManagement: createLazyComponent(
    () => import('@/app/(dashboard)/admin/users/page')
  ),
  AIManagement: createLazyComponent(
    () => import('@/app/(dashboard)/admin/ai-management/page')
  ),
  CacheManagement: createLazyComponent(
    () => import('@/app/(dashboard)/admin/cache-database-management/page')
  ),
  FileManagement: createLazyComponent(
    () => import('@/app/(dashboard)/admin/file-management/page')
  ),
  ContentModeration: createLazyComponent(
    () => import('@/app/(dashboard)/admin/content/moderation/page')
  ),

  CourseList: createLazyComponent(() => import('@/app/courses/page')),
  CourseDetail: createLazyComponent(() => import('@/app/courses/[slug]/page')),
  LessonPage: createLazyComponent(
    () =>
      import(
        '@/app/(dashboard)/student/courses/[courseId]/lessons/[lessonId]/page'
      )
  ),

  AssessmentTake: createLazyComponent(
    () =>
      import('@/app/(dashboard)/student/assessments/[assessmentId]/take/page')
  ),
  AssessmentResults: createLazyComponent(
    () =>
      import(
        '@/app/(dashboard)/student/assessments/[assessmentId]/results/page'
      )
  ),

  Forum: createLazyComponent(() => import('@/app/forum/page')),
  StudyGroups: createLazyComponent(() => import('@/app/study-groups/page')),
  Chat: createLazyComponent(() => import('@/app/chat/page')),
  Search: createLazyComponent(() => import('@/app/(dashboard)/search/page')),
};

export const LazyComponents = {
  NavigationHeader: createLazyComponent(
    () => import('@/components/layout/header')
  ),

  Footer: createLazyComponent(() => import('@/components/layout/footer')),

  AnalyticsWidgets: createLazyComponent(
    () => import('@/components/admin/analytics/AnalyticsWidgets')
  ),
  PredictiveAnalyticsWidget: createLazyComponent(
    () =>
      import('@/components/analytics/predictive/performance-forecast-widget')
  ),

  AITutorInterface: createLazyComponent(
    () => import('@/components/ai/ai-tutor-interface')
  ),
  ContentAnalysisDashboard: createLazyComponent(
    () =>
      import('@/components/ai/content-analysis/ContentAnalysisMainDashboard')
  ),
  KnowledgeGraphVisualization: createLazyComponent(
    () => import('@/components/ai/knowledge-graph-visualization')
  ),

  AssessmentBuilder: createLazyComponent(
    () => import('@/components/teacher/assessment/AssessmentBuilder')
  ),
  QuestionEditor: createLazyComponent(
    () => import('@/components/teacher/assessment/QuestionEditor')
  ),
  AssessmentAnalytics: createLazyComponent(
    () => import('@/components/teacher/assessment/AssessmentAnalytics')
  ),

  FileManagementDashboard: createLazyComponent(
    () => import('@/components/file-management/FileManagementDashboard')
  ),
  CDNManagementPanel: createLazyComponent(
    () => import('@/components/file-management/CDNManagementPanel')
  ),

  VideoSessionInterface: createLazyComponent(
    () => import('@/components/live-teaching/VideoSessionInterface')
  ),
  WhiteboardPanel: createLazyComponent(
    () => import('@/components/live-teaching/WhiteboardPanel')
  ),

  // Charts & Visualizations
  PerformanceCharts: createLazyComponent(
    () => import('@/components/analytics/performance-charts-widget')
  ),
  LearningPatternVisualization: createLazyComponent(
    () =>
      import('@/components/analytics/predictive/learning-pattern-visualization')
  ),
};

// Route-based code splitting helper
export const getRouteBundle = (pathname: string) => {
  const routeBundles = {
    '/student': ['student', 'analytics', 'learning'],
    '/teacher': ['teacher', 'assessment', 'gradebook'],
    '/admin': ['admin', 'management', 'analytics'],
    '/courses': ['course', 'learning', 'video'],
    '/chat': ['chat', 'communication'],
    '/forum': ['forum', 'discussion'],
    '/study-groups': ['collaboration', 'whiteboard'],
  };

  for (const [route, bundles] of Object.entries(routeBundles)) {
    if (pathname.startsWith(route)) {
      return bundles;
    }
  }

  return ['core'];
};

// Preload function for route anticipation
export const preloadRoute = (route: string) => {
  const bundles = getRouteBundle(route);

  bundles.forEach(bundle => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'script';
    link.href = `/_next/static/chunks/${bundle}.js`;
    document.head.appendChild(link);
  });
};

// src/lib/performance/caching-strategies.ts
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  staleWhileRevalidate?: number;
  maxAge?: number;
  swr?: boolean;
}

export class PerformanceCache {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();
  private redis: any = null; // Redis client sẽ được inject từ server

  constructor(redisClient?: any) {
    this.redis = redisClient;
  }

  // Browser-side memory cache
  set(key: string, data: any, config: CacheConfig) {
    const entry = {
      data,
      timestamp: Date.now(),
      ttl: config.ttl * 1000, // Convert to milliseconds
    };

    this.cache.set(key, entry);

    // Auto cleanup expired entries
    setTimeout(() => {
      this.cache.delete(key);
    }, entry.ttl);
  }

  get(key: string) {
    const entry = this.cache.get(key);

    if (!entry) return null;

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Redis integration for server-side caching
  async setRedis(key: string, data: any, config: CacheConfig) {
    if (!this.redis) return;

    try {
      await this.redis.setex(key, config.ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Redis cache set error:', error);
    }
  }

  async getRedis(key: string) {
    if (!this.redis) return null;

    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis cache get error:', error);
      return null;
    }
  }

  // Smart caching with fallback
  async smartGet(
    key: string,
    fetcher: () => Promise<any>,
    config: CacheConfig
  ) {
    // Try memory cache first
    let data = this.get(key);
    if (data) return data;

    // Try Redis cache
    data = await this.getRedis(key);
    if (data) {
      // Store in memory for faster access
      this.set(key, data, config);
      return data;
    }

    // Fetch fresh data
    data = await fetcher();

    // Cache in both layers
    this.set(key, data, config);
    await this.setRedis(key, data, config);

    return data;
  }

  // Cache invalidation
  invalidate(pattern: string) {
    // Memory cache
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }

    // Redis cache (if available)
    if (this.redis) {
      this.redis.keys(`*${pattern}*`).then((keys: string[]) => {
        if (keys.length > 0) {
          this.redis.del(...keys);
        }
      });
    }
  }

  // Background refresh for SWR
  async refreshInBackground(
    key: string,
    fetcher: () => Promise<any>,
    config: CacheConfig
  ) {
    try {
      const freshData = await fetcher();
      this.set(key, freshData, config);
      await this.setRedis(key, freshData, config);
    } catch (error) {
      console.error('Background refresh error:', error);
    }
  }
}

// Global cache instance
export const performanceCache = new PerformanceCache();

// Cache key generators
export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  course: (courseId: string) => `course:${courseId}`,
  lesson: (lessonId: string) => `lesson:${lessonId}`,
  assessment: (assessmentId: string) => `assessment:${assessmentId}`,
  analytics: (userId: string, type: string) => `analytics:${userId}:${type}`,
  recommendations: (userId: string) => `recommendations:${userId}`,
  search: (query: string, filters: string) => `search:${query}:${filters}`,
  dashboard: (userId: string, role: string) => `dashboard:${userId}:${role}`,
};

// Cache configurations for different data types
export const CacheConfigs = {
  user: { ttl: 300, swr: true }, // 5 minutes
  course: { ttl: 900, swr: true }, // 15 minutes
  lesson: { ttl: 1800, swr: true }, // 30 minutes
  assessment: { ttl: 600, swr: true }, // 10 minutes
  analytics: { ttl: 180, swr: true }, // 3 minutes
  recommendations: { ttl: 3600, swr: true }, // 1 hour
  search: { ttl: 300, swr: false }, // 5 minutes
  dashboard: { ttl: 120, swr: true }, // 2 minutes
  static: { ttl: 86400, swr: false }, // 24 hours
};

// src/lib/performance/image-optimization.ts
export interface ImageOptimizationConfig {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  blur?: boolean;
  progressive?: boolean;
}

export class ImageOptimizer {
  private static instance: ImageOptimizer;
  private cdnBaseUrl: string;

  constructor(cdnBaseUrl: string = process.env.NEXT_PUBLIC_CDN_URL || '') {
    this.cdnBaseUrl = cdnBaseUrl;
  }

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  // Generate optimized image URL
  getOptimizedUrl(src: string, config: ImageOptimizationConfig = {}): string {
    const {
      quality = 85,
      format = 'webp',
      width,
      height,
      blur = false,
      progressive = true,
    } = config;

    // If it's already a CDN URL, return as is
    if (src.startsWith('http') && src.includes('cdn')) {
      return src;
    }

    // Build optimization parameters
    const params = new URLSearchParams();
    params.set('q', quality.toString());
    params.set('f', format);

    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (blur) params.set('blur', '10');
    if (progressive) params.set('prog', 'true');

    return `${this.cdnBaseUrl}/optimize?url=${encodeURIComponent(src)}&${params.toString()}`;
  }

  // Generate responsive image sources
  generateResponsiveSources(
    src: string,
    sizes: number[] = [640, 768, 1024, 1280, 1536]
  ) {
    return sizes.map(size => ({
      media: `(max-width: ${size}px)`,
      srcSet: this.getOptimizedUrl(src, {
        width: size,
        format: 'webp',
      }),
    }));
  }

  // Preload critical images
  preloadImage(src: string, config: ImageOptimizationConfig = {}) {
    const optimizedUrl = this.getOptimizedUrl(src, config);

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizedUrl;

    document.head.appendChild(link);
  }

  // Lazy load images with intersection observer
  createLazyLoader() {
    if (typeof window === 'undefined') return null;

    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;

            if (src) {
              img.src = src;
              img.classList.remove('lazy');
              observer.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01,
      }
    );

    return imageObserver;
  }
}

// src/lib/performance/monitoring.ts
export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
}

export interface CustomMetric {
  name: string;
  value: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private customMetrics: CustomMetric[] = [];
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  init() {
    if (typeof window === 'undefined') return;

    this.measureCoreWebVitals();
    this.measureResourceTiming();
    this.measureNavigationTiming();
  }

  // Measure Core Web Vitals
  private measureCoreWebVitals() {
    // FCP (First Contentful Paint)
    const fcpObserver = new PerformanceObserver(entryList => {
      const entries = entryList.getEntries();
      const fcp = entries[entries.length - 1];
      this.metrics.fcp = fcp.startTime;
      this.reportMetric('fcp', fcp.startTime);
    });

    fcpObserver.observe({ entryTypes: ['paint'] });
    this.observers.push(fcpObserver);

    // LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver(entryList => {
      const entries = entryList.getEntries();
      const lcp = entries[entries.length - 1];
      this.metrics.lcp = lcp.startTime;
      this.reportMetric('lcp', lcp.startTime);
    });

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(lcpObserver);

    // FID (First Input Delay)
    const fidObserver = new PerformanceObserver(entryList => {
      const entries = entryList.getEntries();
      const fid = entries[0] as PerformanceEventTiming;

      this.metrics.fid = fid.processingStart - fid.startTime;
      this.reportMetric('fid', this.metrics.fid);
    });

    fidObserver.observe({ entryTypes: ['first-input'] });
    this.observers.push(fidObserver);

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    let clsEntries: any[] = [];

    const clsObserver = new PerformanceObserver(entryList => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsEntries.push(entry);
          clsValue += (entry as any).value;
        }
      }

      this.metrics.cls = clsValue;
      this.reportMetric('cls', clsValue);
    });

    clsObserver.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(clsObserver);
  }

  // Measure resource loading performance
  private measureResourceTiming() {
    const resourceObserver = new PerformanceObserver(entryList => {
      const entries = entryList.getEntries();

      entries.forEach((entry: any) => {
        const resource: ResourceTiming = {
          name: entry.name,
          duration: entry.duration,
          size: entry.transferSize || 0,
          type: this.getResourceType(entry.name),
        };

        this.reportResourceTiming(resource);
      });
    });

    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.push(resourceObserver);
  }

  // Measure navigation timing
  private measureNavigationTiming() {
    if (!window.performance.getEntriesByType) return;

    const navigation = window.performance.getEntriesByType(
      'navigation'
    )[0] as any;

    if (navigation) {
      this.metrics.ttfb = navigation.responseStart - navigation.fetchStart;
      this.reportMetric('ttfb', this.metrics.ttfb);
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    if (url.includes('.jpg') || url.includes('.png') || url.includes('.webp'))
      return 'image';
    return 'other';
  }

  private reportMetric(name: string, value: number) {
    // Send to analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(value),
        non_interaction: true,
      });
    }

    // Send to custom analytics endpoint
    this.sendToAnalytics('web_vital', { name, value });
  }

  private reportResourceTiming(resource: ResourceTiming) {
    // Only report slow resources
    if (resource.duration > 1000) {
      this.sendToAnalytics('slow_resource', resource);
    }
  }

  private async sendToAnalytics(type: string, data: any) {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data, timestamp: Date.now() }),
      });
    } catch (error) {
      console.error('Failed to send performance data:', error);
    }
  }

  // Get current metrics
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  // Cleanup observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  reportCustomMetric(name: string, value: number) {
    const metric: CustomMetric = {
      name,
      value,
      timestamp: Date.now(),
    };

    this.customMetrics.push(metric);
    this.sendToAnalytics('custom_metric', metric);

    // Keep only last 100 custom metrics
    if (this.customMetrics.length > 100) {
      this.customMetrics = this.customMetrics.slice(-100);
    }
  }
}

// Initialize performance monitoring
export const performanceMonitor = PerformanceMonitor.getInstance();

// src/lib/performance/service-worker.ts
export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private registration: ServiceWorkerRegistration | null = null;

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  async register(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });

      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New version available
              this.notifyUpdate();
            }
          });
        }
      });

      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  private notifyUpdate() {
    // Show update notification to user
    if (typeof window !== 'undefined' && 'Notification' in window) {
      new Notification('App Update Available', {
        body: 'A new version is available. Please refresh to update.',
        icon: '/icons/icon-192x192.png',
      });
    }
  }

  async update() {
    if (this.registration) {
      await this.registration.update();
    }
  }

  async skipWaiting() {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }
}

export const serviceWorkerManager = ServiceWorkerManager.getInstance();
