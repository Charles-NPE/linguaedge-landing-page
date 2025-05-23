
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ReplyBoxProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
}

export default function ReplyBox({ onSubmit, placeholder = "Your reply..." }: ReplyBoxProps) {
  const [value, setValue] = useState("");
  
  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
      setValue("");
    }
  };
  
  return (
    <div className="flex gap-2 mt-2">
      <Textarea 
        value={value} 
        onChange={(e) => setValue(e.target.value)} 
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder={placeholder} 
        className="flex-1"
      />
      <Button 
        disabled={!value.trim()} 
        onClick={handleSubmit}
      >
        Send
      </Button>
    </div>
  );
}
