'use client';

import React from 'react';
import { AdaptiveLearningPath } from '@/components/ai/adaptive-learning-path';

export default function LearningPathPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Learning Path</h1>
        <p className="text-muted-foreground">
          Your personalized AI-driven learning journey
        </p>
      </div>

      <AdaptiveLearningPath showDetails={true} showAdaptations={true} />
    </div>
  );
}
