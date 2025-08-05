'use client';

import React, { useState, useRef } from 'react';
import { CDNManager } from '@/lib/performance/cdn-config';
import { cn } from '@/lib/utils';

interface CDNOptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  lazy?: boolean;
  blur?: boolean;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const CDNOptimizedImage: React.FC<CDNOptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  quality = 85,
  format = 'webp',
  lazy = true,
  blur = false,
  priority = false,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const cdnManager = CDNManager.getInstance();

  React.useEffect(() => {
    if (!lazy || priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority]);

  const optimizedSrc = cdnManager.getImageUrl(src, {
    width,
    height,
    quality,
    format,
    blur,
  });

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate responsive sources
  const generateSources = () => {
    const sizes = [640, 768, 1024, 1280, 1536];
    return sizes.map(size => ({
      media: `(max-width: ${size}px)`,
      srcSet: cdnManager.getImageUrl(src, { width: size, format: 'webp' }),
    }));
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isInView && !hasError && (
        <picture>
          {generateSources().map((source, index) => (
            <source
              key={index}
              media={source.media}
              srcSet={source.srcSet}
              type="image/webp"
            />
          ))}
          <img
            ref={imgRef}
            src={optimizedSrc}
            alt={alt}
            width={width}
            height={height}
            className={cn(
              'transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={handleLoad}
            onError={handleError}
            loading={lazy && !priority ? 'lazy' : 'eager'}
          />
        </picture>
      )}

      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="animate-pulse">
            <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>
        </div>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center text-gray-500">
            <svg
              className="mx-auto mb-2 h-8 w-8"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-xs">Image failed to load</p>
          </div>
        </div>
      )}
    </div>
  );
};

interface CDNOptimizedVideoProps {
  src: string;
  poster?: string;
  width?: number;
  height?: number;
  className?: string;
  quality?: 'auto' | '360p' | '720p' | '1080p';
  format?: 'mp4' | 'webm' | 'hls';
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
}

export const CDNOptimizedVideo: React.FC<CDNOptimizedVideoProps> = ({
  src,
  poster,
  width,
  height,
  className,
  quality = 'auto',
  format = 'mp4',
  autoPlay = false,
  muted = false,
  loop = false,
  controls = true,
  preload = 'metadata',
}) => {
  const cdnManager = CDNManager.getInstance();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const optimizedSrc = cdnManager.getVideoUrl(src, { quality, format });
  const optimizedPoster = poster
    ? cdnManager.getImageUrl(poster, {
        width,
        height,
        format: 'webp',
      })
    : undefined;

  const handleLoadStart = () => setIsLoading(true);
  const handleCanPlay = () => setIsLoading(false);
  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div className={cn('relative', className)}>
      {!hasError ? (
        <video
          width={width}
          height={height}
          poster={optimizedPoster}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          controls={controls}
          preload={preload}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
          onError={handleError}
          className="h-full w-full"
        >
          <source src={optimizedSrc} type={`video/${format}`} />
          <source
            src={cdnManager.getVideoUrl(src, { quality, format: 'webm' })}
            type="video/webm"
          />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="flex min-h-[200px] items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center text-gray-500">
            <svg
              className="mx-auto mb-2 h-12 w-12"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12l3-3 3 3"
              />
            </svg>
            <p>Video failed to load</p>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex items-center space-x-2 text-white">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Loading video...</span>
          </div>
        </div>
      )}
    </div>
  );
};
