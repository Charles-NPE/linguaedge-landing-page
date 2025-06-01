
import { useQuery } from "@tanstack/react-query";
import { useCorrections } from "./useCorrections";
import { Correction } from "@/types/correction.types";
import { DateRange } from "@/utils/dateRanges";

export interface ProgressMetrics {
  totalEssays: number;
  averageWords: number;
  currentLevel: string;
  wordCountTrend: Array<{ date: string; words: number }>;
  errorsByType: Array<{ type: string; count: number }>;
  errorDensityTrend: Array<{ date: string; density: number }>;
  levelHistory: Array<{ date: string; level: string; created_at: string }>;
  lexicalDiversityTrend: Array<{ date: string; ratio: number }>;
  improvementTrend: string; // "up", "down", "stable"
}

/**
 * Calculate total errors from a correction's errors object
 */
const getTotalErrors = (errors: Record<string, any> | null): number => {
  if (!errors || typeof errors !== 'object') return 0;
  return Object.values(errors).reduce((total: number, errorArray: any) => {
    return total + (Array.isArray(errorArray) ? errorArray.length : 0);
  }, 0);
};

/**
 * Calculate lexical diversity (type-token ratio) from essay text
 */
const calculateLexicalDiversity = (text: string): number => {
  if (!text || text.trim().length === 0) return 0;
  
  const words = text
    .toLowerCase()
    .replace(/[^a-záéíóúüñ\s]/gi, '') // remove punctuation
    .split(/\s+/)
    .filter(w => w.length > 0);
  
  if (words.length === 0) return 0;
  
  const totalWords = words.length;
  const uniqueWords = new Set(words).size;
  
  return uniqueWords / totalWords;
};

/**
 * Calculate error density (errors per 100 words)
 */
const calculateErrorDensity = (totalErrors: number, wordCount: number): number => {
  if (!wordCount || wordCount === 0) return 0;
  return (totalErrors / wordCount) * 100;
};

/**
 * Determine improvement trend based on recent vs older corrections
 */
const calculateImprovementTrend = (corrections: Correction[]): string => {
  if (corrections.length < 2) return "stable";
  
  const sortedCorrections = [...corrections].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  const recentCount = Math.ceil(sortedCorrections.length / 3); // Last third
  const recent = sortedCorrections.slice(-recentCount);
  const older = sortedCorrections.slice(0, -recentCount);
  
  if (older.length === 0 || recent.length === 0) return "stable";
  
  // Calculate average error density for recent vs older essays
  const recentAvgDensity = recent.reduce((sum, corr) => {
    const errors = getTotalErrors(corr.errors);
    const density = calculateErrorDensity(errors, corr.word_count || 0);
    return sum + density;
  }, 0) / recent.length;
  
  const olderAvgDensity = older.reduce((sum, corr) => {
    const errors = getTotalErrors(corr.errors);
    const density = calculateErrorDensity(errors, corr.word_count || 0);
    return sum + density;
  }, 0) / older.length;
  
  const improvement = olderAvgDensity - recentAvgDensity;
  
  if (improvement > 1) return "up"; // Significantly fewer errors
  if (improvement < -1) return "down"; // Significantly more errors
  return "stable";
};

/**
 * Filter corrections by date range
 */
const filterCorrectionsByDateRange = (corrections: Correction[], dateRange: DateRange): Correction[] => {
  const fromDate = new Date(dateRange.from);
  const toDate = new Date(dateRange.to);
  
  return corrections.filter(correction => {
    const correctionDate = new Date(correction.created_at);
    return correctionDate >= fromDate && correctionDate <= toDate;
  });
};

export const useProgressData = (studentId: string, dateRange?: DateRange) => {
  const { data: allCorrections = [], isLoading, error } = useCorrections(studentId);

  return useQuery({
    queryKey: ["progressData", studentId, dateRange],
    queryFn: (): ProgressMetrics => {
      let corrections = allCorrections;

      // Filter by date range if provided
      if (dateRange) {
        corrections = filterCorrectionsByDateRange(allCorrections, dateRange);
      }

      if (!corrections || corrections.length === 0) {
        return {
          totalEssays: 0,
          averageWords: 0,
          currentLevel: "-",
          wordCountTrend: [],
          errorsByType: [],
          errorDensityTrend: [],
          levelHistory: [],
          lexicalDiversityTrend: [],
          improvementTrend: "stable"
        };
      }

      // Sort corrections chronologically (oldest first for trends)
      const sortedCorrections = [...corrections].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      // Basic metrics
      const totalEssays = corrections.length;
      const totalWords = corrections.reduce((sum, corr) => sum + (corr.word_count || 0), 0);
      const averageWords = totalWords / totalEssays;
      const currentLevel = corrections[0]?.level || "-"; // Most recent (first in original array)

      // Word count trend
      const wordCountTrend = sortedCorrections.map(corr => ({
        date: new Date(corr.created_at).toLocaleDateString(),
        words: corr.word_count || 0
      }));

      // Error distribution by type
      const errorTotals = { grammar: 0, vocabulary: 0, cohesion: 0, other: 0 };
      corrections.forEach(corr => {
        if (corr.errors && typeof corr.errors === 'object') {
          Object.entries(corr.errors).forEach(([key, errorArray]) => {
            const normalizedKey = key.toLowerCase();
            if (Array.isArray(errorArray)) {
              if (normalizedKey.includes('grammar') || normalizedKey.includes('gramática')) {
                errorTotals.grammar += errorArray.length;
              } else if (normalizedKey.includes('vocabulary') || normalizedKey.includes('vocabulario')) {
                errorTotals.vocabulary += errorArray.length;
              } else if (normalizedKey.includes('cohesion') || normalizedKey.includes('cohesión')) {
                errorTotals.cohesion += errorArray.length;
              } else {
                errorTotals.other += errorArray.length;
              }
            }
          });
        }
      });

      const errorsByType = [
        { type: "Grammar", count: errorTotals.grammar },
        { type: "Vocabulary", count: errorTotals.vocabulary },
        { type: "Cohesion", count: errorTotals.cohesion },
        { type: "Other", count: errorTotals.other }
      ].filter(item => item.count > 0);

      // Error density trend
      const errorDensityTrend = sortedCorrections.map(corr => {
        const totalErrors = getTotalErrors(corr.errors);
        const density = calculateErrorDensity(totalErrors, corr.word_count || 0);
        return {
          date: new Date(corr.created_at).toLocaleDateString(),
          density: Math.round(density * 100) / 100 // Round to 2 decimals
        };
      });

      // Level history
      const levelHistory = sortedCorrections.map(corr => ({
        date: new Date(corr.created_at).toLocaleDateString(),
        level: corr.level,
        created_at: corr.created_at
      }));

      // Lexical diversity trend
      const lexicalDiversityTrend = sortedCorrections.map(corr => {
        const text = corr.submissions?.text || "";
        const ratio = calculateLexicalDiversity(text);
        return {
          date: new Date(corr.created_at).toLocaleDateString(),
          ratio: Math.round(ratio * 1000) / 1000 // Round to 3 decimals
        };
      });

      // Improvement trend
      const improvementTrend = calculateImprovementTrend(corrections);

      return {
        totalEssays,
        averageWords: Math.round(averageWords),
        currentLevel,
        wordCountTrend,
        errorsByType,
        errorDensityTrend,
        levelHistory,
        lexicalDiversityTrend,
        improvementTrend
      };
    },
    enabled: !!studentId && !isLoading && !error,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
