// import {
//   Assessment,
//   Question,
//   GradingRubric,
//   AntiCheatSettings,
//   QuestionBankFilters,
//   QuestionType,
// } from '@/types/assessment';
// import { baseApi } from '@/lib/api/base-api';

// interface QuestionBankItem {
//   id: string;
//   questionText: string;
//   questionType: QuestionType;
//   difficulty: 'easy' | 'medium' | 'hard' | 'expert';
//   options?: string[];
//   correctAnswer: string | string[];
//   points: number;
//   tags: string[];
//   explanation?: string;
//   hint?: string;
//   createdAt: string;
//   usageCount: number;
//   analytics: {
//     avgScore: number;
//     difficultyIndex: number;
//     discriminationIndex: number;
//     averageTimeSpent: number;
//     attempts: number;
//   };
// }

// interface AIQuestionGenerationRequest {
//   lessonId?: string;
//   courseId?: string;
//   topic: string;
//   questionType: QuestionType;
//   difficulty: string;
//   count: number;
//   context?: string;
//   learningObjectives?: string[];
//   customInstructions?: string;
// }

// interface AIQuestionGenerationResponse {
//   questions: QuestionBankItem[];
//   generationMetadata: {
//     modelVersion: string;
//     prompt: string;
//     qualityScore: number;
//     suggestions: string[];
//   };
// }

// export const assessmentCreationApi = baseApi.injectEndpoints({
//   endpoints: builder => ({
//     // ASSESSMENT CREATION
//     // createAssessment: builder.mutation<Assessment, Partial<Assessment>>({
//     //   query: data => ({
//     //     url: '/assessments',
//     //     method: 'POST',
//     //     body: data,
//     //   }),
//     //   invalidatesTags: ['Assessment'],
//     //   transformResponse: (response: any) => response.data,
//     // }),

//     // updateAssessment: builder.mutation<
//     //   Assessment,
//     //   { id: string; data: Partial<Assessment> }
//     // >({
//     //   query: ({ id, data }) => ({
//     //     url: `/assessments/${id}`,
//     //     method: 'PUT',
//     //     body: data,
//     //   }),
//     //   invalidatesTags: (result, error, { id }) => [
//     //     { type: 'Assessment', id },
//     //     'Assessment',
//     //   ],
//     //   transformResponse: (response: any) => response.data,
//     // }),

//     // getAssessmentById: builder.query<Assessment, string>({
//     //   query: id => `/assessments/${id}`,
//     //   providesTags: (result, error, id) => [{ type: 'Assessment', id }],
//     // }),

//     // duplicateAssessment: builder.mutation<Assessment, string>({
//     //   query: id => ({
//     //     url: `/assessments/${id}/duplicate`,
//     //     method: 'POST',
//     //   }),
//     //   invalidatesTags: ['Assessment'],
//     // }),

//     // publishAssessment: builder.mutation<Assessment, string>({
//     //   query: id => ({
//     //     url: `/assessments/${id}/publish`,
//     //     method: 'POST',
//     //   }),
//     //   invalidatesTags: (result, error, id) => [
//     //     { type: 'Assessment', id },
//     //     'Assessment',
//     //   ],
//     // }),

//     // archiveAssessment: builder.mutation<Assessment, string>({
//     //   query: id => ({
//     //     url: `/assessments/${id}/archive`,
//     //     method: 'POST',
//     //   }),
//     //   invalidatesTags: (result, error, id) => [
//     //     { type: 'Assessment', id },
//     //     'Assessment',
//     //   ],
//     // }),

//     // QUESTION MANAGEMENT
//     addQuestionToAssessment: builder.mutation<
//       Question,
//       { assessmentId: string; question: Partial<Question> }
//     >({
//       query: ({ assessmentId, question }) => ({
//         url: `/assessments/${assessmentId}/questions`,
//         method: 'POST',
//         body: question,
//       }),
//       invalidatesTags: (result, error, { assessmentId }) => [
//         { type: 'Assessment', id: assessmentId },
//         'Question',
//       ],
//     }),

