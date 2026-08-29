'use client';

import { motion } from 'framer-motion';
import { QrCode, Sparkles, User, Tag as TagIcon, MessageSquare } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import ActionMenu from '../shared/ActionMenu';
import { getCategoryBadgeClass, getPrettyCategoryLabel } from '@/components/public/quote/category';

const STATUS_STYLES = {
  unused:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  assigned:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  activated: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  disabled:  'bg-red-500/10 text-red-400 border-red-500/20',
};

const STATUS_LABELS = {
  unused:    'Unused',
  assigned:  'Assigned to Order',
  activated: 'Activated',
  disabled:  'Disabled',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStatusKey(tag) {
  if (!tag.isActive) return 'disabled';
  if (tag.owner || tag.isActivated) return 'activated';
  if (tag.assignedOrderId) return 'assigned';
  return 'unused';
}

function TagRow({ tag, onShowQR, onDownload, onAssign, onToggleStatus, onDelete }) {
  const sk = getStatusKey(tag);
  const style = STATUS_STYLES[sk];
  const label = STATUS_LABELS[sk];
  const isDisabled = !tag.isActive;
  const isAssigned = !!(tag.owner || tag.assignedOrderId || tag.isActivated);

  const actions = [
    { label: 'Show QR Code', onClick: () => onShowQR(tag) },
    { label: 'Download PNG', onClick: () => onDownload(tag) },
    { separator: true },
  ];

  if (sk === 'unused') {
    actions.push({ label: 'Assign to Order', onClick: () => onAssign(tag) });
    actions.push({ separator: true });
  }

  actions.push(
    { label: isDisabled ? 'Enable Tag' : 'Disable Tag', onClick: () => onToggleStatus(tag), destructive: !isDisabled }
  );

  if (!isAssigned) {
    actions.push(
      { separator: true },
      { label: 'Permanent Delete', onClick: () => onDelete(tag), destructive: true }
    );
  }

  const assignedQuote = tag.assignedQuote;
  const quoteCategory = assignedQuote?.category;

  return (
    <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,2.2fr)_minmax(0,1.8fr)_minmax(0,90px)_minmax(0,36px)] items-center gap-2.5 py-3 px-2 hover:bg-muted/30 rounded-lg transition-colors">
      {/* Tag Code + ID + Plan */}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{tag.tagCode}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-foreground-tertiary">ID: {tag._id?.slice(-6).toUpperCase()}</span>
          <span className="text-[10px] text-foreground-tertiary">•</span>
          <span className="text-[10px] capitalize text-foreground-secondary">{tag.subscriptionType || 'free'}</span>
        </div>
      </div>

      {/* Status */}
      <div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${style}`}>{label}</span>
      </div>

      {/* Assigned Quote & Category */}
      <div className="min-w-0">
        {assignedQuote ? (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${getCategoryBadgeClass(quoteCategory)}`}>
                {getPrettyCategoryLabel(quoteCategory)}
              </span>
              <span className="text-[9px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1 py-0.2 rounded flex items-center gap-0.5">
                {tag.assignmentType === 'user' ? <User size={9} /> : <TagIcon size={9} />}
                {tag.assignmentType === 'user' ? 'User Quote' : 'Direct Tag'}
              </span>
            </div>
            <p className="text-xs text-foreground truncate max-w-[240px]">
              "{assignedQuote.text || assignedQuote.title || 'Visual Quote'}"
            </p>
          </div>
        ) : tag.personalMessage ? (
          <div className="space-y-0.5">
            <span className="text-[10px] px-1.5 py-0.2 rounded font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20 flex items-center gap-1 w-fit">
              <MessageSquare size={10} /> Personal Message
            </span>
            <p className="text-xs text-foreground-secondary truncate max-w-[240px]">
              "{tag.personalMessage}"
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-foreground-tertiary text-xs">
            <Sparkles size={12} className="text-foreground-tertiary/70" />
            <span className="text-[11px]">Random Pool Fallback</span>
          </div>
        )}
      </div>

      {/* Associated Order / Owner */}
      <div className="min-w-0 text-xs">
        {tag.owner ? (
          <p className="font-medium text-foreground truncate">
            {tag.owner.name || tag.owner.email}
          </p>
        ) : null}
        {tag.assignedOrderId ? (
          <p className="text-[10px] text-foreground-tertiary truncate">
            {tag.assignedOrderId.orderSource || 'Website'} Order
          </p>
        ) : !tag.owner ? (
          <span className="text-foreground-tertiary text-[11px]">—</span>
        ) : null}
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

export default function TagsTable({ tags = [], onShowQR, onDownload, onAssign, onToggleStatus, onDelete }) {
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

        <div className="hidden lg:grid grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,2.2fr)_minmax(0,1.8fr)_minmax(0,90px)_minmax(0,36px)] items-center gap-2.5 px-2 pb-2 text-[10px] text-foreground-tertiary font-medium uppercase tracking-wider border-b border-border/50 mb-1">
          <span>Tag</span>
          <span>Status</span>
          <span>Assigned Quote / Category</span>
          <span>Associated Owner / Order</span>
          <span className="hidden md:inline">Created</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="divide-y divide-border/50">
          {tags.map((tag, i) => (
            <motion.div key={tag._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
              <TagRow
                tag={tag}
                onShowQR={onShowQR}
                onDownload={onDownload}
                onAssign={onAssign}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
              />
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
