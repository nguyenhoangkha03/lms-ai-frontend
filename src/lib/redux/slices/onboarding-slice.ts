import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  OnboardingProgress,
  AssessmentResponse,
  LearningPreferences,
  AssessmentResult,
  LearningPath,
} from '../api/onboarding-api';

interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  isActive: boolean;
  isCompleted: boolean;

  assessmentStarted: boolean;
  assessmentInProgress: boolean;
  currentQuestionIndex: number;
  assessmentResponses: AssessmentResponse[];
  assessmentTimeRemaining: number;
  assessmentResult?: AssessmentResult;

  preferences?: LearningPreferences;
  preferencesStep:
    | 'learning-style'
    | 'schedule'
    | 'goals'
    | 'notifications'
    | 'completed';

  availablePaths: LearningPath[];
  selectedPath?: LearningPath;
  pathCustomization: Record<string, any>;

  showSkipDialog: boolean;
  isTransitioning: boolean;
  error?: string;

  stepStartTime: number;
  totalTimeSpent: number;
  stepTimeSpent: Record<number, number>;
}

const initialState: OnboardingState = {
  currentStep: 1,
  totalSteps: 5,
  isActive: false,
  isCompleted: false,

  assessmentStarted: false,
  assessmentInProgress: false,
  currentQuestionIndex: 0,
  assessmentResponses: [],
  assessmentTimeRemaining: 0,

  preferencesStep: 'learning-style',

  availablePaths: [],
  pathCustomization: {},

  showSkipDialog: false,
  isTransitioning: false,

  stepStartTime: Date.now(),
  totalTimeSpent: 0,
  stepTimeSpent: {},
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      const timeSpent = Date.now() - state.stepStartTime;
      state.stepTimeSpent[state.currentStep] = timeSpent;
      state.totalTimeSpent += timeSpent;

      state.currentStep = action.payload;
      state.stepStartTime = Date.now();
      state.error = undefined;
    },

    nextStep: state => {
      if (state.currentStep < state.totalSteps) {
        const timeSpent = Date.now() - state.stepStartTime;
        state.stepTimeSpent[state.currentStep] = timeSpent;
        state.totalTimeSpent += timeSpent;

        state.currentStep += 1;
        state.stepStartTime = Date.now();
      }
    },

    previousStep: state => {
      if (state.currentStep > 1) {
        const timeSpent = Date.now() - state.stepStartTime;
        state.stepTimeSpent[state.currentStep] = timeSpent;
        state.totalTimeSpent += timeSpent;

        state.currentStep -= 1;
        state.stepStartTime = Date.now();
      }
    },

    startAssessment: state => {
      state.assessmentStarted = true;
      state.assessmentInProgress = true;
      state.currentQuestionIndex = 0;
      state.assessmentResponses = [];
    },

    setAssessmentTimeRemaining: (state, action: PayloadAction<number>) => {
      state.assessmentTimeRemaining = action.payload;
    },

    answerAssessmentQuestion: (
      state,
      action: PayloadAction<AssessmentResponse>
    ) => {
      const { questionId } = action.payload;
      const existingIndex = state.assessmentResponses.findIndex(
        r => r.questionId === questionId
      );

      if (existingIndex >= 0) {
        state.assessmentResponses[existingIndex] = action.payload;
      } else {
        state.assessmentResponses.push(action.payload);
      }
    },

    setCurrentQuestionIndex: (state, action: PayloadAction<number>) => {
      state.currentQuestionIndex = action.payload;
    },

    completeAssessment: (state, action: PayloadAction<AssessmentResult>) => {
      state.assessmentInProgress = false;
      state.assessmentResult = action.payload;
    },

    setPreferencesStep: (
      state,
      action: PayloadAction<OnboardingState['preferencesStep']>
    ) => {
      state.preferencesStep = action.payload;
    },

    updatePreferences: (
      state,
      action: PayloadAction<Partial<LearningPreferences>>
    ) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      } as LearningPreferences;
    },

    setAvailablePaths: (state, action: PayloadAction<LearningPath[]>) => {
      state.availablePaths = action.payload;
    },

    selectLearningPath: (state, action: PayloadAction<LearningPath>) => {
      state.selectedPath = action.payload;
    },

    updatePathCustomization: (
      state,
      action: PayloadAction<Record<string, any>>
    ) => {
      state.pathCustomization = {
        ...state.pathCustomization,
        ...action.payload,
      };
    },

    setShowSkipDialog: (state, action: PayloadAction<boolean>) => {
      state.showSkipDialog = action.payload;
    },

    setIsTransitioning: (state, action: PayloadAction<boolean>) => {
      state.isTransitioning = action.payload;
    },

    setError: (state, action: PayloadAction<string | undefined>) => {
      state.error = action.payload;
    },

    setOnboardingActive: (state, action: PayloadAction<boolean>) => {
      state.isActive = action.payload;
      if (action.payload) {
        state.stepStartTime = Date.now();
      }
    },

    completeOnboarding: state => {
      state.isCompleted = true;
      state.isActive = false;

      const timeSpent = Date.now() - state.stepStartTime;
      state.stepTimeSpent[state.currentStep] = timeSpent;
      state.totalTimeSpent += timeSpent;
    },

    resetOnboarding: state => {
      return {
        ...initialState,
        stepStartTime: Date.now(),
      };
    },

    loadOnboardingProgress: (
      state,
      action: PayloadAction<OnboardingProgress>
    ) => {
      const progress = action.payload;
      state.currentStep = progress.currentStep;
      state.totalSteps = progress.totalSteps;
      state.isCompleted = progress.onboardingCompleted;
      state.isActive = !progress.onboardingCompleted;
    },
  },
});

export const {
  setCurrentStep,
  nextStep,
  previousStep,
  startAssessment,
  setAssessmentTimeRemaining,
  answerAssessmentQuestion,
  setCurrentQuestionIndex,
  completeAssessment,
  setPreferencesStep,
  updatePreferences,
  setAvailablePaths,
  selectLearningPath,
  updatePathCustomization,
  setShowSkipDialog,
  setIsTransitioning,
  setError,
  setOnboardingActive,
  completeOnboarding,
  resetOnboarding,
  loadOnboardingProgress,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
