'use client';

import React from 'react';
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';
import { OfflineManager } from '@/components/performance/OfflineManager';
import { CDNManager } from '@/lib/performance/cdn-config';
import {
  CDNOptimizedImage,
  CDNOptimizedVideo,
} from '@/components/performance/CDNOptimizedMedia';
import { ResourcePreloader } from '@/components/performance/ResourcePreloader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RedisCache } from '@/lib/performance/redis-integration';

export default function PerformanceTestPage() {
  return (
    <div className="container mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold">Performance Optimization Demo</h1>
        <p className="mt-2 text-muted-foreground">
          Test and monitor various performance optimization features
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="offline">Offline Manager</TabsTrigger>
          <TabsTrigger value="media">Optimized Media</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <PerformanceDashboard />
        </TabsContent>

        <TabsContent value="offline">
          <OfflineManager />
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CDN Optimized Images</CardTitle>
              <CardDescription>
                Images automatically optimized and served from CDN
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <CDNOptimizedImage
                src="/images/course-1.jpg"
                alt="Course 1"
                width={400}
                height={300}
                className="rounded-lg"
              />
              <CDNOptimizedImage
                src="/images/course-2.jpg"
                alt="Course 2"
                width={400}
                height={300}
                className="rounded-lg"
                lazy={false}
                priority
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CDN Optimized Video</CardTitle>
              <CardDescription>
                Videos with adaptive quality and format optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CDNOptimizedVideo
                src="/videos/intro.mp4"
                poster="/images/video-poster.jpg"
                width={800}
                height={450}
                className="rounded-lg"
                controls
                preload="metadata"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preload critical resources */}
      <ResourcePreloader
        images={['/images/hero-bg.jpg', '/images/logo.png']}
        routes={['/dashboard', '/courses']}
        fonts={['/fonts/inter.woff2']}
        critical
      />
    </div>
  );
}

export const cdnManager = CDNManager.getInstance();
export const redisCache = RedisCache.getInstance();
