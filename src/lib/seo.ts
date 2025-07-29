import type { Metadata } from 'next';
import { APP_CONFIG } from '@/lib/constants/constants';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export function generateSEO({
  title,
  description = APP_CONFIG.description,
  keywords = [],
  image = `${APP_CONFIG.url}/images/og-default.jpg`,
  url = APP_CONFIG.url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
}: SEOProps = {}): Metadata {
  const fullTitle = title ? `${title} | ${APP_CONFIG.name}` : APP_CONFIG.name;
  const defaultKeywords = [
    'LMS',
    'AI Learning',
    'Online Education',
    'E-learning Platform',
    'Adaptive Learning',
    'Personalized Education',
    'Virtual Classroom',
  ];

  return {
    title: fullTitle,
    description,
    keywords: [...defaultKeywords, ...keywords].join(', '),
    authors: author ? [{ name: author }] : undefined,

    openGraph: {
      title: fullTitle,
      description,
      url,
      type: type === 'article' ? 'article' : 'website',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title || APP_CONFIG.name,
        },
      ],
      siteName: APP_CONFIG.name,
    },

    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@lmsai',
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

    alternates: {
      canonical: url,
    },

    other: {
      ...(publishedTime && { 'article:published_time': publishedTime }),
      ...(modifiedTime && { 'article:modified_time': modifiedTime }),
    },
  };
}

export interface Course {
  name: string;
  description: string;
  provider: string;
  url: string;
  price?: string;
  duration?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  rating?: number;
  reviewCount?: number;
}

export function generateCourseStructuredData(course: Course) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: course.provider,
      url: APP_CONFIG.url,
    },
    url: course.url,
    courseCode: course.url.split('/').pop(),
    educationalLevel: course.level,
    teaches: course.description,
    offers: course.price
      ? {
          '@type': 'Offer',
          price: course.price,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        }
      : undefined,
    aggregateRating: course.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: course.rating,
          reviewCount: course.reviewCount || 0,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  };
}

export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: APP_CONFIG.name,
    url: APP_CONFIG.url,
    logo: `${APP_CONFIG.url}/images/logo.png`,
    description: APP_CONFIG.description,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-0123',
      contactType: 'customer service',
    },
    sameAs: [
      'https://twitter.com/lmsai',
      'https://linkedin.com/company/lmsai',
      'https://facebook.com/lmsai',
    ],
  };
}

export function generateWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: APP_CONFIG.name,
    url: APP_CONFIG.url,
    description: APP_CONFIG.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${APP_CONFIG.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
