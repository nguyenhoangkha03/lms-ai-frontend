import { baseApi } from '@/lib/api/base-api';

export interface Role {
  id: string;
  name: string;
  description?: string;
  displayName?: string;
  isSystemRole: boolean;
  isActive: boolean;
  level: number;
  color?: string;
  icon?: string;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  permissions?: Permission[];
  permissionIds?: string[];
  users?: User[];
  userCount?: number;
  permissionCount?: number;
  createdAt: string;
  updatedAt: string;
  // Virtual properties
  isAdminRole?: boolean;
  displayText?: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  category?: string;
  priority?: number;
  conditions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  displayName?: string;
  level?: number;
  color?: string;
  icon?: string;
  isSystemRole?: boolean;
  isActive?: boolean;
  permissionIds?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  displayName?: string;
  level?: number;
  color?: string;
  icon?: string;
  isSystemRole?: boolean;
  isActive?: boolean;
}

export interface AssignPermissionsDto {
  permissionIds: string[];
}

export interface RoleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  level?: number;
}

export interface RoleListResponse {
  data: Role[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RoleFormData {
  name: string;
  displayName: string;
  description: string;
  level: number;
  color: string;
  icon: string;
  isSystemRole: boolean;
  isActive: boolean;
  permissionIds: string[];
}

export const roleApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get all roles
    getRoles: builder.query<Role[], RoleQueryParams | void>({
      query: params => ({
        url: '/roles',
        params,
      }),
      providesTags: ['Roles'],
    }),

    // Get role by ID
    getRoleById: builder.query<Role, string>({
      query: id => `/roles/${id}`,
      providesTags: (result, error, id) => [{ type: 'Role', id }],
    }),

    // Create new role
    createRole: builder.mutation<Role, CreateRoleDto>({
      query: roleData => ({
        url: '/roles',
        method: 'POST',
        body: roleData,
      }),
      invalidatesTags: ['Roles'],
    }),

    // Update role
    updateRole: builder.mutation<Role, { id: string; data: UpdateRoleDto }>({
      query: ({ id, data }) => ({
        url: `/roles/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Role', id },
        'Roles',
      ],
    }),

    // Delete role
    deleteRole: builder.mutation<void, string>({
      query: id => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Role', id }, 'Roles'],
    }),

    // Assign permissions to role
    assignPermissions: builder.mutation<
      Role,
      { id: string; permissionIds: string[] }
    >({
      query: ({ id, permissionIds }) => ({
        url: `/roles/${id}/permissions`,
        method: 'POST',
        body: { permissionIds },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Role', id },
        'RolePermissions',
      ],
    }),

    // Remove permissions from role
    removePermissions: builder.mutation<
      Role,
      { id: string; permissionIds: string[] }
    >({
      query: ({ id, permissionIds }) => ({
        url: `/roles/${id}/permissions`,
        method: 'DELETE',
        body: { permissionIds },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Role', id },
        'RolePermissions',
      ],
    }),

    // Get role permissions
    getRolePermissions: builder.query<Permission[], string>({
      query: roleId => `/roles/${roleId}/permissions`,
      providesTags: (result, error, roleId) => [
        { type: 'RolePermissions', id: roleId },
      ],
    }),

    // Bulk update roles
    bulkUpdateRoles: builder.mutation<
      void,
      { roleIds: string[]; updates: Partial<UpdateRoleDto> }
    >({
      query: ({ roleIds, updates }) => ({
        url: '/bulk-update',
        method: 'PATCH',
        body: { roleIds, updates },
      }),
      invalidatesTags: ['Roles'],
    }),

    // Get role statistics
    getRoleStats: builder.query<
      {
        total: number;
        active: number;
        inactive: number;
        systemRoles: number;
        customRoles: number;
        byLevel: Record<string, number>;
      },
      void
    >({
      query: () => '/stats',
      providesTags: ['Roles'],
    }),

    // Search roles
    searchRoles: builder.query<Role[], { query: string; filters?: any }>({
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
      providesTags: ['Roles'],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignPermissionsMutation,
  useRemovePermissionsMutation,
  useGetRolePermissionsQuery,
  useBulkUpdateRolesMutation,
  useGetRoleStatsQuery,
  useSearchRolesQuery,
} = roleApi;
