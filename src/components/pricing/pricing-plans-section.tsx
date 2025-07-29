'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/constants';

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Access to 50+ free courses',
      'Basic progress tracking',
      'Community discussions',
      'Mobile app access',
      '5GB storage',
    ],
    limitations: [
      'Limited AI features',
      'Basic analytics only',
      'No certificates',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Pro',
    description: 'For serious learners',
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      'Everything in Free',
      'Unlimited course access',
      'AI-powered recommendations',
      'Adaptive learning paths',
      'Advanced analytics',
      'Certificates of completion',
      'Priority support',
      '100GB storage',
      'Offline content access',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Team',
    description: 'For organizations and teams',
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      'Everything in Pro',
      'Team management dashboard',
      'Bulk user management',
      'Custom learning paths',
      'Advanced reporting',
      'SSO integration',
      'API access',
      'Dedicated support',
      'Unlimited storage',
      'White-label options',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export const PricingPlansSection: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="bg-gray-50 py-24 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Choose Your Perfect Plan
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            Start free and upgrade as you grow. All plans include our core AI
            features and comprehensive learning tools.
          </p>

          {/* Billing Toggle */}
          <div className="mb-8 flex items-center justify-center gap-4">
            <span
              className={`text-sm ${!isYearly ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500'}`}
            >
              Monthly
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span
              className={`text-sm ${isYearly ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500'}`}
            >
              Yearly
            </span>
            <Badge variant="secondary" className="ml-2">
              Save 20%
            </Badge>
          </div>
        </motion.div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card
                className={`h-full ${plan.popular ? 'scale-105 border-blue-500 shadow-lg' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                    <Badge className="bg-blue-500 text-white">
                      <Star className="mr-1 h-3 w-3" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-8 text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">
                    {plan.description}
                  </CardDescription>

                  <div className="mt-4">
                    <div className="text-4xl font-bold">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      {plan.monthlyPrice > 0 && (
                        <span className="text-lg font-normal text-gray-500">
                          /{isYearly ? 'year' : 'month'}
                        </span>
                      )}
                    </div>
                    {isYearly && plan.monthlyPrice > 0 && (
                      <div className="mt-1 text-sm text-gray-500">
                        ${Math.round(plan.yearlyPrice / 12)}/month billed yearly
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link
                      href={
                        plan.name === 'Team' ? ROUTES.CONTACT : ROUTES.REGISTER
                      }
                    >
                      {plan.cta}
                    </Link>
                  </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center gap-3"
                      >
                        <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}

                    {plan.limitations?.map((limitation, limitIndex) => (
                      <div
                        key={limitIndex}
                        className="flex items-center gap-3 opacity-60"
                      >
                        <div className="h-4 w-4 flex-shrink-0 rounded-full border border-gray-300"></div>
                        <span className="text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Enterprise Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Card className="border-none bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <div className="mb-4 flex items-center justify-center gap-2">
                <Zap className="h-6 w-6" />
                <h3 className="text-2xl font-bold">Enterprise Solutions</h3>
              </div>
              <p className="mb-6 text-lg opacity-90">
                Need custom features, advanced security, or dedicated support?
                Let's build a solution that scales with your organization.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button variant="secondary" size="lg" asChild>
                  <Link href={ROUTES.CONTACT}>Schedule Demo</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  Contact Sales
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
