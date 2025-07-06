import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
// import { ReduxProvider } from '@/store/provider';
// import { Toaster } from '@/components/ui/toaster';
import { APP_CONFIG } from '@/constants';
import './globals.css';

// const geistSans = Geist({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// });

// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

const inter = Inter({
  subsets: ['latin'], // chỉ cần tải các ký tự thuộc bộ latin
  variable: '--font-inter', // tạo ra một biến CSS (CSS variable) tên là --font-inter
});

export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.name, // tiêu đề mặc định cho trang chính
    template: `%s | ${APP_CONFIG.name}`, // sử dụng template để tạo tiêu đề động trang con
  },
  description: APP_CONFIG.description,
  keywords: [
    'learning management system',
    'LMS',
    'AI education',
    'online learning',
    'e-learning',
    'education technology',
  ],
  authors: [
    {
      name: APP_CONFIG.name,
      url: process.env.NEXT_PUBLIC_APP_URL,
    },
  ],
  creator: APP_CONFIG.name,
  publisher: APP_CONFIG.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  //  cách trang web hiển thị khi được chia sẻ trên các nền tảng hỗ trợ Open Graph (như Facebook, Zalo).
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    siteName: APP_CONFIG.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    creator: '@smartlms',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressContentEditableWarning để tránh cảnh báo khi sử dụng contentEditable
    <html lang="en" suppressContentEditableWarning>
      <head />
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* <ReduxProvider> */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
          {/* <Toaster /> */}
        </ThemeProvider>
        {/* </ReduxProvider>*/}
      </body>
    </html>
  );
}
