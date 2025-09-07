import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers/providers';
import { PerformanceProvider } from '@/components/performance/PerformanceProvider';
import { ResourcePreloader } from '@/components/performance/ResourcePreloader';
import TokenSyncComponent from '@/components/auth/token-sync';
import './globals.css';
import { generateSEO } from '@/lib/seo';

// Optimized font loading with display swap
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

// Enhanced SEO metadata
export const metadata: Metadata = {
  ...generateSEO(),
  // Additional performance and PWA metadata
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'msapplication-TileColor': '#2563eb',
    'msapplication-config': '/browserconfig.xml',
    // Permissions Policy meta tag for media access
    'permissions-policy': 'camera=*, microphone=*, display-capture=*, screen-wake-lock=*',
  },
};

// Enhanced viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  colorScheme: 'light dark',
};

// Critical CSS for above-the-fold content
const criticalCSS = `
  /* Critical above-the-fold styles */
  body {
    margin: 0;
    font-family: var(--font-inter), system-ui, -apple-system, sans-serif;
    font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Loading states */
  .loading-spinner {
    animation: spin 1s linear infinite;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    margin: 0 auto;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Skeleton loading */
  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Performance optimizations */
  * {
    box-sizing: border-box;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  /* Prevent layout shifts */
  .layout-stable {
    contain: layout style paint;
  }

  /* Smooth transitions */
  .smooth-transition {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Dark mode preparation */
  @media (prefers-color-scheme: dark) {
    body {
      background-color: #0f172a;
      color: #f8fafc;
    }
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

// Resources to preload
const criticalResources = {
  images:
    process.env.NODE_ENV === 'development'
      ? []
      : [
          '/images/logo.png',
          '/images/logo.webp',
          '/images/hero-bg.webp',
          '/icons/icon-192x192.png',
        ],
  routes: [], // Temporarily disabled to prevent 404 errors on non-existent chunks
  fonts: [], // Disabled to prevent 404 errors - fonts are loaded via Next.js font optimization
  scripts: [], // Disabled to prevent 404 errors - scripts are loaded automatically by Next.js
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(inter.variable, poppins.variable, 'scroll-smooth')}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://cdn.lms-ai.com" />
        <link rel="preconnect" href="https://api.lms-ai.com" />

        {/* DNS prefetch for likely navigations */}
        <link rel="dns-prefetch" href="//analytics.lms-ai.com" />
        <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />

        {/* Enhanced favicon and app icons */}
        <link rel="icon" href="/logo-no-background.png" sizes="any" />
        <link rel="icon" href="/logo-no-background.png" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo-no-background.png" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/logo-no-background.png"
        />

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Additional meta tags for performance */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Critical CSS injection */}
        <style
          dangerouslySetInnerHTML={{
            __html: criticalCSS,
          }}
        />

        {/* Service Worker registration */}
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        /> */}

        {/* Performance monitoring script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function() {
                // Web Vitals monitoring
                if ('PerformanceObserver' in window) {
                  // Largest Contentful Paint
                  new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                      console.log('LCP:', entry.startTime);
                    }
                  }).observe({entryTypes: ['largest-contentful-paint']});

                  // First Input Delay
                  new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                      console.log('FID:', entry.processingStart - entry.startTime);
                    }
                  }).observe({entryTypes: ['first-input']});

                  // Cumulative Layout Shift
                  new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                      if (!entry.hadRecentInput) {
                        console.log('CLS:', entry.value);
                      }
                    }
                  }).observe({entryTypes: ['layout-shift']});
                }
              });
            `,
          }}
        />
      </head>
      <body
        className={cn(
          'layout-stable min-h-screen bg-background font-sans antialiased',
          'selection:bg-primary/20 selection:text-primary-foreground',
          'smooth-transition'
        )}
      >
        <PerformanceProvider>
          <Providers>
            {/* Authentication token sync component */}
            <TokenSyncComponent />

            {children}

            {/* Fixed Chat Float Container */}
            <div id="chat-float-portal" />

            {/* Resource preloader with critical resources */}
            <ResourcePreloader
              images={criticalResources.images}
              routes={criticalResources.routes}
              fonts={criticalResources.fonts}
              critical={true}
            />

            {/* Performance monitoring component */}
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  // Report performance metrics
                  window.addEventListener('beforeunload', function() {
                    if (navigator.sendBeacon && window.performance) {
                      const perfData = JSON.stringify({
                        url: location.href,
                        loadTime: performance.now(),
                        navigation: performance.getEntriesByType('navigation')[0],
                        resources: performance.getEntriesByType('resource').length,
                        timestamp: Date.now()
                      });
                      
                      // navigator.sendBeacon('/api/v1/analytics/performance', perfData); // Temporarily disabled
                    }
                  });
                `,
              }}
            />
          </Providers>
        </PerformanceProvider>

        {/* Structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'LMS AI',
              description: 'Advanced Learning Management System with AI',
              url: 'https://lms-ai.com',
              applicationCategory: 'EducationalApplication',
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
