
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
      
      if (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }
      
      // Map Supabase rows to our strict Notification type
      const notifications: Notification[] = (data || []).map((n) => ({
        id: n.id,
        user_id: n.user_id,
        type: n.type as NotificationType,
        title: n.title,
        message: n.message,
        link: n.link,
        data: n.data,
        assignment_id: n.assignment_id,
        created_at: n.created_at,
        // Map read boolean to read_at timestamp
        read_at: n.read ? n.created_at : null,
      }));
      
      return notifications;
    },
    enabled: !!userId,
  });

  const unreadCount = query.data?.filter(n => !n.read_at).length ?? 0;

  const markRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      if (error) {
        console.error("Error marking notification as read:", error);
        throw error;
      }
      
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllRead = async () => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
      
      if (error) {
        console.error("Error marking all notifications as read:", error);
        throw error;
      }
      
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  return { 
    ...query, 
    unreadCount, 
    markRead, 
    markAllRead,
    latest: query.data || []
  };
};
