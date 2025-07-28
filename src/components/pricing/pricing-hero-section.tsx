'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, DollarSign, Users, Zap } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export const PricingHeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <Badge variant="outline" className="mb-6">
            <DollarSign className="mr-1 h-3 w-3" />
            Transparent Pricing
          </Badge>

          <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
            Choose the Perfect Plan for{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Learning Journey
            </span>
          </h1>

          <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
            Start free and scale as you grow. All plans include our core AI
            features, comprehensive analytics, and dedicated support to ensure
            your success.
          </p>

          <div className="mb-16 flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href={ROUTES.REGISTER}>
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button variant="outline" size="lg" asChild>
              <Link href={ROUTES.CONTACT}>Contact Sales</Link>
            </Button>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No Setup Fees</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Get started immediately with no hidden costs or setup charges.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Flexible Scaling</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Upgrade or downgrade anytime to match your changing needs.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">30-Day Guarantee</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Try risk-free with our money-back guarantee on all paid plans.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
