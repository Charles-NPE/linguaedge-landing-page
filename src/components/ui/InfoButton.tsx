
import { Info } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export const InfoButton: React.FC<{ text: string }> = ({ text }) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        aria-label="info"
        className="ml-2 text-muted-foreground hover:text-foreground"
      >
        <Info className="h-4 w-4" />
      </button>
    </PopoverTrigger>
    <PopoverContent className="max-w-xs text-sm">{text}</PopoverContent>
  </Popover>
);
