import { AxiosError, AxiosRequestConfig as _ } from 'axios';
import { sleep } from '@/lib/utils';

export interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: AxiosError) => boolean;
  exponentialBackoff?: boolean;
}

export class RetryPolicy {
  private static defaultConfig: RetryConfig = {
    retries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    retryCondition: (error: AxiosError) => {
      return !error.response || error.response.status >= 500;
    },
  };

  static async execute<T>(
    requestFn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...this.defaultConfig, ...config };
    let lastError: any;

    for (let attempt = 0; attempt <= finalConfig.retries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        if (
          error instanceof AxiosError &&
          !finalConfig.retryCondition!(error)
        ) {
          throw error;
        }

        if (attempt === finalConfig.retries) {
          throw error;
        }

        let delay = finalConfig.retryDelay;
        if (finalConfig.exponentialBackoff) {
          delay = delay * Math.pow(2, attempt);
        }

        delay += Math.random() * 1000;

        console.warn(
          `Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${finalConfig.retries + 1})`
        );
        await sleep(delay);
      }
    }

    throw lastError;
  }
}
