'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  useBreakpoint,
  getResponsiveValue,
  type Breakpoint,
} from '@/lib/responsive';

type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

interface ResponsiveStackProps {
  children: React.ReactNode;
  direction?: ResponsiveValue<'row' | 'column'>;
  spacing?: ResponsiveValue<string>;
  align?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch'>;
  justify?: ResponsiveValue<
    'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  >;
  wrap?: ResponsiveValue<boolean>;
  className?: string;
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  direction = 'column',
  spacing = '1rem',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className,
}) => {
  const currentBreakpoint = useBreakpoint();

  const responsiveDirection = getResponsiveValue(direction, currentBreakpoint);
  const responsiveSpacing = getResponsiveValue(spacing, currentBreakpoint);
  const responsiveAlign = getResponsiveValue(align, currentBreakpoint);
  const responsiveJustify = getResponsiveValue(justify, currentBreakpoint);
  const responsiveWrap = getResponsiveValue(wrap, currentBreakpoint);

  const flexDirection = responsiveDirection === 'row' ? 'row' : 'column';
  const gapProperty = responsiveDirection === 'row' ? 'column-gap' : 'row-gap';

  const alignItemsMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
  };

  const justifyContentMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  };

  return (
    <div
      className={cn('flex', className)}
      style={{
        flexDirection,
        [gapProperty]: responsiveSpacing,
        alignItems: alignItemsMap[responsiveAlign],
        justifyContent: justifyContentMap[responsiveJustify],
        flexWrap: responsiveWrap ? 'wrap' : 'nowrap',
      }}
    >
      {children}
    </div>
  );
};
