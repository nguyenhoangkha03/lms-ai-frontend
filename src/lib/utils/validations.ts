import { z } from 'zod';
import { VALIDATION_RULES } from '@/constants';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(VALIDATION_RULES.email.maxLength, 'Email too long'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(VALIDATION_RULES.password.minLength, 'Password too short'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name too long'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name too long'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email format')
      .max(VALIDATION_RULES.email.maxLength, 'Email too long'),
    password: z
      .string()
      .min(VALIDATION_RULES.password.minLength, 'Password too short')
      .max(VALIDATION_RULES.password.maxLength, 'Password too long')
      .regex(
        VALIDATION_RULES.password.pattern,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    userType: z.enum(['student', 'teacher']),
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    password: z
      .string()
      .min(VALIDATION_RULES.password.minLength, 'Password too short')
      .regex(
        VALIDATION_RULES.password.pattern,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Profile validation schemas
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name too long'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long'),
  displayName: z.string().max(100, 'Display name too long').optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  phone: z
    .string()
    .regex(VALIDATION_RULES.phone.pattern, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  organization: z.string().max(255, 'Organization name too long').optional(),
  jobTitle: z.string().max(255, 'Job title too long').optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(VALIDATION_RULES.password.minLength, 'Password too short')
      .regex(
        VALIDATION_RULES.password.pattern,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Course validation schemas
export const createCourseSchema = z.object({
  title: z
    .string()
    .min(1, 'Course title is required')
    .max(255, 'Title too long'),
  description: z
    .string()
    .min(1, 'Course description is required')
    .max(5000, 'Description too long'),
  shortDescription: z
    .string()
    .max(500, 'Short description too long')
    .optional(),
  categoryId: z.string().min(1, 'Category is required'),
  level: z.enum([
    'beginner',
    'intermediate',
    'advanced',
    'expert',
    'all_levels',
  ]),
  language: z.string().min(1, 'Language is required'),
  price: z.number().min(0, 'Price cannot be negative'),
  isFree: z.boolean(),
  tags: z.array(z.string()).max(10, 'Too many tags'),
  requirements: z.array(z.string()).max(20, 'Too many requirements'),
  whatYouWillLearn: z.array(z.string()).max(20, 'Too many learning outcomes'),
  targetAudience: z.array(z.string()).max(10, 'Too many target audiences'),
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type CreateCourseFormData = z.infer<typeof createCourseSchema>;
