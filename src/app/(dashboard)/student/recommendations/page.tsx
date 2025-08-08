'use client';

import React from 'react';
import { EnhancedAIRecommendationsWidget } from '@/components/ai';
import { PersonalizedContentFeeds } from '@/components/ai';
import { SmartSuggestionsSystem } from '@/components/ai';

export default function RecommendationsPage() {
  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI Recommendations</h1>
        <p className="text-muted-foreground">
          Personalized learning suggestions powered by AI
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <EnhancedAIRecommendationsWidget
            maxItems={8}
            showTabs={true}
            showFilters={true}
          />

          <PersonalizedContentFeeds
            maxItems={16}
            layout="grid"
            showFilters={true}
          />
        </div>

        <div className="space-y-6">
          <SmartSuggestionsSystem
            maxSuggestions={5}
            position="top-right"
            autoShow={true}
          />
        </div>
      </div>
    </div>
  );
}
