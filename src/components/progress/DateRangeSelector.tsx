
import React from 'react';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { DateRange, RangePreset, getPresetLabel, getDateRange } from '@/utils/dateRanges';
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
  const handlePresetClick = (preset: RangePreset) => {
    onPresetChange(preset);
    
    // If it's not custom, update the custom range to match the preset
    // This ensures the calendar shows the correct dates when opened
    if (preset !== 'custom') {
      const dateRange = getDateRange(preset);
      const newRange = {
        from: new Date(dateRange.from),
        to: new Date(dateRange.to)
      };
      onCustomRangeChange(newRange);
    }
  };

  const handleCustomRangeChange = (range: { from: Date; to: Date }) => {
    onCustomRangeChange(range);
    onPresetChange('custom');
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset}
            variant={selectedPreset === preset ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetClick(preset)}
            className="text-sm"
          >
            {getPresetLabel(preset)}
          </Button>
        ))}
        
        {/* Custom range picker */}
        <DateRangePicker
          value={customRange}
          onChange={handleCustomRangeChange}
          className={cn(
            selectedPreset === 'custom' ? "border-primary bg-primary text-primary-foreground" : ""
          )}
        />
      </div>
    </div>
  );
};
