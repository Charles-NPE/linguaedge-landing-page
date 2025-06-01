
import { startOfMonth, startOfQuarter, startOfYear, startOfDay, endOfDay } from 'date-fns';

export type DateRange = {
  from: string;
  to: string;
};

export type RangePreset = 'month' | 'quarter' | 'semester' | 'year' | 'custom';

const today = () => new Date();

export const getDateRange = (preset: RangePreset, customRange?: { from: Date; to: Date }): DateRange => {
  const now = today();
  
  switch (preset) {
    case 'month':
      return {
        from: startOfMonth(now).toISOString(),
        to: endOfDay(now).toISOString(),
      };
    
    case 'quarter':
      return {
        from: startOfQuarter(now).toISOString(),
        to: endOfDay(now).toISOString(),
      };
    
    case 'semester':
      const currentMonth = now.getMonth();
      const semesterStart = currentMonth < 6 
        ? new Date(now.getFullYear(), 0, 1) // Jan-Jun
        : new Date(now.getFullYear(), 6, 1); // Jul-Dec
      return {
        from: semesterStart.toISOString(),
        to: endOfDay(now).toISOString(),
      };
    
    case 'year':
      return {
        from: startOfYear(now).toISOString(),
        to: endOfDay(now).toISOString(),
      };
    
    case 'custom':
      if (!customRange) {
        return getDateRange('month');
      }
      return {
        from: startOfDay(customRange.from).toISOString(),
        to: endOfDay(customRange.to).toISOString(),
      };
    
    default:
      return getDateRange('month');
  }
};

export const formatDateRange = (range: DateRange): string => {
  const from = new Date(range.from).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const to = new Date(range.to).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  return `${from} – ${to}`;
};

export const getPresetLabel = (preset: RangePreset): string => {
  switch (preset) {
    case 'month': return 'This Month';
    case 'quarter': return 'Quarter-to-Date';
    case 'semester': return 'Semester';
    case 'year': return 'Year-to-Date';
    case 'custom': return 'Custom Range';
    default: return 'This Month';
  }
};
