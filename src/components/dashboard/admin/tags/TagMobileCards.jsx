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

function TagCard({ tag, onShowQR, onToggleStatus, onDelete }) {
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
    <div className="flex items-start gap-3 py-3 px-1 hover:bg-muted/30 rounded-lg transition-colors">
      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <QrCode size={18} className="text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-mono font-medium text-foreground truncate">{tag.tagCode}</p>
          <ActionMenu actions={actions} />
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${style}`}>{label}</span>
          <span className="text-[10px] text-foreground-tertiary capitalize">{tag.subscriptionType || 'free'}</span>
          <span className="text-[10px] text-foreground-tertiary ml-auto">{formatDate(tag.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

export default function TagMobileCards({ tags = [], onShowQR, onToggleStatus, onDelete }) {
  if (tags.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:hidden">
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <QrCode size={18} className="text-indigo-400" />
            All Tags
          </h2>
        </div>
        <div className="divide-y divide-border/50">
          {tags.map((tag, i) => (
            <motion.div key={tag._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
              <TagCard tag={tag} onShowQR={onShowQR} onToggleStatus={onToggleStatus} onDelete={onDelete} />
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
