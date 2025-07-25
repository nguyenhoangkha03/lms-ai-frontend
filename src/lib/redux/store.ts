import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '../api/base-api';
import authSlice from './slices/auth-slice';
import uiSlice from './slices/ui-slice';
import courseSlice from './slices/course-slice';
import notificationSlice from './slices/notification-slice';
// import { authApi } from './api/auth-api';
// import { userApi } from './api/user-api';
// import { courseApi } from './api/course-api';
// import { assessmentApi } from './api/assessment-api';
// import { chatApi } from './api/chat-api';
// import { aiApi } from './api/ai-api';

export const store = configureStore({
  reducer: {
    // RTK Query APIs
    [baseApi.reducerPath]: baseApi.reducer,

    // Feature slices
    auth: authSlice,
    ui: uiSlice,
    course: courseSlice,
    notification: notificationSlice,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['socket', 'api'],
      },
    }).concat(baseApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
