'use client';

import { motion } from 'framer-motion';
import { QrCode } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function UnassignedTagsTable({ tags = [], selectedTagId, onSelect }) {
  if (tags.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <QrCode size={16} className="text-indigo-400" />
          Unassigned Tags
          <span className="text-[10px] text-foreground-tertiary font-normal">({tags.length})</span>
        </h3>

        <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
          {tags.map((tag) => {
            const isSelected = selectedTagId === tag._id;
            return (
              <button
                key={tag._id}
                onClick={() => onSelect(tag)}
                className={`w-full flex items-center justify-between py-2.5 px-2 rounded-lg transition-colors text-left cursor-pointer ${
                  isSelected
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted/30 border border-transparent'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-mono font-medium text-foreground truncate">{tag.tagCode}</p>
                  <p className="text-[10px] text-foreground-tertiary">Created {formatDate(tag.createdAt)}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                  Free
                </span>
              </button>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
