'use client';

import { motion } from 'framer-motion';
import { QrCode, Check } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function UnassignedTagsTable({ tags = [], selectedTagId, onSelect }) {
  const safeTags = Array.isArray(tags) ? tags : Array.isArray(tags?.data) ? tags.data : [];
  if (safeTags.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-200 shadow-xs">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-3.5">
          <QrCode size={16} className="text-[#E5C378] shrink-0" />
          <span>Unassigned Tags</span>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-normal">({safeTags.length})</span>
        </h3>

        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {safeTags.map((tag) => {
            const isSelected = selectedTagId === tag._id;
            return (
              <button
                key={tag._id}
                type="button"
                onClick={() => onSelect(tag)}
                className={`relative group w-full flex items-center justify-between gap-3 p-3 rounded-xl text-left cursor-pointer transition-all duration-200 select-none ${
                  isSelected
                    ? 'bg-amber-50/70 dark:bg-neutral-900/80 dark:bg-amber-400/[0.04] border-2 border-[#E5C158]/50 dark:border-[#E5C378]/50 shadow-sm ring-1 ring-[#E5C378]/25'
                    : 'bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                {/* Active checkmark / radio indicator */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    {isSelected ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E5C378]/15 border border-[#E5C378]/40 text-[#E5C378] shadow-xs">
                        <Check size={12} strokeWidth={2.5} />
                      </span>
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-400 dark:group-hover:border-neutral-600 transition-colors" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-bold font-mono tracking-wide truncate ${
                      isSelected
                        ? 'text-amber-800 dark:text-[#E5C378]'
                        : 'text-neutral-900 dark:text-neutral-100'
                    }`}>
                      {tag.tagCode}
                    </p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Created {formatDate(tag.createdAt)}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                  Unassigned
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
