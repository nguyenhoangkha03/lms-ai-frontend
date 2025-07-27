import z from 'zod';
import { emailValidation } from './auth-schemas';

export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: emailValidation,
  phone: z.string().optional(),
  dateOfBirth: z.date().optional(),
  bio: z.string().max(500, 'Bio is too long').optional(),
  website: z.string().url('Invalid website URL').optional(),
  location: z.string().max(100, 'Location is too long').optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  avatar: z.instanceof(File).optional(),
});

export const studentProfileSchema = profileSchema.extend({
  interests: z.array(z.string()).optional(),
  learningGoals: z.array(z.string()).optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  preferredLearningStyle: z
    .enum(['visual', 'auditory', 'kinesthetic', 'reading'])
    .optional(),
});

export const teacherProfileSchema = profileSchema.extend({
  expertise: z
    .array(z.string())
    .min(1, 'At least one area of expertise is required'),
  experience: z.string().min(1, 'Teaching experience is required'),
  education: z.string().min(1, 'Education background is required'),
  certifications: z.array(z.string()).optional(),
  socialMedia: z
    .object({
      linkedin: z.string().url().optional(),
      twitter: z.string().url().optional(),
      youtube: z.string().url().optional(),
    })
    .optional(),
});

export const notificationPreferencesSchema = z.object({
  email: z.object({
    courseUpdates: z.boolean().default(true),
    assignments: z.boolean().default(true),
    messages: z.boolean().default(true),
    promotions: z.boolean().default(false),
  }),
  push: z.object({
    courseUpdates: z.boolean().default(true),
    assignments: z.boolean().default(true),
    messages: z.boolean().default(true),
    promotions: z.boolean().default(false),
  }),
  sms: z.object({
    important: z.boolean().default(false),
    reminders: z.boolean().default(false),
  }),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type StudentProfileFormData = z.infer<typeof studentProfileSchema>;
export type TeacherProfileFormData = z.infer<typeof teacherProfileSchema>;
export type NotificationPreferencesFormData = z.infer<
  typeof notificationPreferencesSchema
>;
