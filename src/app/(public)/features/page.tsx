import React from 'react';
import type { Metadata } from 'next';
import { generateSEO } from '@/lib/seo';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { FeaturesHeroSection } from '@/components/features/features-hero-section';
import { DetailedFeaturesSection } from '@/components/features/detailed-features-section';
import { ComparisonSection } from '@/components/features/comparison-section';
import { IntegrationSection } from '@/components/features/integration-section';

export const metadata: Metadata = generateSEO({
  title: 'Features - AI-Powered Learning Platform',
  description:
    'Discover powerful features that make our LMS unique: AI personalization, adaptive learning, real-time analytics, and comprehensive assessment tools.',
  keywords: [
    'LMS Features',
    'AI Learning Features',
    'Adaptive Learning',
    'Learning Analytics',
    'Assessment Tools',
    'Video Learning',
    'Interactive Content',
  ],
});

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <PublicHeader />

      <main>
        <FeaturesHeroSection />
        <DetailedFeaturesSection />
        <IntegrationSection />
        <ComparisonSection />
      </main>

      <PublicFooter />
    </div>
  );
}
