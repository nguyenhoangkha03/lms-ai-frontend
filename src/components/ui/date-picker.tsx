'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  disableFuture?: boolean;
  disablePast?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = 'Pick a date',
  disabled = false,
  className,
  disableFuture = false,
  disablePast = false,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onDateChange?.(selectedDate);
    setOpen(false);
  };

  const getDisabledDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (disableFuture && date > today) {
      return true;
    }

    if (disablePast && date < today) {
      return true;
    }

    if (minDate && date < minDate) {
      return true;
    }

    if (maxDate && date > maxDate) {
      return true;
    }

    return false;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={getDisabledDates}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

interface DateRangePickerProps {
  dateFrom?: Date;
  dateTo?: Date;
  onDateFromChange?: (date: Date | undefined) => void;
  onDateToChange?: (date: Date | undefined) => void;
  placeholderFrom?: string;
  placeholderTo?: string;
  disabled?: boolean;
  className?: string;
  disableFuture?: boolean;
  disablePast?: boolean;
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  placeholderFrom = 'From date',
  placeholderTo = 'To date',
  disabled = false,
  className,
  disableFuture = false,
  disablePast = false,
}: DateRangePickerProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      <DatePicker
        date={dateFrom}
        onDateChange={onDateFromChange}
        placeholder={placeholderFrom}
        disabled={disabled}
        disableFuture={disableFuture}
        disablePast={disablePast}
        maxDate={dateTo}
        className="flex-1"
      />
      <DatePicker
        date={dateTo}
        onDateChange={onDateToChange}
        placeholder={placeholderTo}
        disabled={disabled}
        disableFuture={disableFuture}
        disablePast={disablePast}
        minDate={dateFrom}
        className="flex-1"
      />
    </div>
  );
}

// Time picker component for more precise datetime selection
interface TimePickerProps {
  time?: string; // Format: "HH:mm"
  onTimeChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minTime?: string;
  maxTime?: string;
  step?: number; // Minutes step, default 15
}

export function TimePicker({
  time,
  onTimeChange,
  placeholder = 'Select time',
  disabled = false,
  className,
  minTime = '00:00',
  maxTime = '23:59',
  step = 15,
}: TimePickerProps) {
  const generateTimeOptions = () => {
    const options: string[] = [];
    const startHour = parseInt(minTime.split(':')[0]);
    const startMinute = parseInt(minTime.split(':')[1]);
    const endHour = parseInt(maxTime.split(':')[0]);
    const endMinute = parseInt(maxTime.split(':')[1]);

    for (let hour = startHour; hour <= endHour; hour++) {
      const minuteStart = hour === startHour ? startMinute : 0;
      const minuteEnd = hour === endHour ? endMinute : 59;

      for (let minute = minuteStart; minute <= minuteEnd; minute += step) {
        if (minute > 59) break;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }

    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <select
      value={time || ''}
      onChange={e => onTimeChange?.(e.target.value)}
      disabled={disabled}
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {timeOptions.map(timeOption => (
        <option key={timeOption} value={timeOption}>
          {timeOption}
        </option>
      ))}
    </select>
  );
}

// Combined DateTime picker
interface DateTimePickerProps {
  date?: Date;
  onDateTimeChange?: (datetime: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  disableFuture?: boolean;
  disablePast?: boolean;
  timeStep?: number;
}

export function DateTimePicker({
  date,
  onDateTimeChange,
  placeholder = 'Select date and time',
  disabled = false,
  className,
  disableFuture = false,
  disablePast = false,
  timeStep = 15,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date
  );
  const [selectedTime, setSelectedTime] = React.useState<string>(
    date ? format(date, 'HH:mm') : ''
  );

  React.useEffect(() => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(hours, minutes, 0, 0);
      onDateTimeChange?.(newDateTime);
    } else if (!selectedDate) {
      onDateTimeChange?.(undefined);
    }
  }, [selectedDate, selectedTime, onDateTimeChange]);

  const handleDateChange = (newDate: Date | undefined) => {
    setSelectedDate(newDate);
    if (!newDate) {
      setSelectedTime('');
    }
  };

  const handleTimeChange = (newTime: string) => {
    setSelectedTime(newTime);
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <DatePicker
        date={selectedDate}
        onDateChange={handleDateChange}
        placeholder="Select date"
        disabled={disabled}
        disableFuture={disableFuture}
        disablePast={disablePast}
        className="flex-1"
      />
      <TimePicker
        time={selectedTime}
        onTimeChange={handleTimeChange}
        placeholder="Time"
        disabled={disabled || !selectedDate}
        step={timeStep}
        className="flex-1"
      />
    </div>
  );
}

export default DatePicker;
