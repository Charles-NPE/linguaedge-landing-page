
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StudentProfile {
  id: string;
  email?: string;
  avatar_url?: string;
  full_name?: string | null;
  phone?: string | null;
}

export interface Student {
  student_id?: string;
  status?: string;
  profiles?: StudentProfile | null;
  // For handling invited students who aren't registered yet
  invited_email?: string;
}

interface StudentsListProps {
  students: Student[];
  isTeacher: boolean;
  onInviteClick: () => void;
  onRemoveStudent: (studentId: string) => void;
}

const StudentsList: React.FC<StudentsListProps> = ({
  students,
  isTeacher,
  onInviteClick,
  onRemoveStudent,
}) => {
  return (
    <>
      {isTeacher && (
        <Button className="mb-4" onClick={onInviteClick}>
          Invite Student
        </Button>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            {isTeacher && <TableHead className="w-[100px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isTeacher ? 4 : 3} className="text-center text-muted-foreground py-8">
                No students enrolled yet
              </TableCell>
            </TableRow>
          ) : (
            students.map((s) => {
              const name = s.profiles?.full_name ?? (s.profiles?.email ? s.profiles.email.split('@')[0] : (s.invited_email ? s.invited_email.split('@')[0] : `Student ${s.student_id?.slice(0, 6) || ''}`));
              const phone = s.profiles?.phone ?? '—';
              
              return (
                <TableRow key={s.student_id || s.invited_email || 'pending'}>
                  <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {s.profiles?.full_name 
                          ? s.profiles.full_name.charAt(0).toUpperCase()
                          : s.profiles && s.profiles.email 
                            ? s.profiles.email.charAt(0).toUpperCase()
                            : s.invited_email 
                              ? s.invited_email.charAt(0).toUpperCase() 
                              : 'S'}
                      </AvatarFallback>
                    </Avatar>
                    {name}
                  </TableCell>
                  <TableCell>{phone}</TableCell>
                  <TableCell>
                    {s.status === 'invited' ? 
                      <span className="text-amber-600 dark:text-amber-500">Invited</span> : 
                      <span className="text-green-600 dark:text-green-500">Enrolled</span>
                    }
                  </TableCell>
                  {isTeacher && (
                    <TableCell>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => s.student_id ? onRemoveStudent(s.student_id) : null}
                        aria-label="Remove student"
                        disabled={!s.student_id}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default StudentsList;
