'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

const faqs = [
  {
    question: 'Can I switch plans at any time?',
    answer:
      'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated based on your usage.',
  },
  {
    question: 'What happens to my data if I cancel?',
    answer:
      'Your data remains accessible for 30 days after cancellation. You can export all your learning progress, certificates, and content during this period.',
  },
  {
    question: 'Do you offer discounts for students or educators?',
    answer:
      'Yes! We offer special pricing for students and educators. Contact our sales team with proof of enrollment or employment for custom pricing.',
  },
  {
    question: 'Is there a limit on the number of courses I can take?',
    answer:
      'Free plans include access to 50+ courses. Pro and Team plans include unlimited access to our entire course library with new content added weekly.',
  },
  {
    question: 'How does the AI personalization work?',
    answer:
      'Our AI analyzes your learning patterns, performance, and preferences to create personalized study plans, recommend relevant content, and adapt difficulty levels in real-time.',
  },
  {
    question: 'Can I use the platform offline?',
    answer:
      'Pro and Team plans include offline access. You can download courses and continue learning without an internet connection, with progress syncing when you reconnect.',
  },
  {
    question: 'What kind of support do you provide?',
    answer:
      'All plans include community support. Pro plans add email support with 24-hour response time. Team plans include priority support with dedicated account management.',
  },
  {
    question: 'Do you offer enterprise plans?',
    answer:
      'Yes, we offer custom enterprise solutions with advanced features like SSO, custom branding, API access, and dedicated infrastructure. Contact our sales team for details.',
  },
  {
    question: 'How secure is my learning data?',
    answer:
      'We use enterprise-grade security with end-to-end encryption, regular security audits, and comply with GDPR, CCPA, and other privacy regulations.',
  },
  {
    question: "Can I get a refund if I'm not satisfied?",
    answer:
      "Absolutely! We offer a 30-day money-back guarantee on all paid plans. If you're not completely satisfied, we'll refund your payment in full.",
  },
];

export const PricingFAQSection: React.FC = () => {
  return (
    <section className="bg-white py-24 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <Badge variant="outline" className="mb-4">
            <HelpCircle className="mr-1 h-3 w-3" />
            Frequently Asked Questions
          </Badge>
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Got Questions? We Have Answers
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">
            Find answers to common questions about our pricing, features, and
            platform capabilities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* FAQ Accordion */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="rounded-lg border bg-gray-50 px-4 dark:bg-gray-800/50"
                  >
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-medium">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 dark:text-gray-300">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>

          {/* Contact Support */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="sticky top-8"
            >
              <Card>
                <CardHeader>
                  <div className="mb-2 flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                      <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg">
                      Still Have Questions?
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Can't find what you're looking for? Our support team is here
                    to help you choose the right plan and answer any questions.
                  </p>

                  <div className="space-y-3">
                    <Button className="w-full" asChild>
                      <Link href={ROUTES.CONTACT}>Contact Support</Link>
                    </Button>

                    <Button variant="outline" className="w-full">
                      Schedule Demo
                    </Button>

                    <Button variant="ghost" className="w-full">
                      Chat with Sales
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="mb-2 font-medium">Quick Contact</h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>📧 sales@lmsai.com</p>
                      <p>📞 +1 (555) 123-4567</p>
                      <p>💬 Live chat available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Indicators */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h4 className="mb-4 font-medium">Why Choose Us?</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>99.9% uptime guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>SOC 2 Type II certified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>GDPR & CCPA compliant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>24/7 monitoring & support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
