'use client';

import { motion } from 'framer-motion';
import DataTableToolbar from '@/components/common/table/DataTableToolbar';

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'user', label: 'User' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

export default function UsersFilters({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  totalItems = 0,
  isLoading = false,
}) {
  const hasActiveFilters = Boolean(
    (search && search.trim()) ||
    (role && role !== 'all') ||
    (status && status !== 'all') ||
    (sort && sort !== 'newest')
  );

  const handleReset = () => {
    onSearchChange?.('');
    onRoleChange?.('all');
    onStatusChange?.('all');
    onSortChange?.('newest');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <DataTableToolbar
        variant="admin"
        search={{
          value: search,
          onChange: onSearchChange,
          placeholder: 'Search users by name or email...',
          isLoading,
        }}
        filters={[
          {
            key: 'role',
            value: role,
            onChange: onRoleChange,
            placeholder: 'All Roles',
            options: ROLE_OPTIONS,
          },
          {
            key: 'status',
            value: status,
            onChange: onStatusChange,
            placeholder: 'All Statuses',
            options: STATUS_OPTIONS,
          },
        ]}
        sort={{
          value: sort,
          onChange: onSortChange,
          placeholder: 'Newest First',
          options: SORT_OPTIONS,
        }}
        hasActiveFilters={hasActiveFilters}
        onReset={handleReset}
        resetLabel="Reset"
        summary={{
          total: totalItems,
          label: 'users',
        }}
      />
    </motion.div>
  );
}
