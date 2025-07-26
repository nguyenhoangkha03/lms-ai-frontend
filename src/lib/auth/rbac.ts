export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'in'
    | 'not_in'
    | 'greater_than'
    | 'less_than'
    | 'contains';
  value: any;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  hierarchy: number;
  isSystem: boolean;
  conditions?: RoleCondition[];
}

export interface RoleCondition {
  field: string;
  operator: string;
  value: any;
}

export interface AccessContext {
  user: {
    id: string;
    userType: string;
    organizationId?: string;
    departmentId?: string;
    metadata?: Record<string, any>;
  };
  resource?: {
    id: string;
    type: string;
    ownerId?: string;
    organizationId?: string;
    metadata?: Record<string, any>;
  };
  environment?: {
    ip?: string;
    userAgent?: string;
    timestamp: Date;
    sessionId?: string;
  };
}

class RBACSystem {
  private static permissions: Map<string, Permission> = new Map();
  private static roles: Map<string, Role> = new Map();
  private static userRoles: Map<string, string[]> = new Map();

  static initialize(): void {
    this.setupDefaultPermissions();
    this.setupDefaultRoles();
  }

  private static setupDefaultPermissions(): void {
    const permissions: Permission[] = [
      // Course permissions
      {
        id: 'course.view',
        name: 'View Courses',
        description: 'View course content',
        resource: 'course',
        action: 'read',
      },
      {
        id: 'course.enroll',
        name: 'Enroll in Courses',
        description: 'Enroll in available courses',
        resource: 'course',
        action: 'enroll',
      },
      {
        id: 'course.create',
        name: 'Create Courses',
        description: 'Create new courses',
        resource: 'course',
        action: 'create',
      },
      {
        id: 'course.edit',
        name: 'Edit Courses',
        description: 'Edit course content',
        resource: 'course',
        action: 'update',
      },
      {
        id: 'course.delete',
        name: 'Delete Courses',
        description: 'Delete courses',
        resource: 'course',
        action: 'delete',
      },
      {
        id: 'course.publish',
        name: 'Publish Courses',
        description: 'Publish/unpublish courses',
        resource: 'course',
        action: 'publish',
      },

      // Assessment permissions
      {
        id: 'assessment.view',
        name: 'View Assessments',
        description: 'View assessment content',
        resource: 'assessment',
        action: 'read',
      },
      {
        id: 'assessment.take',
        name: 'Take Assessments',
        description: 'Take assessments and quizzes',
        resource: 'assessment',
        action: 'take',
      },
      {
        id: 'assessment.create',
        name: 'Create Assessments',
        description: 'Create new assessments',
        resource: 'assessment',
        action: 'create',
      },
      {
        id: 'assessment.edit',
        name: 'Edit Assessments',
        description: 'Edit assessment content',
        resource: 'assessment',
        action: 'update',
      },
      {
        id: 'assessment.delete',
        name: 'Delete Assessments',
        description: 'Delete assessments',
        resource: 'assessment',
        action: 'delete',
      },
      {
        id: 'assessment.grade',
        name: 'Grade Assessments',
        description: 'Grade and provide feedback',
        resource: 'assessment',
        action: 'grade',
      },

      {
        id: 'user.view',
        name: 'View Users',
        description: 'View user profiles',
        resource: 'user',
        action: 'read',
      },
      {
        id: 'user.create',
        name: 'Create Users',
        description: 'Create new user accounts',
        resource: 'user',
        action: 'create',
      },
      {
        id: 'user.edit',
        name: 'Edit Users',
        description: 'Edit user profiles',
        resource: 'user',
        action: 'update',
      },
      {
        id: 'user.delete',
        name: 'Delete Users',
        description: 'Delete user accounts',
        resource: 'user',
        action: 'delete',
      },
      {
        id: 'user.manage_roles',
        name: 'Manage User Roles',
        description: 'Assign/remove user roles',
        resource: 'user',
        action: 'manage_roles',
      },

      // Analytics permissions
      {
        id: 'analytics.view',
        name: 'View Analytics',
        description: 'View analytics and reports',
        resource: 'analytics',
        action: 'read',
      },
      {
        id: 'analytics.export',
        name: 'Export Analytics',
        description: 'Export analytics data',
        resource: 'analytics',
        action: 'export',
      },

      // System permissions
      {
        id: 'system.settings',
        name: 'System Settings',
        description: 'Manage system settings',
        resource: 'system',
        action: 'configure',
      },
      {
        id: 'system.backup',
        name: 'System Backup',
        description: 'Perform system backups',
        resource: 'system',
        action: 'backup',
      },
      {
        id: 'system.logs',
        name: 'View System Logs',
        description: 'View system audit logs',
        resource: 'system',
        action: 'logs',
      },

      // Communication permissions
      {
        id: 'chat.participate',
        name: 'Chat Participation',
        description: 'Participate in chat rooms',
        resource: 'chat',
        action: 'participate',
      },
      {
        id: 'chat.moderate',
        name: 'Chat Moderation',
        description: 'Moderate chat rooms',
        resource: 'chat',
        action: 'moderate',
      },
      {
        id: 'video.join',
        name: 'Join Video Sessions',
        description: 'Join video calls',
        resource: 'video',
        action: 'join',
      },
      {
        id: 'video.host',
        name: 'Host Video Sessions',
        description: 'Host and manage video calls',
        resource: 'video',
        action: 'host',
      },

      // AI features permissions
      {
        id: 'ai.recommendations',
        name: 'AI Recommendations',
        description: 'Access AI-powered recommendations',
        resource: 'ai',
        action: 'recommendations',
      },
      {
        id: 'ai.tutor',
        name: 'AI Tutor',
        description: 'Access AI tutoring features',
        resource: 'ai',
        action: 'tutor',
      },
      {
        id: 'ai.analytics',
        name: 'AI Analytics',
        description: 'Access AI-powered analytics',
        resource: 'ai',
        action: 'analytics',
      },
    ];

    permissions.forEach(permission => {
      this.permissions.set(permission.id, permission);
    });
  }

