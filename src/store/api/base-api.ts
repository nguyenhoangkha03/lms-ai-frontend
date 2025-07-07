import { Mutex } from 'async-mutex';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { API_CONFIG, ERROR_MESSAGES } from '@/constants';
import type { RootState } from '../store';
import { logout, setTokens } from '../slices/auth';

// đảm bảo chỉ một tiến trình hoặc tác vụ có thể truy cập một đoạn code tại một thời điểm.
const mutex = new Mutex();

// Câu hình cơ bản cho fetchBaseQuery
// tự động gắn token vào header.
const baseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth?.token;

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');

    return headers;
  },
});

// Gọi API như bình thường
// Nếu gặp lỗi 401 (token hết hạn), sẽ tự động gọi /auth/refresh để lấy token mới
// Sau đó retry lại request ban đầu
// Xử lý nhiều yêu cầu đồng thời
// Đăng xuất
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs, // kiểu đầu vào
  unknown, // kiểu trả về
  FetchBaseQueryError // kiểu lỗi
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock(); // nếu có request khác đang xử lý token, thì chờ nó làm xong rồi mới tiếp tục

  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      // Yêu cầu này sẽ "khóa" lại (acquire) để các request khác không thể vào đượ
      // release dùng mở khóa
      const release = await mutex.acquire();

      try {
        const refreshToken = (api.getState() as RootState).auth?.refreshToken;

        if (refreshToken) {
          const refreshResult = await baseQuery(
            {
              url: '/auth/refresh',
              method: 'POST',
              body: { refreshToken },
            },
            api,
            extraOptions
          );

          if (refreshResult.data) {
            const { token, refreshToken: newRefreshToken } =
              refreshResult.data as {
                token: string;
                refreshToken: string;
              };

            api.dispatch(setTokens({ token, refreshToken: newRefreshToken }));

            // Thực hiện lại yêu cầu API ban đầu đã thất bại
            result = await baseQuery(args, api, extraOptions);
          } else {
            api.dispatch(logout());
          }
        } else {
          api.dispatch(logout());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

// Hàm này dùng để chuyển đổi lỗi trả về từ API (FetchBaseQueryError) thành lỗi hiển thị có ý nghĩa, ví dụ:
const transformErrorResponse = (response: FetchBaseQueryError) => {
  if (response.status === 'FETCH_ERROR') {
    return { message: ERROR_MESSAGES.NETWORK_ERROR };
  }

  if (response.status === 401) {
    return { message: ERROR_MESSAGES.UNAUTHORIZED };
  }

  if (response.status === 403) {
    return { message: ERROR_MESSAGES.FORBIDDEN };
  }

  if (response.status === 404) {
    return { message: ERROR_MESSAGES.NOT_FOUND };
  }

  if ((response.status as number) >= 500) {
    return { message: ERROR_MESSAGES.SERVER_ERROR };
  }

  if (response.data && typeof response.data === 'object') {
    const errorData = response.data as any;
    return {
      message:
        errorData.message || errorData.error || ERROR_MESSAGES.VALIDATION_ERROR,
      errors: errorData.errors || [],
    };
  }

  return { message: 'An unexpected error occurred' };
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Course',
    'Lesson',
    'Assessment',
    'Enrollment',
    'Progress',
    'Chat',
    'Message',
    'Notification',
    'AI',
    'Analytics',
    'System',
  ],
  endpoints: () => ({}),
});
