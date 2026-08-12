'use client';

import { useMemo, useRef, useState, useEffect, useLayoutEffect, memo, useCallback } from 'react';
import { Search, ChevronDown, Check, Layers, Upload, ImageIcon, Library, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  CATEGORY_ICON_REGISTRY,
  CATEGORY_ICON_GROUPS,
  resolveCategoryIcon,
} from './categoryIconRegistry';

// ===========================================================================
// MODULE-LEVEL STATIC DATA (computed once at import, never rebuilt)
// ===========================================================================

const ALL_NAMES = Object.keys(CATEGORY_ICON_REGISTRY).sort((a, b) => a.localeCompare(b));

function buildDefs(names) {
  const defs = [];
  const seen = new Set();
  for (const name of names) {
    if (seen.has(name)) continue;
    seen.add(name);
    const Icon = CATEGORY_ICON_REGISTRY[name];
    if (Icon) defs.push({ name, Icon });
  }
  return defs;
}

const CURATED_DEFS = (() => {
  const seen = new Set();
  return CATEGORY_ICON_GROUPS
    .map((g) => {
      const unique = [];
      for (const name of g.names) {
        if (seen.has(name)) continue;
        seen.add(name);
        const Icon = CATEGORY_ICON_REGISTRY[name];
        if (Icon) unique.push({ name, Icon });
      }
      return { label: g.label, icons: unique };
    })
    .filter((g) => g.icons.length > 0);
})();

const CURATED_SET = new Set(CURATED_DEFS.flatMap((g) => g.icons.map((d) => d.name)));

const LETTER_GROUP_DEFS = (() => {
  const rest = ALL_NAMES.filter((n) => !CURATED_SET.has(n));
  const byLetter = new Map();
  for (const name of rest) {
    const letter = name[0].toUpperCase();
    if (!byLetter.has(letter)) byLetter.set(letter, []);
    byLetter.get(letter).push(name);
  }
  return Array.from(byLetter.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, names]) => ({ label: letter, icons: buildDefs(names) }));
})();

const NO_SEARCH_GROUPS = [...CURATED_DEFS, ...LETTER_GROUP_DEFS];

// ===========================================================================
// CONSTANTS
// ===========================================================================

const COLUMNS = 5;
const ROW_HEIGHT = 60;
const LABEL_HEIGHT = 24;
const OVERSCAN_PX = 320; // ~5 rows of overscan in px

// ===========================================================================
// ICON BUTTON (memoized)
// ===========================================================================

const IconButton = memo(function IconButton({ name, Icon, selected, color, onSelect }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      aria-label={`Select ${name} icon`}
      title={name}
      onClick={() => onSelect(name)}
      className={cn(
        'flex flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary min-w-0',
        selected
          ? 'border-primary/50 bg-primary/10 text-foreground'
          : 'border-border/60 bg-transparent text-foreground-secondary hover:bg-muted/60 hover:text-foreground',
      )}
    >
      <Icon size={18} className="flex-shrink-0" style={{ color: selected ? undefined : color }} />
      <span className="w-full text-[10px] leading-tight text-center truncate px-0.5">{name}</span>
    </button>
  );
});

// ===========================================================================
// VIRTUALIZED ICON GRID
//
// Layout (inside a fixed-height viewport):
//   <outer container>: position:relative, height=totalHeight
//     → forms the scrollHeight for the parent scroll container
//   <visible zone>:   position:absolute, top=offsetY, left:0, right:0
//     → only rendered rows appear within the viewport
//
// The scroll container must have:
//   - A known fixed pixel height (measured via ResizeObserver)
//   - overflow-y: auto
//   - overflow-x: hidden
//   - overscroll-behavior: contain
// ===========================================================================

