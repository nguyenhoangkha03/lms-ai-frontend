import React from 'react';
import type { Metadata } from 'next';
import { generateSEO } from '@/lib/seo';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { AboutHeroSection } from '@/components/about/about-hero-section';
import { MissionSection } from '@/components/about/mission-section';
import { TeamSection } from '@/components/about/team-section';
import { StatsSection } from '@/components/about/stats-section';

export const metadata: Metadata = generateSEO({
  title: 'About Us - Revolutionizing Education with AI',
  description:
    'Learn about our mission to transform education through AI-powered personalized learning. Meet our team and discover our vision for the future of learning.',
  keywords: [
    'About LMS AI',
    'Education Technology',
    'AI Learning',
    'Company Mission',
    'Team',
  ],
});

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <PublicHeader />

      <main>
        <AboutHeroSection />
        <MissionSection />
        <StatsSection />
        <TeamSection />
      </main>

      <PublicFooter />
    </div>
  );
}