  /**
   * Setup default roles for LMS system
   */
  private static setupDefaultRoles(): void {
    const roles: Role[] = [
      {
        id: 'student',
        name: 'Student',
        description: 'Regular student with learning access',
        hierarchy: 1,
        isSystem: true,
        permissions: [
          'course.view',
          'course.enroll',
          'assessment.view',
          'assessment.take',
          'analytics.view',
          'chat.participate',
          'video.join',
          'ai.recommendations',
          'ai.tutor',
        ],
      },
      {
        id: 'teacher',
        name: 'Teacher',
        description: 'Teacher with course creation and management access',
        hierarchy: 2,
        isSystem: true,
        permissions: [
          'course.view',
          'course.create',
          'course.edit',
          'course.publish',
          'assessment.view',
          'assessment.create',
          'assessment.edit',
          'assessment.grade',
          'user.view',
          'analytics.view',
          'analytics.export',
          'chat.participate',
          'chat.moderate',
          'video.join',
          'video.host',
          'ai.recommendations',
          'ai.tutor',
          'ai.analytics',
        ],
      },
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Full system administrator access',
        hierarchy: 3,
        isSystem: true,
        permissions: [
          'course.view',
          'course.create',
          'course.edit',
          'course.delete',
          'course.publish',
          'assessment.view',
          'assessment.create',
          'assessment.edit',
          'assessment.delete',
          'assessment.grade',
          'user.view',
          'user.create',
          'user.edit',
          'user.delete',
          'user.manage_roles',
          'analytics.view',
          'analytics.export',
          'system.settings',
          'system.backup',
          'system.logs',
          'chat.participate',
          'chat.moderate',
          'video.join',
          'video.host',
          'ai.recommendations',
          'ai.tutor',
          'ai.analytics',
        ],
      },
    ];

