'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { FileManagementDashboard } from '@/components/file-management';

export default function FileManagementPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute
      allowedRoles={['admin', 'teacher']}
      requiredPermissions={['files.read', 'files.manage']}
    >
      <div className="container mx-auto px-4 py-8">
        <FileManagementDashboard
          userRole={user?.userType || 'teacher'}
          enableUpload={true}
          enableBulkOperations={user?.userType === 'admin'}
          enableFiltering={true}
        />
      </div>
    </ProtectedRoute>
  );
}

// export const metadata = {
//   title: 'File Management | LMS AI Platform',
//   description:
//     'Advanced file management with media processing, CDN integration, and security scanning',
// };
