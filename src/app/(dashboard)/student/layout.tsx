import { ProtectedRoute } from '@/components/auth/protected-route';
import { USER_ROLES } from '@/lib/constants';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.STUDENT]} requireMfa={false}>
      <div className="min-h-screen bg-background">
        {/* Student layout content */}
        {children}
      </div>
    </ProtectedRoute>
  );
}
