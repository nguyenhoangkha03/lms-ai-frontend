'use client';

import React from 'react';
import Link from 'next/link';
import {
  Brain,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Github,
} from 'lucide-react';
import { ROUTES, APP_CONFIG } from '@/lib/constants/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const footerSections = [
  {
    title: 'Platform',
    links: [
      { name: 'Features', href: ROUTES.FEATURES },
      { name: 'Pricing', href: ROUTES.PRICING },
      { name: 'For Students', href: '/for-students' },
      { name: 'For Teachers', href: '/for-teachers' },
      { name: 'For Organizations', href: '/for-organizations' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api-docs' },
      { name: 'Help Center', href: '/help' },
      { name: 'Blog', href: '/blog' },
      { name: 'Community', href: '/community' },
      { name: 'Status', href: '/status' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: ROUTES.ABOUT },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
      { name: 'Contact', href: ROUTES.CONTACT },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR', href: '/gdpr' },
    ],
  },
];

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-2xl font-bold">Stay Updated</h3>
              <p className="text-gray-400">
                Get the latest news, updates, and educational content delivered
                to your inbox.
              </p>
            </div>
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
              />
              <Button variant="secondary">Subscribe</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link
              href={ROUTES.HOME}
              className="mb-4 flex items-center space-x-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">{APP_CONFIG.name}</span>
            </Link>
            <p className="mb-6 max-w-sm text-gray-400">
              Empowering learners worldwide with AI-driven personalized
              education. Transform your learning journey with intelligent
              insights and adaptive content.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>hello@lmsai.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map(section => (
            <div key={section.title}>
              <h4 className="mb-4 font-semibold">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map(link => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} {APP_CONFIG.name}. All rights
              reserved.
            </p>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Follow us:</span>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-white"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-white"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-white"
                >
                  <Github className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
