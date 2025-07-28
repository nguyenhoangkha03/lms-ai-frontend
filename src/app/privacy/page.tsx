import React from 'react';
import type { Metadata } from 'next';
import { generateSEO } from '@/lib/seo';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { LegalPageLayout } from '@/components/legal/legal-page-layout';

export const metadata: Metadata = generateSEO({
  title: 'Privacy Policy - Your Data Protection',
  description:
    'Learn how we collect, use, and protect your personal information. Our commitment to your privacy and data security.',
  keywords: ['Privacy Policy', 'Data Protection', 'GDPR', 'Privacy Rights'],
});

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <PublicHeader />

      <main>
        <LegalPageLayout
          title="Privacy Policy"
          lastUpdated="January 15, 2024"
          description="This Privacy Policy describes how we collect, use, and protect your personal information when you use our AI-powered learning platform."
        >
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Information We Collect</h2>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">Personal Information</h3>
              <p>We collect information you provide directly to us, such as:</p>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>
                  Account registration information (name, email, password)
                </li>
                <li>Profile information (bio, avatar, preferences)</li>
                <li>Learning progress and performance data</li>
                <li>Communication data (messages, support requests)</li>
                <li>
                  Payment information (processed securely by third parties)
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">
                Automatically Collected Information
              </h3>
              <p>
                We automatically collect certain information when you use our
                platform:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>
                  Device information (browser, operating system, device type)
                </li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>
                  Learning analytics (quiz scores, completion rates, engagement
                  metrics)
                </li>
                <li>IP address and approximate location</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">
              How We Use Your Information
            </h2>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">Platform Operations</h3>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>Provide and maintain our learning platform</li>
                <li>Process your transactions and manage your account</li>
                <li>Deliver personalized learning experiences</li>
                <li>Generate AI-powered recommendations and insights</li>
                <li>Provide customer support and respond to inquiries</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">Improvement and Analytics</h3>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>Analyze usage patterns to improve our platform</li>
                <li>Develop new features and educational content</li>
                <li>Train and improve our AI algorithms</li>
                <li>Conduct research on learning effectiveness</li>
                <li>Monitor platform security and prevent fraud</li>
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">
              Data Sharing and Disclosure
            </h2>

            <p>
              We do not sell your personal information. We may share your
              information in the following circumstances:
            </p>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">Service Providers</h3>
              <p>
                We work with trusted third-party service providers who help us
                operate our platform:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>Cloud hosting and storage providers</li>
                <li>Payment processing companies</li>
                <li>Email and communication services</li>
                <li>Analytics and monitoring tools</li>
                <li>Customer support platforms</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">Legal Requirements</h3>
              <p>We may disclose your information if required by law or to:</p>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>Comply with legal processes or government requests</li>
                <li>Protect our rights, privacy, safety, or property</li>
                <li>Enforce our terms of service</li>
                <li>Investigate potential violations or fraud</li>
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Your Rights and Choices</h2>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">Access and Control</h3>
              <p>You have the right to:</p>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>Access and review your personal information</li>
                <li>Update or correct your account information</li>
                <li>Delete your account and associated data</li>
                <li>Export your learning data</li>
                <li>Opt-out of marketing communications</li>
                <li>Manage cookie preferences</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">Data Portability</h3>
              <p>
                You can request a copy of your data in a structured,
                machine-readable format. This includes your learning progress,
                course completions, and profile information.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Data Security</h2>

            <p>
              We implement industry-standard security measures to protect your
              information:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>Encryption in transit and at rest</li>
              <li>Regular security audits and penetration testing</li>
              <li>Access controls and authentication measures</li>
              <li>Employee training on data protection</li>
              <li>Incident response and breach notification procedures</li>
            </ul>

            <p className="mt-4">
              While we strive to protect your information, no method of
              transmission over the internet or electronic storage is 100%
              secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">
              International Data Transfers
            </h2>

            <p>
              Our platform operates globally, and your information may be
              transferred to and processed in countries other than your own. We
              ensure appropriate safeguards are in place for international
              transfers, including:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>Adherence to GDPR requirements for EU users</li>
              <li>Standard contractual clauses with service providers</li>
              <li>Privacy Shield certification where applicable</li>
              <li>Regular compliance assessments</li>
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Contact Us</h2>

            <p>
              If you have questions about this Privacy Policy or our data
              practices, please contact us:
            </p>
            <ul className="list-none space-y-1">
              <li>Email: privacy@lmsai.com</li>
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
