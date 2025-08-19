import React from 'react';
import type { Metadata } from 'next';
import { generateSEO, generateOrganizationStructuredData } from '@/lib/seo';
import { StructuredData } from '@/components/shared/structured-data';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { CTASection } from '@/components/landing/cta-section';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';

export const metadata: Metadata = generateSEO({
  title: 'AI-Powered Learning Management System',
  description:
    'Transform your learning with our intelligent LMS platform. Personalized education, adaptive learning, and AI-driven insights for students and educators.',
  keywords: [
    'AI Learning Platform',
    'Adaptive Education',
    'Personalized Learning',
    'Online Education',
    'Smart LMS',
    'Educational Technology',
    'E-learning',
    'Virtual Classroom',
  ],
});

export default function HomePage() {
  const organizationData = generateOrganizationStructuredData();

  return (
    <>
      <StructuredData data={organizationData} />

      <div className="min-h-screen">
        <PublicHeader />

        <main>
          <HeroSection />
          <FeaturesSection />
          <CTASection />
        </main>

        <PublicFooter />
      </div>
    </>
  );
}
