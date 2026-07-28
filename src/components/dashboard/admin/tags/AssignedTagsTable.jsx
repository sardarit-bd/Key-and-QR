'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import ActionMenu from '../shared/ActionMenu';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function AssignedTagRow({ tag, onShowQR, onUnassign, onViewUser, onViewOrder }) {
  const actions = [
    { label: 'Show QR Code', onClick: () => onShowQR(tag) },
    { separator: true },
    { label: 'View User', onClick: () => onViewUser(tag) },
    { label: 'View Order', onClick: () => onViewOrder(tag) },
    { separator: true },
    { label: 'Unassign Tag', onClick: () => onUnassign(tag), destructive: true },
  ];

  const ownerName = tag.owner?.name || tag.owner?.email || 'Unknown';
  const ownerEmail = tag.owner?.email || '';

  return (
    <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,0.8fr)_minmax(0,100px)_minmax(0,36px)] items-center gap-2 py-3 px-2 hover:bg-muted/30 rounded-lg transition-colors">
      {/* Tag Code */}
      <div className="min-w-0">
        <p className="text-sm font-mono font-medium text-foreground truncate">{tag.tagCode}</p>
        <p className="text-[10px] text-foreground-tertiary font-mono">ID: {tag._id?.slice(-8).toUpperCase()}</p>
      </div>

      {/* Assigned User */}
      <div className="min-w-0">
        <p className="text-sm text-foreground truncate">{ownerName}</p>
        {ownerEmail && <p className="text-[10px] text-foreground-tertiary truncate">{ownerEmail}</p>}
      </div>

      {/* Plan */}
      <div className="text-xs capitalize text-foreground-secondary">{tag.subscriptionType || 'free'}</div>

      {/* Assigned Date */}
      <div className="hidden md:block text-xs text-foreground-tertiary">{formatDate(tag.activatedAt || tag.createdAt)}</div>

      {/* Actions */}
      <div className="flex justify-end">
        <ActionMenu actions={actions} />
      </div>
    </div>
  );
}

export default function AssignedTagsTable({ tags = [], onShowQR, onUnassign, onViewUser, onViewOrder }) {
  if (tags.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-400" />
            Assigned Tags
          </h2>
        </div>

        <div className="hidden lg:grid grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,0.8fr)_minmax(0,100px)_minmax(0,36px)] items-center gap-2 px-2 pb-2 text-[10px] text-foreground-tertiary font-medium uppercase tracking-wider border-b border-border/50 mb-1">
          <span>Tag</span>
          <span>User</span>
          <span>Plan</span>
          <span className="hidden md:inline">Assigned</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="divide-y divide-border/50">
          {tags.map((tag, i) => (
            <motion.div key={tag._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
              <AssignedTagRow tag={tag} onShowQR={onShowQR} onUnassign={onUnassign} onViewUser={onViewUser} onViewOrder={onViewOrder} />
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
