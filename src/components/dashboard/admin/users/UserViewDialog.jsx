'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  Shield,
  Activity,
  Globe,
  Clock,
  LogIn,
  UserCheck,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DetailRow({ icon: Icon, label, value, className = '' }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-foreground-tertiary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-sm text-foreground mt-0.5 ${className}`}>{value || '—'}</p>
      </div>
    </div>
  );
}

function getInitials(name) {
  return name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

export default function UserViewDialog({ open, onOpenChange, user, isLoading = false }) {
  const initials = getInitials(user?.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : user ? (
          <div className="py-2">
            {/* User identity header */}
            <div className="flex items-center gap-4 pb-4 border-b border-border/50 mb-2">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-sm text-foreground-tertiary truncate">{user.email}</p>
              </div>
            </div>

            {/* Detail rows */}
            <DetailRow icon={Shield} label="Role" value={user.role} className="capitalize" />
            <DetailRow
              icon={Activity}
              label="Status"
              value={user.status === 'active' ? 'Active' : 'Suspended'}
              className={
                user.status === 'active' ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'
              }
            />
            <DetailRow icon={Globe} label="Auth Provider" value={user.provider || 'email'} className="capitalize" />
            <DetailRow
              icon={UserCheck}
              label="Email Verified"
              value={user.isEmailVerified ? 'Yes' : 'No'}
              className={user.isEmailVerified ? 'text-emerald-400' : 'text-amber-400'}
            />
            <DetailRow icon={Calendar} label="Registered" value={formatDate(user.createdAt)} />
            <DetailRow icon={Clock} label="Last Active" value={formatDate(user.lastActive)} />
            <DetailRow icon={LogIn} label="Login Count" value={user.loginCount?.toLocaleString() || '—'} />
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-foreground-tertiary">User not found.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
