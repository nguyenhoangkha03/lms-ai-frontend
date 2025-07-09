import { ApiCache } from './cache';

export const setupApiClient = () => {
  const cache = ApiCache.getInstance();

  setInterval(
    () => {
      cache.clearExpired();
    },
    5 * 60 * 1000
  );

  // kiện này được kích hoạt mỗi khi một Promise bị "reject" (thất bại) nhưng không có khối .catch() nào để xử lý nó.
  window.addEventListener('unhandledrejection', event => {
    // Nó xảy ra khi bạn hủy một yêu cầu API đang chạy. Ví dụ: người dùng nhấp vào một trang, một yêu cầu API được gửi
    //  đi, nhưng họ ngay lập tức nhấp sang trang khác trước khi yêu cầu hoàn tất.
    if (event.reason?.name === 'AbortError') {
      event.preventDefault();
      return;
    }

    console.error('Unhandled API error:', event.reason);
  });

  console.log('API client setup complete');
};
