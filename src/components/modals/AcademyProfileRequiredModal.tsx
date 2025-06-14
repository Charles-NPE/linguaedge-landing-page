
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
          <AlertTriangle className="w-12 h-12 text-amber-500" />
          <h2 className="text-xl font-semibold">Perfil de Academia Requerido</h2>
          <p className="text-muted-foreground">
            Para continuar usando LinguaEdgeAI, debe completar la información de su academia. 
            Los campos "Nombre de la Academia" y "Nombre del Administrador" son obligatorios.
          </p>
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Más tarde
            </Button>
            <Button onClick={handleCompleteProfile} className="flex-1">
              Completar perfil
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
