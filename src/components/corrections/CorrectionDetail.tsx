
import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Lightbulb, User, BarChart, FileText } from "lucide-react";
import { Correction } from "@/types/correction.types";

interface CorrectionDetailProps {
  correction: Correction;
}

const CorrectionDetail: React.FC<CorrectionDetailProps> = ({ correction }) => {
  const renderErrors = () => {
    if (!correction.errors || typeof correction.errors !== 'object') return null;
    
    const errorEntries = Object.entries(correction.errors).filter(
      ([_, errorList]) => Array.isArray(errorList) && errorList.length > 0
    );

    if (errorEntries.length === 0) return null;
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          Errors Found
        </h4>
        <div className="space-y-3">
          {errorEntries.map(([category, errorList]) => (
            <div key={category} className="space-y-2">
              <h5 className="text-sm font-medium capitalize text-muted-foreground">
                {category}
              </h5>
              <div className="space-y-1">
                {(errorList as string[]).map((error: string, index: number) => (
                  <div key={index} className="text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded border-l-2 border-red-200 dark:border-red-800 select-text">
                    • {error}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    // Handle both array and object formats from webhook
    let recommendationsList: string[] = [];
    
    if (Array.isArray(correction.recommendations)) {
      recommendationsList = correction.recommendations;
    } else if (correction.recommendations && typeof correction.recommendations === 'object') {
      // If it's an object, try to extract values or convert to array
      recommendationsList = Object.values(correction.recommendations).filter(item => typeof item === 'string') as string[];
    }
    
    if (recommendationsList.length === 0) {
      return null;
    }
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          Recommendations
        </h4>
        <div className="space-y-2">
          {recommendationsList.map((recommendation: string, index: number) => (
            <div key={index} className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border-l-2 border-yellow-200 dark:border-yellow-800 select-text">
              <span className="font-medium">{index + 1}.</span> {recommendation}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header con nivel y estadísticas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-base px-3 py-1">
            Level: {correction.level}
          </Badge>
          {correction.word_count && correction.word_count > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <BarChart className="h-4 w-4" />
              {correction.word_count} words
            </div>
          )}
        </div>
      </div>

      {/* Original Essay Text */}
      {correction.submissions?.text && (
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            Original Essay Text
            {correction.word_count && correction.word_count > 0 && (
              <Badge variant="outline" className="text-xs ml-2">
                📝 {correction.word_count} words
              </Badge>
            )}
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border">
            <div className="text-sm leading-relaxed whitespace-pre-wrap select-text">
              {correction.submissions.text}
            </div>
          </div>
        </div>
      )}

      {/* Errores */}
      {renderErrors()}

      {/* Recomendaciones */}
      {renderRecommendations()}

      {/* Feedback del profesor */}
      {correction.teacher_feedback && (
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" />
            Teacher Feedback
          </h4>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-200 dark:border-blue-800">
            <div className="text-sm leading-relaxed whitespace-pre-wrap select-text">
              {correction.teacher_feedback}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorrectionDetail;
