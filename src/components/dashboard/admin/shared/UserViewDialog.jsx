'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Mail, Shield, Calendar, Activity } from 'lucide-react';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Row({ icon: Icon, label, value, className = '' }) {
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

export default function UserViewDialog({ open, onOpenChange, user }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Information</DialogTitle>
        </DialogHeader>

        {user ? (
          <div className="py-2 space-y-1">
            <div className="flex items-center gap-4 pb-4 border-b border-border/50">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {user.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-foreground truncate">{user.name || 'Unknown'}</p>
                <p className="text-sm text-foreground-tertiary truncate">{user.email || '—'}</p>
              </div>
            </div>

 <Row icon={User} label="User ID" value={user._id} className=" text-xs" />
            <Row icon={Mail} label="Email" value={user.email} />
            <Row icon={Shield} label="Role" value={user.role || 'user'} className="capitalize" />
            <Row icon={Activity} label="Email Verified" value={user.isEmailVerified ? 'Yes' : 'No'} className={user.isEmailVerified ? 'text-emerald-400' : 'text-amber-400'} />
            {user.createdAt && <Row icon={Calendar} label="Registered" value={formatDate(user.createdAt)} />}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-foreground-tertiary">User information not available.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
