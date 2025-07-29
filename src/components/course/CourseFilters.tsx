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
import { ChevronDown, ChevronRight, Star } from 'lucide-react';
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
    { value: 'beginner', label: 'Cơ bản' },
    { value: 'intermediate', label: 'Trung cấp' },
    { value: 'advanced', label: 'Nâng cao' },
    { value: 'expert', label: 'Chuyên gia' },
    { value: 'all_levels', label: 'Mọi cấp độ' },
  ];

  const durations = [
    { value: 'short', label: 'Ngắn (< 3 giờ)' },
    { value: 'medium', label: 'Trung bình (3-10 giờ)' },
    { value: 'long', label: 'Dài (> 10 giờ)' },
  ];

  const features = [
    { value: 'certificate', label: 'Có chứng chỉ' },
    { value: 'captions', label: 'Có phụ đề' },
    { value: 'assignments', label: 'Có bài tập' },
    { value: 'downloadable', label: 'Tải tài liệu được' },
    { value: 'lifetime_access', label: 'Truy cập trọn đời' },
  ];

  const FilterSection = ({
    title,
    children,
    sectionKey,
  }: {
    title: string;
    children: React.ReactNode;
    sectionKey: keyof typeof expandedSections;
  }) => (
    <Collapsible
      open={expandedSections[sectionKey]}
      onOpenChange={() => toggleSection(sectionKey)}
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-left font-medium hover:text-blue-600">
        {title}
        {expandedSections[sectionKey] ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-4">{children}</CollapsibleContent>
    </Collapsible>
  );

  return (
    <div className="space-y-4">
      {/* Categories */}
      <FilterSection title="Danh mục" sectionKey="category">
        <div className="max-h-60 space-y-2 overflow-y-auto">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="all-categories"
              checked={!filters.category}
              onCheckedChange={() => onFiltersChange({ category: undefined })}
            />
            <Label htmlFor="all-categories" className="text-sm">
              Tất cả danh mục
            </Label>
          </div>
          {categories
            .filter(cat => cat.isActive && cat.courseCount > 0)
            .map(category => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={filters.category === category.slug}
                  onCheckedChange={checked =>
                    onFiltersChange({
                      category: checked ? category.slug : undefined,
                    })
                  }
                />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="flex w-full items-center justify-between text-sm"
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-gray-500">
                    ({category.courseCount})
                  </span>
                </Label>
              </div>
            ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Giá" sectionKey="price">
        <RadioGroup
          value={filters.price || 'all'}
          onValueChange={value =>
            onFiltersChange({ price: value as 'free' | 'paid' | 'all' })
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="price-all" />
            <Label htmlFor="price-all" className="text-sm">
              Tất cả
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="free" id="price-free" />
            <Label htmlFor="price-free" className="text-sm">
              Miễn phí
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="paid" id="price-paid" />
            <Label htmlFor="price-paid" className="text-sm">
              Có phí
            </Label>
          </div>
        </RadioGroup>
      </FilterSection>

      {/* Level */}
      <FilterSection title="Cấp độ" sectionKey="level">
        <div className="space-y-2">
          {levels.map(level => (
            <div key={level.value} className="flex items-center space-x-2">
              <Checkbox
                id={`level-${level.value}`}
                checked={filters.level?.includes(level.value) || false}
                onCheckedChange={checked =>
                  onFiltersChange({
                    level: checked ? [level.value] : undefined,
                  })
                }
              />
              <Label htmlFor={`level-${level.value}`} className="text-sm">
                {level.label}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Đánh giá" sectionKey="rating">
        <div className="space-y-2">
          {[5, 4, 3, 2].map(rating => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.rating === rating}
                onCheckedChange={checked =>
                  onFiltersChange({
                    rating: checked ? rating : undefined,
                  })
                }
              />
              <Label
                htmlFor={`rating-${rating}`}
                className="flex items-center gap-1 text-sm"
              >
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-3 w-3',
                        i < rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
                <span>từ {rating} sao trở lên</span>
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Duration */}
      <FilterSection title="Thời lượng" sectionKey="duration">
        <div className="space-y-2">
          {durations.map(duration => (
            <div key={duration.value} className="flex items-center space-x-2">
              <Checkbox
                id={`duration-${duration.value}`}
                checked={filters.duration === duration.value}
                onCheckedChange={checked =>
                  onFiltersChange({
                    duration: checked ? (duration.value as any) : undefined,
                  })
                }
              />
              <Label htmlFor={`duration-${duration.value}`} className="text-sm">
                {duration.label}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Features */}
      <FilterSection title="Tính năng" sectionKey="features">
        <div className="space-y-2">
          {features.map(feature => (
            <div key={feature.value} className="flex items-center space-x-2">
              <Checkbox
                id={`feature-${feature.value}`}
                checked={false} // You can implement this based on your needs
                onCheckedChange={checked => {
                  // Handle features filter
                }}
              />
              <Label htmlFor={`feature-${feature.value}`} className="text-sm">
                {feature.label}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Clear All Button */}
      <div className="border-t pt-4">
        <Button
          variant="outline"
          className="w-full"
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
          Xóa tất cả bộ lọc
        </Button>
      </div>
    </div>
  );
}
