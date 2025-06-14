
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProfileIncompleteModalProps {
  open: boolean;
  onClose?: () => void;
}

export const ProfileIncompleteModal: React.FC<ProfileIncompleteModalProps> = ({ 
  open, 
  onClose 
}) => {
  const navigate = useNavigate();
  
  const handleClose = () => {
    if (onClose) onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-semibold">Just one more step!</h2>
          <p className="text-muted-foreground">
            To keep things organised, please add your full name to your profile.
            It helps your teacher know who submitted each essay.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Later
            </Button>
            <Button onClick={() => navigate("/profile")} className="flex-1">
              Complete profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
