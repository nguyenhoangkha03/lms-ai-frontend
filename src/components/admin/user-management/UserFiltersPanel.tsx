import React from 'react';
import { Filter, X } from 'lucide-react';
import { UsersQueryParams, Role } from '@/types/user-management';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';

interface UserFiltersPanelProps {
  onFilterChange: (filters: Partial<UsersQueryParams>) => void;
  currentFilters: UsersQueryParams;
  roles: Role[];
}

export const UserFiltersPanel: React.FC<UserFiltersPanelProps> = ({
  onFilterChange,
  currentFilters,
  roles,
}) => {
  const clearFilters = () => {
    onFilterChange({
      search: undefined,
      userType: undefined,
      status: undefined,
      emailVerified: undefined,
      twoFactorEnabled: undefined,
      country: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      lastLoginAfter: undefined,
      lastLoginBefore: undefined,
    });
  };

  const hasActiveFilters = () => {
    return !!(
      currentFilters.search ||
      currentFilters.userType ||
      currentFilters.status ||
      currentFilters.emailVerified !== undefined ||
      currentFilters.twoFactorEnabled !== undefined ||
      currentFilters.country ||
      currentFilters.dateFrom ||
      currentFilters.dateTo ||
      currentFilters.lastLoginAfter ||
      currentFilters.lastLoginBefore
    );
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
            <CardDescription>Filter users by various criteria</CardDescription>
          </div>
          {hasActiveFilters() && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-3 w-3" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {/* User Type Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium">User Type</label>
            <Select
              value={currentFilters.userType || 'all'}
              onValueChange={value =>
                onFilterChange({
                  userType: value === 'all' ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="teacher">Teachers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>
            <Select
              value={currentFilters.status || 'all'}
              onValueChange={value =>
                onFilterChange({ status: value === 'all' ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Country Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium">Country</label>
            <Input
              placeholder="Enter country..."
              value={currentFilters.country || ''}
              onChange={e =>
                onFilterChange({ country: e.target.value || undefined })
              }
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="mb-2 block text-sm font-medium">Sort By</label>
            <Select
              value={`${currentFilters.sortBy}-${currentFilters.sortOrder}`}
              onValueChange={value => {
                const [sortBy, sortOrder] = value.split('-');
                onFilterChange({
                  sortBy,
                  sortOrder: sortOrder as 'asc' | 'desc',
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="displayName-asc">Name A-Z</SelectItem>
                <SelectItem value="displayName-desc">Name Z-A</SelectItem>
                <SelectItem value="lastLoginAt-desc">
                  Last Login (Recent)
                </SelectItem>
                <SelectItem value="lastLoginAt-asc">
                  Last Login (Oldest)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Boolean Filters */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="emailVerified"
              checked={currentFilters.emailVerified === true}
              onCheckedChange={checked =>
                onFilterChange({
                  emailVerified: checked ? true : undefined,
                })
              }
            />
            <label htmlFor="emailVerified" className="text-sm">
              Email verified only
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="twoFactorEnabled"
              checked={currentFilters.twoFactorEnabled === true}
              onCheckedChange={checked =>
                onFilterChange({
                  twoFactorEnabled: checked ? true : undefined,
                })
              }
            />
            <label htmlFor="twoFactorEnabled" className="text-sm">
              Two-factor authentication enabled
            </label>
          </div>
        </div>

        <Separator />

        {/* Date Range Filters */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Created After
            </label>
            <DatePicker
              date={
                currentFilters.dateFrom
                  ? new Date(currentFilters.dateFrom)
                  : undefined
              }
              onDateChange={date =>
                onFilterChange({ dateFrom: date?.toISOString().split('T')[0] })
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Created Before
            </label>
            <DatePicker
              date={
                currentFilters.dateTo
                  ? new Date(currentFilters.dateTo)
                  : undefined
              }
              onDateChange={date =>
                onFilterChange({ dateTo: date?.toISOString().split('T')[0] })
              }
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <>
            <Separator />
            <div>
              <div className="mb-2 text-sm font-medium">Active Filters:</div>
              <div className="flex flex-wrap gap-2">
                {currentFilters.search && (
                  <Badge variant="secondary">
                    Search: {currentFilters.search}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => onFilterChange({ search: undefined })}
                    />
                  </Badge>
                )}
                {currentFilters.userType && (
                  <Badge variant="secondary">
                    Type: {currentFilters.userType}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => onFilterChange({ userType: undefined })}
                    />
                  </Badge>
                )}
                {currentFilters.status && (
                  <Badge variant="secondary">
                    Status: {currentFilters.status}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => onFilterChange({ status: undefined })}
                    />
                  </Badge>
                )}
                {currentFilters.emailVerified && (
                  <Badge variant="secondary">
                    Email Verified
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() =>
                        onFilterChange({ emailVerified: undefined })
                      }
                    />
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
