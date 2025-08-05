'use client';

import React, { useState } from 'react';
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  Calendar,
  DollarSign,
  Star,
  Clock,
  Tag,
  User,
  BookOpen,
  Languages,
  Award,
  RotateCcw,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import DatePickerWithRange, {
  DateRangePicker,
} from '@/components/ui/date-picker';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  useGetFacetedFiltersQuery,
  useGetFilterSuggestionsQuery,
} from '@/lib/redux/api/search-api';
import { SearchFilters, FacetedFilter } from '@/lib/types/search';
import { cn } from '@/lib/utils';

interface FacetedSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  query?: string;
  contentType?: string;
  className?: string;
  collapsible?: boolean;
  showActiveCount?: boolean;
}

export function FacetedSearch({
  filters,
  onFiltersChange,
  query = '',
  contentType = 'all',
  className,
  collapsible = true,
  showActiveCount = true,
}: FacetedSearchProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['categories', 'price', 'rating'])
  );
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  // API queries
  const { data: facetedFilters = [], isLoading: filtersLoading } =
    useGetFacetedFiltersQuery({
      query,
      contentType,
      includeZeroCounts: false,
    });

  const { data: filterSuggestions = [] } = useGetFilterSuggestionsQuery(
    { query, currentFilters: filters },
    { skip: !query }
  );

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories?.length) count += filters.categories.length;
    if (filters.tags?.length) count += filters.tags.length;
    if (filters.authors?.length) count += filters.authors.length;
    if (filters.instructors?.length) count += filters.instructors.length;
    if (filters.levels?.length) count += filters.levels.length;
    if (filters.languages?.length) count += filters.languages.length;
    if (filters.price?.min || filters.price?.max) count += 1;
    if (filters.rating?.min) count += 1;
    if (filters.duration?.min || filters.duration?.max) count += 1;
    if (filters.dateRange?.from || filters.dateRange?.to) count += 1;
    return count;
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({
      query: filters.query,
      page: 1,
      limit: filters.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
  };

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Update array filter
  const updateArrayFilter = (
    field: keyof SearchFilters,
    value: string,
    checked: boolean
  ) => {
    const currentValues = (filters[field] as string[]) || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);

    onFiltersChange({
      ...filters,
      [field]: newValues,
      page: 1,
    });
  };

  // Update range filter
  const updateRangeFilter = (
    field: 'price' | 'rating' | 'duration',
    values: number[]
  ) => {
    onFiltersChange({
      ...filters,
      [field]: {
        ...filters[field],
        min: values[0],
        max: values[1],
      },
      page: 1,
    });
  };

  // Render filter section
  const renderFilterSection = (filter: FacetedFilter) => {
    const isExpanded = expandedSections.has(filter.id);
    const searchTerm = searchTerms[filter.id] || '';

    // Filter options based on search term
    const filteredOptions = filter.searchable
      ? filter.options.filter(option =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : filter.options;

    const getSectionIcon = (id: string) => {
      switch (id) {
        case 'categories':
          return <BookOpen className="h-4 w-4" />;
        case 'tags':
          return <Tag className="h-4 w-4" />;
        case 'instructors':
        case 'authors':
          return <User className="h-4 w-4" />;
        case 'levels':
          return <Award className="h-4 w-4" />;
        case 'languages':
          return <Languages className="h-4 w-4" />;
        case 'price':
          return <DollarSign className="h-4 w-4" />;
        case 'rating':
          return <Star className="h-4 w-4" />;
        case 'duration':
          return <Clock className="h-4 w-4" />;
        case 'dateRange':
          return <Calendar className="h-4 w-4" />;
        default:
          return <Filter className="h-4 w-4" />;
      }
    };

    return (
      <div key={filter.id} className="border-b border-border last:border-b-0">
        <Collapsible
          open={isExpanded}
          onOpenChange={() => toggleSection(filter.id)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex w-full justify-between p-4 text-left font-medium hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                {getSectionIcon(filter.id)}
                <span>{filter.name}</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {filter.options.reduce((sum, opt) => sum + opt.count, 0)}
                </Badge>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="px-4 pb-4">
            {/* Search within section */}
            {filter.searchable && filter.options.length > 5 && (
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={`Tìm trong ${filter.name.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={e =>
                      setSearchTerms(prev => ({
                        ...prev,
                        [filter.id]: e.target.value,
                      }))
                    }
                    className="pl-9 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Filter content based on type */}
            {filter.type === 'checkbox' && (
              <div className="space-y-2">
                <ScrollArea
                  className={cn(
                    filteredOptions.length > 8 ? 'h-48' : 'max-h-none'
                  )}
                >
                  {filteredOptions.map(option => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2 py-1"
                    >
                      <Checkbox
                        id={`${filter.id}-${option.value}`}
                        checked={(
                          (filters[
                            filter.id as keyof SearchFilters
                          ] as string[]) || []
                        ).includes(option.value as string)}
                        onCheckedChange={checked =>
                          updateArrayFilter(
                            filter.id as keyof SearchFilters,
                            option.value as string,
                            !!checked
                          )
                        }
                      />
                      <Label
                        htmlFor={`${filter.id}-${option.value}`}
                        className="flex flex-1 cursor-pointer items-center justify-between text-sm"
                      >
                        <span>{option.label}</span>
                        <Badge variant="outline" className="text-xs">
                          {option.count}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}

            {filter.type === 'radio' && (
              <RadioGroup
                value={
                  (filters[filter.id as keyof SearchFilters] as string) || ''
                }
                onValueChange={value =>
                  onFiltersChange({
                    ...filters,
                    [filter.id]: value,
                    page: 1,
                  })
                }
              >
                {filteredOptions.map(option => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem
                      value={option.value as string}
                      id={`${filter.id}-${option.value}`}
                    />
                    <Label
                      htmlFor={`${filter.id}-${option.value}`}
                      className="flex flex-1 cursor-pointer items-center justify-between text-sm"
                    >
                      <span>{option.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {option.count}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {filter.type === 'range' && filter.range && (
              <div className="space-y-4">
                <div className="px-2">
                  <Slider
                    min={filter.range.min}
                    max={filter.range.max}
                    step={filter.range.step || 1}
                    value={[
                      (filters[filter.id as keyof SearchFilters] as any)?.min ||
                        filter.range.min,
                      (filters[filter.id as keyof SearchFilters] as any)?.max ||
                        filter.range.max,
                    ]}
                    onValueChange={values =>
                      updateRangeFilter(
                        filter.id as 'price' | 'rating' | 'duration',
                        values
                      )
                    }
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {filter.id === 'price' && '$'}
                    {(filters[filter.id as keyof SearchFilters] as any)?.min ||
                      filter.range.min}
                    {filter.id === 'rating' && '⭐'}
                    {filter.id === 'duration' && 'h'}
                  </span>
                  <span>
                    {filter.id === 'price' && '$'}
                    {(filters[filter.id as keyof SearchFilters] as any)?.max ||
                      filter.range.max}
                    {filter.id === 'rating' && '⭐'}
                    {filter.id === 'duration' && 'h'}
                  </span>
                </div>
              </div>
            )}

            {filter.type === 'select' && (
              <Select
                value={
                  (filters[filter.id as keyof SearchFilters] as string) || ''
                }
                onValueChange={value =>
                  onFiltersChange({
                    ...filters,
                    [filter.id]: value,
                    page: 1,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={`Chọn ${filter.name.toLowerCase()}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredOptions.map(option => (
                    <SelectItem
                      key={option.value}
                      value={option.value as string}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span>{option.label}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {option.count}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Special handling for date range */}
            {filter.id === 'dateRange' && (
              <div className="space-y-3">
                <DateRangePicker
                  dateFrom={
                    filters.dateRange?.from
                      ? new Date(filters.dateRange.from)
                      : undefined
                  }
                  dateTo={
                    filters.dateRange?.to
                      ? new Date(filters.dateRange.to)
                      : undefined
                  }
                  onDateFromChange={from => {
                    onFiltersChange({
                      ...filters,
                      dateRange: {
                        from: from?.toISOString(),
                        to: filters.dateRange?.to,
                      },
                      page: 1,
                    });
                  }}
                  onDateToChange={to => {
                    onFiltersChange({
                      ...filters,
                      dateRange: {
                        from: filters.dateRange?.from,
                        to: to?.toISOString(),
                      },
                      page: 1,
                    });
                  }}
                />
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  // Render active filters
  const renderActiveFilters = () => {
    const activeFilters: Array<{ label: string; onRemove: () => void }> = [];

    // Categories
    filters.categories?.forEach(category => {
      activeFilters.push({
        label: `Danh mục: ${category}`,
        onRemove: () => updateArrayFilter('categories', category, false),
      });
    });

    // Tags
    filters.tags?.forEach(tag => {
      activeFilters.push({
        label: `Thẻ: ${tag}`,
        onRemove: () => updateArrayFilter('tags', tag, false),
      });
    });

    // Price range
    if (filters.price?.min || filters.price?.max) {
      activeFilters.push({
        label: `Giá: ${filters.price.min || 0} - ${filters.price.max || '∞'}`,
        onRemove: () =>
          onFiltersChange({
            ...filters,
            price: undefined,
            page: 1,
          }),
      });
    }

    // Rating
    if (filters.rating?.min) {
      activeFilters.push({
        label: `Đánh giá: ${filters.rating.min}⭐+`,
        onRemove: () =>
          onFiltersChange({
            ...filters,
            rating: undefined,
            page: 1,
          }),
      });
    }

    // Duration
    if (filters.duration?.min || filters.duration?.max) {
      activeFilters.push({
        label: `Thời lượng: ${filters.duration.min || 0}h - ${filters.duration.max || '∞'}h`,
        onRemove: () =>
          onFiltersChange({
            ...filters,
            duration: undefined,
            page: 1,
          }),
      });
    }

    // Date range
    if (filters.dateRange?.from || filters.dateRange?.to) {
      const fromDate = filters.dateRange.from
        ? new Date(filters.dateRange.from).toLocaleDateString()
        : '';
      const toDate = filters.dateRange.to
        ? new Date(filters.dateRange.to).toLocaleDateString()
        : '';

      activeFilters.push({
        label: `Ngày: ${fromDate} - ${toDate}`,
        onRemove: () =>
          onFiltersChange({
            ...filters,
            dateRange: undefined,
            page: 1,
          }),
      });
    }

    // Levels
    filters.levels?.forEach(level => {
      activeFilters.push({
        label: `Cấp độ: ${level}`,
        onRemove: () => updateArrayFilter('levels', level, false),
      });
    });

    // Languages
    filters.languages?.forEach(language => {
      activeFilters.push({
        label: `Ngôn ngữ: ${language}`,
        onRemove: () => updateArrayFilter('languages', language, false),
      });
    });

    return activeFilters;
  };

  const activeFilters = renderActiveFilters();
  const activeCount = getActiveFiltersCount();

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Bộ lọc tìm kiếm
            {showActiveCount && activeCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeCount}
              </Badge>
            )}
          </CardTitle>

          {activeCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Xóa tất cả
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <div className="mt-3 space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Bộ lọc đã áp dụng:
            </Label>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 text-xs"
                >
                  {filter.label}
                  <button
                    onClick={filter.onRemove}
                    className="ml-1 rounded-full hover:bg-destructive/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {filtersLoading ? (
          <div className="p-6 text-center">
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="h-4 w-5/6 rounded bg-muted" />
            </div>
          </div>
        ) : facetedFilters.length > 0 ? (
          <div className="divide-y divide-border">
            {facetedFilters.map(renderFilterSection)}
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            <Filter className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>Không có bộ lọc nào khả dụng</p>
          </div>
        )}

        {/* Filter Suggestions */}
        {filterSuggestions.length > 0 && (
          <div className="border-t border-border p-4">
            <Label className="mb-3 block text-sm font-medium text-muted-foreground">
              Gợi ý lọc:
            </Label>
            <div className="space-y-2">
              {filterSuggestions.map((suggestion, index) => (
                <div key={index} className="space-y-1">
                  <div className="text-sm font-medium">{suggestion.field}:</div>
                  <div className="flex flex-wrap gap-1">
                    {suggestion.suggestions
                      .slice(0, 5)
                      .map((item, itemIndex) => (
                        <Button
                          key={itemIndex}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            updateArrayFilter(
                              suggestion.field as keyof SearchFilters,
                              item.value,
                              true
                            )
                          }
                        >
                          {item.value}
                          <Badge variant="secondary" className="ml-1 text-xs">
                            {item.count}
                          </Badge>
                        </Button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Filters */}
        <div className="border-t border-border p-4">
          <Label className="mb-3 block text-sm font-medium text-muted-foreground">
            Bộ lọc nhanh:
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  price: { min: 0, max: 0, isFree: true },
                  page: 1,
                })
              }
              className="justify-start"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Miễn phí
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  rating: { min: 4.5 },
                  page: 1,
                })
              }
              className="justify-start"
            >
              <Star className="mr-2 h-4 w-4" />
              Đánh giá cao
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  levels: ['Beginner'],
                  page: 1,
                })
              }
              className="justify-start"
            >
              <Award className="mr-2 h-4 w-4" />
              Người mới
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  dateRange: {
                    from: new Date(
                      Date.now() - 7 * 24 * 60 * 60 * 1000
                    ).toISOString(),
                    to: new Date().toISOString(),
                  },
                  page: 1,
                })
              }
              className="justify-start"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Tuần này
            </Button>
          </div>
        </div>

        {/* Save/Load Filter Presets */}
        <div className="border-t border-border p-4">
          <Label className="mb-3 block text-sm font-medium text-muted-foreground">
            Bộ lọc đã lưu:
          </Label>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                // Save current filters as preset
                const presets = JSON.parse(
                  localStorage.getItem('searchFilterPresets') || '[]'
                );
                const newPreset = {
                  id: Date.now().toString(),
                  name: `Preset ${presets.length + 1}`,
                  filters,
                  createdAt: new Date().toISOString(),
                };
                presets.push(newPreset);
                localStorage.setItem(
                  'searchFilterPresets',
                  JSON.stringify(presets)
                );
              }}
            >
              Lưu bộ lọc hiện tại
            </Button>

            {/* Load saved presets */}
            {(() => {
              const presets = JSON.parse(
                localStorage.getItem('searchFilterPresets') || '[]'
              );
              return presets.slice(0, 3).map((preset: any) => (
                <Button
                  key={preset.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between text-xs"
                  onClick={() =>
                    onFiltersChange({ ...preset.filters, page: 1 })
                  }
                >
                  <span>{preset.name}</span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      const updatedPresets = presets.filter(
                        (p: any) => p.id !== preset.id
                      );
                      localStorage.setItem(
                        'searchFilterPresets',
                        JSON.stringify(updatedPresets)
                      );
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Button>
              ));
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
