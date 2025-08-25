import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  OnboardingProgress,
  AssessmentResponse,
  LearningPreferences,
  AssessmentResult,
  LearningPath,
} from '../api/onboarding-api';

interface OnboardingState {
  // Core navigation
  currentStep: number;
  totalSteps: number;
  isActive: boolean;
  isCompleted: boolean;
  isLoading: boolean;
  error?: string;

  // Category selection
  selectedCategory?: string;
  customizedAssessment: boolean;

  // Assessment data
  assessmentStarted: boolean;
  assessmentInProgress: boolean;
  currentQuestionIndex: number;
  assessmentResponses: AssessmentResponse[];
  assessmentTimeRemaining: number;
  assessmentResult?: AssessmentResult;

  // Preferences data - flattened, no sub-steps
  preferences?: LearningPreferences;

  // Learning paths
  availablePaths: LearningPath[];
  selectedPath?: LearningPath;

  // UI state
  showSkipDialog: boolean;

  // Analytics
  stepStartTime: number;
  totalTimeSpent: number;
  stepTimeSpent: Record<number, number>;
}

const initialState: OnboardingState = {
  // Core navigation
  currentStep: 1,
  totalSteps: 5, // Updated to 5 steps: Welcome → Category → Assessment → Preferences → Learning Path
  isActive: false,
  isCompleted: false,
  isLoading: false,

  // Category selection
  customizedAssessment: false,

  // Assessment
  assessmentStarted: false,
  assessmentInProgress: false,
  currentQuestionIndex: 0,
  assessmentResponses: [],
  assessmentTimeRemaining: 0,

  // Learning paths
  availablePaths: [],

  // UI state
  showSkipDialog: false,

  // Analytics
  stepStartTime: Date.now(),
  totalTimeSpent: 0,
  stepTimeSpent: {},
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    // Simplified navigation - single source of truth
    setCurrentStep: (state, action: PayloadAction<number>) => {
      const timeSpent = Date.now() - state.stepStartTime;
      state.stepTimeSpent[state.currentStep] = timeSpent;
      state.totalTimeSpent += timeSpent;

      state.currentStep = Math.min(Math.max(1, action.payload), state.totalSteps);
      state.stepStartTime = Date.now();
      state.error = undefined;
      state.isLoading = false;
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

    // Loading state management
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | undefined>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Assessment actions - simplified
    startAssessment: state => {
      state.assessmentStarted = true;
      state.assessmentInProgress = true;
      state.currentQuestionIndex = 0;
      state.assessmentResponses = [];
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

    setAssessmentTimeRemaining: (state, action: PayloadAction<number>) => {
      state.assessmentTimeRemaining = action.payload;
    },

    // Preferences actions - flattened
    updatePreferences: (
      state,
      action: PayloadAction<Partial<LearningPreferences>>
    ) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      } as LearningPreferences;
    },

    // Learning path actions
    setAvailablePaths: (state, action: PayloadAction<LearningPath[]>) => {
      state.availablePaths = action.payload;
    },

    selectLearningPath: (state, action: PayloadAction<LearningPath>) => {
      state.selectedPath = action.payload;
    },

    // Category selection actions
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
      state.customizedAssessment = true;
      state.error = undefined;
    },

    resetCategorySelection: (state) => {
      state.selectedCategory = undefined;
      state.customizedAssessment = false;
    },

    // UI actions
    setShowSkipDialog: (state, action: PayloadAction<boolean>) => {
      state.showSkipDialog = action.payload;
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

    // Load progress from API
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
  setLoading,
  setError,
  setSelectedCategory,
  resetCategorySelection,
  startAssessment,
  answerAssessmentQuestion,
  setCurrentQuestionIndex,
  completeAssessment,
  setAssessmentTimeRemaining,
  updatePreferences,
  setAvailablePaths,
  selectLearningPath,
  setShowSkipDialog,
  setOnboardingActive,
  completeOnboarding,
  resetOnboarding,
  loadOnboardingProgress,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
