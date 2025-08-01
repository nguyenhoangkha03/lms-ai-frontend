'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronDown, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxItems?: number;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Chọn...',
  disabled = false,
  maxItems,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOptions = options.filter(option =>
    value.includes(option.value)
  );

  const handleSelect = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      if (!maxItems || value.length < maxItems) {
        onChange([...value, optionValue]);
      }
    }
  };

  const handleRemove = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue));
  };

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className="w-full justify-between"
          >
            <span>
              {selectedOptions.length > 0
                ? `Đã chọn ${selectedOptions.length} mục`
                : placeholder}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <Input
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.map(option => (
                <div
                  key={option.value}
                  className="flex cursor-pointer items-center space-x-2 rounded p-2 hover:bg-gray-100"
                  onClick={() => handleSelect(option.value)}
                >
                  <div className="flex h-4 w-4 items-center justify-center">
                    {value.includes(option.value) && (
                      <Check className="h-3 w-3 text-blue-600" />
                    )}
                  </div>
                  <span className="flex-1">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map(option => (
            <Badge
              key={option.value}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleRemove(option.value)}
            >
              {option.label}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
