'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, Star, Calendar, DollarSign, Clock } from 'lucide-react';

interface CourseSortingProps {
  value: string;
  onChange: (value: string) => void;
}

export function CourseSorting({ value, onChange }: CourseSortingProps) {
  const sortOptions = [
    {
      value: 'popularity',
      label: 'Most Popular',
      icon: TrendingUp,
      description: 'Based on enrollment count',
    },
    {
      value: 'rating',
      label: 'Highest Rated',
      icon: Star,
      description: 'Based on rating score',
    },
    {
      value: 'newest',
      label: 'Newest',
      icon: Calendar,
      description: 'Recently added courses',
    },
    {
      value: 'price_low',
      label: 'Price: Low to High',
      icon: DollarSign,
      description: 'Sort by ascending price',
    },
    {
      value: 'price_high',
      label: 'Price: High to Low',
      icon: DollarSign,
      description: 'Sort by descending price',
    },
    {
      value: 'duration',
      label: 'Duration',
      icon: Clock,
      description: 'Sort by course duration',
    },
  ];

  const selectedOption = sortOptions.find(option => option.value === value);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-48">
        <div className="flex items-center gap-2">
          {selectedOption && <selectedOption.icon className="h-4 w-4" />}
          <SelectValue placeholder="Sort by" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map(option => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="flex flex-col items-start py-3"
          >
            <div className="flex w-full items-center gap-2">
              <option.icon className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="font-medium">{option.label}</span>
                {/* <span className="text-xs text-gray-500">
                  {option.description}
                </span> */}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
