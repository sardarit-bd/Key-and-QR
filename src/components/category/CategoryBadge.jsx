'use client';

import { getCategoryLabel } from './categoryLabels';
import { getCategoryBadgeClass } from './categoryColors';
import { getCategoryIcon } from './categoryIcons';

/**
 * CategoryBadge — renders a category chip consistently across the app.
 *
 * @param {string} category  Category slug (e.g. "love").
 * @param {string} [variant] "chip" (full chip theme — default) or "badge"
 *                           (compact admin-table style).
 * @param {string} [className] Extra classes appended to the chip.
 * @param {boolean} [withIcon] Show a small leading category icon.
 */
export default function CategoryBadge({
  category,
  variant = 'chip',
  className = '',
  withIcon = false,
}) {
  const label = getCategoryLabel(category);
  const Icon = getCategoryIcon(category);

  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${getCategoryBadgeClass(category)} ${className}`}
      >
        {withIcon && <Icon size={10} />}
        {label}
      </span>
    );
  }

  const theme = getCategoryBadgeClass(category);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize backdrop-blur-md ${theme} ${className}`}
    >
      {withIcon && <Icon size={11} />}
      {label}
    </span>
  );
}
