'use client';

import { motion } from 'framer-motion';
import { QrCode } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import ActionMenu from '../shared/ActionMenu';
import { getCategoryBadgeClass, getPrettyCategoryLabel } from '@/components/public/quote/category';

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
  const isAssigned = !!(tag.owner || tag.assignedOrderId || tag.isActivated);

  const actions = [
    { label: 'Show QR Code', onClick: () => onShowQR(tag) },
    { separator: true },
    { label: isDisabled ? 'Enable Tag' : 'Disable Tag', onClick: () => onToggleStatus(tag), destructive: !isDisabled },
  ];

  if (!isAssigned) {
    actions.push(
      { separator: true },
      { label: 'Permanent Delete', onClick: () => onDelete(tag), destructive: true }
    );
  }

  const assignedQuote = tag.assignedQuote;
  const quoteCategory = assignedQuote?.category;

  return (
    <div className="flex items-start gap-3 py-3 px-1 hover:bg-muted/30 rounded-lg transition-colors">
      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <QrCode size={18} className="text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground truncate">{tag.tagCode}</p>
            <p className="text-[10px] text-foreground-tertiary">ID: {tag._id?.slice(-6).toUpperCase()}</p>
          </div>
          <ActionMenu actions={actions} />
        </div>

        {/* Assigned Quote Information */}
        {assignedQuote ? (
          <div className="mt-2 p-2 rounded-lg bg-card border border-border/60">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium border ${getCategoryBadgeClass(quoteCategory)}`}>
                {getPrettyCategoryLabel(quoteCategory)}
              </span>
              <span className="text-[9px] text-indigo-400">
                {tag.assignmentType === 'user' ? '• User Quote' : '• Direct Tag Quote'}
              </span>
            </div>
            <p className="text-xs text-foreground line-clamp-1">
              "{assignedQuote.text || assignedQuote.title || 'Visual Quote'}"
            </p>
          </div>
        ) : tag.personalMessage ? (
          <div className="mt-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <span className="text-[9px] text-amber-400 font-medium">Personal Message:</span>
            <p className="text-xs text-foreground-secondary line-clamp-1">"{tag.personalMessage}"</p>
          </div>
        ) : null}

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
