import React from 'react';
import type { Metadata } from 'next';
import { generateSEO } from '@/lib/seo';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { ContactHeroSection } from '@/components/contact/contact-hero-section';
import { ContactFormSection } from '@/components/contact/contact-form-section';
import { ContactInfoSection } from '@/components/contact/contact-info-section';

export const metadata: Metadata = generateSEO({
  title: 'Contact Us - Get in Touch with Our Team',
  description:
    "Have questions about our AI learning platform? Contact our support team or schedule a demo. We're here to help you succeed.",
  keywords: ['Contact LMS AI', 'Support', 'Demo', 'Help', 'Customer Service'],
});

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <PublicHeader />

      <main>
        <ContactHeroSection />
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <ContactFormSection />
          <ContactInfoSection />
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
