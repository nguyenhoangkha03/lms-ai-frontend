'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';

interface ComponentDemoProps {
  title: string;
  description?: string;
  component: React.ReactNode;
  code: string;
  props?: Record<string, any>;
}

export function ComponentDemo({
  title,
  description,
  component,
  code,
  props,
}: ComponentDemoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-4">
            <div className="bg-card rounded-lg border p-6">{component}</div>
          </TabsContent>

          <TabsContent value="code" className="mt-4">
            <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm">
              <code>{code}</code>
            </pre>
          </TabsContent>
        </Tabs>

        {props && (
          <div className="mt-4 border-t pt-4">
            <h4 className="mb-2 text-sm font-medium">Props</h4>
            <div className="space-y-1">
              {Object.entries(props).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <code className="bg-muted rounded px-1">{key}</code>
                  <span className="text-muted-foreground">:</span>
                  <code>{String(value)}</code>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
