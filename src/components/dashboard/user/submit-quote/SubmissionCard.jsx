'use client';

import { motion } from 'framer-motion';
import { Calendar, Quote as QuoteIcon, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import StatusChip from './StatusChip';
import { getCategoryChipClass, getSubmissionCategoryLabel } from './submitQuote.constants';

function formatDate(iso) {
  if (!iso) return null;
  return format(new Date(iso), 'MMM d, yyyy');
}

/**
 * Premium submission card — quote, author, category, date, status,
 * admin review date, and rejection reason.
 */
export default function SubmissionCard({ submission, index = 0 }) {
  const status = submission?.status || 'pending';
  const category = submission?.category || 'other';
  const chip = getCategoryChipClass(category);
  const chipClass = `${chip.border} ${chip.bg} ${chip.text} ${chip.lightText} ${chip.glow}`.trim();
  const categoryLabel = getSubmissionCategoryLabel(category);

  const submittedDate = formatDate(submission?.createdAt);
  const reviewedAt = status === 'approved' ? submission?.approvedAt : submission?.rejectedAt;
  const reviewedDate = formatDate(reviewedAt);
  const rejectionReason = status === 'rejected' ? submission?.adminNote : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 3) * 0.06, duration: 0.3, ease: 'easeOut' }}
      className="group relative overflow-hidden rounded-[22px] border border-white/6 bg-card p-4 sm:p-5 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_24px_48px_-16px_rgb(0_0_0/0.55)] light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/55 light:shadow-[0_20px_50px_-20px_rgba(100,72,24,0.28),0_10px_30px_-18px_rgba(100,72,24,0.16)]"
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-accent/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-primary/[0.05] blur-3xl" />
      {/* Hairline top highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent light:via-[#E8DFCE]/70" />

      <div className="relative z-10">
        {/* Top row: category chip + status */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex max-w-[140px] sm:max-w-[180px] truncate items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold capitalize backdrop-blur-md ${chipClass}`}
            title={categoryLabel}
          >
            {categoryLabel}
          </span>
          <StatusChip status={status} />
        </div>

        {/* Quote */}
        <div className="mt-4">
          <div className="flex items-start gap-2.5">
            <QuoteIcon
              size={14}
              className="mt-1 shrink-0 text-accent/40"
              fill="currentColor"
              stroke="none"
            />
            <p className="line-clamp-3 text-[15px] leading-[1.6] font-medium text-foreground">
              &ldquo;{submission?.text}&rdquo;
            </p>
          </div>
        </div>

        {/* Author */}
        {submission?.author && (
          <p className="mt-2 pl-[26px] text-[13px] text-foreground-secondary">
            — {submission.author}
          </p>
        )}

        {/* Rejection reason */}
        {status === 'rejected' && rejectionReason && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5">
            <XCircle size={15} className="mt-0.5 shrink-0 text-red-400" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-red-400">
                Rejection Reason
              </p>
              <p className="mt-0.5 text-[13px] leading-snug text-foreground-secondary">
                {rejectionReason}
              </p>
            </div>
          </div>
        )}

        {/* Approved published note */}
        {status === 'approved' && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
            <p className="text-[13px] text-foreground-secondary">
              Published to the inspiration library.
            </p>
          </div>
        )}

        {/* Pending review note */}
        {status === 'pending' && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3.5 py-2.5">
            <Clock size={15} className="shrink-0 text-amber-400" />
            <p className="text-[13px] text-foreground-secondary">
              Under review — typically within 1&ndash;3 business days.
            </p>
          </div>
        )}

        {/* Footer: dates */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-white/6 pt-3.5 text-[11px] text-foreground-tertiary light:border-[#E8DFCE]/70">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-foreground-tertiary/70" />
            Submitted {submittedDate}
          </span>
          {reviewedDate && (
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="text-foreground-tertiary/70" />
              {status === 'approved' ? 'Approved' : 'Reviewed'} {reviewedDate}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
