'use client';

import { useMemo, useRef, useState } from 'react';
import GreetingSection from './GreetingSection';
import WelcomeCard from './WelcomeCard';
import LatestInspirationCard from './LatestInspirationCard';
import CategorySection from './CategorySection';
import RecentQuotesCard from './RecentQuotesCard';
import InspirationStreak from './InspirationStreak';
import StatsSection from './StatsSection';
import ReceiveOverlay from './ReceiveOverlay';
import { useReceiveQuoteMutation, useReadAgainMutation, useReceivedQuoteHistory } from '@/hooks/received-quote/useReceivedQuote';
import { mapHistoryQuotes } from '@/utils/dashboard.utils';

/**
 * User Dashboard home — client-approved layout:
 * Greeting + Today's Inspiration (or Welcome) | Categories | Recent Quotes +
 * Streak | Statistics. Category clicks open the loading → reveal overlay.
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
  const receiveQuote = useReceiveQuoteMutation();
  const readAgain = useReadAgainMutation();

  // Real history for "Your Recent Quotes" (latest 5).
  const { data: historyData } = useReceivedQuoteHistory({ page: 1, limit: 5 });
  const historyQuotes = useMemo(() => mapHistoryQuotes(historyData?.data), [historyData]);

  const overlayCategoryRef = useRef(null);

  // Reveal state: null = closed, { quote } = revealing.
  const [revealState, setRevealState] = useState(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const hasReceivedQuote = latestInspiration?.hasReceivedQuote;

  // Flatten the backend payload (quote nested under .quote) onto the shape
  // ReceiveOverlay renders: top-level text/author/description/image/category/
  // favorite/favoriteId.
  const flattenQuotePayload = (payload) => {
    const q = payload?.quote || payload || {};
    return {
      _id: q._id,
      receivedQuoteId: payload?.receivedQuoteId || payload?._id,
      text: q.text,
      author: q.author || 'InspireTag',
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
        // Small delay so the loading messages are visible (~1s feel)
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

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      {/* Row 1: Greeting + Today's Inspiration / Welcome */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 min-h-[180px] sm:min-h-[200px] lg:min-h-[220px]">
        <GreetingSection greeting={greeting} user={user} subscription={subscription} />
        {hasReceivedQuote ? (
          <LatestInspirationCard
            inspiration={latestInspiration}
            onShare={handleShare}
            onReadAgain={() => latestInspiration?.id && handleReadAgain(latestInspiration.id)}
          />
        ) : (
          <WelcomeCard
            userName={user?.name}
            onReceive={handleReceiveFirst}
            isReceiving={receiveQuote.isPending}
          />
        )}
      </div>

      {/* Row 2: Explore Categories */}
      <section>
        <CategorySection
          categories={categories}
          onSelectCategory={handleSelectCategory}
          disabled={receiveQuote.isPending}
        />
      </section>

      {/* Row 3: Recent Quotes & Streak */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        <div className="xl:col-span-2">
          <RecentQuotesCard
            quotes={historyQuotes}
            onQuoteClick={(q) => handleReadAgain(q.receivedQuoteId)}
          />
        </div>
        <div className="xl:col-span-1">
          <InspirationStreak streak={streak} />
        </div>
      </div>

      {/* Row 4: Statistics */}
      <section>
        <StatsSection statistics={statistics} />
      </section>

      {/* Category receive → loading → reveal overlay */}
      <ReceiveOverlay
        isOpen={isOverlayOpen && revealState !== null}
        quote={revealState?.quote || null}
        categoryName={overlayCategoryRef.current}
        onClose={handleCloseOverlay}
      />
    </div>
  );
}