    roles.forEach(role => {
      this.roles.set(role.id, role);
    });
  }

  /**
   * Check if user has permission for a specific action
   */
  static hasPermission(
    userId: string,
    permissionId: string,
    context?: AccessContext
  ): boolean {
    const userRoles = this.getUserRoles(userId);
    const permission = this.permissions.get(permissionId);

    if (!permission) {
      console.warn(`Permission ${permissionId} not found`);
      return false;
    }

    // Check if any of user's roles has the permission
    for (const roleId of userRoles) {
      const role = this.roles.get(roleId);
      if (role && role.permissions.includes(permissionId)) {
        // Check role conditions if they exist
        if (
          role.conditions &&
          !this.evaluateConditions(role.conditions, context)
        ) {
          continue;
        }

        // Check permission conditions if they exist
        if (
          permission.conditions &&
          !this.evaluateConditions(permission.conditions, context)
        ) {
          continue;
        }

        return true;
      }
    }

    return false;
  }

  static hasAnyPermission(
    userId: string,
    permissionIds: string[],
    context?: AccessContext
  ): boolean {
    return permissionIds.some(permissionId =>
      this.hasPermission(userId, permissionId, context)
    );
  }

  static hasAllPermissions(
    userId: string,
    permissionIds: string[],
    context?: AccessContext
  ): boolean {
    return permissionIds.every(permissionId =>
      this.hasPermission(userId, permissionId, context)
    );
  }

  static hasRole(userId: string, roleId: string): boolean {
    const userRoles = this.getUserRoles(userId);
    return userRoles.includes(roleId);
  }

  static hasAnyRole(userId: string, roleIds: string[]): boolean {
    const userRoles = this.getUserRoles(userId);
    return roleIds.some(roleId => userRoles.includes(roleId));
  }

  static canAccessResource(
    userId: string,
    resource: string,
    action: string,
    context?: AccessContext
  ): boolean {
    const relevantPermissions = Array.from(this.permissions.values())
      .filter(p => p.resource === resource && p.action === action)
      .map(p => p.id);

    return this.hasAnyPermission(userId, relevantPermissions, context);
  }

  static getUserRoles(userId: string): string[] {
    return this.userRoles.get(userId) || [];
  }

  /**
   * Set user roles
   */
  static setUserRoles(userId: string, roleIds: string[]): void {
    // Validate roles exist
    const validRoles = roleIds.filter(roleId => this.roles.has(roleId));
    this.userRoles.set(userId, validRoles);
  }

  /**
   * Add role to user
   */
  static addUserRole(userId: string, roleId: string): void {
    if (!this.roles.has(roleId)) {
      throw new Error(`Role ${roleId} does not exist`);
    }

    const currentRoles = this.getUserRoles(userId);
    if (!currentRoles.includes(roleId)) {
      this.userRoles.set(userId, [...currentRoles, roleId]);
    }
  }

  static removeUserRole(userId: string, roleId: string): void {
    const currentRoles = this.getUserRoles(userId);
    const updatedRoles = currentRoles.filter(role => role !== roleId);
    this.userRoles.set(userId, updatedRoles);
  }

  static getUserPermissions(userId: string): string[] {
    const userRoles = this.getUserRoles(userId);
    const permissions = new Set<string>();

    userRoles.forEach(roleId => {
      const role = this.roles.get(roleId);
      if (role) {
        role.permissions.forEach(permission => permissions.add(permission));
      }
    });

    return Array.from(permissions);
  }

  static hasRoleHierarchy(userId: string, requiredHierarchy: number): boolean {
    const userRoles = this.getUserRoles(userId);
    const maxHierarchy = Math.max(
      ...userRoles.map(roleId => {
        const role = this.roles.get(roleId);
        return role ? role.hierarchy : 0;
      }),
      0
    );

    return maxHierarchy >= requiredHierarchy;
  }

  private static evaluateConditions(
    conditions: (PermissionCondition | RoleCondition)[],
    context?: AccessContext
  ): boolean {
    if (!context) return true;

    return conditions.every(condition => {
      const value = this.getContextValue(condition.field, context);
      return this.evaluateCondition(value, condition.operator, condition.value);
    });
  }

  private static getContextValue(field: string, context: AccessContext): any {
    const parts = field.split('.');
    let value: any = context;

    for (const part of parts) {
      value = value?.[part];
    }

    return value;
  }

  private static evaluateCondition(
    actualValue: any,
    operator: string,
    expectedValue: any
  ): boolean {
    switch (operator) {
      case 'equals':
        return actualValue === expectedValue;
      case 'not_equals':
        return actualValue !== expectedValue;
      case 'in':
        return (
          Array.isArray(expectedValue) && expectedValue.includes(actualValue)
        );
      case 'not_in':
        return (
          Array.isArray(expectedValue) && !expectedValue.includes(actualValue)
        );
      case 'greater_than':
        return actualValue > expectedValue;
      case 'less_than':
        return actualValue < expectedValue;
      case 'contains':
        return String(actualValue).includes(String(expectedValue));
      default:
        console.warn(`Unknown operator: ${operator}`);
        return false;
    }
  }

  static getAllPermissions(): Permission[] {
    return Array.from(this.permissions.values());
  }

  static getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  static getPermissionsByResource(resource: string): Permission[] {
    return Array.from(this.permissions.values()).filter(
      permission => permission.resource === resource
    );
  }

  static createPermission(permission: Permission): void {
    this.permissions.set(permission.id, permission);
  }

  static createRole(role: Role): void {
    const validPermissions = role.permissions.filter(permissionId =>
      this.permissions.has(permissionId)
    );

    if (validPermissions.length !== role.permissions.length) {
      console.warn('Some permissions in role do not exist');
    }

    this.roles.set(role.id, { ...role, permissions: validPermissions });
  }

  static generateAccessReport(userId: string): {
    roles: Role[];
    permissions: Permission[];
    resourceAccess: Record<string, string[]>;
  } {
    const userRoles = this.getUserRoles(userId)
      .map(roleId => this.roles.get(roleId)!)
      .filter(Boolean);
    const userPermissions = this.getUserPermissions(userId)
      .map(permissionId => this.permissions.get(permissionId)!)
      .filter(Boolean);

    const resourceAccess: Record<string, string[]> = {};
    userPermissions.forEach(permission => {
      if (!resourceAccess[permission.resource]) {
        resourceAccess[permission.resource] = [];
      }
      resourceAccess[permission.resource].push(permission.action);
    });

    return {
      roles: userRoles,
      permissions: userPermissions,
      resourceAccess,
    };
  }
}

RBACSystem.initialize();

export { RBACSystem };
