
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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
  const [isLoading, setIsLoading] = useState(false);

  // reset when modal opens
  useEffect(() => {
    if (open) {
      setTitle("");
      setInstructions("");
      setDeadline("");
      if (classes.length) setClassId(classes[0].id);
    }
  }, [open, classes]);

  const handleSubmit = async () => {
    if (!title.trim() || !instructions.trim() || !classId || !user) return;
    setIsLoading(true);
    try {
      // insert into assignments
      const { data: assn, error } = await supabase
        .from("assignments")
        .insert({
          class_id: classId,
          teacher_id: user.id,
          title: title.trim(),
          instructions: instructions.trim(),
          deadline: deadline ? new Date(deadline).toISOString() : null
        })
        .select("id")
        .single();

      if (error) throw error;

      // fetch students of that class
      const { data: students } = await supabase
        .from("class_students")
        .select("student_id")
        .eq("class_id", classId);

      // bulk insert targets
      if (students && students.length) {
        const targets = students.map((s) => ({
          assignment_id: assn.id,
          student_id: s.student_id,
          status: "pending"
        }));
        await supabase.from("assignment_targets").insert(targets);
      }

      toast({ title: "Essay assigned!", description: "Students have been notified." });
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
            <Input 
              id="title"
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Essay title..."
            />
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
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            disabled={isLoading || !title.trim() || !instructions.trim() || !classId} 
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
