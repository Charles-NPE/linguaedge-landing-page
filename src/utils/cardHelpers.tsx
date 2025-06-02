
import React from "react";
import type { ReactElement } from "react";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

export function getCardColor(stats: { submitted: number; pending: number; late: number }): string {
  const { submitted, pending, late } = stats;
  const total = submitted + pending + late;
  
  if (total === 0) return '';
  if (submitted === total) return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
  if (late > 0) return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
  return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
}

export function getStatusIcon(stats: { submitted: number; pending: number; late: number }): ReactElement {
  const { submitted, pending, late } = stats;
  const total = submitted + pending + late;
  
  if (total === 0) return <Clock className="h-5 w-5 text-muted-foreground" />;
  if (submitted === total) return <CheckCircle className="h-5 w-5 text-green-600" />;
  if (late > 0) return <AlertCircle className="h-5 w-5 text-red-600" />;
  return <Clock className="h-5 w-5 text-yellow-600" />;
}
