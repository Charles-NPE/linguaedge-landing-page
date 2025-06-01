
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useFileExtraction } from "@/hooks/useFileExtraction";
import FileUpload from "./FileUpload";

interface Props {
  onSubmit: (text: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const SubmitBox: React.FC<Props> = ({ onSubmit, onCancel, loading = false }) => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { extracting, extractTextFromFile } = useFileExtraction();

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    try {
      const extractedText = await extractTextFromFile(selectedFile);
      setText(extractedText);
    } catch (error) {
      setFile(null);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    
    setSubmitting(true);
    
    try {
      await onSubmit(text.trim());
      
      // Reset form and redirect to corrections page
      setText("");
      setFile(null);
      navigate("/student/corrections");
      
    } catch (err: any) {
      console.error("Submit error:", err);
      toast({ 
        title: "Error", 
        description: err.message || "Failed to submit essay", 
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Separate busy state from content validation
  const isBusy = loading || extracting || submitting;
  const canSend = text.trim().length > 0;

  return (
    <div className="fixed inset-x-0 bottom-0 bg-white dark:bg-slate-900 border-t p-4 space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Paste or write your essay here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          disabled={isBusy}
        />

        <FileUpload
          file={file}
          onFileSelect={handleFileSelect}
          disabled={isBusy}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isBusy}>
          Cancel
        </Button>
        <Button
          disabled={!canSend || isBusy}
          onClick={handleSubmit}
        >
          {submitting ? "Analyzing..." : loading ? "Processing..." : extracting ? "Extracting..." : "Send Essay"}
        </Button>
      </div>
    </div>
  );
};

export default SubmitBox;
