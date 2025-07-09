import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export const selectAuthUser = (state: RootState) => state.auth?.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth?.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth?.isLoading;

export const selectAllCourses = (state: RootState) => state.course?.courses;
export const selectCurrentCourse = (state: RootState) =>
  state.course?.currentCourse;
export const selectCourseFilters = (state: RootState) => state.course?.filters;

// Hàm biến đổi (số 2) sẽ CHỈ CHẠY LẠI khi giá trị trả về từ các selector đầu vào (số 1) thay đổi.
// Nếu không có gì thay đổi, nó sẽ ngay lập tức trả về kết quả đã tính toán từ lần trước mà không cần chạy lại logic phức tạp bên trong.
export const selectFilteredCourses = createSelector(
  [selectAllCourses, selectCourseFilters],
  (courses, filters) => {
    let filtered = [...courses!];

    if (filters?.category) {
      filtered = filtered.filter(
        course => course.categoryId === filters.category
      );
    }

    if (filters?.level) {
      filtered = filtered.filter(course => course.level === filters.level);
    }

    if (filters?.price === 'free') {
      filtered = filtered.filter(course => course.isFree);
    } else if (filters?.price === 'paid') {
      filtered = filtered.filter(course => !course.isFree);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        course =>
          course.title.toLowerCase().includes(searchLower) ||
          course.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.sortBy) {
      filtered.sort((a, b) => {
        const aValue = a[filters.sortBy as keyof typeof a];
        const bValue = b[filters.sortBy as keyof typeof b];

        if (filters.sortOrder === 'desc') {
          return bValue! > aValue! ? 1 : -1;
        }
        return aValue! > bValue! ? 1 : -1;
      });
    }

    return filtered;
  }
);

export const selectChatRooms = (state: RootState) => state.chat?.rooms;
export const selectCurrentRoom = (state: RootState) => state.chat?.currentRoom;
export const selectUnreadCounts = (state: RootState) =>
  state.chat?.unreadCounts;

export const selectTotalUnreadMessages = createSelector(
  [selectUnreadCounts],
  unreadCounts =>
    Object.values(unreadCounts!).reduce((total, count) => total + count, 0)
);

export const selectNotifications = (state: RootState) =>
  state.notification?.notifications;
export const selectUnreadNotificationCount = (state: RootState) =>
  state.notification?.unreadCount;

export const selectRecentNotifications = createSelector(
  [selectNotifications],
  notifications => notifications?.slice(0, 5)
);

export const selectTheme = (state: RootState) => state.ui?.theme;
export const selectSidebarCollapsed = (state: RootState) =>
  state.ui?.sidebarCollapsed;
export const selectModals = (state: RootState) => state.ui?.modals;
export const selectToasts = (state: RootState) => state.ui?.toasts;
