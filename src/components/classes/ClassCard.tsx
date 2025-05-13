
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, BookOpen } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

interface ClassCardProps {
  id: string;
  name: string;
  code: string;
  studentCount: number;
  studentLimit: number;
  totalStudents: number;
  onOpenClass: (id: string) => void;
}

const ClassCard: React.FC<ClassCardProps> = ({
  id,
  name,
  code,
  studentCount,
  studentLimit,
  totalStudents,
  onOpenClass
}) => {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copied!",
      description: `Class code ${code} copied to clipboard.`,
    });
  };

  // Calculate progress percentage for the progress bar (based on total students)
  const progressPercent = Math.min((totalStudents / studentLimit) * 100, 100);
  
  // Determine color based on capacity
  const getProgressColor = () => {
    if (progressPercent >= 90) return "bg-red-500";
    if (progressPercent >= 70) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <Card className="overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-start justify-between">
          <span className="text-xl line-clamp-1">{name}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Class Code:</span>
            <span className="font-mono font-medium">{code}</span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Students:</span>
              <span className="text-muted-foreground">{studentCount} students</span>
            </div>
            <Progress 
              value={progressPercent} 
              className="h-1 bg-slate-200 dark:bg-slate-700" 
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-2 pb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={handleCopyCode}
        >
          <Copy className="mr-1 h-4 w-4" />
          Copy Code
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1"
          onClick={() => onOpenClass(id)}
        >
          <BookOpen className="mr-1 h-4 w-4" />
          Open
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClassCard;
