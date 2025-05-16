
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Copy, Check, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "@/lib/toastShim";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ClassCardProps {
  id: string;
  name: string;
  code: string;
  studentCount: number;
  studentLimit: number;
  totalStudents: number;
  onOpenClass: (id: string) => void;
  onDeleteClass?: (id: string) => void;
}

const ClassCard: React.FC<ClassCardProps> = ({
  id,
  name,
  code,
  studentCount,
  studentLimit,
  totalStudents,
  onOpenClass,
  onDeleteClass
}) => {
  const [copied, setCopied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  const handleDelete = () => {
    if (onDeleteClass) {
      onDeleteClass(id);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <CardTitle>{name}</CardTitle>
          {onDeleteClass && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Class options">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete class
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
                aria-label={copied ? "Code copied" : "Copy class code"}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this class? This action cannot be undone.
              All student data and assignments will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ClassCard;
