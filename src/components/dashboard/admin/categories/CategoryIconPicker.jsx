'use client';

import { useMemo, useRef, useState, useEffect, memo, useCallback } from 'react';
import { Search, ChevronDown, Check, Layers, Upload, ImageIcon, Library, X, ChevronRight } from 'lucide-react';
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
    .map(([letter, names]) => ({ label: `Letter ${letter}`, icons: buildDefs(names) }));
})();

// ===========================================================================
// ICON BUTTON (memoized for instantaneous rendering)
// ===========================================================================

const IconButton = memo(function IconButton({ name, Icon, selected, color, onSelect }) {
  const handleClick = useCallback(() => {
    onSelect(name);
  }, [name, onSelect]);

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      aria-label={`Select ${name} icon`}
      title={name}
      onClick={handleClick}
      style={
        selected
          ? {
              borderColor: color,
              backgroundColor: `${color}18`,
              color: color,
            }
          : undefined
      }
      className={cn(
        'group relative flex flex-col items-center justify-center gap-1 rounded-lg border p-1.5 cursor-pointer transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary min-w-0 aspect-square select-none',
        selected
          ? 'font-medium shadow-xs ring-1'
          : 'border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white',
      )}
    >
      <Icon
        size={18}
        className="flex-shrink-0 pointer-events-none transition-transform group-hover:scale-110"
        style={{ color: selected ? color : undefined }}
      />
      <span
        className="w-full text-[10px] leading-tight text-center truncate px-0.5 pointer-events-none"
        style={{ color: selected ? color : undefined }}
      >
        {name}
      </span>
    </button>
  );
});

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
    if (!file.type.includes('svg')) {
      setError('Only SVG files are allowed.');
      return;
    }
    if (file.size > 500 * 1024) {
      setError('SVG must be under 500KB.');
      return;
    }
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
    <div className="p-1 space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept=".svg,image/svg+xml"
        className="hidden"
        aria-label="Upload custom SVG icon"
        disabled={uploading}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {!preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/40 py-6 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Upload size={22} className="text-neutral-400" />
          <span className="text-xs font-medium">{uploading ? 'Uploading…' : 'Upload custom SVG'}</span>
          <span className="text-[10px] text-neutral-400">SVG only · max 500KB</span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/40 py-4">
            <img src={preview} alt="Custom SVG preview" className="w-12 h-12 object-contain" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">
              {uploading ? 'Uploading…' : 'Uploaded. Saving will persist it.'}
            </span>
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="text-[11px] text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <X size={12} /> Remove
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

// ===========================================================================
// MAIN PICKER COMPONENT
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
  const [showAllAlphabetical, setShowAllAlphabetical] = useState(false);
  const scrollContainerRef = useRef(null);

  const selectedIcon = resolveCategoryIcon(value);
  const SelectedIcon = selectedIcon;

  useEffect(() => {
    setMode(parentIconType === 'custom' ? 'custom' : 'library');
  }, [parentIconType]);

  // Fast zero-lag computation:
  // - When search is empty: show curated groups immediately (~60 icons = 2ms mount!).
  // - If user clicks "Browse all icons", include letter groups.
  // - When user searches: filter all 1,000+ icons and return exact matches.
  const displayGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return showAllAlphabetical ? [...CURATED_DEFS, ...LETTER_GROUP_DEFS] : CURATED_DEFS;
    }
    const matches = ALL_NAMES.filter((n) => n.toLowerCase().includes(q));
    if (matches.length === 0) return [];
    return [{ label: `Search Results (${matches.length})`, icons: buildDefs(matches) }];
  }, [search, showAllAlphabetical]);

  useEffect(() => {
    if (open) {
      setSearch('');
      setShowAllAlphabetical(false);
    }
  }, [open]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [search, mode]);

  const handleSelectIcon = useCallback(
    (iconName) => {
      onSelect(iconName);
      setOpen(false);
    },
    [onSelect],
  );

  const handleCustomUpload = async (file) => {
    if (onCustomUpload) await onCustomUpload(file);
  };

  const showCustom = Boolean(parentIconType === 'custom' && iconUrl);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Choose icon"
          className="flex w-full h-9 items-center justify-between gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-background px-3 text-sm text-foreground cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
          <ChevronDown size={14} className="flex-shrink-0 text-neutral-400" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        collisionPadding={16}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="w-[340px] sm:w-[380px] max-h-[360px] p-3 flex flex-col shadow-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-xl z-[60] overflow-hidden"
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
      >
        {/* Sticky Top: Mode Tabs & Search Bar */}
        <div className="sticky top-0 bg-white dark:bg-neutral-900 z-10 pb-2 space-y-2 flex-shrink-0">
          {/* Mode tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60">
            <button
              type="button"
              onClick={() => setMode('library')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer',
                mode === 'library'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white',
              )}
              aria-pressed={mode === 'library'}
            >
              <Library size={13} /> Library Icon
            </button>
            <button
              type="button"
              onClick={() => setMode('custom')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer',
                mode === 'custom'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white',
              )}
              aria-pressed={mode === 'custom'}
            >
              <ImageIcon size={13} /> Custom SVG
            </button>
          </div>

          {/* Search bar (Library mode) */}
          {mode === 'library' && (
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search 1,000+ icons..."
                aria-label="Search icons"
                className="pl-8 pr-8 h-8 text-xs bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 focus-visible:ring-1 focus-visible:ring-primary"
                autoFocus
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5 rounded cursor-pointer"
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Icon List */}
        {mode === 'library' ? (
          <div
            ref={scrollContainerRef}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            style={{
              overscrollBehavior: 'contain',
              touchAction: 'pan-y',
              pointerEvents: 'auto',
            }}
            className="max-h-[240px] overflow-y-auto pr-1 space-y-4 custom-scrollbar flex-1 min-h-0"
          >
            {displayGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Layers size={28} className="text-neutral-400/50 mb-2" />
                <p className="text-sm text-neutral-600 dark:text-neutral-300">No icons found</p>
                <p className="text-xs text-neutral-400 mt-0.5">Try a different search term.</p>
              </div>
            ) : (
              <>
                {displayGroups.map((group) => (
                  <div key={group.label} className="space-y-2">
                    <p className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                      {group.label}
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {group.icons.map(({ name, Icon }) => (
                        <IconButton
                          key={name}
                          name={name}
                          Icon={Icon}
                          selected={value === name && parentIconType !== 'custom'}
                          color={color}
                          onSelect={handleSelectIcon}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {!search && !showAllAlphabetical && (
                  <button
                    type="button"
                    onClick={() => setShowAllAlphabetical(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-primary text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>Browse all 1,000+ icons (A–Z)</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            style={{
              overscrollBehavior: 'contain',
              touchAction: 'pan-y',
              pointerEvents: 'auto',
            }}
            className="max-h-[240px] overflow-y-auto pr-1 custom-scrollbar flex-1 min-h-0"
          >
            <CustomSvgPane onUploaded={handleCustomUpload} uploading={uploading} />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 border-t border-neutral-200 dark:border-neutral-800 pt-2 mt-2 flex-shrink-0">
          <Check size={14} className="text-primary flex-shrink-0" />
          <span className="text-xs text-neutral-600 dark:text-neutral-300 truncate flex-1">
            Selected:{' '}
            <strong className="font-semibold text-neutral-900 dark:text-white">
              {parentIconType === 'custom' ? 'Custom SVG' : value || 'None'}
            </strong>
          </span>
          {showCustom && (
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                if (onCustomUpload) onCustomUpload(null);
              }}
              className="text-[11px] text-neutral-400 hover:text-destructive cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
