import { baseApi } from '@/lib/api/base-api';

// ==================== TYPES AND INTERFACES ====================
// Based on actual backend gradebook service interfaces

export interface GradebookEntry {
  studentId: string;
  studentName: string;
  studentEmail: string;
  assessments: Record<
    string,
    {
      score: number;
      maxScore: number;
      percentage: number;
      status: string;
      gradedAt?: string;
    }
  >;
  overallGrade: {
    totalScore: number;
    totalMaxScore: number;
    percentage: number;
    letterGrade: string;
    isPassing: boolean;
  };
}

export interface GradebookSummary {
  course: {
    id: string;
    title: string;
    code: string;
  };
  statistics: {
    totalStudents: number;
    totalAssessments: number;
    averageGrade: number;
    passingRate: number;
    completionRate: number;
  };
  gradeDistribution: Record<string, number>;
  recentActivity: {
    id: string;
    studentName: string;
    assessmentTitle: string;
    score: number;
    maxScore: number;
    percentage: number;
    gradedAt: string;
    graderName: string;
  }[];
}

export interface Gradebook {
  id: string;
  courseId: string;
  name: string;
  description?: string;
  teacherId: string;
  gradingScale?: string; // JSON string
  weightingScheme?: string; // JSON string
  passingThreshold?: number;
  totalStudents?: number;
  classAverage?: number;
  lastCalculatedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CreateGradebookRequest {
  courseId: string;
  name: string;
  description?: string;
  gradingScale?: Record<string, { min: number }>;
  weightingScheme?: Record<string, number>;
  passingThreshold?: number;
}

export interface UpdateGradebookRequest extends Partial<CreateGradebookRequest> {
  name?: string;
}

// Grade-related interfaces (from grading module)
export interface Grade {
  id: string;
  studentId: string;
  assessmentId: string;
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade?: string;
  status: 'draft' | 'published' | 'returned';
  feedback?: string;
  rubricScores?: Record<string, number>;
  isPublished: boolean;
  gradedAt?: string;
  graderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGradeRequest {
  studentId: string;
  assessmentId: string;
  score: number;
  maxScore: number;
  feedback?: string;
  rubricScores?: Record<string, number>;
  status?: 'draft' | 'published' | 'returned';
}

export interface UpdateGradeRequest extends Partial<CreateGradeRequest> {
  score?: number;
  feedback?: string;
  status?: 'draft' | 'published' | 'returned';
}

export interface BulkGradeRequest {
  grades: {
    studentId: string;
    assessmentId: string;
    score: number;
    maxScore: number;
    feedback?: string;
  }[];
}

// ==================== API ENDPOINTS ====================
// Based on actual gradebook controller endpoints

export const teacherGradebookApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create gradebook
    createGradebook: builder.mutation<Gradebook, CreateGradebookRequest>({
      query: (gradebookData) => ({
        url: '/gradebook',
        method: 'POST',
        body: gradebookData,
      }),
      invalidatesTags: ['Gradebooks'],
    }),

    // Update gradebook  
    updateGradebook: builder.mutation<
      Gradebook,
      { id: string; updates: UpdateGradebookRequest }
    >({
      query: ({ id, updates }) => ({
        url: `/gradebook/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Gradebooks',
        { type: 'Gradebook', id },
      ],
    }),

    // Get gradebook data with all student grades
    getGradebookData: builder.query<GradebookEntry[], string>({
      query: (gradebookId) => `/gradebook/${gradebookId}/data`,
      providesTags: (result, error, id) => [{ type: 'GradebookData', id }],
    }),

    // Get gradebook summary and statistics
    getGradebookSummary: builder.query<GradebookSummary, string>({
      query: (gradebookId) => `/gradebook/${gradebookId}/summary`,
      providesTags: (result, error, id) => [{ type: 'GradebookSummary', id }],
    }),

    // Recalculate final grades
    calculateFinalGrades: builder.mutation<{ message: string }, string>({
      query: (gradebookId) => ({
        url: `/gradebook/${gradebookId}/calculate`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, gradebookId) => [
        { type: 'GradebookData', id: gradebookId },
        { type: 'GradebookSummary', id: gradebookId },
      ],
    }),

    // Export gradebook data
    exportGradebook: builder.mutation<
      Blob,
      { gradebookId: string; format?: 'csv' | 'xlsx' }
    >({
      query: ({ gradebookId, format = 'csv' }) => ({
        url: `/gradebook/${gradebookId}/export`,
        params: { format },
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Grade management endpoints (from grading module)
    
    // Create grade
    createGrade: builder.mutation<Grade, CreateGradeRequest>({
      query: (gradeData) => ({
        url: '/grading/grades',
        method: 'POST',
        body: gradeData,
      }),
      invalidatesTags: ['Grades'],
    }),

    // Update grade
    updateGrade: builder.mutation<
      Grade,
      { id: string; updates: UpdateGradeRequest }
    >({
      query: ({ id, updates }) => ({
        url: `/grading/grades/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Grades',
        { type: 'Grade', id },
      ],
    }),

    // Get grades for assessment
    getAssessmentGrades: builder.query<Grade[], string>({
      query: (assessmentId) => `/grading/grades/assessment/${assessmentId}`,
      providesTags: (result, error, assessmentId) => [
        { type: 'AssessmentGrades', id: assessmentId },
      ],
    }),

    // Get grades for student
    getStudentGrades: builder.query<Grade[], string>({
      query: (studentId) => `/grading/grades/student/${studentId}`,
      providesTags: (result, error, studentId) => [
        { type: 'StudentGrades', id: studentId },
      ],
    }),

    // Bulk grade creation
    bulkCreateGrades: builder.mutation<
      { created: number; failed: number },
      BulkGradeRequest
    >({
      query: (bulkData) => ({
        url: '/grading/grades/bulk',
        method: 'POST',
        body: bulkData,
      }),
      invalidatesTags: ['Grades'],
    }),

    // Publish grades
    publishGrades: builder.mutation<void, string[]>({
      query: (gradeIds) => ({
        url: '/grading/grades/publish',
        method: 'POST',
        body: { gradeIds },
      }),
      invalidatesTags: ['Grades'],
    }),

    // Teacher-specific gradebook queries

    // Get teacher's gradebooks
    getTeacherGradebooks: builder.query<Gradebook[], { teacherId?: string }>({
      query: ({ teacherId } = {}) => ({
        url: '/gradebook',
        params: teacherId ? { teacherId } : {},
      }),
      providesTags: ['Gradebooks'],
    }),

    // Get gradebook for course
    getCourseGradebook: builder.query<Gradebook, string>({
      query: (courseId) => ({
        url: '/gradebook',
        params: { courseId },
      }),
      providesTags: (result, error, courseId) => [
        { type: 'CourseGradebook', id: courseId },
      ],
    }),
  }),
});

// Export hooks
export const {
  useCreateGradebookMutation,
  useUpdateGradebookMutation,
  useGetGradebookDataQuery,
  useGetGradebookSummaryQuery,
  useCalculateFinalGradesMutation,
  useExportGradebookMutation,
  useCreateGradeMutation,
  useUpdateGradeMutation,
  useGetAssessmentGradesQuery,
  useGetStudentGradesQuery,
  useBulkCreateGradesMutation,
  usePublishGradesMutation,
  useGetTeacherGradebooksQuery,
  useGetCourseGradebookQuery,
} = teacherGradebookApi;