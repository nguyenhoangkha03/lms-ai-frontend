'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Construction,
  Wrench,
  Clock,
  ArrowLeft,
  Sparkles,
  Zap,
  Cpu,
  Rocket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UnderDevelopmentProps {
  title?: string;
  description?: string;
  expectedCompletion?: string;
  className?: string;
  showBackButton?: boolean;
  backUrl?: string;
  features?: string[];
}

export function UnderDevelopment({
  title = "Feature Under Development",
  description = "We're working hard to bring you this amazing feature. Stay tuned for updates!",
  expectedCompletion = "Coming Soon",
  className = "",
  showBackButton = true,
  backUrl = "/student",
  features = []
}: UnderDevelopmentProps) {
  const router = useRouter();

  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex min-h-[70vh] items-center justify-center"
      >
        <Card className="w-full max-w-2xl border-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 shadow-2xl">
          <CardContent className="p-8 text-center">
            {/* Animated Construction Icon */}
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1, 1.05, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center"
            >
              {/* Glowing background */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
              />
              
              {/* Main icon */}
              <Construction className="relative z-10 h-12 w-12 text-orange-600" />
              
              {/* Floating particles */}
              <motion.div
                animate={{
                  y: [-10, -20, -10],
                  x: [0, 5, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -right-2 -top-2"
              >
                <Wrench className="h-4 w-4 text-blue-500" />
              </motion.div>
              
              <motion.div
                animate={{
                  y: [-5, -15, -5],
                  x: [0, -3, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute -left-3 -bottom-1"
              >
                <Sparkles className="h-3 w-3 text-purple-500" />
              </motion.div>
            </motion.div>

            {/* Title with gradient */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent"
            >
              {title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 text-lg text-gray-600 leading-relaxed"
            >
              {description}
            </motion.p>

            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 text-sm font-medium">
                <Clock className="mr-2 h-4 w-4" />
                {expectedCompletion}
              </Badge>
            </motion.div>

            {/* Features Preview */}
            {features.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <h3 className="mb-4 text-xl font-semibold text-gray-800">
                  What's Coming:
                </h3>
                <div className="grid gap-3 text-left">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-3 rounded-lg border border-blue-200/50 bg-white/60 p-3 backdrop-blur-sm"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                        {index % 3 === 0 ? (
                          <Zap className="h-4 w-4 text-white" />
                        ) : index % 3 === 1 ? (
                          <Cpu className="h-4 w-4 text-white" />
                        ) : (
                          <Rocket className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {showBackButton && (
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-medium"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              )}
              
              <Button
                asChild
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href={backUrl}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </motion.div>

            {/* Animated Progress Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8"
            >
              <div className="mb-2 flex justify-between text-sm text-gray-600">
                <span>Development Progress</span>
                <span>75%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ delay: 1, duration: 2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                />
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}