'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="container flex flex-col gap-4 py-8 md:flex-row md:gap-8">
        {/* Brand Section */}
        <div className="flex flex-col gap-4 md:w-1/3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-ai-primary">
              <span className="text-sm font-bold text-white">LMS</span>
            </div>
            <span className="text-lg font-semibold">LMS AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Intelligent learning management system powered by AI to enhance your
            educational journey.
          </p>
        </div>

        {/* Links Section */}
        <div className="flex flex-col gap-4 md:w-2/3 md:flex-row">
          <div className="flex flex-col gap-2 md:w-1/3">
            <h4 className="text-sm font-semibold">Product</h4>
            <nav className="flex flex-col gap-1 text-sm text-muted-foreground">
              <Link
                href="/features"
                className="transition-colors hover:text-foreground"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="transition-colors hover:text-foreground"
              >
                Pricing
              </Link>
              <Link
                href="/integrations"
                className="transition-colors hover:text-foreground"
              >
                Integrations
              </Link>
              <Link
                href="/api"
                className="transition-colors hover:text-foreground"
              >
                API
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-2 md:w-1/3">
            <h4 className="text-sm font-semibold">Support</h4>
            <nav className="flex flex-col gap-1 text-sm text-muted-foreground">
              <Link
                href="/help"
                className="transition-colors hover:text-foreground"
              >
                Help Center
              </Link>
              <Link
                href="/contact"
                className="transition-colors hover:text-foreground"
              >
                Contact Us
              </Link>
              <Link
                href="/status"
                className="transition-colors hover:text-foreground"
              >
                System Status
              </Link>
              <Link
                href="/community"
                className="transition-colors hover:text-foreground"
              >
                Community
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-2 md:w-1/3">
            <h4 className="text-sm font-semibold">Legal</h4>
            <nav className="flex flex-col gap-1 text-sm text-muted-foreground">
              <Link
                href="/privacy"
                className="transition-colors hover:text-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:text-foreground"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="transition-colors hover:text-foreground"
              >
                Cookie Policy
              </Link>
              <Link
                href="/security"
                className="transition-colors hover:text-foreground"
              >
                Security
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t">
        <div className="container flex flex-col gap-4 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} LMS AI. All rights reserved.</p>
          <div className="flex gap-4">
            <Link
              href="/terms"
              className="transition-colors hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/cookies"
              className="transition-colors hover:text-foreground"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
