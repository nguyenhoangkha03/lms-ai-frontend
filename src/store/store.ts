import { combineReducers, configureStore } from '@reduxjs/toolkit';
// persistStore: Hàm để kích hoạt việc lưu trữ.
// persistReducer: Một "bộ lọc" để bọc reducer của bạn, quyết định phần nào của state sẽ được lưu.
import { persistStore, persistReducer } from 'redux-persist';
import storageEngine from './storage-engine';
// Tuần tự hóa (Serialization) là quá trình chuyển đổi một object thành chuỗi JSON (hoặc định dạng
//  lưu trữ khác) để có thể lưu vào file, gửi qua network, hoặc lưu vào localStorage.
import {
  FLUSH, // Xóa ngay lập tức mọi thay đổi đang chờ được lưu vào storage.
  REHYDRATE, // Khi app load lại, lấy data từ localStorage
  PAUSE, // Tạm dừng việc lưu trữ state. Như bấm Pause khi đang record
  PERSIST, // Bắt đầu quá trình lưu trữ state. Như "resume" lại việc lưu sau khi pause
  PURGE, // Xóa toàn bộ state khỏi storage. Reset sạch dữ liệu persist
  REGISTER, // Đăng ký một reducer mới để lưu trữ. Gọi khi slice/reducer được persist đăng ký
} from 'redux-persist';

// Import middleware
import { websocketMiddleware } from './middleware/websocket';
import { errorHandlerMiddleware } from './middleware/error-handler';
import { authMiddleware } from './middleware/auth-middleware';
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

// Import API slices
import { baseApi } from './api/base-api';

const persistConfig = {
  key: 'lms-root',
  version: 1, // thay đổi cấu trúc state và muốn người dùng cũ phải làm mới state, bạn có thể tăng số phiên bản này
  storage: storageEngine,
  whitelist: ['auth', 'user', 'ui'], // Only persist auth, user, and ui slices
  // không được lưu
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
  transforms: [authTransform], // áp dụng biến đổi trước khi lưu
  debug: process.env.NODE_ENV === 'development', // Bật chế độ gỡ lỗi cho redux-persist khi chạy ở môi trường development.
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
  [baseApi.reducerPath]: baseApi.reducer,
});

// phiên bản "nâng cấp" của rootReducer, nó biết cách tự động lưu và lấy lại một phần trạng thái từ localStorage.
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      // kiểm tra xem action và state có thể serialize được không (giúp debug tốt hơn).
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // 	Bỏ qua cảnh báo nếu action có meta.websocket
        ignoredActionsPaths: ['meta.websocket'],
        // Không kiểm tra state ở state.socket
        ignoredPaths: ['socket'],
      },
      //  không được mutate trực tiếp bất kỳ phần nào trong state
      immutableCheck: {
        ignoredPaths: ['socket'],
      },
    }).concat(
      baseApi.middleware,

      // Custom middleware
      errorHandlerMiddleware,
      websocketMiddleware,
      authMiddleware
    ),
  devTools: process.env.NODE_ENV !== 'production' && {
    name: 'LMS Redux Store',
    trace: true,
    traceLimit: 25,
  },
});

// Kích hoạt cơ chế tự động lưu trữ (persist) Redux state vào storage (localStorage hoặc sessionStorage).
// Object này sau đó sẽ được sử dụng bởi component <PersistGate> trong cây React để trì hoãn việc
//  render giao diện cho đến khi trạng thái đã được khôi phục thành công từ localStorage.
export const persistor = (() => {
  // Kiểm tra nếu đang chạy ở server-side
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return persistStore(store, null, () => {
      console.log('Redux store rehydrated');
    });
  } catch (error) {
    console.warn('Failed to create persistor:', error);
    return null;
  }
})();
// store.getState là hàm, gọi store.getState() sẽ trả về toàn bộ state của Redux store
// typeof store.getState trả về () => StateObject
// RetyurnType<typeof store.getState> sẽ trả về kiểu của toàn bộ state object
export type RootState = ReturnType<typeof store.getState>;
// typeof store.dispatch trả về (action: AnyAction) => AnyAction & Promise<any>
// Không quan tâm dispatch trả về gì, chỉ cần biết nó là hàm
export type AppDispatch = typeof store.dispatch;
