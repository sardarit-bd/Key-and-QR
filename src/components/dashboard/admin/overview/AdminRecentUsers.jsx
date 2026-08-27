'use client';

import { motion } from 'framer-motion';
import { Users, UserPlus } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import Link from 'next/link';

const PROVIDER_ICONS = {
  google: 'G',
  apple: 'A',
  email: '@',
};

function UserRow({ user }) {
  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const providerTag = PROVIDER_ICONS[user.provider] || '@';

  return (
    <div className="flex items-center justify-between py-3 px-1 hover:bg-muted/30 rounded-lg transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-primary">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
          <p className="text-xs text-foreground-tertiary truncate">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
 <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground-tertiary ">
          {providerTag}
        </span>
        {user.isEmailVerified ? (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Verified" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Unverified" />
        )}
      </div>
    </div>
  );
}

export default function AdminRecentUsers({ users = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Card className="p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users size={18} className="text-blue-400" />
            Recent Users
          </h2>
          <Link
            href="/dashboard/admin/users"
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            View All <UserPlus size={13} />
          </Link>
        </div>

        {users.length === 0 ? (
          <div className="py-10 text-center">
            <Users size={36} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-foreground-tertiary">No new users</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {users.map((user) => (
              <UserRow key={user._id} user={user} />
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
