
import React from 'react';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { DateRange, RangePreset, getPresetLabel } from '@/utils/dateRanges';
import { cn } from '@/lib/utils';

interface DateRangeSelectorProps {
  selectedPreset: RangePreset;
  onPresetChange: (preset: RangePreset) => void;
  customRange: { from: Date; to: Date };
  onCustomRangeChange: (range: { from: Date; to: Date }) => void;
  className?: string;
}

const presets: RangePreset[] = ['month', 'quarter', 'semester', 'year'];

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  selectedPreset,
  onPresetChange,
  customRange,
  onCustomRangeChange,
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset}
            variant={selectedPreset === preset ? "default" : "outline"}
            size="sm"
            onClick={() => onPresetChange(preset)}
            className="text-sm"
          >
            {getPresetLabel(preset)}
          </Button>
        ))}
        
        {/* Custom range picker */}
        <DateRangePicker
          value={customRange}
          onChange={(range) => {
            onCustomRangeChange(range);
            onPresetChange('custom');
          }}
          className={cn(
            selectedPreset === 'custom' ? "border-primary bg-primary text-primary-foreground" : ""
          )}
        />
      </div>
    </div>
  );
};
