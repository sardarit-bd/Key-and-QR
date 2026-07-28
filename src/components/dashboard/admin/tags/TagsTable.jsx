'use client';

import { motion } from 'framer-motion';
import { QrCode } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import ActionMenu from '../shared/ActionMenu';

const STATUS_STYLES = {
  active_activated: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  active_pending:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  disabled:         'bg-red-500/10 text-red-400 border-red-500/20',
};

const STATUS_LABELS = {
  active_activated: 'Active',
  active_pending: 'Pending',
  disabled: 'Disabled',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStatusKey(tag) {
  if (!tag.isActive) return 'disabled';
  return tag.isActivated ? 'active_activated' : 'active_pending';
}

function TagRow({ tag, onShowQR, onToggleStatus, onDelete }) {
  const sk = getStatusKey(tag);
  const style = STATUS_STYLES[sk];
  const label = STATUS_LABELS[sk];
  const isDisabled = !tag.isActive;

  const actions = [
    { label: 'Show QR Code', onClick: () => onShowQR(tag) },
    { separator: true },
    { label: isDisabled ? 'Enable Tag' : 'Disable Tag', onClick: () => onToggleStatus(tag), destructive: !isDisabled },
    { separator: true },
    { label: 'Delete Tag', onClick: () => onDelete(tag), destructive: true },
  ];

  return (
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,100px)_minmax(0,36px)] items-center gap-2 py-3 px-2 hover:bg-muted/30 rounded-lg transition-colors">
      {/* Tag Code + ID */}
      <div className="min-w-0">
        <p className="text-sm font-mono font-medium text-foreground truncate">{tag.tagCode}</p>
        <p className="text-[10px] text-foreground-tertiary font-mono truncate">ID: {tag._id?.slice(-8).toUpperCase()}</p>
      </div>

      {/* Plan */}
      <div className="text-xs capitalize text-foreground-secondary">{tag.subscriptionType || 'free'}</div>

      {/* Status */}
      <div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${style}`}>{label}</span>
      </div>

      {/* Created */}
      <div className="hidden md:block text-xs text-foreground-tertiary">{formatDate(tag.createdAt)}</div>

      {/* Actions */}
      <div className="flex justify-end">
        <ActionMenu actions={actions} />
      </div>
    </div>
  );
}

export default function TagsTable({ tags = [], onShowQR, onToggleStatus, onDelete }) {
  if (tags.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <QrCode size={18} className="text-indigo-400" />
            All Tags
          </h2>
        </div>

        <div className="hidden lg:grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,100px)_minmax(0,36px)] items-center gap-2 px-2 pb-2 text-[10px] text-foreground-tertiary font-medium uppercase tracking-wider border-b border-border/50 mb-1">
          <span>Tag</span>
          <span>Plan</span>
          <span>Status</span>
          <span className="hidden md:inline">Created</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="divide-y divide-border/50">
          {tags.map((tag, i) => (
            <motion.div key={tag._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
              <TagRow tag={tag} onShowQR={onShowQR} onToggleStatus={onToggleStatus} onDelete={onDelete} />
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
