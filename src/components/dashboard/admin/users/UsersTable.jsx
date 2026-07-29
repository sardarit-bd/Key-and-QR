'use client';

import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import ActionMenu from '../shared/ActionMenu';

const ROLE_STYLES = {
  admin:     'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  moderator: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  user:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitials(name) {
  return name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

function UserRow({ user, onView, onEdit, onSuspend, onActivate, onDelete }) {
  const roleStyle = ROLE_STYLES[user.role] || ROLE_STYLES.user;
  const isSuspended = user.isSuspended;

  const actions = [
    { label: 'View Details', onClick: () => onView(user), icon: null },
    { label: 'Edit User',   onClick: () => onEdit(user), icon: null },
    { separator: true },
    ...(isSuspended
      ? [{ label: 'Activate', onClick: () => onActivate(user), icon: null }]
      : [{ label: 'Suspend', onClick: () => onSuspend(user), icon: null }]),
    { separator: true },
    { label: 'Delete User', onClick: () => onDelete(user), destructive: true, icon: null },
  ];

  return (
    <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,120px)_minmax(0,36px)] items-center gap-2 py-3 px-2 hover:bg-muted/30 rounded-lg transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-primary">{getInitials(user.name)}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
          <p className="text-xs text-foreground-tertiary truncate">{user.email}</p>
        </div>
      </div>

      <div className="text-xs text-foreground-secondary capitalize truncate">{user.role}</div>

      <div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isSuspended ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
          {isSuspended ? 'Suspended' : 'Active'}
        </span>
      </div>

      <div className="hidden md:block text-xs text-foreground-tertiary">
        {formatDate(user.createdAt)}
      </div>

      <div className="flex justify-end">
        <ActionMenu actions={actions} />
      </div>
    </div>
  );
}

export default function UsersTable({ users = [], onView, onEdit, onSuspend, onActivate, onDelete }) {
  if (users.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users size={18} className="text-indigo-400" />
            All Users
          </h2>
        </div>

        <div className="hidden lg:grid grid-cols-[minmax(0,3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,120px)_minmax(0,36px)] items-center gap-2 px-2 pb-2 text-[10px] text-foreground-tertiary font-medium uppercase tracking-wider border-b border-border/50 mb-1">
          <span>User</span>
          <span>Role</span>
          <span>Status</span>
          <span>Joined</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="divide-y divide-border/50">
          {users.map((user, i) => (
            <motion.div key={user._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
              <UserRow user={user} onView={onView} onEdit={onEdit} onSuspend={onSuspend} onActivate={onActivate} onDelete={onDelete} />
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
