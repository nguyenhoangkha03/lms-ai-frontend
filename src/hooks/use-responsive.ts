'use client';

import { useBreakpoint, useMediaQuery } from '@/lib/responsive';

export function useResponsive() {
  const breakpoint = useBreakpoint();

  const isMobile = useMediaQuery('max-sm');
  const isTablet = useMediaQuery('sm-md');
  const isDesktop = useMediaQuery('lg');
  const isLargeDesktop = useMediaQuery('xl');

  return {
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,

    isXs: breakpoint === 'xs',
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    is2Xl: breakpoint === '2xl',

    isTouchDevice: isMobile || isTablet,
    showSidebar: isDesktop,
    showMobileMenu: isMobile,
    columnsCount: isMobile ? 1 : isTablet ? 2 : isDesktop ? 3 : 4,
  };
}
