
// @ts-nocheck
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { PdfLoader, DocxLoader } from "@/utils/fileExtractors";
import { Upload, File as FileIcon } from "lucide-react";

interface Props {
  onSubmit: (text: string) => Promise<void>;
  onCancel: () => void;
}

const SubmitBox: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);

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
    setLoading(true);
    try {
      await onSubmit(text.trim());
      setText("");
      setFile(null);
    } finally {
      setLoading(false);
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
          disabled={extracting}
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
          {loading ? "Sending…" : extracting ? "Processing..." : "Send Essay"}
        </Button>
      </div>
    </div>
  );
};

export default SubmitBox;
