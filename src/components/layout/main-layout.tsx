'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { Footer } from './footer';
import { useAppSelector } from '@/lib/redux/hooks';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
  showFooter?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className,
  showSidebar = true,
  showFooter = false,
}) => {
  const { sidebarCollapsed } = useAppSelector(state => state.ui);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex">
        {showSidebar && <Sidebar />}

        <main
          className={cn(
            'min-h-[calc(100vh-4rem)] flex-1',
            showSidebar && (sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'),
            className
          )}
        >
          {children}
        </main>
      </div>

      {showFooter && <Footer />}
    </div>
  );
};
