import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '../api/base-api';
import authSlice from './slices/auth-slice';
import uiSlice from './slices/ui-slice';
import courseSlice from './slices/course-slice';
import notificationSlice from './slices/notification-slice';
import onboardingSlice from './slices/onboarding-slice';
import dashboardSlice from './slices/dashboard-slice';
import { authMiddleware } from './middleware/auth-middleware';
import { errorMiddleware } from './middleware/error-middleware';
import { apiMiddleware } from './middleware/api-middleware';

export const store = configureStore({
  reducer: {
    // RTK Query APIs
    [baseApi.reducerPath]: baseApi.reducer,

    // Feature slices
    auth: authSlice,
    ui: uiSlice,
    course: courseSlice,
    notification: notificationSlice,
    onboarding: onboardingSlice,
    dashboard: dashboardSlice,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['socket', 'api'],
      },
    })
      .concat(baseApi.middleware)
      .concat(apiMiddleware.middleware)
      .concat(authMiddleware.middleware)
      .concat(errorMiddleware.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
