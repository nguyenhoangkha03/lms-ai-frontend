'use client';

import React from 'react';
import { useRBAC } from '@/hooks/use-rbac';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, User, Settings } from 'lucide-react';

export function AccessReport() {
  const { getAccessReport, userRoles, userPermissions } = useRBAC();

  const report = getAccessReport();

  if (!report) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            No access information available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Roles Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Assigned Roles</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {report.roles.map(role => (
              <Badge key={role.id} variant="secondary">
                {role.name}
              </Badge>
            ))}
          </div>
          {report.roles.length === 0 && (
            <p className="text-muted-foreground">No roles assigned</p>
          )}
        </CardContent>
      </Card>

      {/* Permissions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Permissions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(report.resourceAccess).map(
              ([resource, actions]) => (
                <div key={resource}>
                  <h4 className="mb-2 text-sm font-medium capitalize">
                    {resource}
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {actions.map(action => (
                      <Badge key={action} variant="outline" className="text-xs">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              )
            )}
            {Object.keys(report.resourceAccess).length === 0 && (
              <p className="text-muted-foreground">No permissions available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permission Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Permission Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {report.permissions.map(permission => (
              <div
                key={permission.id}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <p className="text-sm font-medium">{permission.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {permission.description}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {permission.resource}:{permission.action}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
