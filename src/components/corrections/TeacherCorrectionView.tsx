
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCorrection, useUpdateCorrectionNotes } from "@/hooks/useCorrection";
import CorrectionDetail from "./CorrectionDetail";

interface TeacherCorrectionViewProps {
  correctionId: string;
}

const TeacherCorrectionView: React.FC<TeacherCorrectionViewProps> = ({ correctionId }) => {
  const { data: correction, isLoading } = useCorrection(correctionId);
  const updateNotesMutation = useUpdateCorrectionNotes();
  
  const [privateNote, setPrivateNote] = useState("");
  const [publicNote, setPublicNote] = useState("");

  React.useEffect(() => {
    if (correction) {
      setPrivateNote(correction.teacher_private_note || "");
      setPublicNote(correction.teacher_public_note || "");
    }
  }, [correction]);

  const handleSaveNotes = () => {
    updateNotesMutation.mutate({
      correctionId,
      privateNote,
      publicNote
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!correction) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Correction not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Original correction details */}
      <CorrectionDetail correction={correction} />
      
      <Separator />
      
      {/* Teacher notes section */}
      <div className="space-y-4">
        <h4 className="font-medium text-lg">Teacher Notes</h4>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="private-note">Private Note (only you can see this)</Label>
            <Textarea
              id="private-note"
              placeholder="Add your private notes about this submission..."
              value={privateNote}
              onChange={(e) => setPrivateNote(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="public-note">Public Note (visible to student)</Label>
            <Textarea
              id="public-note"
              placeholder="Add feedback that the student will see..."
              value={publicNote}
              onChange={(e) => setPublicNote(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
          
          <Button 
            onClick={handleSaveNotes}
            disabled={updateNotesMutation.isPending}
            className="w-full"
          >
            {updateNotesMutation.isPending ? "Saving..." : "Save Notes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeacherCorrectionView;
