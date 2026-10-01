// Platform user list: cards on phones, a table on larger screens, with role, store, and join date.
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatOrderDate } from '@/features/orders/lib/order-rules';
import { CustomerAvatar } from '@/features/tenant-customers/components/customer-avatar';
import { UserRoleBadge } from './user-role-badge';
import type { PlatformUser } from '../types/admin-types';

function UserStoreLink({ user }: { user: PlatformUser }) {
  if (!user.store) return <span className="text-slate-400">—</span>;
  return <Link to={`/admin/stores/${user.store.id}`} className="font-medium text-sky-700 hover:underline">{user.store.name}</Link>;
}

export function UserDirectoryTable({ users }: { users: PlatformUser[] }) {
  return (
    <>
      <ul className="flex flex-col gap-3 md:hidden">
        {users.map((u) => (
          <li key={u.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-start gap-3"><CustomerAvatar id={u.id} name={u.username} /><div className="min-w-0 flex-1"><p className="truncate font-semibold text-slate-900">{u.username}</p><p className="truncate text-xs text-slate-500">{u.email}</p></div><UserRoleBadge role={u.role} /></div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500"><UserStoreLink user={u} /><span>Joined {formatOrderDate(u.created_at)}</span></div>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs md:block">
        <Table>
          <TableHeader><TableRow className="bg-slate-50/70 hover:bg-slate-50/70"><TableHead className="pl-5">User</TableHead><TableHead>Role</TableHead><TableHead>Store</TableHead><TableHead>Phone</TableHead><TableHead className="pr-5">Joined</TableHead></TableRow></TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="max-w-xs py-3 pl-5"><div className="flex items-center gap-3"><CustomerAvatar id={u.id} name={u.username} /><div className="min-w-0"><p className="truncate font-semibold text-slate-900">{u.username}</p><p className="truncate text-xs text-slate-500">{u.email}</p></div></div></TableCell>
                <TableCell><UserRoleBadge role={u.role} /></TableCell>
                <TableCell><UserStoreLink user={u} /></TableCell>
                <TableCell className="text-slate-600 tabular-nums">{u.phone_number}</TableCell>
                <TableCell className="pr-5 text-slate-500">{formatOrderDate(u.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
