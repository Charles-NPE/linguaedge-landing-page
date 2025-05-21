
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClassRow } from "@/types/class.types";

interface ClassHeaderProps {
  classRow: ClassRow;
  userRole?: string;
  isTeacher: boolean;
  onDeleteClick: () => void;
}

const ClassHeader: React.FC<ClassHeaderProps> = ({ 
  classRow, 
  userRole, 
  isTeacher, 
  onDeleteClick 
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center space-x-4">
        <Link to={userRole === "teacher" ? "/teacher/classes" : "/student"}>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <span className="text-sm font-medium text-muted-foreground mr-2">Class Code:</span>
          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">{classRow.code}</span>
        </div>
      </div>
      
      {isTeacher && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Class options">
              <MoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={onDeleteClick}
            >
              Delete Class
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default ClassHeader;
