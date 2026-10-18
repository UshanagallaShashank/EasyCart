// Platform user list: cards on phones, a table on larger screens, with role, status, last usage, and management actions.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShieldCheck, Clock, MoreVertical } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { formatOrderDate } from '@/features/orders/lib/order-rules';
import { CustomerAvatar } from '@/features/tenant-customers/components/customer-avatar';
import { UserRoleBadge } from './user-role-badge';
import { UserStatusBadge } from './user-status-badge';
import { UserDetailModal } from './user-detail-modal';
import { UserEditModal } from './user-edit-modal';
import type { PlatformUser } from '../types/admin-types';

function UserStoreLink({ user }: { user: PlatformUser }) {
  if (!user.store) return <span className="text-slate-400">—</span>;
  return (
    <Link to={`/admin/stores/${user.store.id}`} className="font-medium text-sky-700 hover:underline">
      {user.store.name}
    </Link>
  );
}

function formatPhone(phone: string | undefined | null) {
  if (!phone || phone === 'undefined' || phone.trim() === '') {
    return <span className="text-slate-400">—</span>;
  }
  return phone;
}

function formatRelativeTime(isoDate?: string | null): string {
  if (!isoDate) return 'Never';
  const date = new Date(isoDate);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)}d ago`;

  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatFullDateTime(isoDate?: string | null): string {
  if (!isoDate) return 'Never';
  return new Date(isoDate).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function UserDirectoryTable({ users }: { users: PlatformUser[] }) {
  const [viewingUser, setViewingUser] = useState<PlatformUser | null>(null);
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);

  return (
    <>
      {/* Mobile Card View */}
      <ul className="flex flex-col gap-3 lg:hidden">
        {users.map((u) => {
          const lastActive = u.last_active_at || u.created_at;
          return (
            <li key={u.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setViewingUser(u)}
                  className="text-left cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <CustomerAvatar id={u.id} name={u.username} />
                </button>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => setViewingUser(u)}
                    className="truncate text-left font-semibold text-slate-900 hover:text-sky-600 block w-full cursor-pointer"
                  >
                    {u.username}
                  </button>
                  <p className="truncate text-xs text-slate-500">{u.email}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500 font-mono">
                    Phone: {formatPhone(u.phone_number)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <UserRoleBadge role={u.role} />
                  <UserStatusBadge status={u.status} />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                <UserStoreLink user={u} />
                <span className="flex items-center gap-1" title={formatFullDateTime(lastActive)}>
                  <Clock className="size-3 text-slate-400" /> Active {formatRelativeTime(lastActive)}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                <span className="text-xs text-slate-500 font-medium">Actions</span>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="size-8 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                      aria-label="User actions"
                    >
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-slate-200/80 p-1">
                    <DropdownMenuItem
                      onSelect={() => setViewingUser(u)}
                      onClick={() => setViewingUser(u)}
                      className="cursor-pointer gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-sky-700 focus:bg-sky-50 focus:text-sky-700 rounded-lg"
                    >
                      <Eye className="size-4 text-slate-500" />
                      <span>View</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setEditingUser(u)}
                      onClick={() => setEditingUser(u)}
                      className="cursor-pointer gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-sky-700 focus:bg-sky-50 focus:text-sky-700 rounded-lg"
                    >
                      <ShieldCheck className="size-4 text-slate-500" />
                      <span>Manage</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Desktop Table View */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs lg:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
              <TableHead className="pl-5">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Store</TableHead>
              <TableHead className="hidden xl:table-cell">Phone</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead className="hidden 2xl:table-cell">Joined</TableHead>
              <TableHead className="pr-5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const lastActive = u.last_active_at || u.created_at;
              return (
                <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="max-w-64 py-3 pl-5">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setViewingUser(u)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <CustomerAvatar id={u.id} name={u.username} />
                      </button>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setViewingUser(u)}
                          className="truncate text-left font-semibold text-slate-900 hover:text-sky-600 block max-w-56 cursor-pointer"
                        >
                          {u.username}
                        </button>
                        <p className="truncate text-xs text-slate-500" title={u.email}>
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <UserRoleBadge role={u.role} />
                  </TableCell>
                  <TableCell>
                    <UserStatusBadge status={u.status} />
                  </TableCell>
                  <TableCell className="max-w-44 truncate">
                    <UserStoreLink user={u} />
                  </TableCell>
                  <TableCell className="hidden text-slate-600 tabular-nums xl:table-cell">
                    {formatPhone(u.phone_number)}
                  </TableCell>
                  <TableCell>
                    <span
                      className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-default"
                      title={`Last active: ${formatFullDateTime(lastActive)}`}
                    >
                      <Clock className="size-3 text-slate-400" />
                      {formatRelativeTime(lastActive)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden 2xl:table-cell text-slate-400 text-xs">
                    {formatOrderDate(u.created_at)}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <div className="flex items-center justify-end">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="size-8 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                            aria-label="User actions"
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-slate-200/80 p-1">
                          <DropdownMenuItem
                            onSelect={() => setViewingUser(u)}
                            onClick={() => setViewingUser(u)}
                            className="cursor-pointer gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-sky-700 focus:bg-sky-50 focus:text-sky-700 rounded-lg"
                          >
                            <Eye className="size-4 text-slate-500" />
                            <span>View</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setEditingUser(u)}
                            onClick={() => setEditingUser(u)}
                            className="cursor-pointer gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-sky-700 focus:bg-sky-50 focus:text-sky-700 rounded-lg"
                          >
                            <ShieldCheck className="size-4 text-slate-500" />
                            <span>Manage</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Profile Detail Modal */}
      <UserDetailModal
        user={viewingUser}
        open={!!viewingUser}
        onOpenChange={(open) => {
          if (!open) setViewingUser(null);
        }}
        onEdit={(u) => {
          setViewingUser(null);
          setEditingUser(u);
        }}
      />

      {/* Role & Status Modal */}
      <UserEditModal
        user={editingUser}
        open={!!editingUser}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null);
        }}
      />
    </>
  );
}
