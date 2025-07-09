export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export class RequestTransformer {
  static paginationParams(params: PaginationParams): Record<string, any> {
    const transformed: Record<string, any> = {};

    if (params.page !== undefined) transformed.page = params.page;
    if (params.limit !== undefined) transformed.limit = params.limit;
    if (params.sortBy) transformed.sort_by = params.sortBy;
    if (params.sortOrder) transformed.sort_order = params.sortOrder;
    if (params.search) transformed.search = params.search.trim();

    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          transformed[key] = value;
        }
      });
    }

    return transformed;
  }

  static toSnakeCase(data: Record<string, any>): Record<string, any> {
    const transformed: Record<string, any> = {};

    Object.entries(data).forEach(([key, value]) => {
      const snakeKey = key.replace(
        /[A-Z]/g,
        letter => `_${letter.toLowerCase()}`
      );

      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        transformed[snakeKey] = this.toSnakeCase(value);
      } else {
        transformed[snakeKey] = value;
      }
    });

    return transformed;
  }

  static fileUpload(
    file: File,
    additionalData?: Record<string, any>
  ): FormData {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(
            key,
            typeof value === 'object' ? JSON.stringify(value) : String(value)
          );
        }
      });
    }

    return formData;
  }

  // Chuyển sang chuỗi ISO và đặt tên key cho đúng
  static dateRange(
    startDate?: Date | string,
    endDate?: Date | string
  ): Record<string, string> {
    const params: Record<string, string> = {};

    if (startDate) {
      params.start_date =
        startDate instanceof Date ? startDate.toISOString() : startDate;
    }

    if (endDate) {
      params.end_date =
        endDate instanceof Date ? endDate.toISOString() : endDate;
    }

    return params;
  }
}

export class ResponseTransformer {
  // Chuyển lại thành CamelCase
  public static toCamelCase<T = any>(data: any): T {
    if (data === null || data === undefined) return data;

    if (Array.isArray(data)) {
      return data.map(item => this.toCamelCase(item)) as unknown as T;
    }

    if (typeof data === 'object' && !(data instanceof Date)) {
      const transformed: any = {};

      Object.entries(data).forEach(([key, value]) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
          letter.toUpperCase()
        );
        transformed[camelKey] = this.toCamelCase(value);
      });

      return transformed as T;
    }

    return data as T;
  }

  // Chuẩn hóa phản hồi phân trang
  static pagination<T>(response: any): {
    items: T[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  } {
    const items = Array.isArray(response.data)
      ? response.data
      : response.items || [];
    const meta = response.meta || response.pagination || {};

    return {
      items: items.map((item: T) => this.toCamelCase<T>(item)),
      meta: {
        total: meta.total || 0,
        page: meta.page || 1,
        limit: meta.limit || 20,
        totalPages:
          meta.totalPages ||
          meta.total_pages ||
          Math.ceil((meta.total || 0) / (meta.limit || 20)),
        hasNext:
          meta.hasNext !== undefined ? meta.hasNext : meta.has_next || false,
        hasPrevious:
          meta.hasPrevious !== undefined
            ? meta.hasPrevious
            : meta.has_previous || false,
      },
    };
  }

  // Định dạng lỗi chung
  static error(error: any): {
    message: string;
    errors: string[];
    code?: string;
  } {
    let message = 'An unexpected error occurred';
    let errors: string[] = [];
    let code: string | undefined;

    if (error.response?.data) {
      const data = error.response.data;
      message = data.message || data.error || message;
      errors = data.errors || data.details || [];
      code = data.code;
    } else if (error.message) {
      message = error.message;
    }

    return { message, errors, code };
  }
}
