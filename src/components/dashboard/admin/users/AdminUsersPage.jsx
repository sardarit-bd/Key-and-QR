'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import { useDebounce } from '@/hooks/search-with-debounce/useDebounce';
import {
  useAdminUsers,
  useAdminUsersStats,
  useAdminUserActions,
} from '@/hooks/dashboard/useAdminUsers';
import UsersStatsCards from './UsersStatsCards';
import UsersFilters from './UsersFilters';
import UsersTable from './UsersTable';
import UserMobileCards from './UserMobileCards';
import UserViewDialog from './UserViewDialog';
import UserEditDialog from './UserEditDialog';
import ConfirmDialog from '../shared/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';

const ITEMS_PER_PAGE = 10;

export default function AdminUsersPage({ 
  title = 'Users Management', 
  description = 'View, manage, and moderate all platform users.',
  defaultRole = 'all',
  defaultStatus = 'all',
}) {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [status, setStatus] = useState(defaultStatus);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogVariant, setDialogVariant] = useState('delete');
  const [selectedUser, setSelectedUser] = useState(null);

  const filters = { search: debouncedSearch, role, status, sort, page, limit: ITEMS_PER_PAGE };
  const { data, isLoading, isError, error, refetch } = useAdminUsers(filters);
  const { data: statsData } = useAdminUsersStats();
  const { suspendUser, activateUser, deleteUser, updateUser } = useAdminUserActions();

  const users = data?.users || [];
  const pagination = data?.pagination || { page: 1, totalPages: 0, totalItems: 0 };

  const isProcessing =
    suspendUser.isPending || activateUser.isPending || deleteUser.isPending;

  const handleSearchChange = useCallback((value) => { setSearch(value); setPage(1); }, []);
  const handleRoleChange    = useCallback((value) => { setRole(value); setPage(1); }, []);
  const handleStatusChange  = useCallback((value) => { setStatus(value); setPage(1); }, []);
  const handleSortChange    = useCallback((value) => { setSort(value); setPage(1); }, []);

  const handleView = useCallback((user) => setViewUser(user), []);
  const handleEdit = useCallback((user) => setEditUser(user), []);

  const handleEditSave = useCallback(async ({ userId, updates }) => {
    setEditLoading(true);
    try {
      await updateUser.mutateAsync({ userId, updates });
      toast.success('User updated successfully');
      setEditUser(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  }, [updateUser]);

  const openDialog = useCallback((variant, user) => {
    setDialogVariant(variant);
    setSelectedUser(user);
    setDialogOpen(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selectedUser) return;
    const userId = selectedUser._id;
    const userName = selectedUser.name;

    try {
      if (dialogVariant === 'delete') {
        await deleteUser.mutateAsync({ userId });
        toast.success(`"${userName}" deleted permanently`);
      } else if (dialogVariant === 'suspend') {
        await suspendUser.mutateAsync({ userId });
        toast.success(`"${userName}" has been suspended`);
      } else if (dialogVariant === 'activate') {
        await activateUser.mutateAsync({ userId });
        toast.success(`"${userName}" has been reactivated`);
      }
      setDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || `Failed to ${dialogVariant} user`);
    }
  }, [selectedUser, dialogVariant, suspendUser, activateUser, deleteUser]);

  const handleSuspend = useCallback((user) => openDialog('suspend', user), [openDialog]);
  const handleActivate = useCallback((user) => openDialog('activate', user), [openDialog]);
  const handleDelete   = useCallback((user) => openDialog('delete', user), [openDialog]);

  if (isLoading && users.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-[22px] border border-border h-24" />
          ))}
        </div>
        <div className="h-9 bg-card rounded-lg border border-border w-full" />
        <div className="bg-card rounded-[22px] border border-border p-6 space-y-4">
          <div className="h-4 bg-muted rounded w-24" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError && users.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <Users size={28} className="text-destructive" />
          </div>
          <p className="text-destructive text-sm mb-2 font-medium">Failed to load users</p>
          <p className="text-foreground-tertiary text-xs mb-6">
            {error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
            <Users size={20} className="text-primary" />
          </span>
          {title}
        </h1>
        <p className="text-sm text-foreground-secondary mt-2 ml-[52px]">
          {description}
        </p>
      </motion.div>

      <UsersStatsCards stats={statsData || {}} />

      <UsersFilters
        search={search}
        onSearchChange={handleSearchChange}
        role={role}
        onRoleChange={handleRoleChange}
        status={status}
        onStatusChange={handleStatusChange}
        sort={sort}
        onSortChange={handleSortChange}
        totalItems={pagination.totalItems}
      />

      {!isLoading && users.length === 0 && (
        <Card className="p-10 sm:p-12">
          <div className="text-center">
            <Users size={40} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground mb-1">No users found</p>
            <p className="text-xs text-foreground-tertiary">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        </Card>
      )}

      {users.length > 0 && (
        <div className="hidden lg:block">
          <UsersTable
            users={users}
            onView={handleView}
            onEdit={handleEdit}
            onSuspend={handleSuspend}
            onActivate={handleActivate}
            onDelete={handleDelete}
          />
        </div>
      )}

      {users.length > 0 && (
        <UserMobileCards
          users={users}
          onView={handleView}
          onEdit={handleEdit}
          onSuspend={handleSuspend}
          onActivate={handleActivate}
          onDelete={handleDelete}
        />
      )}

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          className="pt-2"
        />
      )}

      <UserViewDialog
        open={!!viewUser}
        onOpenChange={(open) => { if (!open) setViewUser(null); }}
        user={viewUser}
      />

      <UserEditDialog
        open={!!editUser}
        onOpenChange={(open) => { if (!open) setEditUser(null); }}
        user={editUser}
        onSave={handleEditSave}
        isLoading={editLoading}
      />

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        variant={dialogVariant}
        userName={selectedUser?.name || ''}
        onConfirm={handleConfirm}
        isLoading={isProcessing}
      />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: 'var(--popover)',
            color: 'var(--popover-foreground)',
            border: '1px solid var(--border)',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </div>
  );
}
