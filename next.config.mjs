import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic React settings
  reactStrictMode: true,
  swcMinify: true,

  // Enable experimental features for better performance
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'bcryptjs'],
  },

  // Enhanced image optimization
  images: {
    domains: [
      'localhost',
      'lms-ai.com',
      'cdn.lms-ai.com',
      'cdn.example.com',
      'assets.example.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'platform-lookaside.fbsbx.com',
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Performance settings
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  httpAgentOptions: {
    keepAlive: true,
  },

  // Bundle analyzer (conditional)
  ...(process.env.ANALYZE === 'true' && {
    bundleAnalyzer: {
      enabled: true,
      openAnalyzer: true,
    },
  }),

  // Enhanced webpack configuration
  webpack: (config, { dev, isServer, webpack }) => {
    // Alias configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve('./src'),
      // Replace heavy libraries with lighter alternatives (production only)
      ...(!dev && {
        moment: 'date-fns',
        lodash: 'lodash-es',
      }),
    };

    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        // Enable SWC minification
        minimize: true,
        // Split chunks for better caching
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      };
    }

    // Tree shaking optimization
    // config.optimization.usedExports = true;
    // config.optimization.sideEffects = false;

    // Bundle analyzer plugin
    if (process.env.ANALYZE === 'true' && !isServer) {
      const BundleAnalyzerPlugin =
        require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: '../analyze/client.html',
        })
      );
    }

    return config;
  },

  // Enhanced headers for performance and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // HSTS (HTTPS only)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Enhanced Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob: https:",
              "connect-src 'self' https: wss:",
              "worker-src 'self' blob:",
            ].join('; '),
          },
          // Performance hints
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      // API CORS headers
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
      // Static assets caching
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // API routes caching
      {
        source: '/api/v1/courses/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },

  // Smart redirects based on user roles
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/student/dashboard',
        permanent: false,
        has: [
          {
            type: 'cookie',
            key: 'user-role',
            value: 'student',
          },
        ],
      },
      {
        source: '/dashboard',
        destination: '/teacher/dashboard',
        permanent: false,
        has: [
          {
            type: 'cookie',
            key: 'user-role',
            value: 'teacher',
          },
        ],
      },
      {
        source: '/dashboard',
        destination: '/admin/dashboard',
        permanent: false,
        has: [
          {
            type: 'cookie',
            key: 'user-role',
            value: 'admin',
          },
        ],
      },
    ];
  },

  // API proxy rewrites
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Output configuration for deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  // Trailing slash configuration
  trailingSlash: false,

  // Runtime configuration
  serverRuntimeConfig: {
    // Server-only configuration
    JWT_SECRET: process.env.JWT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    REDIS_URL: process.env.REDIS_URL,
  },

  publicRuntimeConfig: {
    // Client and server configuration
    API_URL: process.env.NEXT_PUBLIC_API_URL,
    CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
    APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
};

export default nextConfig;
