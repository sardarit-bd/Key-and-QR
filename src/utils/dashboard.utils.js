'use client';

import { Sparkles, Heart, Dumbbell, Church, Shield, BookOpen, HandHeart, Bandage } from 'lucide-react';

// ============================================================
// Dashboard normalization layer
// Maps the backend GET /dashboard/home payload onto the exact
// prop shapes the existing dashboard UI components expect.
// No UI component was changed to accommodate these mappings.
// ============================================================

const CATEGORY_ICONS = {
  inspire: { icon: Sparkles, colorClass: 'text-accent', bgClass: 'bg-accent/10 border border-accent/20' },
  love: { icon: Heart, colorClass: 'text-pink-400', bgClass: 'bg-pink-500/10 border border-pink-500/20' },
  strength: { icon: Dumbbell, colorClass: 'text-orange-400', bgClass: 'bg-orange-500/10 border border-orange-500/20' },
  healing: { icon: Bandage, colorClass: 'text-green-400', bgClass: 'bg-green-500/10 border border-green-500/20' },
  faith: { icon: Church, colorClass: 'text-yellow-200', bgClass: 'bg-yellow-500/10 border border-yellow-500/20' },
  gratitude: { icon: HandHeart, colorClass: 'text-yellow-400', bgClass: 'bg-yellow-500/10 border border-yellow-500/20' },
  courage: { icon: Shield, colorClass: 'text-orange-400', bgClass: 'bg-orange-500/10 border border-orange-500/20' },
  wisdom: { icon: BookOpen, colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10 border border-emerald-500/20' },
  motivation: { icon: Sparkles, colorClass: 'text-accent', bgClass: 'bg-accent/10 border border-accent/20' },
};

const DEFAULT_STYLE = CATEGORY_ICONS.inspire;

/**
 * Map a backend category slug (or name) to the icon/badge style used
 * by QuoteItem. Falls back to the inspire style when unknown.
 */
export function getCategoryStyle(slug) {
  const key = String(slug || 'inspire').toLowerCase();
  return CATEGORY_ICONS[key] || DEFAULT_STYLE;
}

/**
 * Build the time-based greeting shown by WelcomeSection.
 * "Good Morning / Good Afternoon / Good Evening" per local time.
 */
export function buildGreeting(name) {
  const hour = new Date().getHours();
  let text = 'Good Evening';
  if (hour < 5) text = 'Good Night';
  else if (hour < 12) text = 'Good Morning';
  else if (hour < 17) text = 'Good Afternoon';
  else if (hour < 21) text = 'Good Evening';

  return {
    text,
    name: name || 'there',
  };
}

/**
 * Map /dashboard/home streak (weekActivity: [{date, active}]) onto the
 * [bool x7] shape InspirationStreak renders (Monday → Sunday).
 */
export function mapStreak(streak) {
  if (!streak) {
    return {
      current: 0,
      longest: 0,
      weekActivity: [false, false, false, false, false, false, false],
    };
  }

  let weekActivity = streak.weekActivity;

  // /home returns [{date, active}] — flatten to booleans.
  if (Array.isArray(weekActivity) && weekActivity.length > 0 && typeof weekActivity[0] === 'object') {
    weekActivity = weekActivity.map((entry) => !!entry.active);
  }

  // Ensure exactly 7 entries, aligned Monday → Sunday (index 0 = Monday).
  if (!Array.isArray(weekActivity) || weekActivity.length === 0) {
    weekActivity = [false, false, false, false, false, false, false];
  }
  if (weekActivity.length !== 7) {
    const padded = [false, false, false, false, false, false, false];
    weekActivity.forEach((active, i) => {
      if (i < 7) padded[i] = !!active;
    });
    weekActivity = padded;
  }

  return {
    current: streak.current || 0,
    longest: streak.longest || 0,
    weekActivity,
  };
}

/**
 * Map /dashboard/home statistics onto the 4 stats cards:
 * Total Quotes / Favorites / Total Scans / Gifted Messages.
 */
export function mapStatistics(statistics, extra) {
  const source = statistics || {};
  const fallback = extra || {};

  return {
    // Total quotes received (quote receive engine)
    totalQuotes: source.totalQuotesReceived ?? fallback.totalQuotes ?? 0,
    // Live favorite count
    favorites: source.favoriteCount ?? fallback.favorites ?? 0,
    // QR & NFC scans
    scans: source.scans ?? fallback.scans ?? 0,
    // Gifted messages (activated tags)
    tags: source.tags ?? fallback.tags ?? 0,
  };
}

/**
 * Map /dashboard/home categories to the shape CategorySection renders.
 * Keeps icon/color/name/lock/selection state fully backend-driven.
 */
export function mapCategories(categories) {
  if (!Array.isArray(categories)) return [];
  return categories.map((category) => {
    const slug = category?.slug || category?.id || category?.name || '';
    const style = getCategoryStyle(slug);
    return {
      id: category.id || category._id,
      name: category.name || category.slug || 'Inspire',
      slug,
      icon: category.icon,
      color: category.color,
      count: category.count,
      isPremium: !!category.isPremium,
      isLocked: !!category.isLocked,
      isAvailableToday: category.isAvailableToday !== false,
      iconComponent: style.icon,
      colorClass: style.colorClass,
      bgClass: style.bgClass,
    };
  });
}

/**
 * Map /dashboard/home latestInspiration onto the Latest Inspiration card
 * (client image: background image, quote preview, author, favorite, share,
 * read again, daily usage badge).
 */
export function mapLatestInspiration(latestInspiration, dailyUsage) {
  const quote = latestInspiration?.latestQuote || null;

  return {
    hasReceivedQuote: !!latestInspiration?.hasReceivedQuote,
    id: quote?.id || quote?.quoteId || null,
    quoteId: quote?.quoteId || quote?.id || null,
    text: quote?.fullText || quote?.previewText || '',
    previewText: quote?.previewText || '',
    author: quote?.author || 'InspireTag',
    image: quote?.image?.url || quote?.image || null,
    theme: quote?.theme || null,
    category: quote?.category || null,
    receivedAt: quote?.receivedAt || null,
    favorite: !!quote?.favorite,
    favoriteId: quote?.favoriteId || null,
    dailyUsage: dailyUsage
      ? {
          usedToday: dailyUsage.usedToday ?? 0,
          dailyLimit: dailyUsage.dailyLimit ?? 0,
        }
      : null,
  };
}

/**
 * Map received-quote history docs onto the RecentQuotesCard list shape.
 * Each item carries its receivedQuoteId so clicking it triggers Read Again.
 */
export function mapHistoryQuotes(historyData) {
  const items = Array.isArray(historyData) ? historyData : [];
  return items.map((rq) => {
    const quote = rq?.quote || {};
    const style = getCategoryStyle(rq?.category?.slug || rq?.categorySlug || quote?.category);
    return {
      id: rq?._id,
      receivedQuoteId: rq?._id,
      title: quote?.text || 'No quote available',
      category: rq?.category?.name || rq?.categorySlug || 'Inspiration',
      date: rq?.receivedAt
        ? new Date(rq.receivedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : '',
      icon: style.icon,
      colorClass: style.colorClass,
      bgClass: style.bgClass,
      badgeIcon: style.icon,
      badgeColor: style.colorClass,
    };
  });
}

/**
 * Build the props passed to each section component from a
 * normalized /dashboard/home payload.
 */
export function buildDashboardProps(data) {
  const home = data || {};

  return {
    // Prefer the server-computed greeting; fall back to client time.
    greeting: home?.greeting?.text
      ? { text: home.greeting.text, name: home.greeting.name || home.user?.name || 'there' }
      : buildGreeting(home?.user?.name),
    latestInspiration: mapLatestInspiration(home?.latestInspiration, home?.dailyUsage),
    streak: mapStreak(home?.streak),
    statistics: mapStatistics(home?.statistics, {
      totalQuotes: home?.statistics?.totalQuotesReceived,
      favorites: home?.statistics?.favoriteCount,
      scans: home?.statistics?.scans,
      tags: home?.statistics?.tags,
    }),
    categories: mapCategories(home?.categories),
    user: home?.user || null,
    subscription: home?.subscription || {
      plan: home?.dailyUsage?.plan || 'free',
      status: null,
      currentPeriodEnd: null,
    },
    dailyUsage: home?.dailyUsage || null,
  };
}
