import { isRejectedWithValue, Middleware } from '@reduxjs/toolkit';
import { addToast } from '../slices/ui';

export const errorHandlerMiddleware: Middleware = store => next => action => {
  if (isRejectedWithValue(action)) {
    const error = action.payload;

    // loại action mà không muốn hiển thị thông báo lỗi
    const skipToastErrorTypes = [
      'auth/getCurrentUser/rejected',
      'query/pending',
    ];

    if (!skipToastErrorTypes.some(type => action.type.includes(type))) {
      let errorMessage = 'An unexpected error occurred';

      if (error && typeof error === 'object') {
        if ('data' in error && error.data && typeof error.data === 'object') {
          const errorData = error.data as any;
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else if ('message' in error) {
          errorMessage = error.message as string;
        }
      }

      store.dispatch(
        addToast({
          type: 'error',
          message: errorMessage,
          duration: 5000,
        })
      );
    }
  }

  return next(action);
};
