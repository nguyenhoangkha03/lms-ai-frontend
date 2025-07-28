import { APP_CONFIG } from './constants';

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
