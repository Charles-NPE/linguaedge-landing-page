
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

interface AcademyProfileRequiredModalProps {
  open: boolean;
  onClose: () => void;
}

export const AcademyProfileRequiredModal: React.FC<AcademyProfileRequiredModalProps> = ({ 
  open, 
  onClose 
}) => {
  const navigate = useNavigate();
  
  const handleCompleteProfile = () => {
    onClose();
    navigate("/profile");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center space-y-4 text-center">
          <AlertTriangle className="w-12 h-12 text-primary" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Academy Profile Required</h2>
          <p className="text-muted-foreground">
            To continue using LinguaEdgeAI, please complete your academy information. 
            The "Academy Name" and "Admin Name" fields are required.
          </p>
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Later
            </Button>
            <Button onClick={handleCompleteProfile} className="flex-1 bg-primary hover:bg-primary/90">
              Complete profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
