'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, FileText } from 'lucide-react';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  description: string;
  children: React.ReactNode;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  title,
  lastUpdated,
  description,
  children,
}) => {
  return (
    <div className="bg-gray-50 py-24 dark:bg-gray-900">
      <div className="container mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <Badge variant="outline" className="mb-4">
            <FileText className="mr-1 h-3 w-3" />
            Legal Document
          </Badge>

          <h1 className="mb-6 text-4xl font-bold md:text-5xl">{title}</h1>

          <p className="mx-auto mb-6 max-w-3xl text-xl text-gray-600 dark:text-gray-300">
            {description}
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-8 md:p-12">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                {children}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
