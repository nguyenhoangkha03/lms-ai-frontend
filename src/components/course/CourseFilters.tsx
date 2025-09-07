'use client';

import { useState } from 'react';
import { Category, CourseFilters as CourseFiltersType } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronRight,
  Star,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseFiltersProps {
  filters: CourseFiltersType;
  categories: Category[];
  onFiltersChange: (filters: Partial<CourseFiltersType>) => void;
}

export function CourseFilters({
  filters,
  categories,
  onFiltersChange,
}: CourseFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    level: true,
    rating: true,
    duration: true,
    features: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
    { value: 'all_levels', label: 'All Levels' },
  ];

  const durations = [
    { value: 'short', label: 'Short', subtitle: '< 3 hours' },
    { value: 'medium', label: 'Medium', subtitle: '3-10 hours' },
    { value: 'long', label: 'Long', subtitle: '> 10 hours' },
  ];

  const features = [
    { value: 'certificate', label: 'Certificate included' },
    { value: 'captions', label: 'Subtitles available' },
    { value: 'assignments', label: 'Has assignments' },
    { value: 'downloadable', label: 'Downloadable resources' },
    { value: 'lifetime_access', label: 'Lifetime access' },
  ];

  const FilterSection = ({
    title,
    children,
    sectionKey,
    count,
  }: {
    title: string;
    children: React.ReactNode;
    sectionKey: keyof typeof expandedSections;
    count?: number;
  }) => (
    <div className="rounded-xl border border-gray-100 bg-white transition-all duration-200 hover:border-gray-200 hover:shadow-sm">
      <Collapsible
        open={expandedSections[sectionKey]}
        onOpenChange={() => toggleSection(sectionKey)}
      >
        <CollapsibleTrigger className="group flex w-full items-center justify-between p-4 text-left">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900">{title}</span>
            {count !== undefined && (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                {count}
              </span>
            )}
          </div>
          <div
            className={cn(
              'rounded-lg p-1.5 transition-all duration-200',
              expandedSections[sectionKey]
                ? 'bg-gray-100 text-gray-700'
                : 'text-gray-400 group-hover:bg-gray-50 group-hover:text-gray-600'
            )}
          >
            {expandedSections[sectionKey] ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4">
          <div className="space-y-2">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  // Debug categories data
  console.log('📂 Categories Data:', categories);
  console.log('🔍 Filters:', filters);

  return (
    <div className="space-y-4 p-1">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <Filter className="h-5 w-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
      </div>

      {/* Categories */}
      <FilterSection
        title="Category"
        sectionKey="category"
        count={categories?.filter(cat => cat.isActive !== false).length || 0}
      >
        <div className="max-h-60 space-y-1 overflow-y-auto">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50">
            <Checkbox
              id="all-categories"
              checked={!filters.category}
              onCheckedChange={() => onFiltersChange({ category: undefined })}
              className="data-[state=checked]:border-gray-900 data-[state=checked]:bg-gray-900"
            />
            <span className="text-sm font-medium text-gray-700">
              All Categories
            </span>
          </label>
          {categories && categories.length > 0 ? (
            categories
              .filter(cat => cat.isActive !== false)
              .map(category => (
                <label
                  key={category.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                >
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={filters.category === category.slug}
                    onCheckedChange={checked =>
                      onFiltersChange({
                        category: checked ? category.slug : undefined,
                      })
                    }
                    className="data-[state=checked]:border-gray-900 data-[state=checked]:bg-gray-900"
                  />
                  <div className="flex w-full items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {category.name}
                    </span>
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                      {category.courseCount || 0}
                    </span>
                  </div>
                </label>
              ))
          ) : (
            <div className="rounded-lg bg-gray-50 p-3 text-center text-sm text-gray-500">
              No categories available
            </div>
          )}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price" sectionKey="price">
        <RadioGroup
          value={filters.price || 'all'}
          onValueChange={value =>
            onFiltersChange({ price: value as 'free' | 'paid' | 'all' })
          }
          className="space-y-1"
        >
          <label className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50">
            <RadioGroupItem
              value="all"
              id="price-all"
              className="data-[state=checked]:border-gray-900 data-[state=checked]:bg-gray-900"
            />
            <span className="text-sm font-medium text-gray-700">
              All Prices
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-green-50">
            <RadioGroupItem
              value="free"
              id="price-free"
              className="data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600"
            />
            <span className="text-sm font-medium text-green-700">Free</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-blue-50">
            <RadioGroupItem
              value="paid"
              id="price-paid"
              className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
            />
            <span className="text-sm font-medium text-blue-700">Paid</span>
          </label>
        </RadioGroup>
      </FilterSection>

      {/* Level */}
      <FilterSection title="Level" sectionKey="level">
        <div className="space-y-1">
          {levels.map(level => (
            <label
              key={level.value}
              className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
            >
              <Checkbox
                id={`level-${level.value}`}
                checked={filters.level?.includes(level.value) || false}
                onCheckedChange={checked =>
                  onFiltersChange({
                    level: checked ? [level.value] : undefined,
                  })
                }
                className="data-[state=checked]:border-gray-900 data-[state=checked]:bg-gray-900"
              />
              <span className="text-sm font-medium text-gray-700">
                {level.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating" sectionKey="rating">
        <div className="space-y-1">
          {[5, 4, 3, 2].map(rating => (
            <label
              key={rating}
              className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
            >
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.rating === rating}
                onCheckedChange={checked =>
                  onFiltersChange({
                    rating: checked ? rating : undefined,
                  })
                }
                className="data-[state=checked]:border-gray-900 data-[state=checked]:bg-gray-900"
              />
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {rating}+ stars
                </span>
              </div>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Duration */}
      <FilterSection title="Duration" sectionKey="duration">
        <div className="space-y-1">
          {durations.map(duration => (
            <label
              key={duration.value}
              className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
            >
              <Checkbox
                id={`duration-${duration.value}`}
                checked={filters.duration === duration.value}
                onCheckedChange={checked =>
                  onFiltersChange({
                    duration: checked ? (duration.value as any) : undefined,
                  })
                }
                className="data-[state=checked]:border-gray-900 data-[state=checked]:bg-gray-900"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">
                  {duration.label}
                </span>
                <span className="text-xs text-gray-500">
                  {duration.subtitle}
                </span>
              </div>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Features */}
      <FilterSection title="Features" sectionKey="features">
        <div className="space-y-1">
          {features.map(feature => (
            <label
              key={feature.value}
              className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
            >
              <Checkbox
                id={`feature-${feature.value}`}
                checked={false} // You can implement this based on your needs
                onCheckedChange={checked => {
                  // Handle features filter
                }}
                className="data-[state=checked]:border-gray-900 data-[state=checked]:bg-gray-900"
              />
              <span className="text-sm font-medium text-gray-700">
                {feature.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Clear All Button */}
      <div className="pt-4">
        <Button
          variant="outline"
          className="w-full border-gray-200 text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
          onClick={() =>
            onFiltersChange({
              category: undefined,
              level: undefined,
              price: 'all',
              rating: undefined,
              duration: undefined,
            })
          }
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Clear All Filters
        </Button>
      </div>
    </div>
  );
}
