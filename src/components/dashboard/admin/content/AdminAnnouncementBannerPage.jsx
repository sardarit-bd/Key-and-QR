'use client';

import { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  Save,
  Loader2,
  RotateCcw,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  X,
  Palette,
  Link as LinkIcon,
  Sparkles,
  Smartphone,
  Monitor,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
  Truck,
  Gift,
  Heart,
  Tag,
  Shield,
  Zap,
  Star,
  Bell,
  Smile,
  Flame,
  Trophy,
  Gem,
  Award,
  ShoppingBag,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ChevronDown,
  Check,
  Search,
} from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  useAnnouncementBanner,
  useUpdateAnnouncementBanner,
  DEFAULT_ANNOUNCEMENT_BANNER,
} from '@/hooks/dashboard/useAdminHero';

// Available icons for message badges
const AVAILABLE_ICONS = [
  { name: 'Sparkles', label: 'Sparkles', Icon: Sparkles },
  { name: 'Truck', label: 'Shipping Truck', Icon: Truck },
  { name: 'Gift', label: 'Gift Box', Icon: Gift },
  { name: 'Clock', label: 'Clock / Support', Icon: Clock },
  { name: 'Tag', label: 'Discount Tag', Icon: Tag },
  { name: 'Heart', label: 'Heart', Icon: Heart },
  { name: 'Shield', label: 'Shield / Trust', Icon: Shield },
  { name: 'Zap', label: 'Flash / Lightning', Icon: Zap },
  { name: 'Megaphone', label: 'Megaphone', Icon: Megaphone },
  { name: 'Star', label: 'Star', Icon: Star },
  { name: 'Bell', label: 'Notification Bell', Icon: Bell },
  { name: 'Smile', label: 'Smile', Icon: Smile },
  { name: 'Flame', label: 'Trending / Flame', Icon: Flame },
  { name: 'Trophy', label: 'Trophy', Icon: Trophy },
  { name: 'Gem', label: 'Gem / Premium', Icon: Gem },
  { name: 'Award', label: 'Award', Icon: Award },
  { name: 'ShoppingBag', label: 'Shopping Bag', Icon: ShoppingBag },
  { name: 'HelpCircle', label: 'Help / Info', Icon: HelpCircle },
];

const BANNER_ICON_MAP = Object.fromEntries(
  AVAILABLE_ICONS.map((i) => [i.name, i.Icon])
);

function resolveIcon(name) {
  return BANNER_ICON_MAP[name] || Sparkles;
}

