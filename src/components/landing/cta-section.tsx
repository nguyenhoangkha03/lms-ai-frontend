'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export const CTASection: React.FC = () => {
  const benefits = [
    'Start learning immediately',
    'No setup or installation required',
    'Access to 1000+ courses',
    'Personal AI tutor included',
    '30-day money-back guarantee',
  ];

  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center text-white"
        >
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Ready to Transform Your Learning Journey?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
            Join thousands of learners who are already experiencing the power of
            AI-driven education.
          </p>

          <div className="mb-12 flex flex-wrap justify-center gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span className="text-sm md:text-base">{benefit}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="h-12 px-8">
              <Link href={ROUTES.REGISTER}>
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-white px-8 text-white hover:bg-white hover:text-blue-600"
            >
              <Link href={ROUTES.CONTACT}>Talk to Sales</Link>
            </Button>
          </div>

          <p className="mt-6 text-sm opacity-75">
            Free trial • No credit card required • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
};
