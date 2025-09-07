'use client';

import React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ThreadCreator from '@/components/communication/forum/ThreadCreator';

const CreateThreadPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId') || undefined;

  return (
    <div className="container mx-auto px-4 py-6">
      <ThreadCreator
        categoryId={categoryId}
        showBackButton={true}
      />
    </div>
  );
};

const CreateThreadSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-20" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
      </div>

      {/* Progress Bar */}
      <Skeleton className="h-2 w-full rounded-full" />

      {/* Step Indicators */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-64" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border-2 border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 mt-0.5" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-48 mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CreateThreadPage: React.FC = () => {
  return (
    <Suspense fallback={<CreateThreadSkeleton />}>
      <CreateThreadPageContent />
    </Suspense>
  );
};

export default CreateThreadPage;