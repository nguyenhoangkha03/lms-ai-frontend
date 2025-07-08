import { USER_ROLES } from '@/constants';

// Define permissions
export const PERMISSIONS = {
  // Course permissions
  COURSE_CREATE: 'course:create',
  COURSE_READ: 'course:read',
  COURSE_UPDATE: 'course:update',
  COURSE_DELETE: 'course:delete',
  COURSE_PUBLISH: 'course:publish',
  COURSE_APPROVE: 'course:approve',

  // User permissions
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE_ROLES: 'user:manage_roles',

  // Assessment permissions
  ASSESSMENT_CREATE: 'assessment:create',
  ASSESSMENT_READ: 'assessment:read',
  ASSESSMENT_UPDATE: 'assessment:update',
  ASSESSMENT_DELETE: 'assessment:delete',
  ASSESSMENT_GRADE: 'assessment:grade',

  // System permissions
  SYSTEM_ADMIN: 'system:admin',
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_ANALYTICS: 'system:analytics',
  SYSTEM_AUDIT: 'system:audit',

  // Chat permissions
  CHAT_MODERATE: 'chat:moderate',
  CHAT_CREATE_ROOM: 'chat:create_room',

  // Content permissions
  CONTENT_MODERATE: 'content:moderate',
  CONTENT_FEATURED: 'content:featured',
} as const;

// Default role permissions
export const ROLE_PERMISSIONS = {
  [USER_ROLES.STUDENT]: [PERMISSIONS.COURSE_READ, PERMISSIONS.ASSESSMENT_READ],

  [USER_ROLES.TEACHER]: [
    PERMISSIONS.COURSE_CREATE,
    PERMISSIONS.COURSE_READ,
    PERMISSIONS.COURSE_UPDATE,
    PERMISSIONS.COURSE_PUBLISH,
    PERMISSIONS.ASSESSMENT_CREATE,
    PERMISSIONS.ASSESSMENT_READ,
    PERMISSIONS.ASSESSMENT_UPDATE,
    PERMISSIONS.ASSESSMENT_DELETE,
    PERMISSIONS.ASSESSMENT_GRADE,
    PERMISSIONS.CHAT_CREATE_ROOM,
    PERMISSIONS.USER_READ,
  ],

  [USER_ROLES.ADMIN]: [
    // All permissions
    ...Object.values(PERMISSIONS),
  ],
} as const;

export class PermissionChecker {
  private permissions: string[];
  private roles: string[];

  constructor(permissions: string[] = [], roles: string[] = []) {
    this.permissions = permissions;
    this.roles = roles;
  }

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  // Check if user has all specified permissions
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  // Check if user can access resource
  canAccess(resource: string, action: string): boolean {
    const permission = `${resource}:${action}`;
    return this.hasPermission(permission);
  }

  // Check if user can perform CRUD operations
  canCreate(resource: string): boolean {
    return this.canAccess(resource, 'create');
  }

  canRead(resource: string): boolean {
    return this.canAccess(resource, 'read');
  }

  canUpdate(resource: string): boolean {
    return this.canAccess(resource, 'update');
  }

  canDelete(resource: string): boolean {
    return this.canAccess(resource, 'delete');
  }

  // Get permissions for role
  static getPermissionsForRole(role: string): string[] {
    return [...(ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [])];
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole(USER_ROLES.ADMIN);
  }

  // Check if user is teacher
  isTeacher(): boolean {
    return this.hasRole(USER_ROLES.TEACHER);
  }

  // Check if user is student
  isStudent(): boolean {
    return this.hasRole(USER_ROLES.STUDENT);
  }
}
