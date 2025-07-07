export { TokenManager } from './token-manager';
export {
  PermissionChecker,
  PERMISSIONS,
  ROLE_PERMISSIONS,
} from './permissions';
export { AccessControl } from './access-control';
export * from './demo-auth';

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
