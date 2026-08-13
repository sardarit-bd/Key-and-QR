'use client';

import { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ChevronDown, Search } from 'lucide-react';
import { SHAPE_REGISTRY, SHAPE_CATEGORIES } from './shapeRegistry';

export default function ShapePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedShape = useMemo(() => {
    return SHAPE_REGISTRY.find((s) => s.id === value) || SHAPE_REGISTRY[0];
  }, [value]);

  const categoriesData = useMemo(() => {
    const query = search.toLowerCase().trim();
    
    // Group all shapes by category
    const categoriesMap = {};
    Object.values(SHAPE_CATEGORIES).forEach((cat) => {
      categoriesMap[cat] = [];
    });

    SHAPE_REGISTRY.forEach((shape) => {
      if (
        !query ||
        shape.name.toLowerCase().includes(query) ||
        shape.category.toLowerCase().includes(query)
      ) {
        if (categoriesMap[shape.category]) {
          categoriesMap[shape.category].push(shape);
        }
      }
    });

    return Object.entries(categoriesMap)
      .map(([name, items]) => ({ name, items }))
      .filter((cat) => cat.items.length > 0);
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Choose shape type"
          className="flex w-full h-10 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 text-xs text-foreground cursor-pointer hover:bg-muted/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <span className="w-5 h-5 flex items-center justify-center text-foreground-secondary shrink-0">
              <svg
                viewBox="0 0 100 100"
                className="w-4 h-4 fill-none stroke-current"
                dangerouslySetInnerHTML={{ __html: selectedShape.svgPreview }}
              />
            </span>
            <span className="truncate font-medium">
              {selectedShape.name}
            </span>
          </span>
          <ChevronDown size={14} className="flex-shrink-0 text-foreground-tertiary" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[320px] p-0 flex flex-col overflow-hidden bg-popover border border-border rounded-xl shadow-xl"
        style={{ height: 380 }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
      >
        {/* Search header (fixed, flex-shrink-0) */}
        <div className="p-2.5 border-b border-border/60 flex-shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-tertiary pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shapes..."
              aria-label="Search shapes"
              className="pl-8 h-8 text-xs bg-background/50 focus-visible:ring-1 focus-visible:ring-primary"
              autoFocus
            />
          </div>
        </div>

        {/* Scrollable list of categories and shapes */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4">
          {categoriesData.length === 0 ? (
            <div className="text-center py-8 text-xs text-foreground-tertiary">
              No matching shapes found
            </div>
          ) : (
            categoriesData.map((cat) => (
              <div key={cat.name} className="space-y-2">
                <h4 className="text-[9px] font-bold text-foreground-tertiary uppercase tracking-wider">
                  {cat.name}
                </h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {cat.items.map((shape) => (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => {
                        onChange(shape.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "group flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all cursor-pointer",
                        value === shape.id
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border/60 text-foreground-secondary hover:border-primary/50 hover:bg-muted/40"
                      )}
                    >
                      <div className="w-8 h-8 flex items-center justify-center mb-1 text-foreground-secondary group-hover:text-primary transition-colors">
                        <svg
                          viewBox="0 0 100 100"
                          className="w-5 h-5 fill-none stroke-current"
                          dangerouslySetInnerHTML={{ __html: shape.svgPreview }}
                        />
                      </div>
                      <span className="text-[10px] w-full truncate font-medium" title={shape.name}>
                        {shape.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer (fixed, flex-shrink-0) */}
        <div className="flex items-center gap-2 border-t border-border/60 px-3 py-2 flex-shrink-0 bg-muted/20">
          <span className="text-[10px] text-foreground-tertiary truncate">
            Selected: <span className="font-semibold text-foreground-secondary">{selectedShape.name}</span>
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
