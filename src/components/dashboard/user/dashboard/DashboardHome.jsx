'use client';

import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import GreetingSection from './GreetingSection';
import WelcomeCard from './WelcomeCard';
import LatestInspirationCard from './LatestInspirationCard';
import CategorySection from './CategorySection';
import LibrarySection from './LibrarySection';
import InspirationStreak from './InspirationStreak';
import CompactStats from './CompactStats';
import ReceiveOverlay from './ReceiveOverlay';
import { useReceiveQuoteMutation, useReadAgainMutation } from '@/hooks/received-quote/useReceivedQuote';

/**
 * User Dashboard — redesigned hierarchy:
 * 1. Greeting (editorial, no card)
 * 2. Today's Quote (PRIMARY FOCUS, full-width)
 * 3. Explore Categories (compact card row)
 * 4. Your Library (two compact cards)
 * 5. Inspiration Streak (full-width clean card)
 * 6. Compact Stats (inline row)
 *
 * The quote is the hero. Everything else supports it.
 */
export default function DashboardHome({
  greeting,
  latestInspiration,
  streak,
  statistics,
  categories,
  user,
  subscription,
  dailyUsage,
}) {
  const reduceMotion = useReducedMotion();
  const receiveQuote = useReceiveQuoteMutation();
  const readAgain = useReadAgainMutation();

  const overlayCategoryRef = useRef(null);

  const [revealState, setRevealState] = useState(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const hasReceivedQuote = latestInspiration?.hasReceivedQuote;

  const flattenQuotePayload = (payload) => {
    const q = payload?.quote || payload || {};
    return {
      _id: q._id,
      receivedQuoteId: payload?.receivedQuoteId || payload?._id,
      text: q.text,
      author: q.author || 'MyInspireTag',
      description: q.description || null,
      image: q.image || null,
      theme: q.theme || null,
      category: payload?.category || null,
      receivedAt: payload?.receivedAt || null,
      favorite: !!payload?.favorite,
      favoriteId: payload?.favoriteId || null,
    };
  };

  const handleSelectCategory = (category) => {
    overlayCategoryRef.current = category?.name || 'Inspiration';
    setRevealState({ quote: null });
    setIsOverlayOpen(true);
    receiveQuote.mutate(category?.slug || 'inspire', {
      onSuccess: (quote) => {
        setTimeout(() => setRevealState({ quote: flattenQuotePayload(quote) }), 600);
      },
      onError: () => {
        setIsOverlayOpen(false);
        setRevealState(null);
      },
    });
  };

  const handleReceiveFirst = () => {
    handleSelectCategory({ slug: 'inspire', name: 'Inspiration' });
  };

  const handleReadAgain = (receivedQuoteId) => {
    readAgain.mutate(receivedQuoteId, {
      onSuccess: (data) => {
        overlayCategoryRef.current = data?.category?.name || 'Inspiration';
        setRevealState({ quote: flattenQuotePayload(data) });
        setIsOverlayOpen(true);
      },
    });
  };

  const handleCloseOverlay = () => {
    setIsOverlayOpen(false);
    setTimeout(() => setRevealState(null), 200);
  };

  const handleShare = async () => {
    const text = latestInspiration?.text
      ? `"${latestInspiration.text}" — ${latestInspiration.author}`
      : 'MyInspireTag — daily inspiration';
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // user cancelled or unsupported — ignore
    }
  };

  const handleGift = async () => {
    const text = latestInspiration?.text
      ? `A gift of inspiration for you:\n\n"${latestInspiration.text}"\n— ${latestInspiration.author}\n\nSent via MyInspireTag ❤️`
      : 'A gift of inspiration from MyInspireTag!';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'A gift of inspiration', text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // user cancelled or unsupported — ignore
    }
  };

  const savedCount = statistics?.favorites ?? 0;
  const recentCount = statistics?.totalQuotes ?? 0;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10 space-y-8 sm:space-y-10 md:space-y-12"
    >
      {/* 1. Greeting */}
      <GreetingSection greeting={greeting} user={user} subscription={subscription} />

      {/* 2. Today's Quote — PRIMARY FOCUS */}
      {hasReceivedQuote ? (
        <LatestInspirationCard
          inspiration={latestInspiration}
          onShare={handleShare}
          onGift={handleGift}
          onReadAgain={() => latestInspiration?.id && handleReadAgain(latestInspiration.id)}
        />
      ) : (
        <WelcomeCard
          userName={user?.name}
          onReceive={handleReceiveFirst}
          isReceiving={receiveQuote.isPending}
        />
      )}

      {/* 3. Explore Categories */}
      <CategorySection
        categories={categories}
        onSelectCategory={handleSelectCategory}
        disabled={receiveQuote.isPending}
      />

      {/* 4. Your Library */}
      <section className="w-full">
        <h2 className="text-[18px] sm:text-[19px] md:text-[20px] font-semibold tracking-tight text-foreground mb-4 sm:mb-5">
          Your Library
        </h2>
        <LibrarySection
          savedCount={savedCount}
          recentCount={recentCount}
        />
      </section>

      {/* 5. Inspiration Streak — full-width */}
      <InspirationStreak streak={streak} />

      {/* 6. Compact Statistics */}
      <CompactStats statistics={statistics} />

      {/* Category receive → loading → reveal overlay */}
      <ReceiveOverlay
        isOpen={isOverlayOpen && revealState !== null}
        quote={revealState?.quote || null}
        categoryName={overlayCategoryRef.current}
        onClose={handleCloseOverlay}
      />
    </motion.div>
  );
}