//     updateQuestionInAssessment: builder.mutation<
//       Question,
//       { assessmentId: string; questionId: string; data: Partial<Question> }
//     >({
//       query: ({ assessmentId, questionId, data }) => ({
//         url: `/assessments/${assessmentId}/questions/${questionId}`,
//         method: 'PUT',
//         body: data,
//       }),
//       invalidatesTags: (result, error, { assessmentId, questionId }) => [
//         { type: 'Assessment', id: assessmentId },
//         { type: 'Question', id: questionId },
//       ],
//     }),

//     removeQuestionFromAssessment: builder.mutation<
//       void,
//       { assessmentId: string; questionId: string }
//     >({
//       query: ({ assessmentId, questionId }) => ({
//         url: `/assessments/${assessmentId}/questions/${questionId}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: (result, error, { assessmentId }) => [
//         { type: 'Assessment', id: assessmentId },
//         'Question',
//       ],
//     }),

//     reorderQuestionsInAssessment: builder.mutation<
//       void,
//       { assessmentId: string; questionIds: string[] }
//     >({
//       query: ({ assessmentId, questionIds }) => ({
//         url: `/assessments/${assessmentId}/questions/reorder`,
//         method: 'PUT',
//         body: { questionIds },
//       }),
//       invalidatesTags: (result, error, { assessmentId }) => [
//         { type: 'Assessment', id: assessmentId },
//       ],
//     }),

//     // QUESTION BANK MANAGEMENT
//     getQuestionBank: builder.query<
//       {
//         questions: QuestionBankItem[];
//         total: number;
//         page: number;
//         limit: number;
//         filters: QuestionBankFilters;
//       },
//       QuestionBankFilters
//     >({
//       query: filters => ({
//         url: '/assessments/question-bank',
//         params: filters,
//       }),
//       providesTags: ['QuestionBank'],
//     }),

//     getQuestionBankItem: builder.query<QuestionBankItem, string>({
//       query: id => `/assessments/question-bank/${id}`,
//       providesTags: (result, error, id) => [{ type: 'QuestionBank', id }],
//     }),

//     createQuestionBankItem: builder.mutation<
//       QuestionBankItem,
//       Partial<QuestionBankItem>
//     >({
//       query: data => ({
//         url: '/assessments/question-bank',
//         method: 'POST',
//         body: data,
//       }),
//       invalidatesTags: ['QuestionBank'],
//     }),

//     updateQuestionBankItem: builder.mutation<
//       QuestionBankItem,
//       { id: string; data: Partial<QuestionBankItem> }
//     >({
//       query: ({ id, data }) => ({
//         url: `/assessments/question-bank/${id}`,
//         method: 'PUT',
//         body: data,
//       }),
//       invalidatesTags: (result, error, { id }) => [
//         { type: 'QuestionBank', id },
//         'QuestionBank',
//       ],
//     }),

//     deleteQuestionBankItem: builder.mutation<void, string>({
//       query: id => ({
//         url: `/assessments/question-bank/${id}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: (result, error, id) => [
//         { type: 'QuestionBank', id },
//         'QuestionBank',
//       ],
//     }),

//     getRandomQuestionsFromBank: builder.query<
//       QuestionBankItem[],
//       {
//         count: number;
//         questionType?: string;
//         difficulty?: string;
//         tags?: string[];
//         excludeIds?: string[];
//       }
//     >({
//       query: params => ({
//         url: '/assessments/question-bank/random',
//         params,
//       }),
//     }),

// importQuestionsToAssessment: builder.mutation<
//   void,
//   { assessmentId: string; questionIds: string[]; importSettings?: any }
// >({
//   query: ({ assessmentId, questionIds, importSettings }) => ({
//     url: `/assessments/${assessmentId}/import-questions`,
//     method: 'POST',
//     body: { questionIds, importSettings },
//   }),
//   invalidatesTags: (result, error, { assessmentId }) => [
//     { type: 'Assessment', id: assessmentId },
//   ],
// }),

