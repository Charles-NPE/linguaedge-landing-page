
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useCorrections, useMarkCorrectionRead } from "@/hooks/useCorrections";
import { FileCheck } from "lucide-react";
import { Correction } from "@/types/correction.types";
import CorrectionCard from "@/components/corrections/CorrectionCard";
import CorrectionDetail from "@/components/corrections/CorrectionDetail";
import { BackToDashboard } from "@/components/common/BackToDashboard";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const StudentCorrections: React.FC = () => {
  const { user } = useAuth();
  const [selectedCorrection, setSelectedCorrection] = useState<Correction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const { data: corrections = [], isLoading, error } = useCorrections(user?.id || "");
  const markAsReadMutation = useMarkCorrectionRead();

  const handleCorrectionClick = (correction: Correction) => {
    console.log("Selected correction:", correction);
    setSelectedCorrection(correction);
    setIsDrawerOpen(true);
    
    // Marcar como leída si no lo está
    if (!correction.read_at) {
      markAsReadMutation.mutate(correction.id);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedCorrection(null);
  };

  if (error) {
    console.error("Error loading corrections:", error);
    return (
      <DashboardLayout title="My Corrections">
        <BackToDashboard />
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-red-500">Error loading corrections. Please try again.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout title="My Corrections">
        <BackToDashboard />
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  console.log("Rendering corrections:", corrections);

  return (
    <DashboardLayout title="My Corrections">
      <BackToDashboard />
      <div className="mb-8">
        <h2 className="text-lg text-slate-900 dark:text-white mb-2">
          Your Essay Corrections
        </h2>
        <p className="text-muted-foreground">
          Review AI feedback and corrections for your submitted essays
        </p>
      </div>

      {corrections.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No corrections yet.</p>
            <p className="text-sm mt-1">Submit an essay to get AI feedback and corrections.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {corrections.map((correction) => (
            <CorrectionCard
              key={correction.id}
              correction={correction}
              onClick={() => handleCorrectionClick(correction)}
            />
          ))}
        </div>
      )}

      {/* Drawer para mostrar detalles */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>
              {selectedCorrection?.submissions?.assignments?.title || "Essay Correction"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto">
            {selectedCorrection && <CorrectionDetail correction={selectedCorrection} />}
          </div>
        </DrawerContent>
      </Drawer>
    </DashboardLayout>
  );
};

export default StudentCorrections;
