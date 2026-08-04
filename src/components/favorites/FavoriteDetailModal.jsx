'use client';

import { useState } from 'react';
import { X, Share2, Copy, Calendar, Quote as QuoteIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CATEGORY_CHIPS, CATEGORY_LABELS, DEFAULT_IMAGES } from './favorites.constants';

export default function FavoriteDetailModal({ favorite, onClose, onRemove }) {
  const [isRemoving, setIsRemoving] = useState(false);
  if (!favorite) return null;

  const quote = favorite.quote;
  const category = quote.category || 'motivation';
  const categoryLabel = CATEGORY_LABELS[category] || category;
  const chip = CATEGORY_CHIPS[category] || CATEGORY_CHIPS.healing;
  const hasImage = Boolean(quote.image?.url);
  const formattedDate = favorite.createdAt ? format(new Date(favorite.createdAt), 'MMM d, yyyy') : '';

  const handleShare = async () => {
    const text = `"${quote.text}" — ${quote.author || 'InspireTag'}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'InspireTag Quote', text, url: window.location.href }); }
      catch (err) { if (err.name !== 'AbortError') { navigator.clipboard?.writeText(text); toast.success('Quote copied!'); } }
    } else { navigator.clipboard?.writeText(text); toast.success('Quote copied!'); }
  };

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm px-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
        onClick={onClose}>
        <motion.div className="relative max-w-xl w-full overflow-hidden rounded-[24px] border border-accent/20 bg-card shadow-2xl light:border-[#E8DFCE]/80"
          initial={{ scale: 0.9, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background-secondary/80 text-foreground-secondary backdrop-blur-sm transition-colors hover:text-foreground cursor-pointer">
            <X size={16} />
          </button>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          </div>

          {/* Image area */}
          {hasImage && (
            <div className="relative h-52 bg-cover bg-center" style={{ backgroundImage: `url(${quote.image.url})` }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
              <div className="pointer-events-none absolute inset-0 light:bg-gradient-to-b light:from-[#FDFBF6]/40 light:via-transparent light:to-[#FBF7EF]/85" />
            </div>
          )}

          <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-12 text-center">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${chip.border} ${chip.bg} ${chip.text} ${chip.lightText} ${chip.glow}`}>
              {categoryLabel}
            </span>
            <motion.blockquote className="mt-5 text-[22px] sm:text-[26px] md:text-[30px] leading-[1.35] italic text-foreground"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
              &ldquo;{quote.text}&rdquo;
            </motion.blockquote>
            <motion.p className="mt-4 text-[13px] sm:text-sm text-foreground-secondary"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.4 }}>
              — {quote.author || 'InspireTag'}
            </motion.p>
            <div className="mt-5 flex items-center justify-center gap-1 text-[11px] text-foreground-tertiary">
              <Calendar size={12} /> Saved {formattedDate}
            </div>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" onClick={handleShare} className="cursor-pointer gap-1.5 text-foreground-secondary"><Share2 size={14} /> Share</Button>
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard?.writeText(`"${quote.text}" — ${quote.author || 'InspireTag'}`); toast.success('Copied!'); }} className="cursor-pointer gap-1.5 text-foreground-secondary"><Copy size={14} /> Copy</Button>
              <Button variant="outline" size="sm" onClick={async () => { setIsRemoving(true); try { await onRemove?.(favorite._id); onClose?.(); } finally { setIsRemoving(false); } }} disabled={isRemoving}
                className="cursor-pointer gap-1.5 text-rose-400 border-rose-500/25 hover:bg-rose-500/10 dark:hover:bg-rose-500/15">
                {isRemoving ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-500/30 border-t-rose-500" /> : <Trash2 size={14} />} Remove
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
