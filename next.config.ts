import type { NextConfig } from 'next'; // Interface định nghĩa các option cho Next.js config

const nextConfig: NextConfig = {
  // Các tính năng thử nghiệm của Next.js
  experimental: {
    serverActions: {}, // Cho phép sử dụng server actions trong Next.js, Kích hoạt server-side functions có thể gọi từ client
  },
  images: {
    domains: [
      // Whitelist các domain được phép load images
      'localhost',
      'your-api-domain.com',
      'your-cdn-domain.com',
      'images.unsplash.com',
    ],
    formats: ['image/avif', 'image/webp'],
  },
  env: {
    // Expose server env vars cho client-side code
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  async headers() {
    return [
      {
        source: '/api/:path*', // Áp dụng cho tất cả API routes
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`,
      },
    ];
  },

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'], // sẽ biến SVG thành một function component React
    });

    return config;
  },
};

export default nextConfig;
