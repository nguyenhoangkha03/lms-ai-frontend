'use client';

import React from 'react';
import {
  X,
  Filter,
  Calendar,
  User,
  Tag,
  FileType,
  Shield,
  RotateCcw,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import {
  FileType as FileTypeEnum,
  FileAccessLevel,
  FileProcessingStatus,
} from '@/lib/types/file-management';

interface FileFilterPanelProps {
  filters: {
    fileType?: FileTypeEnum | '';
    accessLevel?: FileAccessLevel | '';
    processingStatus?: FileProcessingStatus | '';
    dateRange?: string;
    uploader?: string;
    tags?: string;
    sizeMin?: number;
    sizeMax?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

export function FileFilterPanel({
  filters,
  onFiltersChange,
  onClose,
}: FileFilterPanelProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      fileType: '',
      accessLevel: '',
      processingStatus: '',
      dateRange: '',
      uploader: '',
      tags: '',
      sizeMin: undefined,
      sizeMax: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'sortBy' || key === 'sortOrder') return false;
      return value !== '' && value !== undefined && value !== null;
    }).length;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filters</CardTitle>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} active
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              disabled={getActiveFiltersCount() === 0}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* File Type Filter */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <FileType className="h-4 w-4" />
            File Type
          </Label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {[
              { value: '', label: 'All Types' },
              { value: 'image', label: 'Images' },
              { value: 'video', label: 'Videos' },
              { value: 'audio', label: 'Audio' },
              { value: 'document', label: 'Documents' },
              { value: 'archive', label: 'Archives' },
              { value: 'other', label: 'Other' },
            ].map(type => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={filters.fileType === type.value}
                  onCheckedChange={checked => {
                    updateFilter('fileType', checked ? type.value : '');
                  }}
                />
                <Label
                  htmlFor={`type-${type.value}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Access Level Filter */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Access Level
          </Label>
          <Select
            value={filters.accessLevel || ''}
            onValueChange={value => updateFilter('accessLevel', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All access levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Access Levels</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="enrolled_only">Enrolled Only</SelectItem>
              <SelectItem value="premium_only">Premium Only</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Processing Status Filter */}
        <div className="space-y-3">
          <Label>Processing Status</Label>
          <Select
            value={filters.processingStatus || ''}
            onValueChange={value => updateFilter('processingStatus', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Date Range Filter */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upload Date
          </Label>
          <Select
            value={filters.dateRange || ''}
            onValueChange={value => updateFilter('dateRange', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* File Size Filter */}
        <div className="space-y-3">
          <Label>File Size Range</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Min Size (MB)
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={
                  filters.sizeMin
                    ? (filters.sizeMin / (1024 * 1024)).toFixed(1)
                    : ''
                }
                onChange={e => {
                  const value = e.target.value;
                  updateFilter(
                    'sizeMin',
                    value ? parseFloat(value) * 1024 * 1024 : undefined
                  );
                }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Max Size (MB)
              </Label>
              <Input
                type="number"
                placeholder="∞"
                value={
                  filters.sizeMax
                    ? (filters.sizeMax / (1024 * 1024)).toFixed(1)
                    : ''
                }
                onChange={e => {
                  const value = e.target.value;
                  updateFilter(
                    'sizeMax',
                    value ? parseFloat(value) * 1024 * 1024 : undefined
                  );
                }}
              />
            </div>
          </div>
          {(filters.sizeMin || filters.sizeMax) && (
            <div className="text-xs text-muted-foreground">
              Range:{' '}
              {filters.sizeMin ? formatFileSize(filters.sizeMin) : '0 Bytes'} -{' '}
              {filters.sizeMax ? formatFileSize(filters.sizeMax) : '∞'}
            </div>
          )}
        </div>

        <Separator />

        {/* Tags Filter */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </Label>
          <Input
            placeholder="Search by tags (comma separated)"
            value={filters.tags || ''}
            onChange={e => updateFilter('tags', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Enter tags separated by commas (e.g., education, video, tutorial)
          </p>
        </div>

        <Separator />

        {/* Uploader Filter */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Uploader
          </Label>
          <Input
            placeholder="Search by uploader name or email"
            value={filters.uploader || ''}
            onChange={e => updateFilter('uploader', e.target.value)}
          />
        </div>

        <Separator />

        {/* Sort Options */}
        <div className="space-y-3">
          <Label>Sort Options</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Sort By</Label>
              <Select
                value={filters.sortBy || 'createdAt'}
                onValueChange={value => updateFilter('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="updatedAt">Date Modified</SelectItem>
                  <SelectItem value="originalName">File Name</SelectItem>
                  <SelectItem value="fileSize">File Size</SelectItem>
                  <SelectItem value="downloadCount">Download Count</SelectItem>
                  <SelectItem value="viewCount">View Count</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Order</Label>
              <Select
                value={filters.sortOrder || 'desc'}
                onValueChange={value => updateFilter('sortOrder', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Quick Filter Presets */}
        <div className="space-y-3">
          <Label>Quick Filters</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateFilter('fileType', 'image');
                updateFilter('processingStatus', 'completed');
              }}
            >
              Ready Images
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateFilter('fileType', 'video');
                updateFilter('processingStatus', 'processing');
              }}
            >
              Processing Videos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateFilter('accessLevel', 'public');
              }}
            >
              Public Files
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateFilter('dateRange', 'today');
              }}
            >
              Today's Uploads
            </Button>
          </div>
        </div>

        {/* Active Filters Summary */}
        {getActiveFiltersCount() > 0 && (
          <div className="space-y-3">
            <Label>Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (
                  !value ||
                  value === '' ||
                  key === 'sortBy' ||
                  key === 'sortOrder'
                )
                  return null;

                let displayValue = value.toString();
                if (key === 'sizeMin')
                  displayValue = `Min: ${formatFileSize(value as number)}`;
                if (key === 'sizeMax')
                  displayValue = `Max: ${formatFileSize(value as number)}`;
                if (key === 'dateRange') displayValue = `Date: ${value}`;
                if (key === 'fileType') displayValue = `Type: ${value}`;
                if (key === 'accessLevel') displayValue = `Access: ${value}`;
                if (key === 'processingStatus')
                  displayValue = `Status: ${value}`;
                if (key === 'uploader') displayValue = `Uploader: ${value}`;
                if (key === 'tags') displayValue = `Tags: ${value}`;

                return (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {displayValue}
                    <button
                      onClick={() => updateFilter(key, '')}
                      className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Apply Filters Button */}
        <div className="flex justify-between gap-3">
          <Button variant="outline" onClick={clearFilters} className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset All
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Apply Filters
          </Button>
        </div>

        {/* Filter Tips */}
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <div className="mb-1 font-medium">Filter Tips:</div>
            <ul className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
              <li>• Use tags to find specific content types</li>
              <li>• Combine multiple filters for precise results</li>
              <li>• Date filters help find recent uploads</li>
              <li>• Size filters are useful for storage management</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
