
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { PdfLoader, DocxLoader } from "@/utils/fileExtractors";
import { Upload, File as FileIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

// Production webhook URL
const N8N_WEBHOOK = 
  "https://n8n-railway-custom-production-c110.up.railway.app/webhook/1f103665-b767-4db5-9394-f251968fce17";

interface Props {
  onSubmit: (text: string) => Promise<void>;
  onCancel: () => void;
}

interface WebhookResponse {
  assignment_id: string;
  student_id: string;
  level: string;
  errors: any;
  recommendations: any;
  teacher_feedback: string;
}

const SubmitBox: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFile = async (f: File) => {
    setExtracting(true);
    toast({ title: "Extracting text...", description: "Processing your document" });
    
    try {
      let extractedText = "";
      
      if (f.type === "application/pdf") {
        extractedText = await PdfLoader(f);
      } else if (
        f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        f.name.endsWith(".docx")
      ) {
        extractedText = await DocxLoader(f);
      } else {
        toast({ 
          title: "Unsupported file type", 
          description: "Only PDF and DOCX files are supported", 
          variant: "destructive" 
        });
        setFile(null);
        return;
      }
      
      setText(extractedText);
      toast({ title: "Text extracted successfully!" });
    } catch (e) {
      toast({ 
        title: "Read error", 
        description: String(e), 
        variant: "destructive" 
      });
      setFile(null);
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !text.trim()) return;
    
    setLoading(true);
    setAnalyzing(true);
    
    try {
      // Call the original onSubmit to handle assignment submission
      await onSubmit(text.trim());
      
      // Now handle the correction workflow
      toast({ 
        title: "Analyzing essay...", 
        description: "AI is reviewing your submission" 
      });

      // Get the most recent submission for this user
      const { data: recentSubmission, error: submissionError } = await supabase
        .from("submissions")
        .select("id, assignment_id")
        .eq("student_id", user.id)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .single();

      if (submissionError || !recentSubmission) {
        throw new Error("Failed to retrieve submission");
      }

      // Get session token for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const authHeader = session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {};

      // Prepare payload for webhook
      const payload = {
        assignment_id: recentSubmission.assignment_id,
        student_id: user.id,
        submission_id: recentSubmission.id,
        text: text.trim()
      };

      // Send to webhook for AI analysis
      const webhookResponse = await fetch(N8N_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify(payload as Record<string, unknown>)
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook failed: ${webhookResponse.status}`);
      }

      const correctionData: WebhookResponse = await webhookResponse.json();

      // Use the edge function to save the correction
      const saveResponse = await fetch(
        `https://amityhneeclqenbiyixl.supabase.co/functions/v1/save-correction`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(session?.access_token && {
              Authorization: `Bearer ${session.access_token}`
            }),
          },
          body: JSON.stringify({
            submission_id: recentSubmission.id,
            level: correctionData.level,
            errors: correctionData.errors,
            recommendations: correctionData.recommendations,
            teacher_feedback: correctionData.teacher_feedback,
            word_count: text.trim().split(/\s+/).length
          })
        }
      );

      if (!saveResponse.ok) {
        throw new Error("Failed to save correction");
      }

      toast({ 
        title: "Analysis complete!", 
        description: "Your essay has been analyzed and corrected" 
      });

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

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              <Upload className="h-4 w-4" />
              <span>Upload PDF or DOCX file (max 2MB)</span>
              <input
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                disabled={extracting || loading}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setFile(f);
                  await handleFile(f);
                }}
              />
            </label>
          </div>
          
          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileIcon className="h-4 w-4" />
              <span>{file.name}</span>
            </div>
          )}
        </div>
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
