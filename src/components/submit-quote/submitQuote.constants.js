'use client';

import { getCategoryChipTheme, getCategoryLabel } from '@/components/category';
import { useQuoteCategories } from '@/hooks/category/useQuoteCategories';

// ============================================================
// Premium quote submission categories.
//
// The backend PendingQuote API validates `category` against a fixed list of
// submission slugs (see src/modules/pendingQuote/pendingQuote.routes.js).
// The picker always renders the backend Category collection (single source
// of truth for names/order) intersected with that valid submission set, so
// new categories created in the Category API automatically appear here the
// moment they are added to the submission enum — no per-page constants.
// ============================================================

// Fixed list of slugs the backend PendingQuote API accepts. Business rule
// (mirrors the backend enum) — kept here only to filter picker options.
export const SUBMISSION_CATEGORY_SLUGS = [
  'inspire', 'love', 'strength', 'healing', 'faith', 'gratitude',
  'hope', 'success', 'leadership', 'family', 'friendship', 'kindness',
  'happiness', 'wisdom', 'motivation', 'self-growth', 'positivity',
  'courage', 'mindfulness', 'dreams', 'life', 'peace', 'discipline',
  'purpose', 'other',
];

// Display fallback order for submission categories when the Category API
// has not returned data yet (same order as before this refactor).
const SUBMISSION_CATEGORY_FALLBACK = [
  { id: 'inspire', label: 'Inspire' },
  { id: 'love', label: 'Love' },
  { id: 'strength', label: 'Strength' },
  { id: 'healing', label: 'Healing' },
  { id: 'faith', label: 'Faith' },
  { id: 'gratitude', label: 'Gratitude' },
  { id: 'hope', label: 'Hope' },
  { id: 'success', label: 'Success' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'family', label: 'Family' },
  { id: 'friendship', label: 'Friendship' },
  { id: 'kindness', label: 'Kindness' },
  { id: 'happiness', label: 'Happiness' },
  { id: 'wisdom', label: 'Wisdom' },
  { id: 'motivation', label: 'Motivation' },
  { id: 'self-growth', label: 'Self Growth' },
  { id: 'positivity', label: 'Positivity' },
  { id: 'courage', label: 'Courage' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'dreams', label: 'Dreams' },
  { id: 'life', label: 'Life' },
  { id: 'peace', label: 'Peace' },
  { id: 'discipline', label: 'Discipline' },
  { id: 'purpose', label: 'Purpose' },
  { id: 'other', label: 'Other' },
];

export const isSubmissionCategory = (slug) =>
  SUBMISSION_CATEGORY_SLUGS.includes(slug);

/**
 * Get the submission category options — backend-driven, validated against
 * the backend submission enum. Pass `categories` (from useQuoteCategories)
 * to avoid re-querying; otherwise the hook is used directly.
 */
export function useSubmissionCategoryOptions(categories) {
  const { data: backendCategories = [], isLoading } = useQuoteCategories();

  if (isLoading || backendCategories.length === 0) {
    return { options: SUBMISSION_CATEGORY_FALLBACK, isLoading: true };
  }

  const source = categories || backendCategories;
  const options = source
    .filter((cat) => isSubmissionCategory(cat.slug))
    .map((cat) => ({
      id: cat.slug,
      label: cat.name || getCategoryLabel(cat.slug),
    }));

  if (options.length === 0) {
    return { options: SUBMISSION_CATEGORY_FALLBACK, isLoading: false };
  }

  return { options, isLoading: false };
}

/**
 * Resolve the chip class for a submission category from the shared theme.
 */
export function getCategoryChipClass(id) {
  return getCategoryChipTheme(id);
}

/**
 * Resolve the display label for a submission category from the shared map.
 */
export function getSubmissionCategoryLabel(id) {
  return getCategoryLabel(id);
}

// Submission status theming.
export const STATUS_CHIP_STYLES = {
  pending: {
    chip: 'border-amber-500/35 bg-amber-500/15 text-amber-300 dark:text-amber-200 light:text-amber-700 shadow-[0_0_16px_-4px_rgba(251,191,36,0.35)]',
    dot: 'bg-amber-400',
    label: 'Pending',
  },
  approved: {
    chip: 'border-emerald-500/35 bg-emerald-500/15 text-emerald-300 dark:text-emerald-200 light:text-emerald-700 shadow-[0_0_16px_-4px_rgba(52,211,153,0.35)]',
    dot: 'bg-emerald-400',
    label: 'Approved',
  },
  rejected: {
    chip: 'border-red-500/35 bg-red-500/15 text-red-300 dark:text-red-200 light:text-red-700 shadow-[0_0_16px_-4px_rgba(248,113,113,0.35)]',
    dot: 'bg-red-400',
    label: 'Rejected',
  },
};

export const getStatusChip = (status) =>
  STATUS_CHIP_STYLES[status] || STATUS_CHIP_STYLES.pending;
