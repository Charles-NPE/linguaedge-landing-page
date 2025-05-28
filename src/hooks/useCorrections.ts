
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Correction } from "@/types/correction.types";

export const useCorrections = (studentId: string) =>
  useQuery({
    queryKey: ["corrections", studentId],
    queryFn: async (): Promise<Correction[]> => {
      const { data, error } = await supabase
        .from("corrections")
        .select(`
          *,
          submissions (
            assignments ( title )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Correction[];
    },
    enabled: !!studentId,
  });

export const useMarkCorrectionRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (correctionId: string) => {
      const { error } = await supabase.rpc('mark_correction_read', {
        correction_id: correctionId
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corrections"] });
    },
  });
};
