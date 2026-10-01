// Platform admin notification bell with unread badge and dropdown menu.
import { useNavigate } from 'react-router-dom';
import { Bell, Store, Ban, CheckCircle2, CheckCheck, Clock, ExternalLink } from 'lucide-react';
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
import {
  useAdminNotifications,
  useMarkAdminNotificationRead,
  useMarkAllAdminNotificationsRead
} from '../hooks/use-admin-notifications';
import type { AdminNotification } from '../types/admin-types';

function getNotificationIcon(type: string) {
  switch (type) {
    case 'store_request':
      return { icon: Store, tone: 'bg-amber-100 text-amber-700' };
    case 'store_suspended':
      return { icon: Ban, tone: 'bg-rose-100 text-rose-700' };
    case 'store_active':
      return { icon: CheckCircle2, tone: 'bg-emerald-100 text-emerald-700' };
    default:
      return { icon: Clock, tone: 'bg-sky-100 text-sky-700' };
  }
}

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

export function AdminNotificationBell() {
  const navigate = useNavigate();
  const { data } = useAdminNotifications();
  const markRead = useMarkAdminNotificationRead();
  const markAllRead = useMarkAllAdminNotificationsRead();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unread_count ?? notifications.filter((n) => !n.is_read).length;

  function handleItemClick(notification: AdminNotification) {
    if (!notification.is_read) {
      markRead.mutate(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  }

  function handleMarkAll() {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length > 0) {
      markAllRead.mutate(unreadIds);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={`Admin notifications (${unreadCount} unread)`}
          className="relative size-9 rounded-xl border-slate-200 bg-white shadow-2xs hover:border-sky-300 hover:text-sky-700 focus:outline-none"
        >
          <Bell className="size-4 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex min-w-5 h-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(24rem,calc(100vw-2rem))] p-0 rounded-2xl shadow-xl border-slate-200/90 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">Admin Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors"
            >
              <CheckCheck className="size-3.5" /> Mark all read
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
          {!notifications.length ? (
            <div className="p-6 text-center">
              <CheckCircle2 className="mx-auto size-8 text-emerald-500 mb-2" />
              <p className="text-sm font-medium text-slate-800">All caught up!</p>
              <p className="text-xs text-slate-400 mt-0.5">No notifications needing attention right now.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const { icon: Icon, tone } = getNotificationIcon(n.type);
              return (
                <DropdownMenuItem
                  key={n.id}
                  onSelect={() => handleItemClick(n)}
                  className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors hover:bg-slate-50 focus:bg-slate-50 ${
                    !n.is_read ? 'bg-sky-50/40' : ''
                  }`}
                >
                  <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold ${!n.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatRelativeTime(n.created_at)}
                      </span>
                    </div>
                    <p className={`mt-0.5 text-xs line-clamp-2 ${!n.is_read ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                      {n.message}
                    </p>
                  </div>
                  {!n.is_read && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-amber-500" title="Unread" />
                  )}
                </DropdownMenuItem>
              );
            })
          )}
        </div>

        <div className="border-t border-slate-100 bg-slate-50/60 p-2.5 text-center">
          <button
            type="button"
            onClick={() => navigate('/admin/stores')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-700 transition-colors"
          >
            <span>Review all stores</span>
            <ExternalLink className="size-3" />
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
