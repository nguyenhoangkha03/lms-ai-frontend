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
      label: 'Phổ biến nhất',
      icon: TrendingUp,
      description: 'Dựa trên số lượng đăng ký',
    },
    {
      value: 'rating',
      label: 'Đánh giá cao nhất',
      icon: Star,
      description: 'Dựa trên điểm đánh giá',
    },
    {
      value: 'newest',
      label: 'Mới nhất',
      icon: Calendar,
      description: 'Khóa học mới được thêm',
    },
    {
      value: 'price_low',
      label: 'Giá thấp đến cao',
      icon: DollarSign,
      description: 'Sắp xếp theo giá tăng dần',
    },
    {
      value: 'price_high',
      label: 'Giá cao đến thấp',
      icon: DollarSign,
      description: 'Sắp xếp theo giá giảm dần',
    },
    {
      value: 'duration',
      label: 'Thời lượng',
      icon: Clock,
      description: 'Sắp xếp theo thời lượng khóa học',
    },
  ];

  const selectedOption = sortOptions.find(option => option.value === value);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-48">
        <div className="flex items-center gap-2">
          {selectedOption && <selectedOption.icon className="h-4 w-4" />}
          <SelectValue placeholder="Sắp xếp theo" />
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
                <span className="text-xs text-gray-500">
                  {option.description}
                </span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
