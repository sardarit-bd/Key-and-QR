'use client';

import { getStatusChip } from './submitQuote.constants';

/**
 * Premium status chip — Pending (yellow), Approved (green), Rejected (red).
 */
export default function StatusChip({ status }) {
  const config = getStatusChip(status);

  return (
    <span
      className={`inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-full border px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold capitalize backdrop-blur-md ${config.chip}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot} shadow-[0_0_6px_currentColor]`} />
      {config.label}
    </span>
  );
}
