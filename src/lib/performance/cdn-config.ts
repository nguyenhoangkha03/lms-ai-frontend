export interface CDNConfig {
  baseUrl: string;
  regions: string[];
  optimizations: {
    images: boolean;
    videos: boolean;
    static: boolean;
  };
  compression: {
    gzip: boolean;
    brotli: boolean;
  };
  caching: {
    static: number; // seconds
    dynamic: number;
    api: number;
  };
}

export const cdnConfig: CDNConfig = {
  baseUrl: process.env.NEXT_PUBLIC_CDN_URL || (process.env.NODE_ENV === 'development' ? '' : 'https://cdn.lms-ai.com'),
  regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
  optimizations: {
    images: true,
    videos: true,
    static: true,
  },
  compression: {
    gzip: true,
    brotli: true,
  },
  caching: {
    static: 31536000, // 1 year
    dynamic: 3600, // 1 hour
    api: 300, // 5 minutes
  },
};

export class CDNManager {
  private static instance: CDNManager;
  private config: CDNConfig;

  constructor(config: CDNConfig = cdnConfig) {
    this.config = config;
  }

  static getInstance(): CDNManager {
    if (!CDNManager.instance) {
      CDNManager.instance = new CDNManager();
    }
    return CDNManager.instance;
  }

  // Get optimized URL for static assets
  getStaticUrl(path: string): string {
    if (path.startsWith('http')) return path;

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.config.baseUrl}/static/${cleanPath}`;
  }

  // Get optimized URL for images
  getImageUrl(
    src: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'jpeg' | 'png';
      blur?: boolean;
    } = {}
  ): string {
    if (src.startsWith('http') && !src.includes(this.config.baseUrl)) {
      return src; // External URL, return as-is
    }

    // In development mode, return local paths
    if (process.env.NODE_ENV === 'development' && !this.config.baseUrl) {
      return src.startsWith('/') ? src : `/${src}`;
    }

    const {
      width,
      height,
      quality = 85,
      format = 'webp',
      blur = false,
    } = options;

    const params = new URLSearchParams();
    params.set('q', quality.toString());
    params.set('f', format);

    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (blur) params.set('blur', '10');

    const cleanSrc = src.startsWith('/') ? src.slice(1) : src;
    return `${this.config.baseUrl}/img/${cleanSrc}?${params.toString()}`;
  }

  // Get optimized URL for videos
  getVideoUrl(
    src: string,
    options: {
      quality?: 'auto' | '360p' | '720p' | '1080p';
      format?: 'mp4' | 'webm' | 'hls';
    } = {}
  ): string {
    const { quality = 'auto', format = 'mp4' } = options;

    const params = new URLSearchParams();
    params.set('q', quality);
    params.set('f', format);

    const cleanSrc = src.startsWith('/') ? src.slice(1) : src;
    return `${this.config.baseUrl}/video/${cleanSrc}?${params.toString()}`;
  }

  // Preload critical resources
  preloadResource(url: string, type: 'image' | 'video' | 'script' | 'style') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = type === 'image' ? 'image' : type === 'video' ? 'video' : type;
    link.href = url;

    if (type === 'image') {
      link.type = 'image/webp';
    }

    document.head.appendChild(link);
  }

  // Get region-specific URL
  getRegionalUrl(path: string, preferredRegion?: string): string {
    const region = preferredRegion || this.detectUserRegion();
    return `${this.config.baseUrl.replace('cdn', `${region}.cdn`)}/${path}`;
  }

  private detectUserRegion(): string {
    // Simple region detection based on timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (timezone.includes('America')) return 'us-east-1';
    if (timezone.includes('Europe')) return 'eu-west-1';
    if (timezone.includes('Asia')) return 'ap-southeast-1';

    return 'us-east-1'; // Default
  }

  // Purge CDN cache
  async purgeCache(paths: string[]): Promise<void> {
    try {
      await fetch('/api/cdn/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths }),
      });
    } catch (error) {
      console.error('Failed to purge CDN cache:', error);
    }
  }
}
