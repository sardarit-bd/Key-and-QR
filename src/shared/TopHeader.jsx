'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Truck,
  Gift,
  Clock,
  Heart,
  Tag,
  Shield,
  Zap,
  Megaphone,
  Star,
  Bell,
  Smile,
  Flame,
  Trophy,
  Gem,
  Award,
  ShoppingBag,
  HelpCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAnnouncementBanner, DEFAULT_ANNOUNCEMENT_BANNER } from '@/hooks/dashboard/useAdminHero';

// Map icon string names to Lucide icon components
const BANNER_ICON_MAP = {
  Sparkles,
  Truck,
  Gift,
  Clock,
  Heart,
  Tag,
  Shield,
  Zap,
  Megaphone,
  Star,
  Bell,
  Smile,
  Flame,
  Trophy,
  Gem,
  Award,
  ShoppingBag,
  HelpCircle,
};

function resolveBannerIcon(iconName) {
  if (!iconName) return Sparkles;
  return BANNER_ICON_MAP[iconName] || Sparkles;
}

function TopHeader() {
  const pathname = usePathname();
  const { data: banner = DEFAULT_ANNOUNCEMENT_BANNER } = useAnnouncementBanner();

  // Filter active and non-empty messages
  const activeMessages = useMemo(() => {
    if (Array.isArray(banner?.messages) && banner.messages.length > 0) {
      const filtered = banner.messages.filter(
        (m) => m && m.enabled !== false && m.text && m.text.trim()
      );
      if (filtered.length > 0) return filtered;
    }
    // Fallback to legacy single text if messages array is empty
    if (banner?.text && banner.text.trim()) {
      return [
        {
          text: banner.text.trim(),
          icon: 'Sparkles',
          linkUrl: banner.linkUrl || '',
          enabled: true,
        },
      ];
    }
    return [];
  }, [banner]);

  // Generate unique content fingerprint/signature to invalidate dismissals when updated
  const bannerSignature = useMemo(() => {
    const messagesFingerprint = activeMessages
      .map((m) => `${m.text}_${m.icon || ''}_${m.linkUrl || ''}`)
      .join('|');
    return `${banner?.updatedAt || 'v1'}_${messagesFingerprint}_${banner?.backgroundColor || ''}_${banner?.textColor || ''}`;
  }, [activeMessages, banner?.updatedAt, banner?.backgroundColor, banner?.textColor]);

  // Synchronous initial state check to prevent layout flicker on reload
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = sessionStorage.getItem('announcement_dismissed_session');
      if (!stored) return false;
      try {
        const parsed = JSON.parse(stored);
        return Boolean(parsed?.dismissed);
      } catch {
        return stored === 'true';
      }
    } catch {
      return false;
    }
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const isTagPage = pathname?.startsWith('/t/') || pathname?.startsWith('/tag/');

  // Session-based dismissal with content version invalidation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = sessionStorage.getItem('announcement_dismissed_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.dismissed) {
            // If signature matches, remain dismissed
            if (!parsed.signature || parsed.signature === bannerSignature) {
              setIsDismissed(true);
              return;
            }
          }
        } catch {
          if (stored === 'true') {
            setIsDismissed(true);
            return;
          }
        }
      }
      // If no dismissal or signature changed by admin, show fresh banner
      setIsDismissed(false);
    } catch {
      setIsDismissed(false);
    }
  }, [bannerSignature]);

  // Auto-rotation timer with hover pause
  useEffect(() => {
    if (activeMessages.length <= 1 || isPaused) return;

    const intervalMs = Math.max(2, Number(banner?.rotationSpeed) || 5) * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeMessages.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [activeMessages.length, isPaused, banner?.rotationSpeed]);

  // Reset index if out of bounds
  useEffect(() => {
    if (currentIndex >= activeMessages.length) {
      setCurrentIndex(0);
    }
  }, [activeMessages.length, currentIndex]);

  const handleDismiss = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDismissed(true);
    try {
      sessionStorage.setItem(
        'announcement_dismissed_session',
        JSON.stringify({
          dismissed: true,
          signature: bannerSignature,
          timestamp: Date.now(),
        })
      );
    } catch {
      // Ignore sessionStorage access errors
    }
  };

  // If disabled, dismissed, on scan routes, or no messages available, render nothing (zero whitespace)
  if (isTagPage || !banner?.isEnabled || isDismissed || activeMessages.length === 0) {
    return null;
  }

  const currentMessage = activeMessages[currentIndex] || activeMessages[0];
  const IconComponent = resolveBannerIcon(currentMessage?.icon);
  const linkUrl = currentMessage?.linkUrl?.trim() || banner?.linkUrl?.trim() || '';
  const isExternal = linkUrl.startsWith('http://') || linkUrl.startsWith('https://');

  const bgColor = banner?.backgroundColor || '#000000';
  const textColor = banner?.textColor || '#ffffff';

  const messageContent = (
    <div className="flex items-center justify-center gap-2 md:gap-2.5 py-0.5 min-h-[22px]">
      <IconComponent className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-400 flex-shrink-0" />
      <p className="text-xs md:text-sm font-semibold tracking-wide truncate max-w-[80vw] sm:max-w-none">
        {currentMessage.text}
      </p>
      {linkUrl && (
        <ExternalLink className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-80 flex-shrink-0" />
      )}
    </div>
  );

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative py-2 px-8 sm:px-12 text-center overflow-hidden transition-colors duration-300 z-30 select-none"
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <div className="container mx-auto">
        <div className="relative h-6 flex items-center justify-center overflow-hidden">
          {activeMessages.length > 1 ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: 'easeInOut' }}
                className="w-full flex items-center justify-center"
              >
                {linkUrl ? (
                  isExternal ? (
                    <a
                      href={linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center hover:opacity-90 transition-opacity focus:outline-none focus:underline"
                    >
                      {messageContent}
                    </a>
                  ) : (
                    <Link
                      href={linkUrl}
                      className="inline-flex items-center justify-center hover:opacity-90 transition-opacity focus:outline-none focus:underline"
                    >
                      {messageContent}
                    </Link>
                  )
                ) : (
                  messageContent
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="w-full flex items-center justify-center">
              {linkUrl ? (
                isExternal ? (
                  <a
                    href={linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center hover:opacity-90 transition-opacity focus:outline-none focus:underline"
                  >
                    {messageContent}
                  </a>
                ) : (
                  <Link
                    href={linkUrl}
                    className="inline-flex items-center justify-center hover:opacity-90 transition-opacity focus:outline-none focus:underline"
                  >
                    {messageContent}
                  </Link>
                )
              ) : (
                messageContent
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dismiss button strictly honors isDismissible */}
      {banner.isDismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity p-1 rounded-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-current"
          aria-label="Close announcement"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      )}
    </div>
  );
}

export default TopHeader;
