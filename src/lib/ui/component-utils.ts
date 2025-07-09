export const spacing = {
  xs: 'p-2',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
} as const;

export const margins = {
  xs: 'm-2',
  sm: 'm-4',
  md: 'm-6',
  lg: 'm-8',
  xl: 'm-10',
} as const;

export const focusRing =
  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

export const transitions = {
  fast: 'transition-all duration-150 ease-in-out',
  normal: 'transition-all duration-300 ease-in-out',
  slow: 'transition-all duration-500 ease-in-out',
} as const;
