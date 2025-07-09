'use client';

import { useResponsive } from '@/hooks/ui/use-responsive';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@/components/ui';

export function ResponsiveDemo() {
  const breakpoints = useResponsive();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Breakpoints</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
          {Object.entries(breakpoints).map(([breakpoint, isActive]) => (
            <Badge
              key={breakpoint}
              variant={isActive ? 'default' : 'outline'}
              className="justify-center"
            >
              {breakpoint}: {isActive ? '✓' : '✗'}
            </Badge>
          ))}
        </div>
        <p className="text-muted-foreground mt-4 text-sm">
          Resize your browser window to see how breakpoints change in real-time.
        </p>
      </CardContent>
    </Card>
  );
}
