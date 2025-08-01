'use client';

import React, { useState } from 'react';
import { AITutorInterface } from '@/components/ai';

export default function AITutorPage() {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI Tutor</h1>
        <p className="text-muted-foreground">
          24/7 intelligent tutoring support
        </p>
      </div>

      <AITutorInterface
        isMinimized={isMinimized}
        onToggleMinimize={() => setIsMinimized(!isMinimized)}
        mode="adaptive"
        showVoiceControls={true}
        showSettings={true}
      />
    </div>
  );
}
