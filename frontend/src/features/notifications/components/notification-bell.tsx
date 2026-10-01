import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/empty-state';
import { useNotifications } from '../hooks/use-notifications';
import { useMarkNotificationRead } from '../hooks/use-mark-notification-read';

export function NotificationBell() {
  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationRead();

  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="bg-accent text-accent-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] tabular-nums">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(20rem,calc(100vw-2rem))]">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!notifications?.length ? (
          <div className="p-2">
            <EmptyState message="No notifications yet." />
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start gap-1 whitespace-normal ${notification.is_read ? 'opacity-60' : ''}`}
              onSelect={(e) => {
                e.preventDefault();
                if (!notification.is_read) markRead.mutate(notification.id);
              }}
            >
              <span className="text-sm">{notification.message}</span>
              <span className="text-muted-foreground text-xs">{new Date(notification.created_at).toLocaleString()}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