function VirtualizedIconGrid({ groups, color, value, onSelect, viewportHeight }) {
  const scrollRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Flatten groups → rows
  const { rows, totalHeight } = useMemo(() => {
    const result = [];
    let cumulative = 0;
    for (const group of groups) {
      const labelKey = `lbl-${group.label}`;
      result.push({ type: 'label', text: group.label, key: labelKey, offset: cumulative, height: LABEL_HEIGHT });
      cumulative += LABEL_HEIGHT;
      for (let i = 0; i < group.icons.length; i += COLUMNS) {
        const rowKey = `row-${group.label}-${i}`;
        const rowIcons = group.icons.slice(i, i + COLUMNS);
        result.push({ type: 'icons', items: rowIcons, key: rowKey, offset: cumulative, height: ROW_HEIGHT });
        cumulative += ROW_HEIGHT;
      }
    }
    return { rows: result, totalHeight: cumulative };
  }, [groups]);

  // Visible row range via binary search on row offsets
  const { startIdx, endIdx, offsetY } = useMemo(() => {
    if (rows.length === 0) return { startIdx: 0, endIdx: 0, offsetY: 0 };
    const vh = viewportHeight || 300;
    const viewTop = Math.max(0, scrollTop - OVERSCAN_PX);
    const viewBottom = scrollTop + vh + OVERSCAN_PX;

    // Binary search start
    let lo = 0, hi = rows.length - 1, si = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (rows[mid].offset + rows[mid].height > viewTop) {
        si = mid;
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    }

    // Binary search end
    lo = si; hi = rows.length - 1; let ei = rows.length;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (rows[mid].offset < viewBottom) {
        ei = mid + 1;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    return { startIdx: si, endIdx: ei, offsetY: rows[si]?.offset ?? 0 };
  }, [scrollTop, rows, viewportHeight]);

  const visibleRows = rows.slice(startIdx, endIdx);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // Reset scroll position when groups (search/filter) changes
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [groups]);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center" style={{ minHeight: 0 }}>
        <Layers size={28} className="text-muted-foreground/50 mb-2" />
        <p className="text-sm text-foreground-secondary">No icons found</p>
        <p className="text-xs text-foreground-tertiary mt-0.5">Try a different search term.</p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="px-2.5 flex-shrink-0"
      style={{
        height: viewportHeight || 300,
        overflowY: 'auto',
        overflowX: 'hidden',
        overscrollBehavior: 'contain',
      }}
      onScroll={handleScroll}
    >
      {/* Outer container: establishes total scrollHeight */}
      <div style={{ height: totalHeight, position: 'relative', minHeight: totalHeight > 0 ? totalHeight : undefined }}>
        {/* Visible zone: positioned at current scroll offset */}
        <div style={{ position: 'absolute', top: offsetY, left: 0, right: 0 }}>
          <div className="space-y-3 px-px">
            {visibleRows.map((row) =>
              row.type === 'label' ? (
                <p
                  key={row.key}
                  className="text-[10px] font-semibold uppercase tracking-wider text-foreground-tertiary"
                >
                  {row.text}
                </p>
              ) : (
                <div key={row.key} className="grid grid-cols-5 gap-1.5">
                  {row.items.map(({ name, Icon }) => (
                    <IconButton
                      key={name}
                      name={name}
                      Icon={Icon}
                      selected={value === name}
                      color={color}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// CUSTOM SVG PANE
// ===========================================================================

function CustomSvgPane({ onUploaded, uploading = false }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    setError('');
    if (!file) return;
    if (!file.type.includes('svg')) { setError('Only SVG files are allowed.'); return; }
    if (file.size > 500 * 1024) { setError('SVG must be under 500KB.'); return; }
    const text = await file.text();
    if (/<script|on\w+\s*=|javascript:|<foreignObject/i.test(text)) {
      setError('SVG contains unsafe content (scripts/event handlers).');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    await onUploaded(file, url);
  };

  return (
    <div className="p-3 space-y-3">
      <input ref={inputRef} type="file" accept=".svg,image/svg+xml" className="hidden" aria-label="Upload custom SVG icon" disabled={uploading} onChange={(e) => handleFile(e.target.files?.[0])} />
      {!preview ? (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 py-8 text-foreground-secondary hover:bg-muted/50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <Upload size={22} />
          <span className="text-xs font-medium">{uploading ? 'Uploading…' : 'Upload custom SVG'}</span>
          <span className="text-[10px] text-foreground-tertiary">SVG only · max 500KB</span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-center rounded-xl border border-border bg-muted/30 py-6">
            <img src={preview} alt="Custom SVG preview" className="w-16 h-16 object-contain" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-foreground-tertiary">{uploading ? 'Uploading…' : 'Uploaded. Saving will persist it.'}</span>
            <button type="button" onClick={() => setPreview(null)} className="text-[11px] text-foreground-tertiary hover:text-foreground flex items-center gap-1 cursor-pointer"><X size={12} /> Remove</button>
          </div>
        </div>
      )}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

// ===========================================================================
// MAIN PICKER
// ===========================================================================

export default function CategoryIconPicker({
  value,
  onSelect,
  color = '#6366f1',
  iconType: parentIconType = 'library',
  iconUrl = null,
  onCustomUpload = null,
  uploading = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState(parentIconType === 'custom' ? 'custom' : 'library');

  // Measure the actual available height for the icon grid viewport.
  // We use a sentinel div inside the PopoverContent to detect how much
  // vertical space the grid actually gets after the header/footer are laid out.
  const [viewportHeight, setViewportHeight] = useState(300);
  const sentinelRef = useRef(null);

  useLayoutEffect(() => {
    if (!open || !sentinelRef.current) return;

    // measure the container height
    const sentinel = sentinelRef.current;
    const initialHeight = sentinel.clientHeight;
    if (initialHeight > 0) {
      setViewportHeight(initialHeight);
    }

    // also observe for resize
    let raf;
    const ro = new ResizeObserver((entries) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        for (const entry of entries) {
          const h = entry.contentBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
          if (h > 0 && Math.abs(h - viewportHeight) > 2) {
            setViewportHeight(Math.round(h));
          }
        }
      });
    });
    ro.observe(sentinel);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [open]);

  const selectedIcon = resolveCategoryIcon(value);
  const SelectedIcon = selectedIcon;

  useEffect(() => { setMode(parentIconType === 'custom' ? 'custom' : 'library'); }, [parentIconType]);

  const displayGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return NO_SEARCH_GROUPS;
    const matches = ALL_NAMES.filter((n) => n.toLowerCase().includes(q));
    if (matches.length === 0) return [];
    return [{ label: 'Results', icons: buildDefs(matches) }];
  }, [search]);

  useEffect(() => {
    if (open) { setSearch(''); setViewportHeight(300); }
  }, [open]);

  const handleCustomUpload = async (file) => {
    if (onCustomUpload) await onCustomUpload(file);
  };

  const showCustom = Boolean(parentIconType === 'custom' && iconUrl);

  // Popover: explicit 480px height with overflow:hidden.
  // Flex column so children stack vertically.
  // overflow:hidden on the popover prevents content from spilling out
  // while the inner grid container handles its own overflow-y:auto.
  const popoverStyle = {
    height: 480,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Choose icon"
          className="flex w-full h-9 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 text-sm text-foreground cursor-pointer hover:bg-muted/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="flex items-center gap-2 min-w-0">
            {parentIconType === 'custom' && iconUrl ? (
              <img src={iconUrl} alt="" className="w-4 h-4 object-contain flex-shrink-0" />
            ) : (
              <SelectedIcon size={16} style={{ color }} className="flex-shrink-0" />
            )}
            <span className="truncate">
              {parentIconType === 'custom' ? 'Custom SVG' : value || 'Select icon'}
            </span>
          </span>
          <ChevronDown size={14} className="flex-shrink-0 text-foreground-tertiary" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[360px] sm:w-[420px] p-0 gap-0"
        style={popoverStyle}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
      >
        {/* Mode tabs — fixed height, flex-shrink-0 */}
        <div className="flex items-center gap-1 p-2 border-b border-border/60 flex-shrink-0">
          <button type="button" onClick={() => setMode('library')} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer', mode === 'library' ? 'bg-primary/10 text-primary' : 'text-foreground-secondary hover:bg-muted/60')} aria-pressed={mode === 'library'}>
            <Library size={13} /> Library Icon
          </button>
          <button type="button" onClick={() => setMode('custom')} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer', mode === 'custom' ? 'bg-primary/10 text-primary' : 'text-foreground-secondary hover:bg-muted/60')} aria-pressed={mode === 'custom'}>
            <ImageIcon size={13} /> Custom SVG
          </button>
        </div>

        {mode === 'library' ? (
          <>
            {/* Search — fixed height, flex-shrink-0 */}
            <div className="p-2.5 border-b border-border/60 flex-shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-tertiary pointer-events-none" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search icons…" aria-label="Search icons" className="pl-8 h-8 text-sm" autoFocus />
              </div>
            </div>

            {/* Sentinel: fills remaining space, measured by ResizeObserver */}
            <div
              ref={sentinelRef}
              className="flex-1 min-h-0"
              style={{ overflow: 'hidden' }}
            >
              {viewportHeight > 0 && (
                <VirtualizedIconGrid
                  groups={displayGroups}
                  color={color}
                  value={value}
                  onSelect={(n) => { onSelect(n); setOpen(false); }}
                  viewportHeight={viewportHeight}
                />
              )}
            </div>
          </>
        ) : (
          <CustomSvgPane onUploaded={handleCustomUpload} uploading={uploading} />
        )}

        {/* Footer — fixed height, flex-shrink-0 */}
        <div className="flex items-center gap-2 border-t border-border/60 px-3 py-2 flex-shrink-0">
          <Check size={14} className="text-primary" />
          <span className="text-xs text-foreground-secondary truncate">
            Selected: {parentIconType === 'custom' ? 'Custom SVG' : value || 'None'}
          </span>
          {showCustom && (
            <button type="button" onClick={() => { onSelect(null); if (onCustomUpload) onCustomUpload(null); }} className="ml-auto text-[11px] text-foreground-tertiary hover:text-destructive cursor-pointer">
              Clear
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
