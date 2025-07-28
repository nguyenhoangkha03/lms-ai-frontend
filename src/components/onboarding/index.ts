export { OnboardingLayout } from './onboarding-layout';

// Step components
export { WelcomeStep } from './steps/welcome-step';
export { SkillAssessmentStep } from './steps/skill-assessment-step';
export { PreferencesSetupStep } from './steps/preferences-setup-step';
export { LearningPathSelectionStep } from './steps/learning-path-selection-step';
export { WelcomeDashboardStep } from './steps/welcome-dashboard-step';

// Types
export type {
  OnboardingStep,
  SkillAssessment,
  AssessmentQuestion,
  AssessmentResponse,
  AssessmentResult,
  LearningPreferences,
  LearningPath,
  LearningPathCourse,
  OnboardingProgress,
} from '@/lib/redux/api/onboarding-api';