//     // AI QUESTION GENERATION
// generateQuestionsWithAI: builder.mutation<
//   AIQuestionGenerationResponse,
//   AIQuestionGenerationRequest
// >({
//   query: data => ({
//     url: '/content-analysis/quiz-generation/generate',
//     method: 'POST',
//     body: data,
//   }),
//   invalidatesTags: ['QuestionBank'],
// }),

//     getGeneratedQuizzes: builder.query<
//       {
//         quizzes: any[];
//         total: number;
//         page: number;
//         limit: number;
//       },
//       {
//         lessonId?: string;
//         status?: string;
//         page?: number;
//         limit?: number;
//       }
//     >({
//       query: params => ({
//         url: '/content-analysis/quiz-generation',
//         params,
//       }),
//       providesTags: ['QuestionBank'],
//     }),

//     reviewGeneratedQuiz: builder.mutation<
//       void,
//       { id: string; review: string; approved: boolean }
//     >({
//       query: ({ id, review, approved }) => ({
//         url: `/content-analysis/quiz-generation/${id}/review`,
//         method: 'PUT',
//         body: { review, approved },
//       }),
//       invalidatesTags: ['QuestionBank'],
//     }),

//     // GRADING RUBRICS
// getGradingRubrics: builder.query<
//   {
//     rubrics: GradingRubric[];
//     total: number;
//     page: number;
//     limit: number;
//   },
//       {
//         assessmentId?: string;
//         isTemplate?: boolean;
//         page?: number;
//         limit?: number;
//       }
//     >({
//       query: params => ({
//         url: '/grading-rubrics',
//         params,
//       }),
//       providesTags: ['GradingRubric'],
//     }),

//     createGradingRubric: builder.mutation<
//       GradingRubric,
//       Partial<GradingRubric>
//     >({
//       query: data => ({
//         url: '/grading-rubrics',
//         method: 'POST',
//         body: data,
//       }),
//       invalidatesTags: ['GradingRubric'],
//     }),

// updateGradingRubric: builder.mutation<
//   GradingRubric,
//   { id: string; data: Partial<GradingRubric> }
// >({
//   query: ({ id, data }) => ({
//     url: `/grading-rubrics/${id}`,
//     method: 'PUT',
//     body: data,
//   }),
//   invalidatesTags: (result, error, { id }) => [
//     { type: 'GradingRubric', id },
//     'GradingRubric',
//   ],
// }),

//     deleteGradingRubric: builder.mutation<void, string>({
//       query: id => ({
//         url: `/grading-rubrics/${id}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: (result, error, id) => [
//         { type: 'GradingRubric', id },
//         'GradingRubric',
//       ],
//     }),

//     // ANTI-CHEAT & PROCTORING
//     configureAntiCheat: builder.mutation<
//       void,
//       { assessmentId: string; settings: AntiCheatSettings }
//     >({
//       query: ({ assessmentId, settings }) => ({
//         url: `/assessments/${assessmentId}/configure`,
//         method: 'PATCH',
//         body: { antiCheatSettings: settings },
//       }),
//       invalidatesTags: (result, error, { assessmentId }) => [
//         { type: 'Assessment', id: assessmentId },
//       ],
//     }),

//     previewAntiCheat: builder.query<
//       {
//         assessment: Assessment;
//         appliedMeasures: string[];
//         restrictedFeatures: string[];
//         requiredPermissions: string[];
//       },
//       string
//     >({
//       query: assessmentId => `/assessments/${assessmentId}/anti-cheat-preview`,
//     }),

