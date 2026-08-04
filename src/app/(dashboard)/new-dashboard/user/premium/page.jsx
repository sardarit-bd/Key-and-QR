'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Sparkles, CreditCard, Calendar, CheckCircle2,
  RefreshCw, ChevronDown, ChevronUp, Infinity, BookOpen, Scan,
  Star, MessageCircle, Zap, ExternalLink, BadgeCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useDashboardOverview } from '@/hooks/dashboard/useDashboardOverview';
import premiumService from '@/services/premium-service/premium.service';

const GLASS_CARD =
  'rounded-[22px] border border-white/6 bg-card shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)] ' +
  'light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/55 light:shadow-[0_20px_50px_-20px_rgba(100,72,24,0.28),0_10px_30px_-18px_rgba(100,72,24,0.16)]';

function CardGlow() {
  return (
    <>
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-accent/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent light:via-[#E8DFCE]/70" />
    </>
  );
}

function fmtDate(iso) { return iso ? format(new Date(iso), 'MMM d, yyyy') : '—'; }

const BENEFITS = [
  { icon: Infinity, title: 'Unlimited Quotes', desc: 'Receive unlimited inspiration every day, no caps.' },
  { icon: BookOpen, title: 'Category Explorer', desc: 'Browse and receive quotes from any category.' },
  { icon: Crown, title: 'Premium Experience', desc: 'Ad-free browsing with an elevated dashboard.' },
  { icon: Sparkles, title: 'Ad-Free Experience', desc: 'Enjoy an uninterrupted, clean experience.' },
];

const FAQ_ITEMS = [
  { q: 'How does automatic renewal work?', a: 'Your subscription auto-renews at the end of each billing cycle via your default payment method. You can cancel anytime.' },
  { q: 'Can I cancel my subscription?', a: 'Yes. Cancel anytime from the Manage Subscription portal. Your benefits continue until the end of the current billing period.' },
  { q: 'How do I upgrade my plan?', a: 'Free-plan users can upgrade to Premium from the pricing page. Premium subscribers are already on the best plan.' },
  { q: 'What payment methods are accepted?', a: 'All major credit and debit cards through Stripe, our secure payment processor.' },
];

// Resolve price dynamically from the backend plans configuration.
// /subscriptions/plans returns the live Stripe Price attached to the active
// subscription price ID (single source of truth). No hardcoded fallback —
// if the backend cannot resolve a price, we display "—" rather than a guess.
function resolvePrice(subscription, plans) {
  if (!subscription || subscription.subscriptionType !== 'subscriber') return null;
  const plan = Array.isArray(plans)
    ? plans.find((p) => p.name === 'subscriber')
    : null;
  if (plan?.price == null) return null;
  return {
    amount: '$' + Number(plan.price).toFixed(2),
    cycle: plan.interval === 'year' ? '/year' : '/month',
  };
}

export default function SubscriptionPage() {
  const { data: dashboard } = useDashboardOverview();
  const { user } = useAuthStore();
  const { mySubscriptions, fetchMySubscriptions, plans, fetchPlans } = useSubscriptionStore();
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => { if (user) { fetchMySubscriptions(); fetchPlans(); } }, [user, fetchMySubscriptions, fetchPlans]);

  const subscription = useMemo(() => {
    const subs = Array.isArray(mySubscriptions) ? mySubscriptions : [];
    return subs.find((s) => ['active', 'trialing', 'past_due'].includes(s.status)) || null;
  }, [mySubscriptions]);

  const isPremium = !!subscription;
  const status = subscription?.status || 'inactive';
  const planType = subscription?.subscriptionType || 'free';
  const cancelAtPeriodEnd = subscription?.cancelAtPeriodEnd || false;
  const currentPeriodEnd = subscription?.currentPeriodEnd;
  const price = resolvePrice(subscription, plans);

  const totalQuotes = dashboard?.statistics?.totalQuotesReceived || 0;
  const scans = dashboard?.statistics?.scans || 0;
  const streak = dashboard?.streak?.current || 0;

  // "Download Invoice" opens the Stripe Billing Portal which has
  // full invoice history, payment methods, and downloads.
  const handleManageSubscription = useCallback(async () => {
    setPortalLoading(true);
    try {
      const result = await premiumService.createPortalSession();
      if (result.success && result.data?.url) window.location.href = result.data.url;
      else toast.error(result.message || 'Failed to open billing portal');
    } catch { toast.error('Failed to open billing portal.'); }
    finally { setPortalLoading(false); }
  }, []);

  const handleDownloadInvoice = useCallback(async () => {
    try {
      const result = await premiumService.getLatestInvoice();
      if (!result.success) {
        toast.error(result.message || 'Failed to fetch invoice');
        return;
      }
      const { invoicePdf, hostedInvoiceUrl } = result.data || {};
      const target = invoicePdf || hostedInvoiceUrl;
      if (target) {
        window.open(target, '_blank');
      } else {
        toast('No invoice is available for this billing period.', { icon: '📄' });
      }
    } catch {
      toast.error('Failed to download invoice. Please try again.');
    }
  }, []);

  const StatusBadge = () => {
    const isActive = status === 'active' || status === 'trialing';
    const colors = isActive
      ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400 shadow-[0_0_16px_-4px_rgba(52,211,153,0.3)]'
      : status === 'past_due'
        ? 'border-amber-500/30 bg-amber-500/15 text-amber-400 shadow-[0_0_16px_-4px_rgba(251,191,36,0.3)]'
        : 'border-red-500/30 bg-red-500/15 text-red-400 shadow-[0_0_16px_-4px_rgba(248,113,113,0.3)]';
    const dot = isActive ? 'bg-emerald-400' : status === 'past_due' ? 'bg-amber-400' : 'bg-red-400';
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold capitalize backdrop-blur-md ${colors}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dot} shadow-[0_0_6px_currentColor]`} />
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-5 sm:space-y-6">

        {/* ===== 1. MERGED HERO ===== */}
        <section className={`${GLASS_CARD} relative overflow-hidden p-6 sm:p-8 md:p-10`}>
          <CardGlow />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left: title + badge + description */}
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/20 to-accent/5 shadow-[0_0_24px_-4px_rgba(253,182,92,0.25)] ring-1 ring-accent/20">
                <Crown size={20} className="text-accent" />
              </span>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-[24px] sm:text-[30px] md:text-[36px] leading-[1.12] font-semibold tracking-tight text-foreground">
                    {isPremium ? 'Premium Member' : 'Free Plan'}
                  </h1>
                  {isPremium && <StatusBadge />}
                </div>
                <p className="mt-1.5 text-[13px] sm:text-[14px] text-foreground-secondary max-w-md">
                  {isPremium
                    ? `Active until ${fmtDate(currentPeriodEnd)}${cancelAtPeriodEnd ? ' — cancels at period end' : ''}`
                    : 'Unlock unlimited inspiration, all categories, and a premium ad-free experience.'}
                </p>
              </div>
            </div>

            {/* Center: plan details */}
            {isPremium && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-tertiary">Plan</span>
                  <p className="font-semibold text-foreground capitalize">{planType}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-tertiary">Status</span>
                  <p className={`font-medium capitalize ${status === 'active' || status === 'trialing' ? 'text-emerald-400' : 'text-amber-400'}`}>{status.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-tertiary">Renewal</span>
                  <p className="font-medium text-foreground">{fmtDate(currentPeriodEnd)}</p>
                </div>
              </div>
            )}

            {/* Right: button */}
            {isPremium && (
              <button onClick={handleManageSubscription} disabled={portalLoading}
                className="group relative inline-flex shrink-0 cursor-pointer items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-accent to-accent/85 px-5 py-2.5 text-[13px] font-semibold text-accent-foreground shadow-[0_8px_24px_-8px_rgba(253,182,92,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(253,182,92,0.6)] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                {portalLoading ? <RefreshCw size={15} className="animate-spin" /> : <CreditCard size={15} />}
                {portalLoading ? 'Opening...' : 'Manage Subscription'}
              </button>
            )}
          </div>
        </section>

        {/* ===== 2. PREMIUM MEMBERSHIP (Benefits + Insights merged) ===== */}
        <section className={`${GLASS_CARD} relative overflow-hidden p-6 sm:p-8`}>
          <CardGlow />
          <div className="relative z-10 space-y-6">
            {/* Title */}
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-accent/25 bg-accent/10 shadow-[0_0_16px_rgba(253,182,92,0.12)]">
                <Star size={13} className="text-accent" />
              </span>
              <h2 className="text-[15px] font-semibold tracking-tight text-foreground">Premium Membership</h2>
            </div>

            {/* 4 benefit cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {BENEFITS.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className="group relative cursor-default rounded-2xl border border-white/6 bg-background-secondary/30 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-background-secondary/50 light:border-[#E8DFCE]/60 light:bg-white/50">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 border border-accent/25 transition-transform duration-300 group-hover:scale-105">
                      <Icon size={16} className="text-accent" />
                    </span>
                    <h3 className="mt-2.5 text-[13px] font-semibold text-foreground">{b.title}</h3>
                    <p className="mt-1 text-[12px] leading-relaxed text-foreground-tertiary">{b.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Compact insights row */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-4 border-t border-white/6 light:border-[#E8DFCE]/70">
              <InsightMetric icon={RefreshCw} label="Reading Streak" value={`${streak}d`} color="text-emerald-400" />
              <InsightMetric icon={BookOpen} label="Quotes Received" value={totalQuotes} color="text-violet-400" />
              <InsightMetric icon={Scan} label="Scan Count" value={scans} color="text-blue-400" />
            </div>
          </div>
        </section>

        {/* ===== 3. BILLING (Full width) ===== */}
        {isPremium && (
          <section className={`${GLASS_CARD} relative overflow-hidden p-6 sm:p-8`}>
            <CardGlow />
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-blue-500/25 bg-blue-500/10 shadow-[0_0_16px_rgba(96,165,250,0.12)]">
                  <CreditCard size={13} className="text-blue-400" />
                </span>
                <h2 className="text-[15px] font-semibold tracking-tight text-foreground">Billing</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
                <BillingField label="Plan" value={`${planType === 'subscriber' ? 'Premium' : planType}`} />
                <BillingField label="Price" value={price ? `${price.amount}${price.cycle}` : '—'} />
                <BillingField label="Renewal Date" value={fmtDate(currentPeriodEnd)} />
                <BillingField label="Auto Renewal" value={cancelAtPeriodEnd ? 'Off' : 'On'} />
                <BillingField label="Billing Cycle" value="Monthly" />
                <BillingField label="Payment Method" value={<span className="text-foreground-tertiary italic">Managed via Stripe</span>} />
                <BillingField label="Next Invoice" value={fmtDate(currentPeriodEnd)} />
                <BillingField label="Status" value={<span className={`font-medium capitalize ${status === 'active' || status === 'trialing' ? 'text-emerald-400' : 'text-amber-400'}`}>{status.replace(/_/g, ' ')}</span>} />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={handleManageSubscription} disabled={portalLoading}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-background-secondary/50 px-5 py-2 text-[12px] font-medium text-foreground-secondary transition-all duration-300 hover:border-accent/30 hover:text-foreground hover:bg-accent/5 active:scale-95 light:border-[#E8DFCE]/70 light:bg-white/70">
                  <ExternalLink size={12} /> Manage Subscription
                </button>
                <button onClick={handleDownloadInvoice}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-background-secondary/50 px-5 py-2 text-[12px] font-medium text-foreground-secondary transition-all duration-300 hover:border-accent/30 hover:text-foreground hover:bg-accent/5 active:scale-95 light:border-[#E8DFCE]/70 light:bg-white/70">
                  Download Invoice
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ===== 4. FAQ ===== */}
        <section className={`${GLASS_CARD} relative overflow-hidden p-6 sm:p-8`}>
          <CardGlow />
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-primary/25 bg-primary/10 shadow-[0_0_16px_rgba(168,85,247,0.12)]">
                <MessageCircle size={13} className="text-primary dark:text-violet-400" />
              </span>
              <h2 className="text-[15px] font-semibold tracking-tight text-foreground">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-2">
              {FAQ_ITEMS.map((faq, i) => <FAQItem key={i} question={faq.q} answer={faq.a} />)}
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}

// ===== Shared mini-components =====

function InsightMetric({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-background-tertiary/60`}>
        <Icon size={14} className={color} />
      </span>
      <div>
        <p className="text-[11px] font-medium text-foreground-tertiary">{label}</p>
        <p className="text-[15px] font-semibold tracking-tight text-foreground">{value}</p>
      </div>
    </div>
  );
}

function BillingField({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground-tertiary mb-1">{label}</p>
      <p className="text-[13px] font-medium text-foreground">{value}</p>
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-white/6 bg-background-secondary/30 transition-colors duration-200 hover:bg-background-secondary/50 light:border-[#E8DFCE]/70 light:bg-white/50">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer">
        <span className="text-[13px] font-medium text-foreground">{question}</span>
        {open ? <ChevronUp size={14} className="shrink-0 text-foreground-tertiary" /> : <ChevronDown size={14} className="shrink-0 text-foreground-tertiary" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ maxHeight: 0, opacity: 0 }} animate={{ maxHeight: 200, opacity: 1 }} exit={{ maxHeight: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }} className="overflow-hidden">
            <p className="px-4 pb-3 text-[13px] leading-relaxed text-foreground-secondary">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
