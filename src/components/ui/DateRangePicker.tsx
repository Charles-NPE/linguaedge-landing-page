
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DateRangePickerProps {
  value: { from: Date; to: Date };
  onChange: (range: { from: Date; to: Date }) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<{ from?: Date; to?: Date }>({
    from: value.from,
    to: value.to
  });

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from) {
      setTempRange(range);
      
      // If both dates are selected, apply the range
      if (range.from && range.to) {
        onChange({ from: range.from, to: range.to });
        setIsOpen(false);
      }
    }
  };

  const handleApply = () => {
    if (tempRange.from && tempRange.to) {
      onChange({ from: tempRange.from, to: tempRange.to });
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "justify-start text-left font-normal",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value.from && value.to ? (
            `${format(value.from, 'dd MMM')} - ${format(value.to, 'dd MMM yyyy')}`
          ) : (
            'Custom Range'
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <Calendar
            mode="range"
            selected={{ from: tempRange.from, to: tempRange.to }}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={(date) => date > new Date()}
            className="pointer-events-auto"
          />
          <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              disabled={!tempRange.from || !tempRange.to}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
