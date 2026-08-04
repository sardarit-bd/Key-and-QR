// Premium quote submission categories — matches the expanded backend enum.

export const SUBMISSION_CATEGORIES = [
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

// Per-category premium chip theming — boosted contrast for both modes.
export const CATEGORY_CHIP_STYLES = {
  inspire: 'border-accent/35 bg-accent/20 text-accent dark:text-amber-200 light:text-amber-800 shadow-[0_0_16px_-4px_rgba(253,182,92,0.35)]',
  love: 'border-rose-500/35 bg-rose-500/20 text-rose-300 dark:text-rose-200 light:text-rose-800 shadow-[0_0_16px_-4px_rgba(251,113,133,0.4)]',
  strength: 'border-orange-500/35 bg-orange-500/20 text-orange-300 dark:text-orange-200 light:text-orange-800 shadow-[0_0_16px_-4px_rgba(251,146,60,0.4)]',
  healing: 'border-emerald-500/35 bg-emerald-500/20 text-emerald-300 dark:text-emerald-200 light:text-emerald-800 shadow-[0_0_16px_-4px_rgba(52,211,153,0.4)]',
  faith: 'border-amber-500/35 bg-amber-500/20 text-amber-300 dark:text-amber-200 light:text-amber-800 shadow-[0_0_16px_-4px_rgba(251,191,36,0.4)]',
  gratitude: 'border-yellow-500/35 bg-yellow-500/20 text-yellow-300 dark:text-yellow-200 light:text-yellow-800 shadow-[0_0_16px_-4px_rgba(250,204,21,0.4)]',
  hope: 'border-teal-500/35 bg-teal-500/20 text-teal-300 dark:text-teal-200 light:text-teal-800 shadow-[0_0_16px_-4px_rgba(45,212,191,0.4)]',
  success: 'border-green-500/35 bg-green-500/20 text-green-300 dark:text-green-200 light:text-green-800 shadow-[0_0_16px_-4px_rgba(74,222,128,0.4)]',
  leadership: 'border-sky-500/35 bg-sky-500/20 text-sky-300 dark:text-sky-200 light:text-sky-800 shadow-[0_0_16px_-4px_rgba(56,189,248,0.4)]',
  family: 'border-pink-500/35 bg-pink-500/20 text-pink-300 dark:text-pink-200 light:text-pink-800 shadow-[0_0_16px_-4px_rgba(244,114,182,0.4)]',
  friendship: 'border-fuchsia-500/35 bg-fuchsia-500/20 text-fuchsia-300 dark:text-fuchsia-200 light:text-fuchsia-800 shadow-[0_0_16px_-4px_rgba(232,121,249,0.4)]',
  kindness: 'border-violet-500/35 bg-violet-500/20 text-violet-300 dark:text-violet-200 light:text-violet-800 shadow-[0_0_16px_-4px_rgba(167,139,250,0.4)]',
  happiness: 'border-yellow-400/35 bg-yellow-400/20 text-yellow-300 dark:text-yellow-200 light:text-yellow-800 shadow-[0_0_16px_-4px_rgba(250,204,21,0.4)]',
  wisdom: 'border-indigo-500/35 bg-indigo-500/20 text-indigo-300 dark:text-indigo-200 light:text-indigo-800 shadow-[0_0_16px_-4px_rgba(129,140,248,0.4)]',
  motivation: 'border-orange-400/35 bg-orange-400/20 text-orange-300 dark:text-orange-200 light:text-orange-800 shadow-[0_0_16px_-4px_rgba(251,146,60,0.4)]',
  'self-growth': 'border-cyan-500/35 bg-cyan-500/20 text-cyan-300 dark:text-cyan-200 light:text-cyan-800 shadow-[0_0_16px_-4px_rgba(34,211,238,0.4)]',
  positivity: 'border-lime-500/35 bg-lime-500/20 text-lime-300 dark:text-lime-200 light:text-lime-800 shadow-[0_0_16px_-4px_rgba(163,230,53,0.4)]',
  courage: 'border-red-500/35 bg-red-500/20 text-red-300 dark:text-red-200 light:text-red-800 shadow-[0_0_16px_-4px_rgba(248,113,113,0.4)]',
  mindfulness: 'border-teal-400/35 bg-teal-400/20 text-teal-300 dark:text-teal-200 light:text-teal-800 shadow-[0_0_16px_-4px_rgba(45,212,191,0.4)]',
  dreams: 'border-purple-500/35 bg-purple-500/20 text-purple-300 dark:text-purple-200 light:text-purple-800 shadow-[0_0_16px_-4px_rgba(192,132,252,0.4)]',
  life: 'border-emerald-400/35 bg-emerald-400/20 text-emerald-300 dark:text-emerald-200 light:text-emerald-800 shadow-[0_0_16px_-4px_rgba(52,211,153,0.4)]',
  peace: 'border-blue-500/35 bg-blue-500/20 text-blue-300 dark:text-blue-200 light:text-blue-800 shadow-[0_0_16px_-4px_rgba(96,165,250,0.4)]',
  discipline: 'border-stone-500/35 bg-stone-500/20 text-stone-300 dark:text-stone-200 light:text-stone-800 shadow-[0_0_16px_-4px_rgba(168,162,158,0.4)]',
  purpose: 'border-amber-400/35 bg-amber-400/20 text-amber-300 dark:text-amber-200 light:text-amber-800 shadow-[0_0_16px_-4px_rgba(251,191,36,0.4)]',
  other: 'border-white/15 bg-white/10 text-foreground-secondary backdrop-blur-md light:border-[#E8DFCE]/80 light:bg-white/70 light:text-[#4A3C2D]',
};

export const getCategoryLabel = (id) =>
  SUBMISSION_CATEGORIES.find((c) => c.id === id)?.label || id;

export const getCategoryChipClass = (id) =>
  CATEGORY_CHIP_STYLES[id] || CATEGORY_CHIP_STYLES.other;

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
