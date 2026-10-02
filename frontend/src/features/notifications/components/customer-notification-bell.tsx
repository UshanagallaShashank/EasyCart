import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ShoppingBag, Truck, CheckCircle2, CheckCheck, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useMyOrders } from '@/features/orders/hooks/use-my-orders';
import { customerOrderPath } from '@/features/storefront/lib/customer-paths';
import { shortOrderId } from '@/features/orders/lib/order-rules';
import type { Order } from '@/features/orders/types/order-types';

const STORAGE_KEY = 'easycart_customer_read_notifications';

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

function getOrderNotificationInfo(order: Order) {
  const totalAmount = typeof order.total === 'number' ? order.total : 0;
  const orderIdText = order.id ? shortOrderId(order.id) : '';

  if (order.status === 'cancelled') {
    return {
      title: `Order ${orderIdText} Cancelled`,
      message: `Your order of Rs. ${totalAmount.toFixed(2)} was cancelled.`,
      icon: XCircle,
      tone: 'bg-rose-100 text-rose-700'
    };
  }
  if (order.status === 'fulfilled') {
    return {
      title: `Order ${orderIdText} Delivered`,
      message: `Your order has been delivered successfully.`,
      icon: CheckCircle2,
      tone: 'bg-emerald-100 text-emerald-700'
    };
  }
  if (order.fulfillment_status === 'dispatched' || order.status === 'confirmed') {
    return {
      title: `Order ${orderIdText} Out for Delivery`,
      message: `Driver is on the way with your items!`,
      icon: Truck,
      tone: 'bg-sky-100 text-sky-700'
    };
  }
  return {
    title: `Order ${orderIdText} Placed`,
    message: `Order placed successfully (Rs. ${totalAmount.toFixed(2)}).`,
    icon: ShoppingBag,
    tone: 'bg-amber-100 text-amber-700'
  };
}

export function CustomerNotificationBell({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const { data: orders } = useMyOrders();
  const [localReadIds, setLocalReadIds] = useState<Set<string>>(() => getStoredReadIds());

  const rawNotifications = (orders ?? []).map((order) => {
    const info = getOrderNotificationInfo(order);
    const notificationId = `order_${order.id}_${order.status}_${order.fulfillment_status}`;
    return {
      id: notificationId,
      orderId: order.id,
      created_at: order.created_at,
      is_read: localReadIds.has(notificationId),
      ...info
    };
  });

  const unreadCount = rawNotifications.filter((n) => !n.is_read).length;

  function handleItemClick(notification: typeof rawNotifications[0]) {
    if (!notification.is_read) {
      setLocalReadIds((prev) => {
        const next = new Set(prev);
        next.add(notification.id);
        storeReadIds(next);
        return next;
      });
    }
    navigate(customerOrderPath(slug, notification.orderId));
  }

  function handleMarkAll() {
    setLocalReadIds((prev) => {
      const next = new Set(prev);
      rawNotifications.forEach((n) => next.add(n.id));
      storeReadIds(next);
      return next;
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Customer notifications (${unreadCount} unread)`}
          className="relative flex size-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <Bell className="size-4 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex min-w-5 h-5 items-center justify-center rounded-full bg-sky-600 px-1 text-[10px] font-bold text-white shadow-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0 rounded-2xl shadow-xl border-slate-200/90 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">My Notifications</span>
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
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
            >
              <CheckCheck className="size-3.5" /> Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
          {!rawNotifications.length ? (
            <div className="p-6 text-center">
              <CheckCircle2 className="mx-auto size-8 text-emerald-500 mb-2" />
              <p className="text-sm font-medium text-slate-800">No notifications yet!</p>
              <p className="text-xs text-slate-400 mt-0.5">Order updates will appear here.</p>
            </div>
          ) : (
            rawNotifications.map((n) => {
              const Icon = n.icon;
              return (
                <DropdownMenuItem
                  key={n.id}
                  onSelect={() => handleItemClick(n)}
                  className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors focus:bg-sky-50/90 focus:text-slate-900 focus:**:text-slate-900 hover:bg-sky-50/90 hover:text-slate-900 ${
                    !n.is_read ? 'bg-sky-50/50' : 'bg-white opacity-85'
                  }`}
                >
                  <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${n.tone}`}>
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
                    <p className={`mt-0.5 text-xs ${!n.is_read ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                      {n.message}
                    </p>
                  </div>
                  {!n.is_read && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-sky-600" title="Unread" />
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
