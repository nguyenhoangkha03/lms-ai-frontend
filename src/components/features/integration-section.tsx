'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Zap,
  Database,
  Cloud,
  Webhook,
  Key,
  Shield,
  Monitor,
  Smartphone,
  Globe,
} from 'lucide-react';

const integrations = [
  {
    category: 'Cloud Platforms',
    icon: Cloud,
    items: ['AWS', 'Google Cloud', 'Microsoft Azure', 'Digital Ocean'],
    description: 'Seamless deployment on major cloud providers',
  },
  {
    category: 'Authentication',
    icon: Key,
    items: ['Google SSO', 'Microsoft 365', 'SAML', 'LDAP'],
    description: 'Enterprise-grade authentication systems',
  },
  {
    category: 'Analytics',
    icon: Monitor,
    items: ['Google Analytics', 'Mixpanel', 'Segment', 'Amplitude'],
    description: 'Advanced analytics and tracking integration',
  },
  {
    category: 'Communication',
    icon: Webhook,
    items: ['Slack', 'Microsoft Teams', 'Discord', 'Zoom'],
    description: 'Connect with your favorite communication tools',
  },
  {
    category: 'Data Storage',
    icon: Database,
    items: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis'],
    description: 'Flexible database and storage options',
  },
  {
    category: 'Mobile SDKs',
    icon: Smartphone,
    items: ['React Native', 'Flutter', 'iOS Native', 'Android Native'],
    description: 'Native mobile app development support',
  },
];

const apiFeatures = [
  {
    title: 'RESTful API',
    description: 'Complete REST API with comprehensive documentation',
    features: [
      'OpenAPI Specification',
      'Rate Limiting',
      'Versioning',
      'Authentication',
    ],
  },
  {
    title: 'GraphQL Support',
    description: 'Flexible GraphQL endpoint for efficient data fetching',
    features: [
      'Real-time Subscriptions',
      'Type Safety',
      'Introspection',
      'Playground',
    ],
  },
  {
    title: 'Webhooks',
    description: 'Real-time event notifications for your applications',
    features: [
      'Event Filtering',
      'Retry Logic',
      'Signature Verification',
      'Custom Headers',
    ],
  },
];

export const IntegrationSection: React.FC = () => {
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
            <Globe className="mr-1 h-3 w-3" />
            Integrations & API
          </Badge>
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Connect with Your Existing Tools
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">
            Our platform integrates seamlessly with the tools you already use,
            and provides powerful APIs for custom integrations.
          </p>
        </motion.div>

        {/* Integration Categories */}
        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full transition-shadow duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                      <integration.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg">
                      {integration.category}
                    </CardTitle>
                  </div>
                  <CardDescription>{integration.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {integration.items.map(item => (
                      <Badge key={item} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* API Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h3 className="mb-6 text-2xl font-bold md:text-3xl">
            Powerful API & Developer Tools
          </h3>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Build custom integrations and extend functionality with our
            comprehensive API suite.
          </p>
        </motion.div>

        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {apiFeatures.map((api, index) => (
            <motion.div
              key={api.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-xl">{api.title}</CardTitle>
                  <CardDescription>{api.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {api.features.map(feature => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Zap className="h-3 w-3 flex-shrink-0 text-blue-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="border-none bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardContent className="p-8">
              <div className="mb-4 flex items-center justify-center gap-2">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h4 className="text-xl font-semibold">Enterprise Ready</h4>
              </div>
              <p className="mx-auto mb-6 max-w-2xl text-gray-600 dark:text-gray-300">
                Need enterprise-grade security, custom integrations, or
                dedicated support? Our team is ready to help you build the
                perfect solution.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button size="lg">View API Documentation</Button>
                <Button variant="outline" size="lg">
                  Contact Engineering Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
