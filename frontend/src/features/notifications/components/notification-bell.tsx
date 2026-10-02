import { Bell, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '../hooks/use-notifications';
import { useMarkNotificationRead } from '../hooks/use-mark-notification-read';

function formatRelativeTime(dateString: string) {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(dateString).toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

export function NotificationBell() {
  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationRead();

  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={`Store notifications (${unreadCount} unread)`}
          className="relative size-9 rounded-xl border-slate-200 bg-white shadow-2xs hover:border-sky-300 hover:text-sky-700 focus:outline-none"
        >
          <Bell className="size-4 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex min-w-5 h-5 items-center justify-center rounded-full bg-sky-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0 rounded-2xl shadow-xl border-slate-200/90 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">Store Notifications</span>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
                {unreadCount} new
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                All caught up
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Container with max height 300px (~5 items visible in one scroll) */}
        <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
          {!notifications?.length ? (
            <div className="p-6 text-center">
              <CheckCircle2 className="mx-auto size-8 text-emerald-500 mb-2" />
              <p className="text-sm font-medium text-slate-800">No notifications yet!</p>
              <p className="text-xs text-slate-400 mt-0.5">New order notifications will appear here.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onSelect={(e) => {
                  e.preventDefault();
                  if (!notification.is_read) markRead.mutate(notification.id);
                }}
                className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors focus:bg-sky-50/90 focus:text-slate-900 focus:**:text-slate-900 hover:bg-sky-50/90 hover:text-slate-900 ${
                  !notification.is_read ? 'bg-sky-50/50' : 'bg-white'
                }`}
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                  <ShoppingBag className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-semibold ${!notification.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                    {notification.message}
                  </p>
                  <span className="mt-1 block text-[10px] text-slate-500 font-medium">
                    {formatRelativeTime(notification.created_at)}
                  </span>
                </div>
                {!notification.is_read && (
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-sky-600" title="Unread" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
