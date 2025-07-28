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
  rememberMe: z.boolean(),
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
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    country: z.string().min(1, 'Please select your country'),
    timezone: z.string().min(1, 'Please select your timezone'),
  }),
  education: z.object({
    highestDegree: z.string().min(1, 'Please select your highest degree'),
    fieldOfStudy: z.string().min(1, 'Field of study is required'),
    institution: z.string().min(1, 'Institution is required'),
    graduationYear: z.string().min(1, 'Graduation year is required'),
    additionalCertifications: z.string().optional(),
  }),
  experience: z.object({
    teachingExperience: z
      .string()
      .min(1, 'Please select your experience level'),
    subjectAreas: z
      .array(z.string())
      .min(1, 'Please select at least one subject area'),
    previousInstitutions: z.string().optional(),
    onlineTeachingExperience: z.boolean().default(false),
    totalStudentsTaught: z.string().optional(),
  }),
  motivation: z.object({
    whyTeach: z.string().min(50, 'Please provide at least 50 characters'),
    teachingPhilosophy: z
      .string()
      .min(50, 'Please provide at least 50 characters'),
    specialSkills: z.string().optional(),
    courseIdeas: z.string().optional(),
  }),
  availability: z.object({
    hoursPerWeek: z.string().optional(),
    preferredSchedule: z.array(z.string()).optional(),
    startDate: z.string().optional(),
  }),
  documents: z.object({
    resumeUploaded: z
      .boolean()
      .refine(val => val === true, 'Resume is required'),
    degreeUploaded: z
      .boolean()
      .refine(val => val === true, 'Degree certificate is required'),
    certificationUploaded: z.boolean().optional(),
    idUploaded: z
      .boolean()
      .refine(val => val === true, 'Government ID is required'),
  }),
  agreements: z.object({
    termsAccepted: z
      .boolean()
      .refine(val => val === true, 'You must accept the terms'),
    backgroundCheckConsent: z
      .boolean()
      .refine(val => val === true, 'Background check consent is required'),
    communicationConsent: z.boolean().default(true),
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
