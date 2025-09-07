import { baseApi } from '@/lib/api/base-api';

export interface StudentStats {
  success: boolean;
  message: string;
  stats: {
    activeCourses: number;
    completedCourses: number;
    totalStudyTime: number;
    averageProgress: number;
    achievements: number;
    currentStreak: number;
    level: number;
    xp: number;
    nextLevelXp: number;
  };
}

export interface StudentCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  enrolledAt: string;
  lastAccessedAt: string;
  instructor: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface StudentCoursesResponse {
  success: boolean;
  message: string;
  courses: StudentCourse[];
}

export interface StudentActivity {
  id: string;
  type: 'lesson_completed' | 'badge_earned' | 'ai_chat' | 'course_enrolled';
  title: string;
  description: string;
  createdAt: string;
  metadata: Record<string, any>;
}

export interface StudentActivitiesResponse {
  success: boolean;
  message: string;
  activities: StudentActivity[];
}

export interface StudentAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface StudentAchievementsResponse {
  success: boolean;
  message: string;
  achievements: StudentAchievement[];
  progress: {
    currentLevel: number;
    currentXp: number;
    nextLevelXp: number;
    progressPercentage: number;
  };
}

export const studentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentStats: builder.query<StudentStats, void>({
      query: () => '/student/dashboard/stats',
      providesTags: ['StudentStats'],
    }),

    getStudentCourses: builder.query<StudentCoursesResponse, { limit?: number }>({
      query: (params = {}) => ({
        url: '/student/dashboard/courses',
        params,
      }),
      providesTags: ['StudentCourses'],
    }),

    getStudentActivity: builder.query<StudentActivitiesResponse, { limit?: number }>({
      query: (params = {}) => ({
        url: '/student/dashboard/activity',
        params,
      }),
      providesTags: ['StudentActivity'],
    }),

    getStudentAchievements: builder.query<StudentAchievementsResponse, void>({
      query: () => '/student/dashboard/achievements',
      providesTags: ['StudentAchievements'],
    }),
  }),
});

export const {
  useGetStudentStatsQuery,
  useGetStudentCoursesQuery,
  useGetStudentActivityQuery,
  useGetStudentAchievementsQuery,
} = studentApi;