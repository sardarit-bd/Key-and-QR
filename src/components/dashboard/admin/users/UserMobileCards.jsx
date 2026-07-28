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

const STATUS_STYLES = {
  active:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  suspended: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
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

function UserCard({ user, onView, onEdit, onSuspend, onActivate, onDelete }) {
  const roleStyle = ROLE_STYLES[user.role] || ROLE_STYLES.user;
  const statusStyle = STATUS_STYLES[user.status] || STATUS_STYLES.active;

  const actions = [
    { label: 'View Details', onClick: () => onView(user) },
    { label: 'Edit User',   onClick: () => onEdit(user) },
    { separator: true },
    ...(user.status === 'active'
      ? [{ label: 'Suspend', onClick: () => onSuspend(user) }]
      : [{ label: 'Activate', onClick: () => onActivate(user) }]),
    { separator: true },
    { label: 'Delete User', onClick: () => onDelete(user), destructive: true },
  ];

  return (
    <div className="flex items-start gap-3 py-3 px-1 hover:bg-muted/30 rounded-lg transition-colors">
      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-xs font-semibold text-primary">{getInitials(user.name)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
          <ActionMenu actions={actions} />
        </div>
        <p className="text-xs text-foreground-tertiary truncate mt-0.5">{user.email}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${roleStyle}`}>
            {user.role}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusStyle}`}>
            {user.status === 'active' ? 'Active' : 'Suspended'}
          </span>
          <span className="text-[10px] text-foreground-tertiary ml-auto">
            {formatDate(user.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function UserMobileCards({ users = [], onView, onEdit, onSuspend, onActivate, onDelete }) {
  if (users.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="lg:hidden"
    >
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users size={18} className="text-indigo-400" />
            All Users
          </h2>
        </div>
        <div className="divide-y divide-border/50">
          {users.map((user, i) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <UserCard
                user={user}
                onView={onView}
                onEdit={onEdit}
                onSuspend={onSuspend}
                onActivate={onActivate}
                onDelete={onDelete}
              />
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
