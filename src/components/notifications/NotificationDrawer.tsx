
import React from "react";
import { Link } from "react-router-dom";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle 
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  BookOpen, 
  MessageSquare, 
  Clock, 
  Bell,
  CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification, NotificationType } from "@/types/notification.types";

interface NotificationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
}

const getIconForType = (type: NotificationType) => {
  switch (type) {
    case 'submission':
      return <FileText className="h-4 w-4 text-blue-600" />;
    case 'assignment':
      return <BookOpen className="h-4 w-4 text-green-600" />;
    case 'feedback':
      return <MessageSquare className="h-4 w-4 text-purple-600" />;
    case 'reminder':
      return <Clock className="h-4 w-4 text-orange-600" />;
    case 'reminder_sent':
      return <Bell className="h-4 w-4 text-indigo-600" />;
    default:
      return <Bell className="h-4 w-4 text-gray-600" />;
  }
};

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  open,
  onOpenChange,
  userId
}) => {
  const { latest, unreadCount, markRead, markAllRead } = useNotifications(userId);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) {
      markRead(notification.id);
    }
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[70vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </DrawerTitle>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllRead}
                className="text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          {latest.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {latest.map((notification) => (
                <div key={notification.id}>
                  {notification.link ? (
                    <Link
                      to={notification.link}
                      onClick={() => handleNotificationClick(notification)}
                      className="block"
                    >
                      <NotificationItem notification={notification} />
                    </Link>
                  ) : (
                    <div 
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "cursor-pointer",
                        !notification.link && "cursor-default"
                      )}
                    >
                      <NotificationItem notification={notification} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

const NotificationItem: React.FC<{ notification: Notification }> = ({ 
  notification 
}) => (
  <div
    className={cn(
      "px-4 py-3 flex gap-3 hover:bg-accent transition-colors cursor-pointer",
      !notification.read_at && "bg-secondary/25"
    )}
  >
    <div className="flex-shrink-0 mt-1">
      {getIconForType(notification.type)}
    </div>
    <div className="flex-1 min-w-0">
      <p className={cn(
        "text-sm leading-5",
        !notification.read_at && "font-medium"
      )}>
        {notification.message}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {formatDistanceToNow(new Date(notification.created_at || ''), { 
          addSuffix: true 
        })}
      </p>
    </div>
    {!notification.read_at && (
      <div className="flex-shrink-0">
        <div className="h-2 w-2 rounded-full bg-blue-600" />
      </div>
    )}
  </div>
);

export default NotificationDrawer;
