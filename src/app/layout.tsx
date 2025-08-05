import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';
import { PerformanceProvider } from '@/components/performance/PerformanceProvider';
import { ResourcePreloader } from '@/components/performance/ResourcePreloader';
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
  images: [
    '/images/logo.png',
    '/images/logo.webp',
    '/images/hero-bg.webp',
    '/icons/icon-192x192.png',
  ],
  routes: ['/dashboard', '/courses', '/login', '/register'],
  fonts: [
    '/fonts/inter-var.woff2',
    'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
  ],
  scripts: [
    '/_next/static/chunks/main.js',
    '/_next/static/chunks/polyfills.js',
  ],
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon-180x180.png"
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
        <script
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
        />

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
            {children}

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
                      
                      navigator.sendBeacon('/api/v1/analytics/performance', perfData);
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

// import type { Metadata, Viewport } from 'next';
// import { Inter, Poppins } from 'next/font/google';
// import { cn } from '@/lib/utils';
// // import { APP_CONFIG } from '@/lib/constants';
// import { Providers } from '@/components/providers';
// import './globals.css';
// import { generateSEO } from '@/lib/seo';

// const inter = Inter({
//   subsets: ['latin'],
//   display: 'swap',
//   variable: '--font-inter',
// });

// const poppins = Poppins({
//   subsets: ['latin'],
//   weight: ['400', '600', '700'],
//   variable: '--font-poppins',
// });

// export const metadata: Metadata = generateSEO();

// // export const metadata: Metadata = {
// //   title: {
// //     default: APP_CONFIG.name,
// //     template: `%s | ${APP_CONFIG.name}`,
// //   },
// //   description: APP_CONFIG.description,
// //   keywords: [
// //     'LMS',
// //     'Learning Management System',
// //     'AI',
// //     'Education',
// //     'Online Learning',
// //     'E-learning',
// //     'Artificial Intelligence',
// //     'Adaptive Learning',
// //   ],
// //   authors: [
// //     {
// //       name: APP_CONFIG.name,
// //       url: APP_CONFIG.url,
// //     },
// //   ],
// //   creator: APP_CONFIG.name,
// //   openGraph: {
// //     type: 'website',
// //     locale: 'en_US',
// //     url: APP_CONFIG.url,
// //     title: APP_CONFIG.name,
// //     description: APP_CONFIG.description,
// //     siteName: APP_CONFIG.name,
// //     images: [
// //       {
// //         url: `${APP_CONFIG.url}/og-image.png`,
// //         width: 1200,
// //         height: 630,
// //         alt: APP_CONFIG.name,
// //       },
// //     ],
// //   },
// //   twitter: {
// //     card: 'summary_large_image',
// //     title: APP_CONFIG.name,
// //     description: APP_CONFIG.description,
// //     images: [`${APP_CONFIG.url}/og-image.png`],
// //   },
// //   robots: {
// //     index: true,
// //     follow: true,
// //     googleBot: {
// //       index: true,
// //       follow: true,
// //       'max-video-preview': -1,
// //       'max-image-preview': 'large',
// //       'max-snippet': -1,
// //     },
// //   },
// //   icons: {
// //     icon: [
// //       { url: '/favicon.ico' },
// //       { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
// //       { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
// //     ],
// //     apple: [
// //       { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
// //     ],
// //     other: [
// //       {
// //         rel: 'mask-icon',
// //         url: '/safari-pinned-tab.svg',
// //         color: '#5bbad5',
// //       },
// //     ],
// //   },
// //   manifest: '/site.webmanifest',
// //   themeColor: [
// //     { media: '(prefers-color-scheme: light)', color: 'white' },
// //     { media: '(prefers-color-scheme: dark)', color: 'black' },
// //   ],
// //   viewport: {
// //     width: 'device-width',
// //     initialScale: 1,
// //     maximumScale: 1,
// //   },
// // };

// export const viewport: Viewport = {
//   width: 'device-width',
//   initialScale: 1,
//   maximumScale: 5,
//   userScalable: true,
//   themeColor: [
//     { media: '(prefers-color-scheme: light)', color: '#ffffff' },
//     { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
//   ],
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html
//       lang="en"
//       className={cn(inter.variable, poppins.variable)}
//       suppressHydrationWarning
//     >
//       <head>
//         <link rel="icon" href="/favicon.ico" sizes="any" />
//         <link rel="icon" href="/icon.svg" type="image/svg+xml" />
//         <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
//         <link rel="manifest" href="/manifest.json" />
//         <meta name="format-detection" content="telephone=no" />
//       </head>
//       <body
//         className={cn(
//           'min-h-screen bg-background font-sans antialiased',
//           'selection:bg-primary/20 selection:text-primary-foreground'
//         )}
//       >
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }
