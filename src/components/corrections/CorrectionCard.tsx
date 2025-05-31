
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MailOpen, BookOpen, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Correction } from "@/types/correction.types";

interface CorrectionCardProps {
  correction: Correction;
  onClick: () => void;
}

const CorrectionCard: React.FC<CorrectionCardProps> = ({ correction, onClick }) => {
  const isUnread = !correction.read_at;
  
  const getErrorCount = () => {
    if (!correction.errors || typeof correction.errors !== 'object') return 0;
    return Object.values(correction.errors).reduce((total: number, errorArray: any) => {
      return total + (Array.isArray(errorArray) ? errorArray.length : 0);
    }, 0);
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'A1': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'A2': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'B1': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'B2': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'C1': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'C2': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  const errorCount = getErrorCount();

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isUnread ? 'border-primary/20 bg-primary/5' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Icono de correo */}
            <div className={`mt-1 ${isUnread ? 'text-primary' : 'text-muted-foreground'}`}>
              {isUnread ? (
                <Mail className="h-5 w-5" />
              ) : (
                <MailOpen className="h-5 w-5" />
              )}
            </div>
            
            {/* Contenido principal */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <h3 className={`font-medium ${isUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {correction.submissions?.assignments?.title || "Unnamed Assignment"}
                </h3>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(correction.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
          
          {/* Badges */}
          <div className="flex items-center gap-2">
            <Badge className={getLevelColor(correction.level)}>
              {correction.level}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {errorCount} {errorCount === 1 ? 'error' : 'errors'}
            </Badge>
            {isUnread && (
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default CorrectionCard;
