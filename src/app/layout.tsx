import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { cn } from '@/lib/utils';
// import { APP_CONFIG } from '@/lib/constants';
import { Providers } from '@/components/providers';
import './globals.css';
import { generateSEO } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = generateSEO();

// export const metadata: Metadata = {
//   title: {
//     default: APP_CONFIG.name,
//     template: `%s | ${APP_CONFIG.name}`,
//   },
//   description: APP_CONFIG.description,
//   keywords: [
//     'LMS',
//     'Learning Management System',
//     'AI',
//     'Education',
//     'Online Learning',
//     'E-learning',
//     'Artificial Intelligence',
//     'Adaptive Learning',
//   ],
//   authors: [
//     {
//       name: APP_CONFIG.name,
//       url: APP_CONFIG.url,
//     },
//   ],
//   creator: APP_CONFIG.name,
//   openGraph: {
//     type: 'website',
//     locale: 'en_US',
//     url: APP_CONFIG.url,
//     title: APP_CONFIG.name,
//     description: APP_CONFIG.description,
//     siteName: APP_CONFIG.name,
//     images: [
//       {
//         url: `${APP_CONFIG.url}/og-image.png`,
//         width: 1200,
//         height: 630,
//         alt: APP_CONFIG.name,
//       },
//     ],
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: APP_CONFIG.name,
//     description: APP_CONFIG.description,
//     images: [`${APP_CONFIG.url}/og-image.png`],
//   },
//   robots: {
//     index: true,
//     follow: true,
//     googleBot: {
//       index: true,
//       follow: true,
//       'max-video-preview': -1,
//       'max-image-preview': 'large',
//       'max-snippet': -1,
//     },
//   },
//   icons: {
//     icon: [
//       { url: '/favicon.ico' },
//       { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
//       { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
//     ],
//     apple: [
//       { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
//     ],
//     other: [
//       {
//         rel: 'mask-icon',
//         url: '/safari-pinned-tab.svg',
//         color: '#5bbad5',
//       },
//     ],
//   },
//   manifest: '/site.webmanifest',
//   themeColor: [
//     { media: '(prefers-color-scheme: light)', color: 'white' },
//     { media: '(prefers-color-scheme: dark)', color: 'black' },
//   ],
//   viewport: {
//     width: 'device-width',
//     initialScale: 1,
//     maximumScale: 1,
//   },
// };

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
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
      className={cn(inter.variable, poppins.variable)}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          'selection:bg-primary/20 selection:text-primary-foreground'
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
