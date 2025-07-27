import z from 'zod';
import { emailValidation } from './auth-schemas';

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  category: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  priceRange: z
    .object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional(),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z
    .enum(['relevance', 'newest', 'price_low', 'price_high', 'rating'])
    .optional(),
});

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: emailValidation,
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000),
  department: z
    .enum(['general', 'technical', 'billing', 'partnerships'])
    .optional(),
});

export const feedbackSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5),
  title: z.string().min(1, 'Review title is required').max(100),
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000),
  recommend: z.boolean().optional(),
});

export type SearchFormData = z.infer<typeof searchSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type FeedbackFormData = z.infer<typeof feedbackSchema>;
