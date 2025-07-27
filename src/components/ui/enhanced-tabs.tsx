'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface CustomTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'default' | 'lg';
}

export const CustomTabs: React.FC<CustomTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
  variant = 'default',
  size = 'default',
}) => {
  const baseClasses =
    'inline-flex items-center justify-center whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  const variantClasses = {
    default:
      'rounded-md px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
    pills:
      'rounded-full px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
    underline:
      'px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    default: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const containerClasses = {
    default:
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
    pills: 'inline-flex items-center justify-center gap-1',
    underline: 'flex items-center border-b',
  };

  return (
    <div className={cn(containerClasses[variant], className)}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            activeTab === tab.id && 'data-[state=active]',
            tab.disabled && 'cursor-not-allowed opacity-50'
          )}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          disabled={tab.disabled}
          data-state={activeTab === tab.id ? 'active' : 'inactive'}
        >
          {tab.icon && (
            <span className="mr-2 [&>svg]:h-4 [&>svg]:w-4">{tab.icon}</span>
          )}
          {tab.label}
          {tab.badge && (
            <span className="ml-2 rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-xs">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
