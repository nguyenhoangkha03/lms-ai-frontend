import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {
  FLUSH, // Xóa ngay lập tức mọi thay đổi đang chờ được lưu vào storage.
  REHYDRATE, // Khôi phục state từ storage.
  PAUSE, // Tạm dừng việc lưu trữ state.
  PERSIST, // Bắt đầu quá trình lưu trữ state.
  PURGE, // Xóa toàn bộ state khỏi storage.
  REGISTER, // Đăng ký một reducer mới để lưu trữ.
} from 'redux-persist';

// Import middleware
import { websocketMiddleware } from './middleware/websocket';
import { errorHandlerMiddleware } from './middleware/error-handler';
import { authTransform } from './transforms/auth-transform';

// // Import slices
import authSlice from './slices/auth';
import userSlice from './slices/user';
import courseSlice from './slices/course';
import lessonSlice from './slices/lesson';
import assessmentSlice from './slices/assessment';
import chatSlice from './slices/chat';
import notificationSlice from './slices/notification';
import uiSlice from './slices/ui';

// // Import API slices
import { authApi } from './api/auth-api';
import { userApi } from './api/user-api';
// import { courseApi } from './api/course-api';
import { lessonApi } from './api/lesson-api';
import { assessmentApi } from './api/assessment-api';
import { chatApi } from './api/chat-api';
import { notificationApi } from './api/notification-api';
import { aiApi } from './api/ai-api';
import { adminApi } from './api/admin-api';

const persistConfig = {
  key: 'lms-root',
  version: 1,
  storage,
  whitelist: ['auth', 'user', 'ui'], // Only persist auth, user, and ui slices
  blacklist: [
    'chat',
    'notification',
    'lesson',
    'assessment',
    // Don't persist API cache
    'authApi',
    'userApi',
    'courseApi',
    'lessonApi',
    'assessmentApi',
    'chatApi',
    'notificationApi',
    'aiApi',
    'adminApi',
  ], // Do not persist chat and notification slices
  transforms: [authTransform],
  debug: process.env.NODE_ENV === 'development',
};

const rootReducer = combineReducers({
  // Feature slices
  auth: authSlice,
  user: userSlice,
  course: courseSlice,
  lesson: lessonSlice,
  assessment: assessmentSlice,
  chat: chatSlice,
  notification: notificationSlice,
  ui: uiSlice,

  // API slices
  [authApi.reducerPath]: authApi.reducer,
  // [userApi.reducerPath]: userApi.reducer,
  //   [courseApi.reducerPath]: courseApi.reducer,
  //   [lessonApi.reducerPath]: lessonApi.reducer,
  //   [assessmentApi.reducerPath]: assessmentApi.reducer,
  //   [chatApi.reducerPath]: chatApi.reducer,
  //   [notificationApi.reducerPath]: notificationApi.reducer,
  //   [aiApi.reducerPath]: aiApi.reducer,
  //   [adminApi.reducerPath]: adminApi.reducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      // kiểm tra xem action và state có thể serialize được không (giúp debug tốt hơn).
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredActionsPaths: ['meta.websocket'],
        ignoredPaths: ['socket'],
      },
      immutableCheck: {
        ignoredPaths: ['socket'],
      },
    }).concat(
      authApi.middleware,
      //   userApi.middleware,
      //   courseApi.middleware,
      //   lessonApi.middleware,
      //   assessmentApi.middleware,
      //   chatApi.middleware,
      //   notificationApi.middleware,
      //   aiApi.middleware,
      //   adminApi.middleware

      // Custom middleware
      errorHandlerMiddleware,
      websocketMiddleware
    ),
  devTools: process.env.NODE_ENV !== 'production' && {
    name: 'LMS Redux Store',
    trace: true,
    traceLimit: 25,
  },
});

// Kích hoạt cơ chế tự động lưu trữ (persist) Redux state vào storage (localStorage hoặc sessionStorage).
export const persistor = persistStore(store, null, () => {
  console.log('Redux store rehydrated');
});

// store.getState là hàm, gọi store.getState() sẽ trả về toàn bộ state của Redux store
// typeof store.getState trả về () => StateObject
// RetyurnType<typeof store.getState> sẽ trả về kiểu của toàn bộ state object
export type RootState = ReturnType<typeof store.getState>;
// typeof store.dispatch trả về (action: AnyAction) => AnyAction & Promise<any>
// Không quan tâm dispatch trả về gì, chỉ cần biết nó là hàm
export type AppDispatch = typeof store.dispatch;
