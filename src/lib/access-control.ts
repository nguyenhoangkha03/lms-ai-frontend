import { User } from '@/types';
import { PermissionChecker, PERMISSIONS } from './permissions';

export class AccessControl {
  static canAccessDashboard(user: User, dashboardType: string): boolean {
    const checker = new PermissionChecker(
      user.permissions || [],
      user.roles || [user.userType]
    );

    switch (dashboardType) {
      case 'student':
        return checker.isStudent();
      case 'teacher':
        return checker.isTeacher();
      case 'admin':
        return checker.isAdmin();
      default:
        return false;
    }
  }

  static canManageCourse(user: User, course?: any): boolean {
    const checker = new PermissionChecker(
      user.permissions || [],
      user.roles || [user.userType]
    );

    // Admin can manage all courses
    if (checker.isAdmin()) {
      return true;
    }

    // Teacher can manage their own courses
    if (checker.isTeacher()) {
      return !course || course.teacherId === user.id;
    }

    return false;
  }

  static canGradeAssessment(user: User, assessment?: any): boolean {
    const checker = new PermissionChecker(
      user.permissions || [],
      user.roles || [user.userType]
    );

    if (checker.hasPermission(PERMISSIONS.ASSESSMENT_GRADE)) {
      // Admin can grade all assessments
      if (checker.isAdmin()) {
        return true;
      }

      // Teacher can grade assessments in their courses
      if (checker.isTeacher()) {
        return !assessment || assessment.teacherId === user.id;
      }
    }

    return false;
  }

  static canModerateContent(user: User): boolean {
    const checker = new PermissionChecker(
      user.permissions || [],
      user.roles || [user.userType]
    );

    return checker.hasPermission(PERMISSIONS.CONTENT_MODERATE);
  }

  static canAccessAnalytics(
    user: User,
    level: 'basic' | 'advanced' | 'system'
  ): boolean {
    const checker = new PermissionChecker(
      user.permissions || [],
      user.roles || [user.userType]
    );

    switch (level) {
      case 'basic':
        return checker.isStudent() || checker.isTeacher() || checker.isAdmin();
      case 'advanced':
        return checker.isTeacher() || checker.isAdmin();
      case 'system':
        return checker.hasPermission(PERMISSIONS.SYSTEM_ANALYTICS);
      default:
        return false;
    }
  }
}
