
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageSquare } from "lucide-react";

interface ClassCardProps {
  classId: string;
  name: string;
  code: string;
  teacherName?: string;
}

export function ClassCard({ classId, name, code, teacherName }: ClassCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          {teacherName ? `Teacher: ${teacherName}` : `Code: ${code}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            className="w-full"
            onClick={() => navigate(`/student/classes/${classId}`)}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Open Class
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/student/classes/${classId}/forum`)}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Forum
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
