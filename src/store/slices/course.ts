import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Course, Category, Enrollment } from '@/types';

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  enrollments: Enrollment[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: {
    category?: string;
    level?: string;
    price?: 'free' | 'paid' | 'all';
    rating?: number;
    search?: string;
    sortBy?: 'title' | 'rating' | 'price' | 'created';
    sortOrder?: 'asc' | 'desc';
  };
}

const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  enrollments: [],
  categories: [],
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  },
  filters: {
    price: 'all',
    sortBy: 'title',
    sortOrder: 'asc',
  },
};

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    setCourses: (state, action: PayloadAction<Course[]>) => {
      state.courses = action.payload;
      state.error = null;
    },

    addCourse: (state, action: PayloadAction<Course>) => {
      state.courses.push(action.payload);
    },

    updateCourse: (state, action: PayloadAction<Course>) => {
      const index = state.courses.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.courses[index] = action.payload;
      }
      if (state.currentCourse?.id === action.payload.id) {
        state.currentCourse = action.payload;
      }
    },

    removeCourse: (state, action: PayloadAction<string>) => {
      state.courses = state.courses.filter(c => c.id !== action.payload);
      if (state.currentCourse?.id === action.payload) {
        state.currentCourse = null;
      }
    },

    setCurrentCourse: (state, action: PayloadAction<Course | null>) => {
      state.currentCourse = action.payload;
    },

    setEnrollments: (state, action: PayloadAction<Enrollment[]>) => {
      state.enrollments = action.payload;
    },

    addEnrollment: (state, action: PayloadAction<Enrollment>) => {
      state.enrollments.push(action.payload);
    },

    updateEnrollment: (state, action: PayloadAction<Enrollment>) => {
      const index = state.enrollments.findIndex(
        e => e.id === action.payload.id
      );
      if (index !== -1) {
        state.enrollments[index] = action.payload;
      }
    },

    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },

    setPagination: (
      state,
      action: PayloadAction<Partial<CourseState['pagination']>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    setFilters: (
      state,
      action: PayloadAction<Partial<CourseState['filters']>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    clearFilters: state => {
      state.filters = {
        price: 'all',
        sortBy: 'title',
        sortOrder: 'asc',
      };
    },

    setCourseLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setCourseError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setCourses,
  addCourse,
  updateCourse,
  removeCourse,
  setCurrentCourse,
  setEnrollments,
  addEnrollment,
  updateEnrollment,
  setCategories,
  setPagination,
  setFilters,
  clearFilters,
  setCourseLoading,
  setCourseError,
} = courseSlice.actions;

export default courseSlice.reducer;
