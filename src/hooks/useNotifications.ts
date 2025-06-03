
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  user_id: string;
  type: 'submission' | 'assignment' | 'feedback' | 'reminder' | 'reminder_sent';
  message: string;
  link?: string;
  data?: any;
  created_at: string;
  read_at?: string;
}

export const useNotifications = (userId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async (): Promise<Notification[]> => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const unreadCount = query.data?.filter(n => !n.read_at).length ?? 0;

  const markRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);
    
    queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
  };

  const markAllRead = async () => {
    if (!userId) return;
    
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null);
    
    queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
  };

  return { 
    ...query, 
    unreadCount, 
    markRead, 
    markAllRead,
    latest: query.data || []
  };
};
