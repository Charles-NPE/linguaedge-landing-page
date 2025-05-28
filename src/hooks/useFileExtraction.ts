
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { PdfLoader, DocxLoader } from "@/utils/fileExtractors";

export const useFileExtraction = () => {
  const [extracting, setExtracting] = useState(false);

  const extractTextFromFile = async (file: File): Promise<string> => {
    setExtracting(true);
    toast({ title: "Extracting text...", description: "Processing your document" });
    
    try {
      let extractedText = "";
      
      if (file.type === "application/pdf") {
        extractedText = await PdfLoader(file);
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx")
      ) {
        extractedText = await DocxLoader(file);
      } else {
        toast({ 
          title: "Unsupported file type", 
          description: "Only PDF and DOCX files are supported", 
          variant: "destructive" 
        });
        throw new Error("Unsupported file type");
      }
      
      toast({ title: "Text extracted successfully!" });
      return extractedText;
    } catch (e) {
      toast({ 
        title: "Read error", 
        description: String(e), 
        variant: "destructive" 
      });
      throw e;
    } finally {
      setExtracting(false);
    }
  };

  return {
    extracting,
    extractTextFromFile
  };
};
