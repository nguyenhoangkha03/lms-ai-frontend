import { useDispatch, useSelector, useStore } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch, store } from './store';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore = useStore.withTypes<typeof store>();

export const useAuth = () => useAppSelector(state => state.auth);
export const useUI = () => useAppSelector(state => state.ui);
export const useCourse = () => useAppSelector(state => state.course);
export const useNotifications = () =>
  useAppSelector(state => state.notification);

export const useIsAuthenticated = () =>
  useAppSelector(state => !!state.auth.token && !!state.auth.user);

export const useUserRole = () =>
  useAppSelector(state => state.auth.user?.userType);

export const useIsLoading = () => useAppSelector(state => state.ui.isLoading);

export const useCurrentCourse = () =>
  useAppSelector(state => state.course.currentCourse);

export const useUnreadNotifications = () =>
  useAppSelector(
    state => state.notification.notifications.filter(n => !n.isRead).length
  );
