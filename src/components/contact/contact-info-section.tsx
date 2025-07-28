'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  BookOpen,
  Users,
  Headphones,
} from 'lucide-react';

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Get help via email',
    contact: 'support@lmsai.com',
    action: 'Send Email',
    color: 'blue',
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Speak with our team',
    contact: '+1 (555) 123-4567',
    action: 'Call Now',
    color: 'green',
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Chat with support',
    contact: 'Available 24/7',
    action: 'Start Chat',
    color: 'purple',
  },
];

const quickLinks = [
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'Comprehensive guides and tutorials',
    link: '/docs',
  },
  {
    icon: Users,
    title: 'Community Forum',
    description: 'Connect with other users',
    link: '/community',
  },
  {
    icon: Headphones,
    title: 'Help Center',
    description: 'FAQs and troubleshooting',
    link: '/help',
  },
];

export const ContactInfoSection: React.FC = () => {
  return (
    <section className="bg-gray-50 py-24 dark:bg-gray-800">
      <div className="container mx-auto max-w-2xl px-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          {/* Contact Methods */}
          <div>
            <h3 className="mb-6 text-2xl font-bold">Get in Touch</h3>
            <div className="space-y-4">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={method.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`rounded-lg p-3 bg-${method.color}-100 dark:bg-${method.color}-900/20`}
                        >
                          <method.icon
                            className={`h-6 w-6 text-${method.color}-600 dark:text-${method.color}-400`}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{method.title}</h4>
                          <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                            {method.description}
                          </p>
                          <p className="text-sm font-medium">
                            {method.contact}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          {method.action}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Office Hours */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-4">
                <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/20">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h4 className="text-lg font-semibold">Office Hours</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 6:00 PM PST</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 4:00 PM PST</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Office Location */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-4">
                <div className="rounded-lg bg-red-100 p-3 dark:bg-red-900/20">
                  <MapPin className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h4 className="text-lg font-semibold">Office Location</h4>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>123 Innovation Drive</p>
                <p>San Francisco, CA 94105</p>
                <p>United States</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div>
            <h3 className="mb-6 text-2xl font-bold">Quick Links</h3>
            <div className="space-y-4">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="cursor-pointer transition-shadow hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
                          <link.icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{link.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {link.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
