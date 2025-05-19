
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
  /** EITHER pass one object ... */
  classRow?: ClassRow;
  /** ... OR pass the individual pieces below */
  name?: string;
  code?: string;
  studentCount?: number;
  userRole?: string;
  isTeacher?: boolean;
  onDeleteClick?: () => void;
}

const ClassHeader: React.FC<ClassHeaderProps> = ({ 
  classRow, 
  userRole, 
  isTeacher, 
  onDeleteClick,
  name,
  code,
  studentCount
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center space-x-4">
        <Link to={userRole === "teacher" ? "/teacher/classes" : "/student/dashboard"}>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <span className="text-sm font-medium text-muted-foreground mr-2">Class Code:</span>
          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">{classRow?.code || code}</span>
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
