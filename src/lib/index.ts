export { TokenManager } from './auth/token-manager';
export {
  PermissionChecker,
  PERMISSIONS,
  ROLE_PERMISSIONS,
} from './auth/permissions';
export { AccessControl } from './auth/access-control';
export * from './auth/demo-auth';

// Export all auth components
export { RouteGuard } from '@/components/auth/route-guard';
export {
  withAuth,
  withStudentAuth,
  withTeacherAuth,
  withAdminAuth,
} from '@/components/auth/with-auth';
export {
  RoleBasedAccess,
  StudentOnly,
  TeacherOnly,
  AdminOnly,
  TeacherOrAdmin,
} from '@/components/auth/role-based-access';
export { ProtectedRoute } from '@/components/auth/protected-route';
export { AuthProvider } from '@/components/auth/auth-provider';
