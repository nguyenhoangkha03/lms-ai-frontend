'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useMobile, useBreakpoint } from '@/hooks/use-mobile';
import {
  MobileNavigation,
  BottomTabBar,
} from '@/components/navigation/MobileNavigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { PWAManager } from '@/components/pwa/PWAManager';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../../ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showBottomNav?: boolean;
  className?: string;
}

export function ResponsiveLayout({
  children,
  showSidebar = true,
  showBottomNav = true,
  className,
}: ResponsiveLayoutProps) {
  const { isMobile, isTablet, shouldShowMobileUI } = useMobile();
  const { current: breakpoint } = useBreakpoint();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  // Handle orientation changes
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  // Determine layout strategy
  const layoutStrategy = () => {
    if (isMobile) {
      return isLandscape ? 'mobile-landscape' : 'mobile-portrait';
    }
    if (isTablet) {
      return 'tablet';
    }
    return 'desktop';
  };

  const strategy = layoutStrategy();

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* PWA Manager */}
      <PWAManager />

      {/* Desktop/Tablet Layout */}
      {strategy === 'desktop' && (
        <div className="flex h-screen">
          {/* Sidebar */}
          {showSidebar && (
            <Sidebar className="hidden lg:flex" />
            // <Sidebar className="hidden lg:flex" collapsed={false} />
          )}

          {/* Main Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header className="border-b" />
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto p-6">{children}</div>
            </main>
          </div>
        </div>
      )}

      {/* Tablet Layout */}
      {strategy === 'tablet' && (
        <div className="flex h-screen">
          {/* Collapsible Sidebar */}
          {showSidebar && (
            // <Sidebar
            //   className="hidden md:flex lg:hidden"
            //   collapsed={!sidebarOpen}
            //   onToggle={setSidebarOpen}
            // />
            <Sidebar className="hidden md:flex lg:hidden" />
          )}

          {/* Main Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header
              className="border-b"
              showMenuButton={showSidebar}
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            />
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto p-4">{children}</div>
            </main>
          </div>
        </div>
      )}

      {/* Mobile Portrait Layout */}
      {strategy === 'mobile-portrait' && (
        <div className="flex h-screen flex-col">
          {/* Mobile Header */}
          <Header className="flex-shrink-0 border-b" variant="mobile" />

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-4 pb-20">
              {' '}
              {/* Bottom padding for tab bar */}
              {children}
            </div>
          </main>

          {/* Bottom Navigation */}
          {showBottomNav && <BottomTabBar />}
        </div>
      )}

      {/* Mobile Landscape Layout */}
      {strategy === 'mobile-landscape' && (
        <div className="flex h-screen">
          {/* Compact Sidebar for landscape */}
          {showSidebar && (
            <Sidebar
              className="w-16 flex-shrink-0"
              collapsed={true}
              variant="compact"
            />
          )}

          {/* Main Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header className="h-12 flex-shrink-0 border-b" variant="compact" />
            <main className="flex-1 overflow-auto">
              <div className="p-3">{children}</div>
            </main>
          </div>
        </div>
      )}

      {/* Mobile Navigation Menu (always available) */}
      {shouldShowMobileUI && <MobileNavigation />}
    </div>
  );
}

// Responsive Container Component
interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function ResponsiveContainer({
  children,
  maxWidth = 'lg',
  padding = 'md',
  className,
}: ResponsiveContainerProps) {
  //   const { isMobile, isTablet, shouldShowMobileUI } = useMobile();

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-2 sm:p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

// Responsive Grid Component
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ResponsiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className,
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const gridClasses = cn(
    'grid',
    `grid-cols-${columns.mobile || 1}`,
    `md:grid-cols-${columns.tablet || 2}`,
    `lg:grid-cols-${columns.desktop || 3}`,
    gapClasses[gap],
    className
  );

  return <div className={gridClasses}>{children}</div>;
}

// Responsive Stack Component
interface ResponsiveStackProps {
  children: React.ReactNode;
  direction?: {
    mobile?: 'row' | 'column';
    tablet?: 'row' | 'column';
    desktop?: 'row' | 'column';
  };
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ResponsiveStack({
  children,
  direction = { mobile: 'column', tablet: 'row', desktop: 'row' },
  align = 'start',
  justify = 'start',
  gap = 'md',
  className,
}: ResponsiveStackProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  const directionClasses = cn(
    'flex',
    direction.mobile === 'row' ? 'flex-row' : 'flex-col',
    direction.tablet &&
      (direction.tablet === 'row' ? 'md:flex-row' : 'md:flex-col'),
    direction.desktop &&
      (direction.desktop === 'row' ? 'lg:flex-row' : 'lg:flex-col'),
    alignClasses[align],
    justifyClasses[justify],
    gapClasses[gap],
    className
  );

  return <div className={directionClasses}>{children}</div>;
}

// Responsive Text Component
interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: {
    mobile?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
    tablet?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
    desktop?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  };
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'destructive';
  className?: string;
}

export function ResponsiveText({
  children,
  size = { mobile: 'base', tablet: 'lg', desktop: 'xl' },
  weight = 'normal',
  color = 'primary',
  className,
}: ResponsiveTextProps) {
  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const colorClasses = {
    primary: 'text-foreground',
    secondary: 'text-muted-foreground',
    muted: 'text-muted-foreground',
    destructive: 'text-destructive',
  };

  const sizeClasses = cn(
    `text-${size.mobile}`,
    size.tablet && `md:text-${size.tablet}`,
    size.desktop && `lg:text-${size.desktop}`,
    weightClasses[weight],
    colorClasses[color],
    className
  );

  return <span className={sizeClasses}>{children}</span>;
}

// Hook for responsive values
export function useResponsiveValue<T>(values: {
  mobile: T;
  tablet?: T;
  desktop?: T;
}): T {
  const { isMobile, isTablet } = useMobile();

  if (isMobile) return values.mobile;
  if (isTablet) return values.tablet || values.mobile;
  return values.desktop || values.tablet || values.mobile;
}

// Safe Area Component for mobile devices
interface SafeAreaProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  className?: string;
}

export function SafeArea({
  children,
  edges = ['top', 'bottom'],
  className,
}: SafeAreaProps) {
  const { isMobile } = useMobile();

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  const safeAreaClasses = cn(
    edges.includes('top') && 'pt-safe-top',
    edges.includes('bottom') && 'pb-safe-bottom',
    edges.includes('left') && 'pl-safe-left',
    edges.includes('right') && 'pr-safe-right',
    className
  );

  return <div className={safeAreaClasses}>{children}</div>;
}

// Adaptive Content Component
interface AdaptiveContentProps {
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdaptiveContent({
  mobile,
  tablet,
  desktop,
  fallback,
}: AdaptiveContentProps) {
  const { isMobile, isTablet } = useMobile();

  if (isMobile && mobile) return <>{mobile}</>;
  if (isTablet && tablet) return <>{tablet}</>;
  if (desktop) return <>{desktop}</>;
  if (fallback) return <>{fallback}</>;

  return null;
}

// Responsive Visibility Component
interface ResponsiveVisibilityProps {
  children: React.ReactNode;
  show?: ('mobile' | 'tablet' | 'desktop')[];
  hide?: ('mobile' | 'tablet' | 'desktop')[];
}

export function ResponsiveVisibility({
  children,
  show,
  hide,
}: ResponsiveVisibilityProps) {
  const { isMobile, isTablet } = useMobile();

  const currentDevice = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

  if (show && !show.includes(currentDevice)) return null;
  if (hide && hide.includes(currentDevice)) return null;

  return <>{children}</>;
}

// Responsive Modal/Sheet Component
interface ResponsiveModalProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function ResponsiveModal({
  children,
  open,
  onOpenChange,
  title,
  description,
}: ResponsiveModalProps) {
  const { isMobile } = useMobile();

  if (isMobile) {
    // Use Sheet for mobile
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh]">
          {title && (
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
              {description && (
                <SheetDescription>{description}</SheetDescription>
              )}
            </SheetHeader>
          )}
          <div className="mt-6">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  // Use Dialog for desktop/tablet
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}
