import { baseApi } from '@/lib/api/base-api';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  stepNumber: number;
}

export interface SkillAssessment {
  id: string;
  title: string;
  description: string;
  questions: AssessmentQuestion[];
  timeLimit: number;
  totalQuestions: number;
  categoryId?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  color?: string;
  courseCount: number;
}

export interface AssessmentQuestion {
  id: string;
  questionText: string;
  type: 'multiple_choice' | 'true_false' | 'scale_rating' | 'text_input';
  hint?: string;
  options?: string[];
  required: boolean;
  category: string;
  skillArea: string;
}

export interface AssessmentResponse {
  questionId: string;
  answer: string | number | string[];
  timeSpent: number;
}

export interface AssessmentResult {
  id: string;
  studentId: string;
  assessmentId: string;
  responses: AssessmentResponse[];
  skillScores: Record<string, number>;
  overallScore: number;
  recommendations: string[];
  completedAt: string;
}

export interface LearningPreferences {
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  studyTimePreference: 'morning' | 'afternoon' | 'evening' | 'night';
  sessionDuration: 15 | 30 | 45 | 60 | 90;
  difficultyPreference: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  notificationPreferences: {
    email: boolean;
    push: boolean;
    reminders: boolean;
    achievements: boolean;
  };
  goals: string[];
  interests: string[];
  availableHoursPerWeek: number;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: string;
  courses: LearningPathCourse[];
  skills: string[];
  prerequisites: string[];
  isRecommended: boolean;
  aiConfidence: number;
}

export interface LearningPathCourse {
  id: string;
  title: string;
  description: string;
  duration: string;
  order: number;
  isRequired: boolean;
}

export interface OnboardingProgress {
  studentId: string;
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  skillAssessmentCompleted: boolean;
  preferencesSetup: boolean;
  learningPathSelected: boolean;
  onboardingCompleted: boolean;
  completedAt?: string;
}

export const onboardingApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getOnboardingProgress: builder.query<OnboardingProgress, void>({
      query: () => '/onboarding/progress',
      providesTags: ['OnboardingProgress'],
    }),

    updateOnboardingProgress: builder.mutation<
      OnboardingProgress,
      { step: number; data?: any }
    >({
      query: ({ step, data }) => ({
        url: '/onboarding/progress',
        method: 'PUT',
        body: { step, data },
      }),
      invalidatesTags: ['OnboardingProgress'],
    }),

    getRootCategories: builder.query<{ success: boolean; categories: Category[] }, void>({
      query: () => '/categories/root-categories',
      providesTags: ['Categories'],
      transformResponse: (response: { success: boolean; categories: Category[] }) => response,
    }),

    getSkillAssessment: builder.query<SkillAssessment, void>({
      query: () => '/onboarding/skill-assessment',
      providesTags: ['SkillAssessment'],
    }),

    getSkillAssessmentByCategory: builder.query<SkillAssessment, string>({
      query: (categoryId) => `/onboarding/skill-assessment/${categoryId}`,
      providesTags: ['SkillAssessment'],
    }),

    submitSkillAssessment: builder.mutation<
      AssessmentResult,
      { responses: AssessmentResponse[]; categoryId?: string }
    >({
      query: ({ responses, categoryId }) => ({
        url: '/onboarding/skill-assessment/submit',
        method: 'POST',
        body: { responses, categoryId },
      }),
      invalidatesTags: ['AssessmentResult', 'OnboardingProgress'],
    }),

    getAssessmentResult: builder.query<AssessmentResult, string>({
      query: id => `/onboarding/skill-assessment/result/${id}`,
      providesTags: ['AssessmentResult'],
    }),

    saveLearningPreferences: builder.mutation<
      LearningPreferences,
      Partial<LearningPreferences>
    >({
      query: preferences => ({
        url: '/onboarding/preferences',
        method: 'POST',
        body: preferences,
      }),
      invalidatesTags: ['Preferences', 'OnboardingProgress'],
    }),

    getLearningPreferences: builder.query<LearningPreferences, void>({
      query: () => '/onboarding/preferences',
      providesTags: ['Preferences'],
    }),

    getRecommendedLearningPaths: builder.query<LearningPath[], void>({
      query: () => '/onboarding/learning-paths/recommended',
      providesTags: ['LearningPath'],
    }),

    getAllLearningPaths: builder.query<LearningPath[], void>({
      query: () => '/onboarding/learning-paths',
      providesTags: ['LearningPath'],
    }),

    selectLearningPath: builder.mutation<
      { success: boolean; enrolledCourses: string[] },
      { pathId: string; customization?: any }
    >({
      query: ({ pathId, customization }) => ({
        url: '/onboarding/learning-paths/select',
        method: 'POST',
        body: { pathId, customization },
      }),
      invalidatesTags: ['LearningPath', 'OnboardingProgress'],
    }),

    completeOnboarding: builder.mutation<
      { success: boolean; redirectUrl: string },
      void
    >({
      query: () => ({
        url: '/onboarding/complete',
        method: 'POST',
      }),
      invalidatesTags: ['OnboardingProgress'],
    }),

    skipOnboardingStep: builder.mutation<
      OnboardingProgress,
      { step: number; reason?: string }
    >({
      query: ({ step, reason }) => ({
        url: '/onboarding/skip-step',
        method: 'POST',
        body: { step, reason },
      }),
      invalidatesTags: ['OnboardingProgress'],
    }),
  }),
});

export const {
  useGetOnboardingProgressQuery,
  useUpdateOnboardingProgressMutation,
  useGetRootCategoriesQuery,
  useGetSkillAssessmentQuery,
  useGetSkillAssessmentByCategoryQuery,
  useSubmitSkillAssessmentMutation,
  useGetAssessmentResultQuery,
  useSaveLearningPreferencesMutation,
  useGetLearningPreferencesQuery,
  useGetRecommendedLearningPathsQuery,
  useGetAllLearningPathsQuery,
  useSelectLearningPathMutation,
  useCompleteOnboardingMutation,
  useSkipOnboardingStepMutation,
} = onboardingApi;
