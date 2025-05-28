
import React from "react";
import { Upload, File as FileIcon } from "lucide-react";

interface FileUploadProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ file, onFileSelect, disabled }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
          <Upload className="h-4 w-4" />
          <span>Upload PDF or DOCX file (max 2MB)</span>
          <input
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            disabled={disabled}
            onChange={handleFileChange}
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
  );
};

export default FileUpload;
