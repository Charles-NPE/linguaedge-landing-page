
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { FileCheck, Calendar, BookOpen, AlertCircle, Lightbulb } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Correction } from "@/types/correction.types";

const StudentCorrections: React.FC = () => {
  const { user } = useAuth();
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchCorrections();
  }, [user]);

  const fetchCorrections = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("corrections")
        .select(`
          *,
          submissions (
            assignments ( title )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCorrections(data || []);
    } catch (error) {
      console.error("Error fetching corrections:", error);
      toast({
        title: "Error",
        description: "Failed to load corrections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string | null) => {
    if (!level) return 'bg-gray-100 text-gray-800';
    
    const colors = {
      'A1': 'bg-red-100 text-red-800',
      'A2': 'bg-orange-100 text-orange-800',
      'B1': 'bg-yellow-100 text-yellow-800',
      'B2': 'bg-blue-100 text-blue-800',
      'C1': 'bg-green-100 text-green-800',
      'C2': 'bg-purple-100 text-purple-800',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getErrorCount = (errors: any) => {
    if (!errors || typeof errors !== 'object') return 0;
    return Object.values(errors).reduce((total: number, errorArray: any) => {
      return total + (Array.isArray(errorArray) ? errorArray.length : 0);
    }, 0);
  };

  const renderErrors = (errors: any) => {
    if (!errors || typeof errors !== 'object') return null;
    
    return Object.entries(errors).map(([category, errorList]) => {
      if (!Array.isArray(errorList) || errorList.length === 0) return null;
      
      return (
        <div key={category} className="space-y-2">
          <h5 className="text-sm font-medium capitalize text-muted-foreground">
            {category}
          </h5>
          <ul className="space-y-1">
            {errorList.map((error: string, index: number) => (
              <li key={index} className="text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded border-l-2 border-red-200 dark:border-red-800">
                {error}
              </li>
            ))}
          </ul>
        </div>
      );
    }).filter(Boolean);
  };

  const renderRecommendations = (recommendations: any) => {
    if (!Array.isArray(recommendations)) return null;
    
    return (
      <ul className="space-y-2">
        {recommendations.map((recommendation: string, index: number) => (
          <li key={index} className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border-l-2 border-yellow-200 dark:border-yellow-800">
            {recommendation}
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return (
      <DashboardLayout title="My Corrections">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Corrections">
      <div className="mb-8">
        <h2 className="text-lg text-slate-900 dark:text-white mb-2">
          Your Essay Corrections
        </h2>
        <p className="text-muted-foreground">
          Review AI feedback and corrections for your submitted essays
        </p>
      </div>

      {corrections.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No corrections yet.</p>
            <p className="text-sm mt-1">Submit an essay to get AI feedback and corrections.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {corrections.map((correction) => (
            <Card key={correction.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {correction.submissions?.assignments?.title || "Unknown Assignment"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDistanceToNow(new Date(correction.created_at), { addSuffix: true })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getLevelColor(correction.level)}>
                      Level: {correction.level || 'Unknown'}
                    </Badge>
                    <Badge variant="outline">
                      {getErrorCount(correction.errors)} errors
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Errors Section */}
                {getErrorCount(correction.errors) > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Errors Found
                    </h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      {renderErrors(correction.errors)}
                    </div>
                  </div>
                )}

                {/* Recommendations Section */}
                {Array.isArray(correction.recommendations) && correction.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Recommendations
                    </h4>
                    {renderRecommendations(correction.recommendations)}
                  </div>
                )}

                {/* Teacher Feedback Section */}
                {correction.teacher_feedback && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Teacher Feedback</h4>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-200 dark:border-blue-800">
                      <p className="text-sm leading-relaxed">{correction.teacher_feedback}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentCorrections;
