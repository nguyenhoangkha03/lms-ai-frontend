export interface PerformanceAnalytics {
  trackPageLoad: (url: string, loadTime: number) => void;
  trackResourceLoad: (resource: string, loadTime: number, size: number) => void;
  trackCacheHit: (
    resource: string,
    hitType: 'memory' | 'disk' | 'network'
  ) => void;
  trackError: (error: Error, context: string) => void;
  trackUserTiming: (name: string, duration: number) => void;
}

export class LMSPerformanceAnalytics implements PerformanceAnalytics {
  private static instance: LMSPerformanceAnalytics;
  private analyticsEndpoint: string;
  private batchSize: number = 10;
  private batch: any[] = [];

  constructor() {
    this.analyticsEndpoint = '/api/analytics/performance';

    // Flush batch periodically
    setInterval(() => this.flushBatch(), 30000);

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flushBatch());
    }
  }

  static getInstance(): LMSPerformanceAnalytics {
    if (!LMSPerformanceAnalytics.instance) {
      LMSPerformanceAnalytics.instance = new LMSPerformanceAnalytics();
    }
    return LMSPerformanceAnalytics.instance;
  }

  trackPageLoad(url: string, loadTime: number) {
    this.addToBatch({
      type: 'page_load',
      url,
      loadTime,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
    });
  }

  trackResourceLoad(resource: string, loadTime: number, size: number) {
    this.addToBatch({
      type: 'resource_load',
      resource,
      loadTime,
      size,
      timestamp: Date.now(),
    });
  }

  trackCacheHit(resource: string, hitType: 'memory' | 'disk' | 'network') {
    this.addToBatch({
      type: 'cache_hit',
      resource,
      hitType,
      timestamp: Date.now(),
    });
  }

  trackError(error: Error, context: string) {
    this.addToBatch({
      type: 'error',
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      url: window.location.href,
    });
  }

  trackUserTiming(name: string, duration: number) {
    this.addToBatch({
      type: 'user_timing',
      name,
      duration,
      timestamp: Date.now(),
    });
  }

  private addToBatch(data: any) {
    this.batch.push(data);

    if (this.batch.length >= this.batchSize) {
      this.flushBatch();
    }
  }

  private async flushBatch() {
    if (this.batch.length === 0) return;

    const batchToSend = [...this.batch];
    this.batch = [];

    try {
      await fetch(this.analyticsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batchToSend }),
        keepalive: true,
      });
    } catch (error) {
      console.error('Failed to send performance analytics:', error);
      // Re-add to batch for retry
      this.batch.unshift(...batchToSend);
    }
  }

  private getConnectionInfo() {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      return {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData,
      };
    }
    return null;
  }
}
