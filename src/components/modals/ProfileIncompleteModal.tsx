
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProfileIncompleteModalProps {
  open: boolean;
}

export const ProfileIncompleteModal: React.FC<ProfileIncompleteModalProps> = ({ open }) => {
  const navigate = useNavigate();
  
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-semibold">Just one more step!</h2>
          <p className="text-muted-foreground">
            To keep things organised, please add your full name to your profile.
            It helps your teacher know who submitted each essay.
          </p>
          <Button onClick={() => navigate("/profile")} className="w-full">
            Complete profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
