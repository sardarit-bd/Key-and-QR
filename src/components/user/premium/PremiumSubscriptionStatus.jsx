'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Crown, ExternalLink, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Premium Subscription Status
 */
export default function PremiumSubscriptionStatus({
  isPremium,
  subscriptionStatus,
  onCreatePortal,
}) {
  const [portalLoading, setPortalLoading] = useState(false);

  const handleManageSubscription = async () => {
    if (!onCreatePortal || portalLoading) return;
    setPortalLoading(true);
    try {
      await onCreatePortal();
    } finally {
      setPortalLoading(false);
    }
  };

  if (!subscriptionStatus) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <XCircle className="w-5 h-5 text-foreground-tertiary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Subscription Status</p>
            <p className="text-foreground font-medium">No Active Subscription</p>
          </div>
        </div>
      </div>
    );
  }

  const isActive = subscriptionStatus.status === 'active' || subscriptionStatus.status === 'trialing';
  const isCancelled = subscriptionStatus.cancelAtPeriodEnd;
  const endDate = subscriptionStatus.currentPeriodEnd
    ? format(new Date(subscriptionStatus.currentPeriodEnd), 'MMM d, yyyy')
    : 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isActive ? 'bg-emerald-500/10' : 'bg-amber-500/10'
          }`}>
            {isActive ? (
              <Crown className="w-6 h-6 text-emerald-400" />
            ) : (
              <Clock className="w-6 h-6 text-amber-400" />
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Subscription Status</p>
            <div className="flex items-center gap-2">
              <p className="text-foreground font-medium">
                {isActive ? 'Active' : 'Inactive'}
              </p>
              {isActive && (
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                  {subscriptionStatus.type || 'Premium'}
                </span>
              )}
              {isCancelled && isActive && (
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">
                  Cancels at period end
                </span>
              )}
            </div>
          </div>
        </div>

        {isActive && (
          <div className="flex flex-col items-end gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Valid Until</p>
              <p className="text-sm text-foreground font-medium">{endDate}</p>
            </div>
            {onCreatePortal && (
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent bg-accent/10 border border-accent/20 rounded-lg hover:bg-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {portalLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <ExternalLink className="w-3 h-3" />
                )}
                Manage Subscription
              </button>
            )}
          </div>
        )}
      </div>

      {/* Status indicators */}
      <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          {isActive ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <XCircle className="w-4 h-4 text-foreground-tertiary" />
          )}
          <span className={`text-xs ${isActive ? 'text-emerald-400' : 'text-foreground-tertiary'}`}>
            {isActive ? 'Active Subscription' : 'No Active Subscription'}
          </span>
        </div>

        {isActive && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-blue-400">
              {isCancelled ? 'Cancels at period end' : 'Auto-renews'}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
