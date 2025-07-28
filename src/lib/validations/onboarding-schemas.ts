import { z } from 'zod';

export const learningPreferencesSchema = z.object({
  preferredLearningStyle: z.enum([
    'visual',
    'auditory',
    'kinesthetic',
    'reading',
  ]),
  studyTimePreference: z.enum(['morning', 'afternoon', 'evening', 'night']),
  sessionDuration: z
    .number()
    .min(15, { message: 'Session duration must be at least 15 minutes' })
    .max(120, { message: 'Session duration must be no more than 120 minutes' }),
  difficultyPreference: z.enum([
    'beginner',
    'intermediate',
    'advanced',
    'mixed',
  ]),
  notificationPreferences: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    reminders: z.boolean().default(true),
    achievements: z.boolean().default(true),
  }),
  goals: z.array(z.string()).min(1, {
    message: 'Please select at least one learning goal',
  }),
  interests: z.array(z.string()).min(1, {
    message: 'Please select at least one area of interest',
  }),
  availableHoursPerWeek: z.number().min(1).max(40, {
    message: 'Available hours must be between 1 and 40 per week',
  }),
});

export const assessmentResponseSchema = z.object({
  questionId: z.string(),
  answer: z.union([z.string(), z.number(), z.array(z.string())]),
  timeSpent: z.number().min(0),
});

export const pathCustomizationSchema = z.object({
  skipCourses: z.array(z.string()).optional(),
  prioritizeCourses: z.array(z.string()).optional(),
  additionalSkills: z.array(z.string()).optional(),
  targetCompletionDate: z.string().optional(),
  studyIntensity: z.enum(['light', 'moderate', 'intensive']).optional(),
});

export type LearningPreferencesFormData = z.infer<
  typeof learningPreferencesSchema
>;
export type AssessmentResponseFormData = z.infer<
  typeof assessmentResponseSchema
>;
export type PathCustomizationFormData = z.infer<typeof pathCustomizationSchema>;
