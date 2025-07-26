'use client';

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useRBAC } from '@/hooks/use-rbac';
import { AccessContext } from '@/lib/auth/rbac';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RBACButtonProps extends ButtonProps {
  permissions?: string[];
  roles?: string[];
  resource?: string;
  action?: string;
  context?: Partial<AccessContext>;
  requireAll?: boolean;
  tooltipMessage?: string;
  hideWhenNoAccess?: boolean;
}

export function RBACButton({
  children,
  permissions = [],
  roles = [],
  resource,
  action,
  context,
  requireAll = false,
  tooltipMessage = "You don't have permission to perform this action",
  hideWhenNoAccess = false,
  disabled,
  ...buttonProps
}: RBACButtonProps) {
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

  if (!hasAccess && hideWhenNoAccess) {
    return null;
  }

  const button = (
    <Button {...buttonProps} disabled={disabled || !hasAccess}>
      {children}
    </Button>
  );

  if (!hasAccess && tooltipMessage) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltipMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
