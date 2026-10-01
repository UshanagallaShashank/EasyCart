// Platform admin notification bell with unread badge and dropdown menu.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Store, Ban, CheckCircle2, CheckCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  useAdminNotifications,
  useMarkAdminNotificationRead,
  useMarkAllAdminNotificationsRead
} from '../hooks/use-admin-notifications';
import type { AdminNotification } from '../types/admin-types';

const STORAGE_KEY = 'easycart_admin_read_notifications';

function getStoredReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function storeReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // ignore
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'store_request':
      return { icon: Store, tone: 'bg-amber-100 text-amber-700' };
    case 'store_suspended':
      return { icon: Ban, tone: 'bg-rose-100 text-rose-700' };
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

  const [localReadIds, setLocalReadIds] = useState<Set<string>>(() => getStoredReadIds());

  // Merge backend notifications with local read status
  const rawNotifications = data?.notifications ?? [];
  const notifications = rawNotifications.map((n) => ({
    ...n,
    is_read: n.is_read || localReadIds.has(n.id)
  }));

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  function handleItemClick(notification: AdminNotification) {
    if (!notification.is_read) {
      setLocalReadIds((prev) => {
        const next = new Set(prev);
        next.add(notification.id);
        storeReadIds(next);
        return next;
      });
      markRead.mutate(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  }

  function handleMarkAll() {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length > 0) {
      setLocalReadIds((prev) => {
        const next = new Set(prev);
        unreadIds.forEach((id) => next.add(id));
        storeReadIds(next);
        return next;
      });
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
            {unreadCount > 0 ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                {unreadCount} new
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                All caught up
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleMarkAll();
              }}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-sky-600 hover:bg-sky-50 hover:text-sky-800 transition-colors cursor-pointer"
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
                    !n.is_read ? 'bg-sky-50/40' : 'opacity-75'
                  }`}
                >
                  <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold ${!n.is_read ? 'text-slate-900' : 'text-slate-600'}`}>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
