export { RouteGuard } from './route-guard';
export {
  withAuth,
  withStudentAuth,
  withTeacherAuth,
  withAdminAuth,
} from './with-auth';
export {
  RoleBasedAccess,
  StudentOnly,
  TeacherOnly,
  AdminOnly,
  TeacherOrAdmin,
} from './role-based-access';
export { ProtectedRoute } from './protected-route';
export { SessionTimeout } from './session-timeout';
export { RoleBadge } from './role-badge';
export { PermissionGate } from './permission-gate';
export { AuthStatus } from './auth-status';
export { ActivityTracker } from './activity-tracker';
export { TwoFactorAuth } from './two-factor-auth';

// Export auth layout
export { AuthLayout } from '../layouts/auth-layout';
