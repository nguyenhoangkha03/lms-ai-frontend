import { baseApi } from '@/lib/api/base-api';
import { Role } from './role-api';

export interface Permission {
  id: string;
  name: string;
  displayName?: string;
  resource: string;
  action: string;
  description?: string;
  category?: string;
  priority?: number;
  conditions?: string;
  isSystemPermission?: boolean;
  isActive?: boolean;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  roles?: Role[];
  users?: any[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  // Virtual properties
  fullName?: string;
  isAdminPermission?: boolean;
  displayText?: string;
}

export interface CreatePermissionDto {
  name: string;
  displayName?: string;
  resource: string;
  action: string;
  description?: string;
  category?: string;
  priority?: number;
  conditions?: string;
  isSystemPermission?: boolean;
  isActive?: boolean;
}

export interface UpdatePermissionDto {
  name?: string;
  displayName?: string;
  resource?: string;
  action?: string;
  description?: string;
  category?: string;
  priority?: number;
  conditions?: string;
  isSystemPermission?: boolean;
  isActive?: boolean;
}

export interface PermissionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  resource?: string;
  action?: string;
  category?: string;
}

export interface PermissionListResponse {
  data: Permission[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const permissionApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get all permissions
    getPermissions: builder.query<Permission[], PermissionQueryParams | void>({
      query: params => ({
        url: '/permissions',
        params,
      }),
      providesTags: ['Permissions'],
    }),

    // Get permission by ID
    getPermissionById: builder.query<Permission, string>({
      query: id => `/permissions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Permission', id }],
    }),

    // Get permissions by category
    getPermissionsByCategory: builder.query<Permission[], string>({
      query: category => `/permissions/category/${category}`,
      providesTags: ['Permissions'],
    }),

    // Get permissions by resource
    getPermissionsByResource: builder.query<Permission[], string>({
      query: resource => `/permissions/resource/${resource}`,
      providesTags: ['Permissions'],
    }),

    // Create new permission
    createPermission: builder.mutation<Permission, CreatePermissionDto>({
      query: permissionData => ({
        url: '/permissions',
        method: 'POST',
        body: permissionData,
      }),
      invalidatesTags: ['Permissions'],
    }),

    // Update permission
    updatePermission: builder.mutation<
      Permission,
      { id: string; data: UpdatePermissionDto }
    >({
      query: ({ id, data }) => ({
        url: `/permissions/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Permission', id },
        'Permissions',
      ],
    }),

    // Delete permission
    deletePermission: builder.mutation<void, string>({
      query: id => ({
        url: `/permissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Permission', id },
        'Permissions',
      ],
    }),

    // Get permission categories
    getPermissionCategories: builder.query<string[], void>({
      query: () => '/permissions/categories',
      providesTags: ['Permissions'],
    }),

    // Get permission resources
    getPermissionResources: builder.query<string[], void>({
      query: () => '/permissions/resources',
      providesTags: ['Permissions'],
    }),

    // Get permission actions
    getPermissionActions: builder.query<string[], void>({
      query: () => '/permissions/actions',
      providesTags: ['Permissions'],
    }),

    // Bulk update permissions
    bulkUpdatePermissions: builder.mutation<
      void,
      { permissionIds: string[]; updates: Partial<UpdatePermissionDto> }
    >({
      query: ({ permissionIds, updates }) => ({
        url: '/bulk-update',
        method: 'PATCH',
        body: { permissionIds, updates },
      }),
      invalidatesTags: ['Permissions'],
    }),

    // Get permission statistics
    getPermissionStats: builder.query<
      {
        total: number;
        byResource: Record<string, number>;
        byAction: Record<string, number>;
        byCategory: Record<string, number>;
        mostUsed: Permission[];
        leastUsed: Permission[];
      },
      void
    >({
      query: () => '/stats',
      providesTags: ['Permissions'],
    }),

    // Search permissions
    searchPermissions: builder.query<
      Permission[],
      { query: string; filters?: any }
    >({
      query: ({ query, filters = {} }) => {
        const params = new URLSearchParams();
        params.set('search', query);
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
        return `/search?${params.toString()}`;
      },
      providesTags: ['Permissions'],
    }),

    // Check permission exists
    checkPermissionExists: builder.query<
      boolean,
      { resource: string; action: string }
    >({
      query: ({ resource, action }) =>
        `/check?resource=${resource}&action=${action}`,
    }),
  }),
});

export const {
  useGetPermissionsQuery,
  useGetPermissionByIdQuery,
  useGetPermissionsByCategoryQuery,
  useGetPermissionsByResourceQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useGetPermissionCategoriesQuery,
  useGetPermissionResourcesQuery,
  useGetPermissionActionsQuery,
  useBulkUpdatePermissionsMutation,
  useGetPermissionStatsQuery,
  useSearchPermissionsQuery,
  useCheckPermissionExistsQuery,
} = permissionApi;
