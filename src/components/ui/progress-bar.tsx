'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export function ProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setProgress(30);

    const timer1 = setTimeout(() => setProgress(60), 100);
    const timer2 = setTimeout(() => setProgress(100), 500);
    const timer3 = setTimeout(() => setIsVisible(false), 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-50">
      <Progress
        value={progress}
        className={cn(
          'h-1 rounded-none bg-transparent transition-opacity duration-300',
          !isVisible && 'opacity-0'
        )}
      />
    </div>
  );
}
