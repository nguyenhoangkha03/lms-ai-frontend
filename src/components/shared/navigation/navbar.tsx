'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  external?: boolean;
}

interface NavbarProps {
  items: NavItem[];
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
  orientation?: 'horizontal' | 'vertical';
}

export const Navbar: React.FC<NavbarProps> = ({
  items,
  className,
  variant = 'default',
  orientation = 'horizontal',
}) => {
  const pathname = usePathname();

  const getLinkClasses = (href: string) => {
    const isActive = pathname === href;

    const baseClasses =
      'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

    const variantClasses = {
      default: cn(
        'rounded-md hover:bg-accent hover:text-accent-foreground',
        isActive && 'bg-accent text-accent-foreground'
      ),
      pills: cn(
        'rounded-full hover:bg-accent hover:text-accent-foreground',
        isActive && 'bg-primary text-primary-foreground'
      ),
      underline: cn(
        'border-b-2 border-transparent hover:border-muted-foreground',
        isActive && 'border-primary text-foreground'
      ),
    };

    return cn(baseClasses, variantClasses[variant]);
  };

  return (
    <nav
      className={cn(
        'flex',
        orientation === 'horizontal'
          ? 'items-center space-x-1'
          : 'flex-col space-y-1',
        className
      )}
    >
      {items.map(item => {
        const LinkComponent = item.external ? 'a' : Link;
        const linkProps = item.external
          ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
          : { href: item.href };

        return (
          <LinkComponent
            key={item.href}
            className={getLinkClasses(item.href)}
            {...linkProps}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-xs">
                {item.badge}
              </span>
            )}
          </LinkComponent>
        );
      })}
    </nav>
  );
};
