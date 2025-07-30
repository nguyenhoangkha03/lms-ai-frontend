import React from 'react';
import type { Metadata } from 'next';
import { generateSEO } from '@/lib/seo';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { LegalPageLayout } from '@/components/legal/legal-page-layout';

export const metadata: Metadata = generateSEO({
  title: 'Terms of Service - Platform Usage Guidelines',
  description:
    'Read our terms of service to understand your rights and responsibilities when using our AI-powered learning platform.',
  keywords: [
    'Terms of Service',
    'User Agreement',
    'Platform Rules',
    'Legal Terms',
  ],
});

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <PublicHeader />

      <main>
        <LegalPageLayout
          title="Terms of Service"
          lastUpdated="January 15, 2024"
          description="These Terms of Service govern your use of our AI-powered learning platform. Please read them carefully."
        >
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Acceptance of Terms</h2>

            <p>
              By accessing or using our platform, you agree to be bound by these
              Terms of Service and our Privacy Policy. If you disagree with any
              part of these terms, you may not access the platform.
            </p>

            <p>
              We reserve the right to update these terms at any time. We will
              notify you of significant changes via email or through the
              platform. Your continued use of the platform after such changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Platform Description</h2>

            <p>
              Our platform provides AI-powered learning management services,
              including:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>Access to educational content and courses</li>
              <li>Personalized learning recommendations</li>
              <li>Progress tracking and analytics</li>
              <li>Interactive assessments and quizzes</li>
              <li>AI tutoring and support</li>
              <li>Collaboration tools and communication features</li>
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">User Accounts</h2>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">Account Creation</h3>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>One person may not maintain multiple accounts</li>
                <li>You must be at least 13 years old to create an account</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">Account Responsibilities</h3>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>Keep your login credentials confidential</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Update your information to keep it current</li>
                <li>You are liable for all activities under your account</li>
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Acceptable Use</h2>

            <p>You agree not to use the platform to:</p>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload malicious software or harmful content</li>
              <li>Harass, threaten, or harm other users</li>
              <li>Share inappropriate or offensive content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>
                Use the platform for commercial purposes without permission
              </li>
              <li>Create fake accounts or impersonate others</li>
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Intellectual Property</h2>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">Our Content</h3>
              <p>
                All content provided on our platform, including courses,
                assessments, software, and design elements, is owned by us or
                our licensors and protected by copyright, trademark, and other
                intellectual property laws.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">User Content</h3>
              <p>
                You retain ownership of content you create and upload. By
                uploading content, you grant us a non-exclusive, worldwide,
                royalty-free license to use, reproduce, and distribute your
                content for platform operations.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">License to Use</h3>
              <p>
                We grant you a limited, non-exclusive, non-transferable license
                to access and use our platform for your personal, non-commercial
                educational purposes.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Payment and Refunds</h2>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">Subscription Plans</h3>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>Subscription fees are billed in advance</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>You may cancel your subscription at any time</li>
                <li>
                  Cancellation takes effect at the end of the current billing
                  period
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">Refund Policy</h3>
              <p>
                We offer a 30-day money-back guarantee for new subscribers.
                Refund requests must be submitted within 30 days of initial
                purchase and will be processed within 5-10 business days.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Termination</h2>

            <p>
              We may terminate or suspend your account immediately, without
              prior notice, if you breach these Terms of Service. Upon
              termination:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>Your right to use the platform ceases immediately</li>
              <li>You lose access to all content and data</li>
              <li>We may delete your account and associated data</li>
              <li>You remain liable for any outstanding fees</li>
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Disclaimer of Warranties</h2>

            <p>
              The platform is provided "as is" without warranties of any kind.
              We disclaim all warranties, including but not limited to:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>Merchantability and fitness for a particular purpose</li>
              <li>Non-infringement of third-party rights</li>
              <li>Uninterrupted or error-free operation</li>
              <li>Security of data transmission</li>
              <li>Accuracy or completeness of content</li>
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Limitation of Liability</h2>

            <p>
              To the maximum extent permitted by law, we shall not be liable for
              any indirect, incidental, special, consequential, or punitive
              damages, including but not limited to loss of profits, data, or
              use.
            </p>

            <p>
              Our total liability to you for any damages shall not exceed the
              amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Governing Law</h2>

            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the State of California, without regard to its
              conflict of law provisions. Any disputes shall be resolved in the
              courts of San Francisco County, California.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Contact Information</h2>

            <p>
              If you have any questions about these Terms of Service, please
              contact us:
            </p>
            <ul className="list-none space-y-1">
              <li>Email: legal@lmsai.com</li>
              <li>Address: 123 Innovation Drive, San Francisco, CA 94105</li>
              <li>Phone: +1 (555) 123-4567</li>
            </ul>
          </section>
        </LegalPageLayout>
      </main>

      <PublicFooter />
    </div>
  );
}