// Custom Icon Selector Dropdown / Combobox Component
function AnnouncementIconPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const SelectedIcon = resolveIcon(value);
  const selectedItem = AVAILABLE_ICONS.find((i) => i.name === value) || AVAILABLE_ICONS[0];

  const filteredIcons = useMemo(() => {
    if (!search.trim()) return AVAILABLE_ICONS;
    const q = search.toLowerCase();
    return AVAILABLE_ICONS.filter(
      (i) => i.label.toLowerCase().includes(q) || i.name.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground cursor-pointer flex items-center justify-between gap-2 hover:bg-muted/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="flex items-center gap-2 truncate">
            <SelectedIcon size={15} className="text-yellow-500 flex-shrink-0" />
            <span className="truncate font-medium">{selectedItem.label}</span>
          </span>
          <ChevronDown size={13} className="text-foreground-tertiary flex-shrink-0" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={4}
        collisionPadding={12}
        className="w-[240px] p-2 flex flex-col gap-2 rounded-xl shadow-xl border border-border bg-popover text-popover-foreground z-50 max-h-[280px]"
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
      >
        <div className="relative flex-shrink-0">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-tertiary pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons..."
            className="h-7 text-xs pl-7 pr-2 bg-muted/40 border-border/70"
            autoFocus
          />
        </div>

        <div className="overflow-y-auto max-h-[190px] pr-0.5 space-y-0.5 custom-scrollbar">
          {filteredIcons.length === 0 ? (
            <p className="text-[11px] text-center text-foreground-tertiary py-3">
              No icons match &quot;{search}&quot;
            </p>
          ) : (
            filteredIcons.map((opt) => {
              const IconComp = opt.Icon;
              const isSelected = (value || 'Sparkles') === opt.name;
              return (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => {
                    onChange(opt.name);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left',
                    isSelected
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground hover:bg-muted/60'
                  )}
                >
                  <span className="flex items-center gap-2 truncate">
                    <IconComp size={15} className={isSelected ? 'text-primary' : 'text-yellow-500'} />
                    <span className="truncate">{opt.label}</span>
                  </span>
                  {isSelected && <Check size={13} className="text-primary flex-shrink-0 ml-1" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

const PRESET_BG_COLORS = [
  { name: 'Black (Default)', value: '#000000' },
  { name: 'Slate Dark', value: '#0f172a' },
  { name: 'Brand Gold', value: '#C8A06B' },
  { name: 'Deep Indigo', value: '#4f46e5' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Crimson', value: '#dc2626' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Purple', value: '#7c3aed' },
];

const PRESET_TEXT_COLORS = [
  { name: 'Pure White', value: '#ffffff' },
  { name: 'Warm Gold', value: '#FDE047' },
  { name: 'Soft Cream', value: '#EDE4D0' },
  { name: 'Charcoal', value: '#111827' },
  { name: 'Muted Gray', value: '#9ca3af' },
];

const COMMON_LINKS = [
  { label: 'Shop', url: '/shop' },
  { label: 'Pricing', url: '/pricing' },
  { label: 'How It Works', url: '/how-it-works' },
];

export default function AdminAnnouncementBannerPage() {
  const { data: bannerData, isLoading, isError, error, refetch } = useAnnouncementBanner();
  const updateBanner = useUpdateAnnouncementBanner();

  const [isEnabled, setIsEnabled] = useState(DEFAULT_ANNOUNCEMENT_BANNER.isEnabled);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_ANNOUNCEMENT_BANNER.backgroundColor);
  const [textColor, setTextColor] = useState(DEFAULT_ANNOUNCEMENT_BANNER.textColor);
  const [isDismissible, setIsDismissible] = useState(DEFAULT_ANNOUNCEMENT_BANNER.isDismissible);
  const [rotationSpeed, setRotationSpeed] = useState(DEFAULT_ANNOUNCEMENT_BANNER.rotationSpeed || 5);
  const [messages, setMessages] = useState(DEFAULT_ANNOUNCEMENT_BANNER.messages);

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');

  // Live preview interactive state
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewPaused, setPreviewPaused] = useState(false);

  // Sync initial data from backend
  useEffect(() => {
    if (bannerData && !hasChanged) {
      setIsEnabled(bannerData.isEnabled !== undefined ? bannerData.isEnabled : true);
      setBackgroundColor(bannerData.backgroundColor || '#000000');
      setTextColor(bannerData.textColor || '#ffffff');
      setIsDismissible(bannerData.isDismissible !== undefined ? bannerData.isDismissible : true);
      setRotationSpeed(bannerData.rotationSpeed || 5);

      if (Array.isArray(bannerData.messages) && bannerData.messages.length > 0) {
        setMessages(
          bannerData.messages.map((m, idx) => ({
            id: m._id || m.id || String(idx + 1),
            text: m.text || '',
            icon: m.icon || 'Sparkles',
            linkUrl: m.linkUrl || '',
            enabled: m.enabled !== undefined ? m.enabled : true,
          }))
        );
      } else if (bannerData.text) {
        setMessages([
          {
            id: '1',
            text: bannerData.text,
            icon: 'Sparkles',
            linkUrl: bannerData.linkUrl || '',
            enabled: true,
          },
        ]);
      } else {
        setMessages(DEFAULT_ANNOUNCEMENT_BANNER.messages);
      }
    }
  }, [bannerData, hasChanged]);

  // Active enabled messages for preview
  const activeMessages = useMemo(() => {
    return messages.filter((m) => m.enabled && m.text.trim());
  }, [messages]);

  // Live preview auto-rotation
  useEffect(() => {
    if (activeMessages.length <= 1 || previewPaused) return;

    const timer = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % activeMessages.length);
    }, Math.max(2, rotationSpeed) * 1000);

    return () => clearInterval(timer);
  }, [activeMessages.length, previewPaused, rotationSpeed]);

  useEffect(() => {
    if (previewIndex >= activeMessages.length) {
      setPreviewIndex(0);
    }
  }, [activeMessages.length, previewIndex]);

  // Message Operations
  const handleAddMessage = () => {
    if (messages.length >= 10) {
      toast.error('Maximum of 10 announcement messages allowed');
      return;
    }
    const newMessage = {
      id: String(Date.now()),
      text: '',
      icon: 'Sparkles',
      linkUrl: '',
      enabled: true,
    };
    setMessages([...messages, newMessage]);
    setHasChanged(true);
  };

  const handleUpdateMessage = (index, field, value) => {
    const updated = [...messages];
    updated[index] = { ...updated[index], [field]: value };
    setMessages(updated);
    setHasChanged(true);
  };

  const handleRemoveMessage = (index) => {
    if (messages.length <= 1) {
      toast.error('At least one announcement message is required');
      return;
    }
    const updated = messages.filter((_, idx) => idx !== index);
    setMessages(updated);
    setHasChanged(true);
    toast.success('Message removed');
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...messages];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setMessages(updated);
    setHasChanged(true);
  };

  const handleMoveDown = (index) => {
    if (index === messages.length - 1) return;
    const updated = [...messages];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setMessages(updated);
    setHasChanged(true);
  };

  const handleResetToDefault = () => {
    setIsEnabled(DEFAULT_ANNOUNCEMENT_BANNER.isEnabled);
    setBackgroundColor(DEFAULT_ANNOUNCEMENT_BANNER.backgroundColor);
    setTextColor(DEFAULT_ANNOUNCEMENT_BANNER.textColor);
    setIsDismissible(DEFAULT_ANNOUNCEMENT_BANNER.isDismissible);
    setRotationSpeed(DEFAULT_ANNOUNCEMENT_BANNER.rotationSpeed);
    setMessages(DEFAULT_ANNOUNCEMENT_BANNER.messages);
    setHasChanged(true);
    toast.success('Reset to default banner configuration');
  };

  const handleSave = async () => {
    const validMessages = messages.filter((m) => m.text && m.text.trim());
    if (validMessages.length === 0 && isEnabled) {
      toast.error('Please enter at least one message or disable the banner');
      return;
    }

    setIsSaving(true);
    try {
      await updateBanner.mutateAsync({
        isEnabled,
        backgroundColor: backgroundColor.trim() || '#000000',
        textColor: textColor.trim() || '#ffffff',
        isDismissible,
        rotationSpeed: Number(rotationSpeed) || 5,
        messages: validMessages.map((m) => ({
          text: m.text.trim(),
          icon: m.icon || 'Sparkles',
          linkUrl: m.linkUrl ? m.linkUrl.trim() : '',
          enabled: m.enabled !== undefined ? m.enabled : true,
        })),
        text: validMessages[0]?.text || '',
        linkUrl: validMessages[0]?.linkUrl || '',
      });
      setHasChanged(false);
      toast.success('Announcement banner saved successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save announcement banner');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !hasChanged) {
    return (
      <div className="min-h-screen p-4 sm:p-6 md:p-8 max-w-4xl mx-auto animate-pulse space-y-6">
        <div className="h-12 bg-card rounded-2xl border border-border w-72" />
        <div className="h-44 bg-card rounded-2xl border border-border" />
        <div className="h-96 bg-card rounded-2xl border border-border" />
      </div>
    );
  }

  if (isError && !hasChanged) {
    return (
      <div className="min-h-[70vh] p-4 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <Megaphone size={28} />
          </div>
          <h2 className="text-lg font-bold text-foreground">Failed to Load Banner Settings</h2>
          <p className="text-xs text-foreground-secondary">{error?.message || 'Could not fetch banner data.'}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors text-sm cursor-pointer"
          >
            Retry Loading
          </button>
        </Card>
      </div>
    );
  }

  const currentPreviewMessage = activeMessages[previewIndex] || activeMessages[0];
  const PreviewIcon = resolveIcon(currentPreviewMessage?.icon);

  return (
    <div className="min-h-screen p-3 sm:p-5 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Megaphone size={18} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Top Announcement Banner
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-foreground-secondary mt-1">
            Manage multiple rotating promotional messages, icons, rotation speed, and styling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || updateBanner.isPending || (!hasChanged && !bannerData)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving || updateBanner.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Live Interactive Preview Card */}
      <Card className="p-5 sm:p-7 border-border/80 bg-card space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Eye size={16} className="text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Live Animated Preview
            </h2>
            {isEnabled ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 size={12} /> {activeMessages.length} Active Message{activeMessages.length !== 1 ? 's' : ''}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 bg-neutral-500/10 px-2.5 py-0.5 rounded-full">
                <XCircle size={12} /> Banner Disabled
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeMessages.length > 1 && (
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60">
                <button
                  type="button"
                  title={previewPaused ? 'Resume auto-rotation' : 'Pause auto-rotation'}
                  onClick={() => setPreviewPaused(!previewPaused)}
                  className="p-1 rounded text-foreground-secondary hover:text-foreground cursor-pointer"
                >
                  {previewPaused ? <Play size={12} /> : <Pause size={12} />}
                </button>
                <button
                  type="button"
                  title="Previous message"
                  onClick={() =>
                    setPreviewIndex((prev) => (prev - 1 + activeMessages.length) % activeMessages.length)
                  }
                  className="p-1 rounded text-foreground-secondary hover:text-foreground cursor-pointer"
                >
                  <ChevronLeft size={13} />
                </button>
                <span className="text-[11px] font-mono px-1 text-foreground-secondary">
                  {previewIndex + 1}/{activeMessages.length}
                </span>
                <button
                  type="button"
                  title="Next message"
                  onClick={() =>
                    setPreviewIndex((prev) => (prev + 1) % activeMessages.length)
                  }
                  className="p-1 rounded text-foreground-secondary hover:text-foreground cursor-pointer"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  previewDevice === 'desktop'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-foreground-secondary hover:text-foreground'
                }`}
              >
                <Monitor size={13} /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  previewDevice === 'mobile'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-foreground-secondary hover:text-foreground'
                }`}
              >
                <Smartphone size={13} /> Mobile
              </button>
            </div>
          </div>
        </div>

        {/* Rendered Preview Box */}
        <div
          onMouseEnter={() => setPreviewPaused(true)}
          onMouseLeave={() => setPreviewPaused(false)}
          className="p-4 sm:p-6 rounded-2xl bg-neutral-100 dark:bg-neutral-900/80 border border-border/70 flex flex-col justify-center items-center min-h-[120px] transition-all"
        >
          <div
            className={`w-full transition-all duration-300 ${
              previewDevice === 'mobile' ? 'max-w-xs' : 'max-w-full'
            }`}
          >
            {isEnabled && activeMessages.length > 0 ? (
              <div
                className="relative py-2.5 px-4 text-center rounded-xl shadow-md overflow-hidden transition-all"
                style={{
                  backgroundColor: backgroundColor || '#000000',
                  color: textColor || '#ffffff',
                }}
              >
                <div className="relative h-6 flex items-center justify-center overflow-hidden pr-6 pl-2">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={previewIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.28, ease: 'easeInOut' }}
                      className="flex items-center justify-center gap-2 max-w-full"
                    >
                      <PreviewIcon className="w-3.5 h-3.5 flex-shrink-0 text-yellow-400" />
                      <p className="text-xs sm:text-sm font-semibold tracking-wide truncate">
                        {currentPreviewMessage?.text || 'Enter message text below...'}
                      </p>
                      {currentPreviewMessage?.linkUrl && (
                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {isDismissible && (
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded cursor-pointer"
                    aria-label="Dismiss preview"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="py-6 px-4 text-center border-2 border-dashed border-border rounded-xl text-foreground-tertiary text-xs">
                {isEnabled
                  ? 'No enabled messages configured. Add or enable a message below.'
                  : 'Banner is disabled. Toggle "Enable Banner" below to display it.'}
              </div>
            )}
          </div>

          {activeMessages.length > 1 && (
            <div className="flex items-center gap-1.5 mt-3">
              {activeMessages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPreviewIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    previewIndex === idx
                      ? 'w-5 bg-primary'
                      : 'w-1.5 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400'
                  }`}
                  aria-label={`Jump to message ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Rotating Messages Management Card */}
      <Card className="p-5 sm:p-8 border-border/80 bg-card space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Megaphone size={16} className="text-primary" />
              Announcement Messages ({messages.length})
            </h2>
            <p className="text-xs text-foreground-tertiary mt-0.5">
              Add multiple promotional headlines. The top banner will rotate through active messages automatically.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddMessage}
            disabled={messages.length >= 10}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs transition-colors cursor-pointer border border-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={14} /> Add Message
          </button>
        </div>

        {/* Message Items List */}
        <div className="space-y-4">
          {messages.map((message, index) => {
            return (
              <motion.div
                key={message.id || index}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  message.enabled
                    ? 'border-border/80 bg-muted/10 shadow-xs'
                    : 'border-border/40 bg-muted/5 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      Message Item #{index + 1}
                    </span>
                    {!message.enabled && (
                      <span className="text-[10px] font-medium text-neutral-400 bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                        Disabled
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Reorder Up */}
                    <button
                      type="button"
                      title="Move up"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      className="p-1.5 rounded-lg border border-border/60 text-foreground-secondary hover:text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowUp size={13} />
                    </button>

                    {/* Reorder Down */}
                    <button
                      type="button"
                      title="Move down"
                      disabled={index === messages.length - 1}
                      onClick={() => handleMoveDown(index)}
                      className="p-1.5 rounded-lg border border-border/60 text-foreground-secondary hover:text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowDown size={13} />
                    </button>

                    {/* Toggle Active */}
                    <button
                      type="button"
                      title={message.enabled ? 'Disable message' : 'Enable message'}
                      onClick={() => handleUpdateMessage(index, 'enabled', !message.enabled)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ml-1 ${
                        message.enabled
                          ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10'
                          : 'border-border/60 text-foreground-tertiary hover:bg-muted'
                      }`}
                    >
                      {message.enabled ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      title="Delete message"
                      onClick={() => handleRemoveMessage(index)}
                      className="p-1.5 rounded-lg border border-border/60 text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer ml-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 pt-4 items-start">
                  {/* Text Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-foreground-secondary">
                        Message Text *
                      </label>
                      <span className="text-[11px] text-foreground-tertiary">
                        {message.text.length} / 300
                      </span>
                    </div>
                    <Input
                      value={message.text}
                      onChange={(e) => handleUpdateMessage(index, 'text', e.target.value)}
                      maxLength={300}
                      placeholder="e.g. FREE SHIPPING ON ORDERS OVER $50"
                      className="text-sm font-medium"
                    />
                  </div>

                  {/* Custom Icon Picker Selector */}
                  <div className="space-y-1.5 sm:w-52">
                    <label className="text-xs font-medium text-foreground-secondary">
                      Badge Icon
                    </label>
                    <AnnouncementIconPicker
                      value={message.icon || 'Sparkles'}
                      onChange={(newIcon) => handleUpdateMessage(index, 'icon', newIcon)}
                    />
                  </div>
                </div>

                {/* Optional Link URL Input */}
                <div className="space-y-1.5 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground-secondary flex items-center gap-1.5">
                      <LinkIcon size={12} />
                      Optional Destination Link
                    </label>
                    {message.linkUrl && (
                      <button
                        type="button"
                        onClick={() => handleUpdateMessage(index, 'linkUrl', '')}
                        className="text-[11px] text-destructive hover:underline cursor-pointer"
                      >
                        Clear Link
                      </button>
                    )}
                  </div>
                  <Input
                    value={message.linkUrl || ''}
                    onChange={(e) => handleUpdateMessage(index, 'linkUrl', e.target.value)}
                    placeholder="e.g. /shop or https://..."
                    className="text-xs"
                  />
                  <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                    <span className="text-[10px] text-foreground-tertiary">Quick autofill:</span>
                    {COMMON_LINKS.map((item) => (
                      <button
                        key={item.url}
                        type="button"
                        onClick={() => handleUpdateMessage(index, 'linkUrl', item.url)}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted/60 hover:bg-muted text-foreground-secondary transition-colors cursor-pointer border border-border/50"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Global Banner Settings Card */}
      <Card className="p-5 sm:p-8 border-border/80 bg-card space-y-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2 border-b border-border/50 pb-3">
          <Palette size={16} className="text-primary" />
          Global Banner Settings & Styling
        </h2>

        {/* Toggle Switches & Rotation Timer Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-muted/20">
            <div>
              <p className="text-xs font-bold text-foreground">Enable Banner</p>
              <p className="text-[11px] text-foreground-secondary mt-0.5">
                Display on website pages
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isEnabled}
              onClick={() => {
                setIsEnabled(!isEnabled);
                setHasChanged(true);
              }}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                isEnabled ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  isEnabled ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-muted/20">
            <div>
              <p className="text-xs font-bold text-foreground">Dismissible</p>
              <p className="text-[11px] text-foreground-secondary mt-0.5">
                Allow users to close for session
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isDismissible}
              onClick={() => {
                setIsDismissible(!isDismissible);
                setHasChanged(true);
              }}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                isDismissible ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  isDismissible ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-muted/20">
            <div>
              <p className="text-xs font-bold text-foreground">Rotation Interval</p>
              <p className="text-[11px] text-foreground-secondary mt-0.5">
                Seconds per message
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <select
                value={rotationSpeed}
                onChange={(e) => {
                  setRotationSpeed(Number(e.target.value));
                  setHasChanged(true);
                }}
                className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-bold text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={3}>3 sec</option>
                <option value={4}>4 sec</option>
                <option value={5}>5 sec</option>
                <option value={6}>6 sec</option>
                <option value={8}>8 sec</option>
                <option value={10}>10 sec</option>
              </select>
            </div>
          </div>
        </div>

        {/* Styling: Background & Text Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border/60 pt-6">
          {/* Background Color */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground-secondary flex items-center gap-1.5">
              <Palette size={13} /> Background Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={backgroundColor.startsWith('#') ? backgroundColor : '#000000'}
                onChange={(e) => {
                  setBackgroundColor(e.target.value);
                  setHasChanged(true);
                }}
                className="w-10 h-10 rounded-xl border border-border cursor-pointer p-0.5 bg-transparent"
                aria-label="Background color picker"
              />
              <Input
                value={backgroundColor}
                onChange={(e) => {
                  setBackgroundColor(e.target.value);
                  setHasChanged(true);
                }}
                placeholder="#000000"
                className="font-mono text-xs uppercase"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRESET_BG_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.name}
                  onClick={() => {
                    setBackgroundColor(c.value);
                    setHasChanged(true);
                  }}
                  className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                    backgroundColor.toLowerCase() === c.value.toLowerCase()
                      ? 'border-primary scale-110 shadow-sm'
                      : 'border-neutral-300 dark:border-neutral-700'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          {/* Text Color */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground-secondary flex items-center gap-1.5">
              <Palette size={13} /> Text Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={textColor.startsWith('#') ? textColor : '#ffffff'}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  setHasChanged(true);
                }}
                className="w-10 h-10 rounded-xl border border-border cursor-pointer p-0.5 bg-transparent"
                aria-label="Text color picker"
              />
              <Input
                value={textColor}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  setHasChanged(true);
                }}
                placeholder="#ffffff"
                className="font-mono text-xs uppercase"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRESET_TEXT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.name}
                  onClick={() => {
                    setTextColor(c.value);
                    setHasChanged(true);
                  }}
                  className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                    textColor.toLowerCase() === c.value.toLowerCase()
                      ? 'border-primary scale-110 shadow-sm'
                      : 'border-neutral-300 dark:border-neutral-700'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 pt-6">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-border text-foreground-secondary font-medium text-xs hover:bg-muted transition-colors cursor-pointer w-full sm:w-auto"
          >
            <RotateCcw size={13} /> Reset to Default
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-foreground-secondary hover:text-primary transition-colors"
          >
            <span>View Public Website</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </Card>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: 'var(--popover)',
            color: 'var(--popover-foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </div>
  );
}
