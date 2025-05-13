import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Copy, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

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
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Class code copied to clipboard.",
    });
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <span className="text-muted-foreground">
              {studentCount} students
            </span>
            <Progress
              value={(totalStudents / studentLimit) * 100}
              className="h-1 mt-1 bg-slate-200 dark:bg-slate-700"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded font-mono text-sm flex-1 text-center">
              {code}
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-shrink-0"
              onClick={handleCopy}
            >
              {copied ? 
                <Check className="h-4 w-4 mr-1" /> : 
                <Copy className="h-4 w-4 mr-1" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <Button 
            className="w-full" 
            onClick={() => onOpenClass(id)}
          >
            Open
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassCard;
