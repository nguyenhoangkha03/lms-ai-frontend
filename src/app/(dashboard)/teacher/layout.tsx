import { ProtectedRoute } from '@/components/auth/protected-route';
import { USER_ROLES } from '@/lib/constants/constants';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute
      allowedRoles={[USER_ROLES.TEACHER]}
      requireMfa={false}
      requireFreshSession={false}
    >
      <div className="min-h-screen bg-background">
        {/* Teacher layout content */}
        {children}
      </div>
    </ProtectedRoute>
  );
}
