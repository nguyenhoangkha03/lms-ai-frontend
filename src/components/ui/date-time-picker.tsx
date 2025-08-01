'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, Clock } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date and time',
  disabled = false,
  className,
}) => {
  const [open, setOpen] = useState(false);

  // Parse the current value
  const currentDate = value ? new Date(value) : undefined;
  const isValidDate = currentDate && isValid(currentDate);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    isValidDate ? currentDate : undefined
  );

  const [time, setTime] = useState({
    hours: isValidDate ? format(currentDate, 'HH') : '09',
    minutes: isValidDate ? format(currentDate, 'mm') : '00',
  });

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      updateDateTime(date, time.hours, time.minutes);
    }
  };

  // Handle time change
  const handleTimeChange = (field: 'hours' | 'minutes', value: string) => {
    const newTime = { ...time, [field]: value };
    setTime(newTime);

    if (selectedDate) {
      updateDateTime(selectedDate, newTime.hours, newTime.minutes);
    }
  };

  // Update the combined date and time
  const updateDateTime = (date: Date, hours: string, minutes: string) => {
    const combinedDate = new Date(date);
    combinedDate.setHours(parseInt(hours, 10));
    combinedDate.setMinutes(parseInt(minutes, 10));
    combinedDate.setSeconds(0);
    combinedDate.setMilliseconds(0);

    onChange(combinedDate.toISOString());
  };

  // Generate hour and minute options
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0')
  ).filter((_, i) => i % 5 === 0); // Show only 5-minute intervals

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground'
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              <span>
                {format(selectedDate, 'PPP')} at {time.hours}:{time.minutes}
              </span>
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="space-y-3 p-3">
            {/* Calendar */}
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
            />

            {/* Time Selection */}
            <div className="border-t pt-3">
              <div className="mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <Label className="text-sm font-medium">Time</Label>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={time.hours}
                  onValueChange={value => handleTimeChange('hours', value)}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map(hour => (
                      <SelectItem key={hour} value={hour}>
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="text-sm font-medium">:</span>

                <Select
                  value={time.minutes}
                  onValueChange={value => handleTimeChange('minutes', value)}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map(minute => (
                      <SelectItem key={minute} value={minute}>
                        {minute}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const now = new Date();
                    setSelectedDate(now);
                    const currentTime = {
                      hours: format(now, 'HH'),
                      minutes: format(now, 'mm'),
                    };
                    setTime(currentTime);
                    updateDateTime(now, currentTime.hours, currentTime.minutes);
                  }}
                >
                  Now
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTime({ hours: '09', minutes: '00' });
                    if (selectedDate) {
                      updateDateTime(selectedDate, '09', '00');
                    }
                  }}
                >
                  9:00 AM
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="ml-auto"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
