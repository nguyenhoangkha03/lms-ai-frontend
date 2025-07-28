import React from 'react';
import type { Metadata } from 'next';
import { generateSEO } from '@/lib/seo';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { PricingHeroSection } from '@/components/pricing/pricing-hero-section';
import { PricingPlansSection } from '@/components/pricing/pricing-plans-section';
import { PricingFAQSection } from '@/components/pricing/pricing-faq-section';

export const metadata: Metadata = generateSEO({
  title: 'Pricing Plans - Choose Your Learning Journey',
  description:
    'Flexible pricing plans for individuals, teams, and organizations. Start free and scale as you grow with our AI-powered learning platform.',
  keywords: [
    'LMS Pricing',
    'Learning Platform Cost',
    'Education Pricing',
    'AI Learning Plans',
  ],
});

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <PublicHeader />

      <main>
        <PricingHeroSection />
        <PricingPlansSection />
        <PricingFAQSection />
      </main>

      <PublicFooter />
    </div>
  );
}
