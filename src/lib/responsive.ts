import { useEffect, useState } from 'react';

export const breakpoints = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export const mediaQuery = {
  xs: `(min-width: ${breakpoints.xs}px)`,
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  '2xl': `(min-width: ${breakpoints['2xl']}px)`,

  'max-xs': `(max-width: ${breakpoints.xs - 1}px)`,
  'max-sm': `(max-width: ${breakpoints.sm - 1}px)`,
  'max-md': `(max-width: ${breakpoints.md - 1}px)`,
  'max-lg': `(max-width: ${breakpoints.lg - 1}px)`,
  'max-xl': `(max-width: ${breakpoints.xl - 1}px)`,
  'max-2xl': `(max-width: ${breakpoints['2xl'] - 1}px)`,

  'sm-md': `(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md - 1}px)`,
  'md-lg': `(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  'lg-xl': `(min-width: ${breakpoints.lg}px) and (max-width: ${breakpoints.xl - 1}px)`,
  'xl-2xl': `(min-width: ${breakpoints.xl}px) and (max-width: ${breakpoints['2xl'] - 1}px)`,
} as const;

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('sm');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;

      if (width >= breakpoints['2xl']) {
        setBreakpoint('2xl');
      } else if (width >= breakpoints.xl) {
        setBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setBreakpoint('md');
      } else if (width >= breakpoints.sm) {
        setBreakpoint('sm');
      } else {
        setBreakpoint('xs');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);

    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}

export function useMediaQuery(query: string | keyof typeof mediaQuery) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryString =
      typeof query === 'string' ? query : mediaQuery[query];
    const mediaQueryList = window.matchMedia(mediaQueryString);

    const updateMatch = () => {
      setMatches(mediaQueryList.matches);
    };

    updateMatch();
    mediaQueryList.addEventListener('change', updateMatch);

    return () => mediaQueryList.removeEventListener('change', updateMatch);
  }, [query]);

  return matches;
}

export function getResponsiveValue<T>(
  value: T | Partial<Record<Breakpoint, T>>,
  currentBrepoint: Breakpoint
): T {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const responsiveValue = value as Partial<Record<Breakpoint, T>>;

    if (responsiveValue[currentBrepoint] !== undefined) {
      return responsiveValue[currentBrepoint] as T;
    }
    const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpointOrder.indexOf(currentBrepoint);

    for (let i = currentIndex; i >= 0; i--) {
      const bp = breakpointOrder[i];
      if (responsiveValue[bp] !== undefined) {
        return responsiveValue[bp] as T;
      }
    }

    for (const bp of breakpointOrder) {
      if (responsiveValue[bp] !== undefined) {
        return responsiveValue[bp] as T;
      }
    }
  }

  return value as T;
}
