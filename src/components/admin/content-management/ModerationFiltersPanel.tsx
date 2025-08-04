'use client';

import React from 'react';
import { Filter, X, Calendar, AlertTriangle } from 'lucide-react';
import { ModerationQueryParams } from '@/types/content-management';
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
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';

interface ModerationFiltersPanelProps {
  onFilterChange: (filters: Partial<ModerationQueryParams>) => void;
  currentFilters: ModerationQueryParams;
}

export const ModerationFiltersPanel: React.FC<ModerationFiltersPanelProps> = ({
  onFilterChange,
  currentFilters,
}) => {
  const clearFilters = () => {
    onFilterChange({
      contentType: undefined,
      status: undefined,
      priority: undefined,
      moderatedBy: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      reportCount: undefined,
    });
  };

  const hasActiveFilters = () => {
    return !!(
      currentFilters.contentType ||
      currentFilters.status ||
      currentFilters.priority ||
      currentFilters.moderatedBy ||
      currentFilters.dateFrom ||
      currentFilters.dateTo ||
      currentFilters.reportCount
    );
  };

  const getFilterCount = () => {
    let count = 0;
    if (currentFilters.contentType) count++;
    if (currentFilters.status) count++;
    if (currentFilters.priority) count++;
    if (currentFilters.moderatedBy) count++;
    if (currentFilters.dateFrom) count++;
    if (currentFilters.dateTo) count++;
    if (currentFilters.reportCount) count++;
    return count;
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters() && (
                <Badge variant="secondary">{getFilterCount()}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Filter content by type, status, priority, and other criteria
            </CardDescription>
          </div>
          {hasActiveFilters() && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-3 w-3" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Content Type and Status */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label className="mb-2 block text-sm font-medium">
              Content Type
            </Label>
            <Select
              value={currentFilters.contentType || 'all'}
              onValueChange={value =>
                onFilterChange({
                  contentType: value === 'all' ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="course">Courses</SelectItem>
                <SelectItem value="lesson">Lessons</SelectItem>
                <SelectItem value="forum_post">Forum Posts</SelectItem>
                <SelectItem value="comment">Comments</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium">Status</Label>
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="requires_changes">
                  Requires Changes
                </SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium">Priority</Label>
            <Select
              value={currentFilters.priority || 'all'}
              onValueChange={value =>
                onFilterChange({
                  priority: value === 'all' ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium">
              Moderated By
            </Label>
            <Input
              placeholder="Moderator name..."
              value={currentFilters.moderatedBy || ''}
              onChange={e =>
                onFilterChange({ moderatedBy: e.target.value || undefined })
              }
            />
          </div>
        </div>

        <Separator />

        {/* Date Range Filters */}
        <div>
          <Label className="mb-3 block flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            Date Range
          </Label>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label className="mb-2 block text-sm text-muted-foreground">
                From Date
              </Label>
              <DatePicker
                date={
                  currentFilters.dateFrom
                    ? new Date(currentFilters.dateFrom)
                    : undefined
                }
                onDateChange={date =>
                  onFilterChange({
                    dateFrom: date?.toISOString().split('T')[0],
                  })
                }
              />
            </div>

            <div>
              <Label className="mb-2 block text-sm text-muted-foreground">
                To Date
              </Label>
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
        </div>

        <Separator />

        {/* Report Count Filter */}
        <div>
          <Label className="mb-3 block flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="h-4 w-4" />
            Minimum Report Count
          </Label>
          <div className="space-y-2">
            <Slider
              value={[currentFilters.reportCount || 0]}
              onValueChange={value =>
                onFilterChange({ reportCount: value[0] || undefined })
              }
              max={20}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 reports</span>
              <span className="font-medium">
                {currentFilters.reportCount || 0} reports
              </span>
              <span>20+ reports</span>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <>
            <Separator />
            <div>
              <Label className="mb-2 block text-sm font-medium">
                Active Filters:
              </Label>
              <div className="flex flex-wrap gap-2">
                {currentFilters.contentType && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Type: {currentFilters.contentType}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => onFilterChange({ contentType: undefined })}
                    />
                  </Badge>
                )}

                {currentFilters.status && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Status: {currentFilters.status}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => onFilterChange({ status: undefined })}
                    />
                  </Badge>
                )}

                {currentFilters.priority && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Priority: {currentFilters.priority}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => onFilterChange({ priority: undefined })}
                    />
                  </Badge>
                )}

                {currentFilters.moderatedBy && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Moderator: {currentFilters.moderatedBy}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => onFilterChange({ moderatedBy: undefined })}
                    />
                  </Badge>
                )}

                {currentFilters.dateFrom && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    From:{' '}
                    {new Date(currentFilters.dateFrom).toLocaleDateString()}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => onFilterChange({ dateFrom: undefined })}
                    />
                  </Badge>
                )}

                {currentFilters.dateTo && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    To: {new Date(currentFilters.dateTo).toLocaleDateString()}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => onFilterChange({ dateTo: undefined })}
                    />
                  </Badge>
                )}

                {currentFilters.reportCount &&
                  currentFilters.reportCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      Reports: {currentFilters.reportCount}+
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          onFilterChange({ reportCount: undefined })
                        }
                      />
                    </Badge>
                  )}
              </div>
            </div>
          </>
        )}

        {/* Quick Filter Presets */}
        <Separator />
        <div>
          <Label className="mb-3 block text-sm font-medium">
            Quick Filters:
          </Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onFilterChange({
                  status: 'pending',
                  priority: 'high',
                })
              }
            >
              High Priority Pending
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onFilterChange({
                  reportCount: 3,
                  status: 'pending',
                })
              }
            >
              Multiple Reports
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onFilterChange({
                  contentType: 'course',
                  status: 'pending',
                })
              }
            >
              Pending Courses
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onFilterChange({
                  status: 'flagged',
                })
              }
            >
              Flagged Content
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onFilterChange({
                  dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0],
                  status: 'pending',
                })
              }
            >
              Today's Submissions
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
