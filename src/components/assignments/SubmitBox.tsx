
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useFileExtraction } from "@/hooks/useFileExtraction";
import { submitEssayAndCorrect } from "@/services/submissionService";
import FileUpload from "./FileUpload";

interface Props {
  onSubmit: (text: string) => Promise<void>;
  onCancel: () => void;
}

const SubmitBox: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
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
    if (!user || !text.trim()) return;
    
    setLoading(true);
    setAnalyzing(true);
    
    try {
      await submitEssayAndCorrect(text, user.id, onSubmit);
      
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
      setLoading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 bg-white dark:bg-slate-900 border-t p-4 space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Paste or write your essay here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          disabled={extracting || loading}
        />

        <FileUpload
          file={file}
          onFileSelect={handleFileSelect}
          disabled={extracting || loading}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading || extracting}>
          Cancel
        </Button>
        <Button
          disabled={loading || extracting || !text.trim()}
          onClick={handleSubmit}
        >
          {analyzing ? "Analyzing..." : loading ? "Sending…" : extracting ? "Processing..." : "Send Essay"}
        </Button>
      </div>
    </div>
  );
};

export default SubmitBox;
