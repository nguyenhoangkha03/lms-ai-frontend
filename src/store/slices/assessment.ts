import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Assessment, Question, AssessmentAttempt } from '@/types';

interface AssessmentState {
  assessments: Assessment[];
  currentAssessment: Assessment | null;
  attempts: AssessmentAttempt[];
  currentAttempt: AssessmentAttempt | null;
  answers: Record<string, any>;
  timeRemaining: number;
  isSubmitting: boolean;
  isLoading: boolean;
  error: string | null;
  currentQuestionIndex: number;
  flaggedQuestions: string[];
  reviewMode: boolean;
}

const initialState: AssessmentState = {
  assessments: [],
  currentAssessment: null,
  attempts: [],
  currentAttempt: null,
  answers: {},
  timeRemaining: 0,
  isSubmitting: false,
  isLoading: false,
  error: null,
  currentQuestionIndex: 0,
  flaggedQuestions: [],
  reviewMode: false,
};

const assessmentSlice = createSlice({
  name: 'assessment',
  initialState,
  reducers: {
    setAssessments: (state, action: PayloadAction<Assessment[]>) => {
      state.assessments = action.payload;
      state.error = null;
    },

    setCurrentAssessment: (state, action: PayloadAction<Assessment | null>) => {
      state.currentAssessment = action.payload;
      state.answers = {};
      state.currentQuestionIndex = 0;
      state.flaggedQuestions = [];
      state.reviewMode = false;

      if (action.payload) {
        state.timeRemaining = (action.payload.timeLimit || 0) * 60; // Convert to seconds
      }
    },

    setAttempts: (state, action: PayloadAction<AssessmentAttempt[]>) => {
      state.attempts = action.payload;
    },

    setCurrentAttempt: (
      state,
      action: PayloadAction<AssessmentAttempt | null>
    ) => {
      state.currentAttempt = action.payload;
      if (action.payload) {
        state.answers = action.payload.answers || {};
      }
    },

    setAnswer: (
      state,
      action: PayloadAction<{ questionId: string; answer: any }>
    ) => {
      const { questionId, answer } = action.payload;
      state.answers[questionId] = answer;
    },

    setAnswers: (state, action: PayloadAction<Record<string, any>>) => {
      state.answers = action.payload;
    },

    setTimeRemaining: (state, action: PayloadAction<number>) => {
      state.timeRemaining = Math.max(0, action.payload);
    },

    decrementTime: state => {
      state.timeRemaining = Math.max(0, state.timeRemaining - 1);
    },

    setCurrentQuestionIndex: (state, action: PayloadAction<number>) => {
      state.currentQuestionIndex = action.payload;
    },

    nextQuestion: state => {
      if (
        state.currentAssessment &&
        state.currentQuestionIndex <
          state.currentAssessment.questions!.length - 1
      ) {
        state.currentQuestionIndex += 1;
      }
    },

    previousQuestion: state => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
      }
    },

    toggleQuestionFlag: (state, action: PayloadAction<string>) => {
      const questionId = action.payload;
      const index = state.flaggedQuestions.indexOf(questionId);

      if (index > -1) {
        state.flaggedQuestions.splice(index, 1);
      } else {
        state.flaggedQuestions.push(questionId);
      }
    },

    setReviewMode: (state, action: PayloadAction<boolean>) => {
      state.reviewMode = action.payload;
    },

    setIsSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },

    setAssessmentLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setAssessmentError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isSubmitting = false;
    },

    resetAssessmentState: state => {
      state.currentAssessment = null;
      state.currentAttempt = null;
      state.answers = {};
      state.timeRemaining = 0;
      state.currentQuestionIndex = 0;
      state.flaggedQuestions = [];
      state.reviewMode = false;
      state.isSubmitting = false;
      state.error = null;
    },
  },
});

export const {
  setAssessments,
  setCurrentAssessment,
  setAttempts,
  setCurrentAttempt,
  setAnswer,
  setAnswers,
  setTimeRemaining,
  decrementTime,
  setCurrentQuestionIndex,
  nextQuestion,
  previousQuestion,
  toggleQuestionFlag,
  setReviewMode,
  setIsSubmitting,
  setAssessmentLoading,
  setAssessmentError,
  resetAssessmentState,
} = assessmentSlice.actions;

export default assessmentSlice.reducer;
