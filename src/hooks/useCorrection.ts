
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Correction } from "@/types/correction.types";
import { toast } from "@/hooks/use-toast";

export const useCorrection = (correctionId: string, enabled = true) =>
  useQuery({
    queryKey: ["correction", correctionId],
    enabled: enabled && !!correctionId,
    queryFn: async (): Promise<Correction> => {
      const { data, error } = await supabase
        .from("corrections")
        .select(`
          *,
          submissions (
            id,
            text,
            student_id,
            assignments (
              title
            )
          )
        `)
        .eq("id", correctionId)
        .single();

      if (error) throw error;
      return data as Correction;
    },
  });

export const useUpdateCorrectionNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      correctionId, 
      privateNote, 
      publicNote 
    }: { 
      correctionId: string; 
      privateNote: string; 
      publicNote: string; 
    }) => {
      const { error } = await supabase
        .from("corrections")
        .update({
          teacher_private_note: privateNote,
          teacher_public_note: publicNote
        })
        .eq("id", correctionId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["correction", variables.correctionId] });
      toast({
        title: "Notes saved",
        description: "Teacher notes have been updated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving notes",
        description: "Failed to save teacher notes. Please try again.",
        variant: "destructive"
      });
    }
  });
};
