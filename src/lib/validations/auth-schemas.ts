import { z } from 'zod';

export const emailValidation = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(254, 'Email is too long');

export const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

export const confirmPasswordValidation = (_passwordField: string) =>
  z.string().min(1, 'Please confirm your password');

export const loginSchema = z.object({
  email: emailValidation,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name is too long')
      .regex(/^[a-zA-Z\s]*$/, 'First name can only contain letters and spaces'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name is too long')
      .regex(/^[a-zA-Z\s]*$/, 'Last name can only contain letters and spaces'),
    email: emailValidation,
    password: passwordValidation,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['student', 'teacher', 'admin'], {
      message: 'Please select a role',
    }),
    acceptTerms: z
      .boolean()
      .refine(val => val === true, 'You must accept the terms and conditions'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailValidation,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordValidation,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordValidation,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const twoFactorSchema = z.object({
  code: z
    .string()
    .length(6, 'Two-factor code must be 6 digits')
    .regex(/^\d+$/, 'Two-factor code must contain only numbers'),
});

export const teacherApplicationSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    email: emailValidation,
    phone: z
      .string()
      .min(10, 'Phone number must be at least 10 digits')
      .regex(
        /^[+]?[\s./0-9]*[(]?[0-9]*[)]?[-\s./0-9]*$/g,
        'Invalid phone number'
      ),
    dateOfBirth: z.date({
      message: 'Date of birth is required',
    }),
  }),
  professionalInfo: z.object({
    education: z.string().min(1, 'Education background is required'),
    experience: z.string().min(1, 'Teaching experience is required'),
    specialization: z
      .array(z.string())
      .min(1, 'At least one specialization is required'),
    resume: z.instanceof(File, { message: 'Resume file is required' }),
    certifications: z.array(z.instanceof(File)).optional(),
  }),
  verification: z.object({
    identityDocument: z.instanceof(File, {
      message: 'Identity document is required',
    }),
    teachingLicense: z.instanceof(File, {
      message: 'Teaching license is required',
    }),
  }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type TwoFactorFormData = z.infer<typeof twoFactorSchema>;
export type TeacherApplicationFormData = z.infer<
  typeof teacherApplicationSchema
>;
