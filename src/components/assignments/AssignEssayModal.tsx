
// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { createAssignmentWithTargets } from "@/utils/assignments";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  classes: { id: string; name: string }[];
}

const AssignEssayModal: React.FC<Props> = ({ open, onOpenChange, classes }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [deadline, setDeadline] = useState<string>("");
  const [classId, setClassId] = useState<string>(classes[0]?.id ?? "");
  const [scope, setScope] = useState<"class" | "student">("class");
  const [students, setStudents] = useState<{id: string; name: string; className: string}[]>([]);
  const [studentId, setStudentId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setTitle("");
      setInstructions("");
      setDeadline("");
      setScope("class");
      setStudentId("");
      setAiQuery("");
      if (classes.length) setClassId(classes[0].id);
    }
  }, [open, classes]);

  // Fetch students when modal opens or classes change
  useEffect(() => {
    if (!open || !user || !classes.length) return;
    
    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from("class_students")
        .select(`
          student_id,
          class_id,
          classes(name),
          profiles:student_id (full_name)
        `)
        .in("class_id", classes.map(c => c.id) as any);

      if (error) {
        console.error("Error fetching students:", error);
        return;
      }

      const studentList = (data ?? []).map((r: any) => ({
        id: r.student_id,
        name: r.profiles?.full_name ?? `Student ${r.student_id.slice(0, 6)}`,
        className: r.classes?.name ?? "Unknown Class"
      }));
      
      setStudents(studentList);
      setStudentId(studentList[0]?.id ?? "");
    };

    fetchStudents();
  }, [open, user, classes]);

  const handleSubmit = async () => {
    if (!title.trim() || !instructions.trim() || !user) return;
    if (scope === "class" && !classId) return;
    if (scope === "student" && !studentId) return;
    
    setIsLoading(true);
    try {
      await createAssignmentWithTargets({
        class_id: scope === "class" ? classId : students.find(s => s.id === studentId)?.id ? classId : classes[0]?.id,
        teacher_id: user.id,
        title: title.trim(),
        instructions: instructions.trim(),
        deadline: deadline ? new Date(deadline).toISOString() : null,
        student_ids: scope === "student" ? [studentId] : undefined
      });

      toast({ 
        title: "Essay assigned!", 
        description: scope === "student" 
          ? "Student has been notified." 
          : "Students have been notified." 
      });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Assign a new essay</DialogTitle></DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="title"
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Essay title..."
                className="flex-1"
              />

              <Popover open={aiOpen} onOpenChange={setAiOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" size="icon" variant="outline" title="Help with AI">
                    <Sparkles size={16} className={aiLoading ? "animate-spin" : ""}/>
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-72 space-y-2">
                  <Label>What kind of writing do you need?</Label>
                  <Textarea
                    rows={3}
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="e.g. B2 opinion essay on renewable energy (teens)…"
                  />
                  <Button
                    className="w-full"
                    disabled={aiLoading || !aiQuery.trim()}
                    onClick={async () => {
                      setAiLoading(true);
                      try {
                        const res = await fetch(
                          "https://n8n-railway-custom-production-c110.up.railway.app/webhook/e256533a-c488-4ca7-a98c-b4b9fc27bb1e",
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ query: aiQuery.trim() })
                          }
                        );
                        if (!res.ok) throw new Error("Webhook error");
                        const json = await res.json();
                        setTitle(json.title ?? "");
                        setInstructions(json.instructions ?? "");
                        setAiOpen(false);
                      } catch (err: any) {
                        toast({ title: "AI helper failed", description: err.message, variant: "destructive" });
                      } finally {
                        setAiLoading(false);
                      }
                    }}
                  >
                    {aiLoading ? "Generating…" : "Generate"}
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea 
              id="instructions"
              rows={5} 
              value={instructions} 
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Provide clear instructions for the essay..."
            />
          </div>

          <div>
            <Label htmlFor="deadline">Deadline (optional)</Label>
            <Input 
              id="deadline"
              type="datetime-local" 
              value={deadline} 
              onChange={(e) => setDeadline(e.target.value)} 
            />
          </div>

          <div>
            <Label>Send to</Label>
            <RadioGroup value={scope} onValueChange={(v) => setScope(v as "class" | "student")} className="flex gap-6 mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="class" id="scope-class" />
                <Label htmlFor="scope-class">Entire class</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="scope-student" />
                <Label htmlFor="scope-student">Specific student</Label>
              </div>
            </RadioGroup>
          </div>

          {scope === "class" && (
            <div>
              <Label>Class</Label>
              {classes.length > 0 ? (
                <RadioGroup value={classId} onValueChange={setClassId}>
                  {classes.map((c) => (
                    <div key={c.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={c.id} id={c.id} />
                      <Label htmlFor={c.id}>{c.name}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <p className="text-sm text-muted-foreground">No classes available. Create a class first.</p>
              )}
            </div>
          )}

          {scope === "student" && (
            <div>
              <Label>Choose student</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.className} • {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            disabled={
              isLoading || 
              !title.trim() || 
              !instructions.trim() || 
              (scope === "class" && !classId) ||
              (scope === "student" && !studentId)
            } 
            onClick={handleSubmit}
          >
            {isLoading ? "Saving…" : "Assign"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignEssayModal;
