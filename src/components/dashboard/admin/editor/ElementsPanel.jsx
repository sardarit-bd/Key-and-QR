'use client';

import {
  Type, Sparkles, Square, Image, Music, Heart, Star, Check, Plus, Minus,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Circle, Triangle, Crown, Gift,
  Bell, User, Home, Calendar, Clock, Camera, Play, Pause, Bookmark, Share2,
  Settings, Search, Quote, Sun, Moon,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import useEditorStore from './editorStore';
import { ICON_LIST } from './iconUtils';

const ELEMENTS = [
  { id: 'text', label: 'Text', icon: Type },
  { id: 'icon', label: 'Icon', icon: Sparkles },
  { id: 'shape', label: 'Shape', icon: Square },
  { id: 'image', label: 'Image', icon: Image },
  { id: 'audio', label: 'Audio', icon: Music },
];

// Icon name → lucide component
const ICON_LOOKUP = {
  sparkles: Sparkles, heart: Heart, star: Star, check: Check, plus: Plus,
  minus: Minus, 'arrow-up': ArrowUp, 'arrow-down': ArrowDown,
  'arrow-left': ArrowLeft, 'arrow-right': ArrowRight,
  circle: Circle, triangle: Triangle, crown: Crown, gift: Gift,
  bell: Bell, user: User, home: Home, calendar: Calendar,
  clock: Clock, camera: Camera, image: Image, music: Music,
  play: Play, pause: Pause, bookmark: Bookmark, share: Share2,
  settings: Settings, search: Search, quote: Quote, sun: Sun, moon: Moon,
};

const btnClass =
  'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-foreground-secondary hover:bg-muted hover:text-foreground';

const iconBtnBase =
  'flex flex-col items-center justify-center rounded-lg border border-border bg-background transition-all duration-200 cursor-pointer hover:bg-muted';

const iconBtnSelected = 'ring-2 ring-primary';

// Render a single icon option button
function IconOption({ iconDef, isSelected, onSelect }) {
  const IconComp = ICON_LOOKUP[iconDef.name];
  if (!IconComp) return null;
  return (
    <button
      type="button"
      onClick={() => onSelect(iconDef.name)}
      className={`
        ${iconBtnBase}
        ${isSelected ? iconBtnSelected : ''}
        w-10 h-10 p-1
      `}
      title={iconDef.name}
    >
      <IconComp size={20} strokeWidth={1.5} />
    </button>
  );
}

export default function ElementsPanel() {
  const elements = useEditorStore((s) => s.elements);
  const addElement = useEditorStore((s) => s.addElement);
  const setQuoteText = useEditorStore((s) => s.setQuoteText);
  const fileRef = useRef(null);

  const [iconPopoverOpen, setIconPopoverOpen] = useState(false);
  const [selectedIconName, setSelectedIconName] = useState('sparkles');

  const handleClick = useCallback(
    (elementId) => {
      if (elementId === 'image') {
        fileRef.current?.click();
        return;
      }

      if (elementId === 'icon') {
        const { canvas } = useEditorStore.getState();
        addElement({
          type: 'icon',
          x: Math.round(canvas.width / 2),
          y: Math.round(canvas.height / 2),
          width: 48, height: 48,
          rotation: 0, scaleX: 1, scaleY: 1,
          opacity: 1, visible: true, locked: false,
          zIndex: elements.length,
          iconData: {
            iconName: selectedIconName || 'sparkles',
            size: 48,
            color: '#1a1a1a',
          },
        });
        setIconPopoverOpen(false);
        return;
      }

      if (elementId === 'audio') return;

      if (elementId === 'text') {
        const { canvas } = useEditorStore.getState();
        const cx = Math.round(canvas.width / 2);
        const cy = Math.round(canvas.height / 2);
        addElement({
          type: 'text', x: cx, y: cy, width: 560, height: 80,
          rotation: 0, scaleX: 1, scaleY: 1,
          opacity: 1, visible: true, locked: false,
          zIndex: elements.length,
          textData: {
            content: 'Type your quote here\u2026', fontFamily: 'Inter', fontSize: 24,
            fontWeight: 'normal', fontStyle: 'normal', lineHeight: 1.4, letterSpacing: 0,
            textAlign: 'center', color: '#1a1a1a', wrap: true,
          },
        });
        setQuoteText('');
        return;
      }

      if (elementId === 'shape') {
        const { canvas } = useEditorStore.getState();
        const cx = Math.round(canvas.width / 2);
        const cy = Math.round(canvas.height / 2);
        addElement({
          type: 'shape', x: cx, y: cy, width: 160, height: 160,
          rotation: 0, scaleX: 1, scaleY: 1,
          opacity: 1, visible: true, locked: false,
          zIndex: elements.length,
          shapeData: {
            shapeType: 'rect',
            fillColor: '#e2e8f0',
            strokeColor: null,
            strokeWidth: 0,
            borderRadius: 0,
          },
        });
      }
    },
    [elements.length, addElement, setQuoteText, selectedIconName],
  );

  const handleImageSelect = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      addElement({
        type: 'image', x: 100, y: 100, width: 600, height: 400,
        rotation: 0, scaleX: 1, scaleY: 1,
        opacity: 1, visible: true, locked: false,
        zIndex: elements.length,
        imageData: { source: { type: 'cloudinary', publicId: '', url }, fit: 'cover' },
      });
    },
    [elements.length, addElement],
  );

  return (
    <div className="p-4">
      <div className="rounded-xl border border-border bg-card shadow-sm p-3 w-[152px]">
        <p className="text-[9px] font-semibold text-foreground-tertiary uppercase tracking-widest mb-2 px-1">
          Elements
        </p>
        <div className="space-y-0.5">
          {ELEMENTS.map((el) => {
            const isIcon = el.id === 'icon';
            return (
              <div key={el.id}>
                {isIcon ? (
                  <Popover open={iconPopoverOpen} onOpenChange={setIconPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={btnClass}
                        onClick={() => setIconPopoverOpen(true)}
                      >
                        <el.icon size={14} className="text-foreground-tertiary" />
                        <span>Icon</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" sideOffset={8} className="w-44 p-2">
                      <div className="grid grid-cols-5 gap-1 max-h-48 overflow-y-auto">
                        {ICON_LIST.map((iconDef) => (
                          <IconOption
                            key={iconDef.name}
                            iconDef={iconDef}
                            isSelected={selectedIconName === iconDef.name}
                            onSelect={(name) => {
                              setSelectedIconName(name);
                              handleClick('icon');
                            }}
                          />
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <button key={el.id} onClick={() => handleClick(el.id)} className={btnClass}>
                    <el.icon size={14} className="text-foreground-tertiary" />
                    <span>{el.label}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
    </div>
  );
}
