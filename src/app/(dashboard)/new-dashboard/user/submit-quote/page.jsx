'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  SubmitQuoteHeader,
  QuoteWriter,
  AuthorInput,
  CategoryPills,
  SubmitButton,
  SubmitSuccessState,
  CooldownNotice,
  SubmitQuoteSkeleton,
} from '@/components/submit-quote';
import {
  useSubmitQuoteMutation,
  useSubmissionStatus,
} from '@/hooks/pending-quote/usePendingQuote';
import { useQuoteCategories } from '@/hooks/category/useQuoteCategories';
import { useAuthStore } from '@/store/authStore';

const MAX_LENGTH = 500;

/**
 * Submit Quote Page — clean, focused, premium publishing experience.
 * Route: /new-dashboard/user/submit-quote
 *
 * Submission limits:
 * - FREE → 1 quote every 7 days (backend-enforced)
 * - MyInspire+ → 1 quote per day (backend-enforced)
 * When in cooldown, the form is replaced by a live countdown.
 */
export default function SubmitQuotePage() {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const { isInitialized } = useAuthStore();
  const submitQuote = useSubmitQuoteMutation();
  const { data: quoteCategories = [], isLoading: isCategoriesLoading } = useQuoteCategories();
  const {
    data: status,
    isLoading: isStatusLoading,
    isPending: isStatusPending,
    refetch: refetchStatus,
  } = useSubmissionStatus();

  // Backend is the source of truth for eligibility.
  const isCheckingEligibility = isStatusLoading || (!status && isStatusPending) || !isInitialized;
  const canSubmit = status?.canSubmit !== false;
  const plan = status?.plan || 'free';
  const cooldownEndsAt = status?.cooldownEndsAt || null;

  // Default category — dynamically resolved from active categories sorted by sortOrder
  const defaultCategory = useMemo(() => {
    const active = (quoteCategories || [])
      .filter((cat) => cat && cat.isActive !== false)
      .sort((a, b) => {
        const orderA = typeof a.sortOrder === 'number' ? a.sortOrder : 9999;
        const orderB = typeof b.sortOrder === 'number' ? b.sortOrder : 9999;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || a.slug || '').localeCompare(b.name || b.slug || '');
      });
    return active[0]?.slug || active[0]?.name?.toLowerCase() || 'inspire';
  }, [quoteCategories]);

  // Set initial category once categories load if not explicitly set
  useEffect(() => {
    if (!category && defaultCategory) {
      setCategory(defaultCategory);
    }
  }, [defaultCategory, category]);

  // When the countdown hits zero, revalidate eligibility (no page refresh).
  const handleCooldownEnd = useCallback(() => {
    refetchStatus();
  }, [refetchStatus]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!canSubmit) {
        setError('Your next submission is not available yet.');
        return;
      }
      if (text.trim().length < 3) {
        setError('Quote must be at least 3 characters');
        return;
      }
      if (text.trim().length > MAX_LENGTH) {
        setError(`Quote cannot exceed ${MAX_LENGTH} characters`);
        return;
      }

      setError(null);
      try {
        await submitQuote.mutateAsync({
          text: text.trim(),
          category: category || defaultCategory,
          author: author.trim() || null,
          type: 'community',
        });
        setSubmitted(true);
        setText('');
        setAuthor('');
        setCategory(defaultCategory);
      } catch (err) {
        // If the backend rejected with the cooldown code, surface it with
        // the next-allowed timestamp so the UI can start a countdown.
        if (err?.code === 'SUBMISSION_COOLDOWN_ACTIVE') {
          refetchStatus();
        }
        setError(err?.message || 'Failed to submit quote');
      }
    },
    [text, author, category, submitQuote, defaultCategory, canSubmit, refetchStatus]
  );

  // Success state — shows the live cooldown countdown; the submission form
  // stays locked until the cooldown expires (backend is the source of truth).
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-background"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-20 sm:pb-24">
          <SubmitQuoteHeader />
          <div className="mt-8 sm:mt-10">
            <SubmitSuccessState
              cooldownEndsAt={cooldownEndsAt}
              plan={plan}
              onCooldownEnd={handleCooldownEnd}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // Loading / verifying eligibility state — prevents FOUC
  if (isCheckingEligibility) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-20 sm:pb-24">
          <SubmitQuoteHeader />
          <div className="mx-auto mt-6 sm:mt-10 w-full max-w-2xl">
            <SubmitQuoteSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Cooldown state — show the live countdown instead of the form.
  if (!canSubmit && cooldownEndsAt) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-background"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-20 sm:pb-24">
          <SubmitQuoteHeader />
          <div className="mx-auto mt-8 sm:mt-10 w-full max-w-md">
            <CooldownNotice
              cooldownEndsAt={cooldownEndsAt}
              plan={plan}
              onCooldownEnd={handleCooldownEnd}
            />
            <p className="mt-6 text-center text-[13px] leading-relaxed text-foreground-tertiary">
              Your submitted quote is under review. We&apos;ll notify you once
              it&apos;s approved.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-20 sm:pb-24">
        {/* Header */}
        <SubmitQuoteHeader />

        {/* Centered writing column */}
        <div className="mx-auto mt-6 sm:mt-10 w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Quote textarea */}
            <QuoteWriter text={text} onChange={setText} />

            {/* Author input */}
            <AuthorInput author={author} onChange={setAuthor} />

            {/* Category selection */}
            <CategoryPills
              value={category || defaultCategory}
              onChange={setCategory}
              categories={quoteCategories}
            />

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-3.5 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Plan-aware limit helper */}
            <div className="rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-center text-[12px] sm:text-[13px] text-foreground-tertiary">
              {plan === 'subscriber'
                ? 'MyInspire+ members can submit 1 quote per day.'
                : 'Free members can submit 1 quote every 7 days.'}
            </div>

            {/* Helper text */}
            <p className="text-center text-[12px] sm:text-[13px] leading-relaxed text-foreground-tertiary">
              Your quote will be reviewed before publishing.
              <br className="hidden sm:block" />
              We&apos;ll notify you once it&apos;s approved.
            </p>

            {/* Publish button */}
            <div className="flex justify-center pt-1">
              <SubmitButton
                submitting={submitQuote.isPending}
                disabled={text.trim().length < 3 || !canSubmit}
              />
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
