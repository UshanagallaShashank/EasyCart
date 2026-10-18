// Platform admin user directory: everyone with an account, filterable by role, searchable, and paginated.
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { FilterPills } from '@/components/filter-pills';
import { SearchField } from '@/components/search-field';
import { usePagination } from '@/components/pagination/use-pagination';
import { PaginationBar } from '@/components/pagination/pagination-bar';
import { usePlatformUsers } from '../hooks/use-platform-users';
import { useUserDirectoryFilter, type UserRoleFilter } from '../hooks/use-user-directory-filter';
import { UserDirectoryTable } from '../components/user-directory-table';
import { AdminPageTitle } from '../components/page-title';

export function UsersPage() {
  const { data: users, isLoading } = usePlatformUsers();
  const { search, setSearch, role, setRole, visible, options } = useUserDirectoryFilter(users ?? []);
  const { page, setPage, pageSize, setPageSize, totalPages, start, end, pageItems } = usePagination(visible, `${search}|${role}`);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageTitle title="Users" description="Store owners, customers, and admins with an EasyCart account." />
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FilterPills<UserRoleFilter> options={options} value={role} onChange={setRole} />
        <SearchField value={search} onChange={setSearch} placeholder="Search name, email, phone" />
      </div>
      {isLoading ? <Skeleton className="h-64 w-full rounded-2xl" /> : visible.length ? (
        <div className="flex flex-col gap-4">
          <UserDirectoryTable users={pageItems} />
          <PaginationBar page={page} totalPages={totalPages} pageSize={pageSize} start={start} end={end} total={visible.length} noun="users" onPageChange={setPage} onPageSizeChange={setPageSize} />
        </div>
      ) : <EmptyState message={users?.length ? 'No users match your filters.' : 'No users yet.'} />}
    </div>
  );
}
