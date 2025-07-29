import { ProtectedRoute } from '@/components/auth/protected-route';
import { USER_ROLES } from '@/lib/constants/constants';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute
      allowedRoles={[USER_ROLES.ADMIN]}
      requireMfa={true}
      requireFreshSession={true}
    >
      <div className="min-h-screen bg-background">
        {/* Admin layout content */}
        {children}
      </div>
    </ProtectedRoute>
  );
}
