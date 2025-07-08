'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Brain } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'API', href: '/api' },
        { label: 'Integrations', href: '/integrations' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Help Center', href: '/help' },
        { label: 'Documentation', href: '/docs' },
        { label: 'Community', href: '/community' },
        { label: 'Status', href: '/status' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'GDPR', href: '/gdpr' },
      ],
    },
  ];

  return (
    <footer className={cn('bg-background border-t', className)}>
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="text-primary h-6 w-6" />
              <span className="text-xl font-bold">Smart LMS</span>
            </Link>
            <p className="text-muted-foreground mt-4 max-w-md text-sm">
              Empowering education through AI-driven learning experiences.
              Transform the way you learn and teach with our intelligent
              platform.
            </p>
            <div className="mt-6 flex space-x-4">
              {/* Social links can be added here */}
            </div>
          </div>

          {/* Links sections */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="mb-4 text-sm font-semibold">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="mt-12 flex flex-col items-center justify-between border-t pt-8 md:flex-row">
          <p className="text-muted-foreground text-sm">
            © {currentYear} Smart LMS. All rights reserved.
          </p>
          <div className="text-muted-foreground mt-4 flex items-center space-x-4 text-sm md:mt-0">
            <span>Made with ❤️ for educators</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
