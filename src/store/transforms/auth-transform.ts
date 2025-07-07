import { createTransform } from 'redux-persist'; // tạo ra logic xử lý lưu & khôi phục riêng cho từng slice
import { AuthState } from '../slices/auth';

// Tùy chỉnh dữ liệu trước khi lưu vào Storage (LocalStorage, SessionStorage, v.v.)
// Tùy chỉnh dữ liệu khi khôi phục lại state từ Storage vào Redux
// Áp dụng riêng cho slice auth (nhờ whitelist)
export const authTransform = createTransform(
  // Trước khi lưu vào storage
  (inboundState: AuthState) => {
    return {
      isAuthenticated: inboundState.isAuthenticated,
      user: inboundState.user,
      token: inboundState.token,
      refreshToken: inboundState.refreshToken,
      isInitialized: inboundState.isInitialized,
      // không lưu state isLoading, error
    };
  },
  // Khi khôi phục state từ storage
  (outboundState: Partial<AuthState>) => {
    return {
      ...outboundState,
      isLoading: false,
      error: null,
    } as AuthState;
  },
  // Chỉ áp dụng cho slice 'auth'
  { whitelist: ['auth'] }
) as any;
