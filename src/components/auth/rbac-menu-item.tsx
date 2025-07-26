'use client';

import React from 'react';
import Link from 'next/link';
import { useRBAC } from '@/hooks/use-rbac';
import { AccessContext } from '@/lib/auth/rbac';
import { cn } from '@/lib/utils';

interface RBACMenuItemProps {
  children: React.ReactNode;
  href?: string;
  permissions?: string[];
  roles?: string[];
  resource?: string;
  action?: string;
  context?: Partial<AccessContext>;
  requireAll?: boolean;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
}

export function RBACMenuItem({
  children,
  href,
  permissions = [],
  roles = [],
  resource,
  action,
  context,
  requireAll = false,
  className,
  activeClassName,
  onClick,
}: RBACMenuItemProps) {
  const { hasAnyPermission, hasAllPermissions, hasAnyRole, canAccessResource } =
    useRBAC();

  let hasAccess = true;

  // Check permissions
  if (permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions, context)
      : hasAnyPermission(permissions, context);
  }

  // Check roles
  if (roles.length > 0) {
    hasAccess = hasAccess && hasAnyRole(roles);
  }

  // Check resource access
  if (resource && action) {
    hasAccess = hasAccess && canAccessResource(resource, action, context);
  }

  if (!hasAccess) {
    return null;
  }

  const itemClassName = cn(
    'block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground',
    className
  );

  if (href) {
    return (
      <Link href={href} className={itemClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button className={itemClassName} onClick={onClick}>
      {children}
    </button>
  );
}
