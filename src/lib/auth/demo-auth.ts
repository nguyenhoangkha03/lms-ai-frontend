import { PERMISSIONS } from './permissions';

export const DEMO_USERS = {
  student: {
    id: 'demo-student-1',
    email: 'student@demo.com',
    userType: 'student',
    firstName: 'John',
    lastName: 'Student',
    permissions: [],
    roles: ['student'],
  },
  teacher: {
    id: 'demo-teacher-1',
    email: 'teacher@demo.com',
    userType: 'teacher',
    firstName: 'Jane',
    lastName: 'Teacher',
    permissions: ['course:create', 'course:update', 'assessment:grade'],
    roles: ['teacher'],
  },
  admin: {
    id: 'demo-admin-1',
    email: 'admin@demo.com',
    userType: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    permissions: Object.values(PERMISSIONS),
    roles: ['admin'],
  },
} as const;

export function createDemoToken(userType: keyof typeof DEMO_USERS): string {
  const user = DEMO_USERS[userType];
  const payload = {
    sub: user.id,
    email: user.email,
    userType: user.userType,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  };

  // In a real app, this would be properly signed
  return btoa(JSON.stringify(payload));
}
