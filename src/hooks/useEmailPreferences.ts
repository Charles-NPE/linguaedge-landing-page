
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EmailPreference {
  user_id: string;
  allow_emails: boolean;
  allow_in_app: boolean;
  updated_at: string;
}

export const useEmailPreferences = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['emailPreferences', userId],
    queryFn: async (): Promise<EmailPreference> => {
      if (!userId) throw new Error('No user ID provided');
      
      const { data, error } = await supabase
        .from('email_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error?.code === 'PGRST116') {
        // Row doesn't exist yet → create with defaults
        const { data: inserted, error: insertError } = await supabase
          .from('email_preferences')
          .insert({ 
            user_id: userId,
            allow_emails: true,
            allow_in_app: true
          })
          .select('*')
          .single();
        
        if (insertError) throw insertError;
        return inserted as EmailPreference;
      }
      
      if (error) throw error;
      return data as EmailPreference;
    },
    enabled: !!userId,
  });
};

export const updateEmailPreferences = async (
  userId: string, 
  allowEmails: boolean, 
  allowInApp: boolean
) => {
  const { error } = await supabase
    .from('email_preferences')
    .upsert({ 
      user_id: userId, 
      allow_emails: allowEmails,
      allow_in_app: allowInApp,
      updated_at: new Date().toISOString() 
    });
  
  if (error) throw error;
};
