'use client';

import { useEffect } from 'react';
import { CDNManager } from '@/lib/performance/cdn-config';
import { preloadRoute } from '@/lib/performance/code-splitting';

interface ResourcePreloaderProps {
  images?: string[];
  routes?: string[];
  videos?: string[];
  fonts?: string[];
  critical?: boolean;
}

export const ResourcePreloader: React.FC<ResourcePreloaderProps> = ({
  images = [],
  routes = [],
  videos = [],
  fonts = [],
  critical = false,
}) => {
  const cdnManager = CDNManager.getInstance();

  useEffect(() => {
    const preloadResources = async () => {
      // Preload images
      images.forEach(src => {
        const optimizedUrl = cdnManager.getImageUrl(src, {
          format: 'webp',
          quality: 85,
        });
        cdnManager.preloadResource(optimizedUrl, 'image');
      });

      // Preload routes with error handling
      routes.forEach(route => {
        try {
          preloadRoute(route);
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Failed to preload route: ${route}`, error);
          }
        }
      });

      // Preload videos
      videos.forEach(src => {
        const optimizedUrl = cdnManager.getVideoUrl(src, { quality: 'auto' });
        cdnManager.preloadResource(optimizedUrl, 'video');
      });

      // Preload fonts
      fonts.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        link.href = src;
        document.head.appendChild(link);
      });
    };

    if (critical) {
      // Preload immediately for critical resources
      preloadResources();
    } else {
      // Preload after page load for non-critical resources
      if (document.readyState === 'complete') {
        setTimeout(preloadResources, 100);
      } else {
        window.addEventListener('load', () => {
          setTimeout(preloadResources, 100);
        });
      }
    }
  }, [images, routes, videos, fonts, critical, cdnManager]);

  return null;
};
