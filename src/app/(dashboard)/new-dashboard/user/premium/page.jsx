'use client';

import { motion } from 'framer-motion';
import { PremiumCategorySelector, PremiumFeatureCard, PremiumLoadingSkeleton, PremiumQuoteDisplay, PremiumSubscriptionStatus, PremiumUpgradeCTA, PremiumWelcomeBanner } from '@/components/user/premium';
import usePremium from '@/hooks/premium/usePremium';


/**
 * Premium Dashboard Page
 * Route: /dashboard/premium
 */
export default function PremiumPage() {
  const {
    loading,
    isPremium,
    currentQuote,
    quoteLoading,
    selectedCategory,
    premiumFeatures,
    loadNewQuote,
    changeCategory,
    getSubscriptionStatus,
    user,
  } = usePremium();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090b14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <PremiumLoadingSkeleton />
        </div>
      </div>
    );
  }

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#090b14]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Welcome Banner */}
        <PremiumWelcomeBanner
          isPremium={isPremium}
          userName={user?.name}
          subscriptionStatus={subscriptionStatus}
        />

        {/* Subscription Status */}
        <div className="mt-6">
          <PremiumSubscriptionStatus
            isPremium={isPremium}
            subscriptionStatus={subscriptionStatus}
          />
        </div>

        {/* Premium Features */}
        {isPremium && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white mb-4">
              Premium Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {premiumFeatures.map((feature) => (
                <PremiumFeatureCard
                  key={feature.id}
                  feature={feature}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quote Display */}
        <div className="mt-8">
          <PremiumCategorySelector
            selectedCategory={selectedCategory}
            onCategoryChange={changeCategory}
            isPremium={isPremium}
          />
          
          <div className="mt-6">
            <PremiumQuoteDisplay
              quote={currentQuote}
              loading={quoteLoading}
              isPremium={isPremium}
              onLoadNew={loadNewQuote}
            />
          </div>
        </div>

        {/* Upgrade CTA for Free Users */}
        {!isPremium && (
          <div className="mt-8">
            <PremiumUpgradeCTA />
          </div>
        )}
      </div>
    </motion.div>
  );
}