import z from 'zod';

export const courseSchema = z.object({
  title: z
    .string()
    .min(1, 'Course title is required')
    .min(5, 'Course title must be at least 5 characters')
    .max(200, 'Course title is too long'),
  description: z
    .string()
    .min(1, 'Course description is required')
    .min(50, 'Course description must be at least 50 characters')
    .max(2000, 'Course description is too long'),
  shortDescription: z
    .string()
    .min(1, 'Short description is required')
    .max(300, 'Short description is too long'),
  categoryId: z.string().min(1, 'Please select a category'),
  subcategoryId: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced'], {
    message: 'Please select a difficulty level',
  }),
  language: z.string().min(1, 'Please select a language'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  currency: z.string().default('USD'),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed'),
  thumbnail: z.instanceof(File).optional(),
  previewVideo: z.instanceof(File).optional(),
  duration: z.number().min(1, 'Course duration is required'),
  objectives: z
    .array(z.string().min(1))
    .min(1, 'At least one objective is required'),
  requirements: z.array(z.string()).optional(),
  targetAudience: z.array(z.string()).optional(),
  isPublished: z.boolean().default(false),
  allowEnrollment: z.boolean().default(true),
  certificateEnabled: z.boolean().default(true),
});

export const lessonSchema = z.object({
  title: z
    .string()
    .min(1, 'Lesson title is required')
    .max(200, 'Lesson title is too long'),
  description: z.string().optional(),
  type: z.enum(['video', 'text', 'quiz', 'assignment'], {
    message: 'Please select a lesson type',
  }),
  content: z.string().optional(),
  videoFile: z.instanceof(File).optional(),
  videoUrl: z.string().url().optional(),
  duration: z.number().min(1, 'Lesson duration is required'),
  order: z.number().min(0),
  isPreview: z.boolean().default(false),
  attachments: z.array(z.instanceof(File)).optional(),
  transcription: z.string().optional(),
});

export const sectionSchema = z.object({
  title: z
    .string()
    .min(1, 'Section title is required')
    .max(200, 'Section title is too long'),
  description: z.string().optional(),
  order: z.number().min(0),
  lessons: z.array(lessonSchema).optional(),
});

export const assessmentSchema = z.object({
  title: z
    .string()
    .min(1, 'Assessment title is required')
    .max(200, 'Assessment title is too long'),
  description: z.string().optional(),
  type: z.enum(['quiz', 'assignment', 'exam'], {
    message: 'Please select an assessment type',
  }),
  timeLimit: z.number().min(1, 'Time limit must be at least 1 minute'),
  maxAttempts: z.number().min(1, 'Maximum attempts must be at least 1'),
  passingScore: z
    .number()
    .min(0)
    .max(100, 'Passing score must be between 0 and 100'),
  isRandomized: z.boolean().default(false),
  showResults: z.boolean().default(true),
  allowReview: z.boolean().default(true),
});

export const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  type: z.enum(['multiple_choice', 'true_false', 'short_answer', 'essay'], {
    message: 'Please select a question type',
  }),
  points: z.number().min(1, 'Points must be at least 1'),
  explanation: z.string().optional(),
  options: z
    .array(
      z.object({
        text: z.string().min(1, 'Option text is required'),
        isCorrect: z.boolean(),
      })
    )
    .optional(),
  correctAnswer: z.string().optional(),
});

export type CourseFormData = z.infer<typeof courseSchema>;
export type LessonFormData = z.infer<typeof lessonSchema>;
export type SectionFormData = z.infer<typeof sectionSchema>;
export type AssessmentFormData = z.infer<typeof assessmentSchema>;
export type QuestionFormData = z.infer<typeof questionSchema>;
