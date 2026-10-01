// Platform admin user directory: everyone with an account, filterable by role and searchable.
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { FilterPills } from '@/components/filter-pills';
import { SearchField } from '@/components/search-field';
import { usePlatformUsers } from '../hooks/use-platform-users';
import { useUserDirectoryFilter, type UserRoleFilter } from '../hooks/use-user-directory-filter';
import { UserDirectoryTable } from '../components/user-directory-table';
import { AdminPageTitle } from '../components/page-title';

export function UsersPage() {
  const { data: users, isLoading } = usePlatformUsers();
  const { search, setSearch, role, setRole, visible, options } = useUserDirectoryFilter(users ?? []);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageTitle title="Users" description="Store owners, customers, and admins with an EasyCart account." />
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FilterPills<UserRoleFilter> options={options} value={role} onChange={setRole} />
        <SearchField value={search} onChange={setSearch} placeholder="Search name, email, phone" />
      </div>
      {isLoading ? <Skeleton className="h-64 w-full rounded-2xl" /> : visible.length ? <UserDirectoryTable users={visible} /> : <EmptyState message={users?.length ? 'No users match your filters.' : 'No users yet.'} />}
    </div>
  );
}
