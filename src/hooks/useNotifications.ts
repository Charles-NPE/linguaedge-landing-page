
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Notification, NotificationType } from "@/types/notification.types";

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
      
      // Map Supabase rows to our strict Notification type
      const notifications: Notification[] = (data || []).map((n) => ({
        ...n,
        // Cast to literal union (assume DB contains only valid values)
        type: n.type as NotificationType,
        // Map read boolean to read_at timestamp
        read_at: n.read ? n.created_at : null,
        // Include the new link and data columns
        link: n.link,
        data: n.data,
      }));
      
      return notifications;
    },
    enabled: !!userId,
  });

  const unreadCount = query.data?.filter(n => !n.read_at).length ?? 0;

  const markRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    
    queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
  };

  const markAllRead = async () => {
    if (!userId) return;
    
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    
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
