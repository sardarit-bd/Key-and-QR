'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Calendar, Quote as QuoteIcon, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  FAVORITE_CARD_SURFACE, FAVORITE_HOVER, ACTION_ICON_CLASS,
} from './favorites.constants';
import {
  getCategoryChipTheme,
  getCategoryLabel,
  resolveBackgroundImage,
} from '@/components/category';

export default function FavoriteCard({ favorite, view = 'grid', onRemove, onViewDetail }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const quote = favorite?.quote;

  if (!quote) return null;

  const category = quote.category || 'motivation';
  const categoryLabel = getCategoryLabel(category);
  const chip = getCategoryChipTheme(category);
  const hasImage = Boolean(quote.image?.url);
  const backgroundImage = hasImage ? quote.image.url : resolveBackgroundImage(category);
  const formattedDate = favorite.createdAt ? format(new Date(favorite.createdAt), 'MMM d, yyyy') : '';

  const handleShare = async () => {
    const text = `"${quote.text}" — ${quote.author || 'InspireTag'}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'InspireTag Quote', text, url: window.location.href }); }
      catch (err) { if (err.name !== 'AbortError') { navigator.clipboard?.writeText(text); toast.success('Quote copied!'); } }
    } else { navigator.clipboard?.writeText(text); toast.success('Quote copied!'); }
  };

  const handleCopy = () => { navigator.clipboard?.writeText(`"${quote.text}" — ${quote.author || 'InspireTag'}`); toast.success('Quote copied!'); };

  const handleRemove = async () => { setIsRemoving(true); try { await onRemove(favorite._id); } finally { setIsRemoving(false); } };

  if (view === 'list') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className={`group flex flex-col gap-4 border ${FAVORITE_CARD_SURFACE} p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_20px_40px_-16px_rgb(0_0_0/0.5)] sm:flex-row sm:items-center`}>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium text-foreground">&ldquo;{quote.text}&rdquo;</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-foreground-tertiary">{quote.author || 'InspireTag'}</span>
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${chip.border} ${chip.bg} ${chip.text} ${chip.lightText}`}>{categoryLabel}</span>
            {formattedDate && <span className="flex items-center gap-1 text-[10px] text-foreground-tertiary"><Calendar className="h-3 w-3" />{formattedDate}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share" className="h-8 w-8 cursor-pointer text-foreground-tertiary hover:text-foreground hover:bg-muted/50"><Share2 className="h-4 w-4" /></Button>
          {onViewDetail && <Button variant="ghost" size="icon" onClick={() => onViewDetail(favorite)} aria-label="View" className="h-8 w-8 cursor-pointer text-foreground-tertiary hover:text-foreground hover:bg-muted/50"><Eye className="h-4 w-4" /></Button>}
          <Button variant="ghost" size="icon" onClick={handleRemove} disabled={isRemoving} aria-label="Remove" className="h-8 w-8 cursor-pointer text-foreground-tertiary hover:text-rose-500 hover:bg-rose-500/10">
            {isRemoving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500/30 border-t-rose-500" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.015, y: -5 }} transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`group relative overflow-hidden ${FAVORITE_CARD_SURFACE} ${FAVORITE_HOVER} transition-all duration-300`}>

      {hasImage ? (
        <div className="relative h-52 bg-cover bg-center sm:h-56" style={{ backgroundImage: `url(${backgroundImage})` }}>
          <div className="absolute inset-0 hidden bg-gradient-to-b from-black/25 via-black/10 to-black/45 dark:block" />
          <div className="pointer-events-none absolute inset-0 hidden dark:block" style={{ background: 'radial-gradient(ellipse 90% 80% at 50% 0%, rgba(0,0,0,0.2) 0%, transparent 60%)' }} />
          <div className="pointer-events-none absolute inset-0 light:bg-gradient-to-b light:from-[#FDFBF6]/40 light:via-[#F8F2E7]/35 light:to-[#FBF7EF]/85" />
          <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/95 backdrop-blur-md light:border-[#E8DFCE]/80 light:bg-white/70 light:text-[#4A3C2D]">{quote.author || 'MyInspireTag'}</span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize backdrop-blur-md ${chip.border} ${chip.bg} ${chip.text} ${chip.lightText} ${chip.glow}`}>{categoryLabel}</span>
          </div>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 py-10 pt-14">
            <div className="text-center">
              <QuoteIcon className="mx-auto mb-2 h-4 w-4 text-white/60 light:text-[#8A7558]" strokeWidth={2} />
              <p className="line-clamp-4 text-[15px] font-medium leading-[1.6] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] light:text-[#201A15] light:drop-shadow-none">&ldquo;{quote.text}&rdquo;</p>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-white/10 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3.5 pb-2.5 pt-8 light:border-[#E8DFCE]/80 light:from-[#FBF7EF]/95 light:via-[#FBF7EF]/60 light:to-transparent">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[11px] font-medium text-white/80 light:text-[#6F5D46]">{formattedDate}</span>
              <div className="pointer-events-auto flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share" className={ACTION_ICON_CLASS}><Share2 className="h-3.5 w-3.5" /></Button>
                {onViewDetail && <Button variant="ghost" size="icon" onClick={() => onViewDetail(favorite)} aria-label="View" className={ACTION_ICON_CLASS}><Eye className="h-3.5 w-3.5" /></Button>}
                <Button variant="ghost" size="icon" onClick={handleRemove} disabled={isRemoving} aria-label="Remove" className={`${ACTION_ICON_CLASS} !text-rose-400`}>
                  {isRemoving ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-500/30 border-t-rose-500" /> : <Trash2 className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative h-52 sm:h-56">
          <div className="absolute inset-0 bg-gradient-to-br from-background-tertiary/90 via-background-secondary to-background" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.07] via-transparent to-accent/[0.05]" />
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-64 -translate-x-1/2 rounded-full bg-accent/[0.06] blur-[80px]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.07] light:opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px', color: '#E8C985',
              maskImage: 'radial-gradient(ellipse 90% 90% at 50% 40%, black 40%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 40%, black 40%, transparent 100%)' }} />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent light:via-[#E8DFCE]/70" />
          <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/95 backdrop-blur-md light:border-[#E8DFCE]/80 light:bg-white/70 light:text-[#4A3C2D]">{quote.author || 'MyInspireTag'}</span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize backdrop-blur-md ${chip.border} ${chip.bg} ${chip.text} ${chip.lightText} ${chip.glow}`}>{categoryLabel}</span>
          </div>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 py-10 pt-14">
            <div className="relative text-center">
              <QuoteIcon className="absolute -top-7 left-1/2 h-12 w-12 -translate-x-1/2 text-accent/15 light:text-[#C6922D]/15" strokeWidth={1} fill="currentColor" stroke="none" />
              <p className="relative line-clamp-4 text-[15px] font-medium leading-[1.6] text-foreground">&ldquo;{quote.text}&rdquo;</p>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-white/10 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3.5 pb-2.5 pt-8 light:border-[#E8DFCE]/80 light:from-[#FBF7EF]/95 light:via-[#FBF7EF]/60 light:to-transparent">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[11px] font-medium text-white/80 light:text-[#6F5D46]">{formattedDate}</span>
              <div className="pointer-events-auto flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share" className={ACTION_ICON_CLASS}><Share2 className="h-3.5 w-3.5" /></Button>
                {onViewDetail && <Button variant="ghost" size="icon" onClick={() => onViewDetail(favorite)} aria-label="View" className={ACTION_ICON_CLASS}><Eye className="h-3.5 w-3.5" /></Button>}
                <Button variant="ghost" size="icon" onClick={handleRemove} disabled={isRemoving} aria-label="Remove" className={`${ACTION_ICON_CLASS} !text-rose-400`}>
                  {isRemoving ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-500/30 border-t-rose-500" /> : <Trash2 className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