//     // ASSESSMENT ANALYTICS
//     getAssessmentStatistics: builder.query<
//       {
//         totalAttempts: number;
//         averageScore: number;
//         completionRate: number;
//         averageTimeSpent: number;
//         difficultyDistribution: Record<string, number>;
//         questionAnalytics: Array<{
//           questionId: string;
//           avgScore: number;
//           correctAnswerRate: number;
//           timeSpent: number;
//           difficultyIndex: number;
//         }>;
//         performanceTrends: Array<{
//           date: string;
//           avgScore: number;
//           attempts: number;
//         }>;
//       },
//       string
//     >({
//       query: assessmentId => `/assessments/${assessmentId}/statistics`,
//       providesTags: (result, error, assessmentId) => [
//         { type: 'Analytics', id: assessmentId },
//       ],
//     }),

//     // getQuestionBankStatistics: builder.query<
//     //   {
//     //     totalQuestions: number;
//     //     questionsByType: Record<string, number>;
//     //     questionsByDifficulty: Record<string, number>;
//     //     popularTags: Array<{ tag: string; count: number }>;
//     //     usageStatistics: {
//     //       mostUsed: QuestionBankItem[];
//     //       leastUsed: QuestionBankItem[];
//     //       highestRated: QuestionBankItem[];
//     //     };
//     //   },
//     //   void
//     // >({
//     //   query: () => '/assessments/question-bank/statistics',
//     //   providesTags: ['Analytics'],
//     // }),

//     // CONTENT ANALYSIS INTEGRATION
//     analyzeContentQuality: builder.mutation<
//       {
//         qualityScore: number;
//         readabilityScore: number;
//         suggestions: string[];
//         issues: Array<{
//           type: string;
//           severity: 'low' | 'medium' | 'high';
//           message: string;
//           suggestion: string;
//         }>;
//       },
//       { contentType: string; contentId: string; content: string }
//     >({
//       query: data => ({
//         url: '/content-analysis/quality/assess',
//         method: 'POST',
//         body: data,
//       }),
//     }),

//     checkPlagiarism: builder.mutation<
//       {
//         similarityScore: number;
//         matches: Array<{
//           source: string;
//           similarity: number;
//           matchedText: string;
//         }>;
//         status: 'clean' | 'suspicious' | 'plagiarized';
//       },
//       { content: string; contentType: string }
//     >({
//       query: data => ({
//         url: '/content-analysis/plagiarism/check',
//         method: 'POST',
//         body: data,
//       }),
//     }),
//   }),
// });

// export const {
//   // Assessment Creation
//   // useCreateAssessmentMutation,
//   //   useUpdateAssessmentMutation,
//   // useGetAssessmentsQuery,
//   // useGetAssessmentByIdQuery,
//   // useDuplicateAssessmentMutation,
//   // usePublishAssessmentMutation,
//   // useArchiveAssessmentMutation,

//   // Question Management
// //   useAddQuestionToAssessmentMutation,
// //   useUpdateQuestionInAssessmentMutation,
// //   useRemoveQuestionFromAssessmentMutation,
// //   useReorderQuestionsInAssessmentMutation,

//   // Question Bank
// //   useGetQuestionBankQuery,
// //   useGetQuestionBankItemQuery,
// //   useCreateQuestionBankItemMutation,
// //   useUpdateQuestionBankItemMutation,
// //   useDeleteQuestionBankItemMutation,
// //   useGetRandomQuestionsFromBankQuery,
// //   useImportQuestionsToAssessmentMutation,

//   // AI Generation
//   useGenerateQuestionsWithAIMutation,
//   useGetGeneratedQuizzesQuery,
//   useReviewGeneratedQuizMutation,

//   // Grading Rubrics
//   useGetGradingRubricsQuery,
//   useCreateGradingRubricMutation,
//   useUpdateGradingRubricMutation,
//   useDeleteGradingRubricMutation,

//   // Anti-Cheat
//   useConfigureAntiCheatMutation,
//   usePreviewAntiCheatQuery,

//   // Analytics
//   useGetAssessmentStatisticsQuery,
//   // useGetQuestionBankStatisticsQuery,

//   // Content Analysis
//   useAnalyzeContentQualityMutation,
//   useCheckPlagiarismMutation,
// } = assessmentCreationApi;
