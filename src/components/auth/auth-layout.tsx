'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Brain, ArrowLeft } from 'lucide-react';
import { APP_CONFIG, ROUTES } from '@/lib/constants/constants';
import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  description,
  showBackButton = true,
  backButtonText = 'Back to Home',
  backButtonHref = ROUTES.HOME,
}) => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Side - Branding */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 lg:flex lg:flex-1">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-white/20" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/20" />
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-white/10" />
        </div>

        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-sm text-center"
          >
            {/* <Image
              className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white backdrop-blur-sm"
              src="/logoAI.png"
              alt="Logo"
              width={32}
              height={32}
            /> */}
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Brain className="h-10 w-10 text-white" />
            </div>

            <h1 className="mb-4 text-4xl font-bold">{APP_CONFIG.name}</h1>
            <p className="mb-8 text-xl opacity-90">
              Transform your learning journey with AI-powered personalization
            </p>

            {/* Features List */}
            <div className="w-full space-y-4 text-left">
              {[
                'Adaptive learning algorithms',
                'Real-time progress tracking',
                '24/7 AI tutor support',
                'Personalized recommendations',
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 40 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-2 w-2 flex-shrink-0 rounded-full bg-white" />
                  <span className="opacity-90">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex min-h-screen flex-1 flex-col overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={backButtonHref} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {backButtonText}
                </Link>
              </Button>
            )}

            {/* Mobile Logo */}
            <Link
              href={ROUTES.HOME}
              className="flex items-center gap-2 lg:hidden"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <Brain className="h-5 w-5 text-white" />
              </div>

              <span className="text-xl font-bold">{APP_CONFIG.name}</span>
            </Link>
          </div>

          <ThemeToggle />
        </div>

        {/* Main Content */}
        <div className="flex flex-1 items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <Card className="shadow-lg">
              <CardHeader className="space-y-4 text-center">
                <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                {description && (
                  <CardDescription className="text-base">
                    {description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-6">{children}</CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            © {new Date().getFullYear()} {APP_CONFIG.name}. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
