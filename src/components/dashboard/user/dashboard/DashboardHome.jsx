'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import GreetingSection from './GreetingSection';
import WelcomeCard from './WelcomeCard';
import LatestInspirationCard from './LatestInspirationCard';
import CategorySection from './CategorySection';
import LibrarySection from './LibrarySection';
import InspirationStreak from './InspirationStreak';
import YourStats from './YourStats';
import ReceiveOverlay from './ReceiveOverlay';
import { useReceiveQuoteMutation, useReadAgainMutation } from '@/hooks/received-quote/useReceivedQuote';
import useShareQuote from "@/hooks/useShareQuote";
import ShareQuoteModal from "@/components/quote/ShareQuoteModal";
import toast from 'react-hot-toast';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const receiveQuote = useReceiveQuoteMutation();
  const readAgain = useReadAgainMutation();
  const { isShareOpen, shareData, closeShare, shareQuote } = useShareQuote();

  const overlayCategoryRef = useRef(null);
  // Track whether the ?action=inspire trigger has already fired for this URL
  // to prevent double-fire during StrictMode double-invocations.
  const actionFiredRef = useRef(false);

  const [revealState, setRevealState] = useState(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [activeInspiration, setActiveInspiration] = useState(latestInspiration);

  // Consume pending quote saved during scan-page authentication
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedQuoteStr = localStorage.getItem("pending_dashboard_quote");
      if (savedQuoteStr) {
        const parsed = JSON.parse(savedQuoteStr);
        const isRecent = parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000;

        if (isRecent && (parsed.text || parsed.quote || parsed.renderedImages || parsed.editorData)) {
          const categorySlug =
            typeof parsed.category === "string" ? parsed.category.toLowerCase() : parsed.category?.slug || "faith";
          const categoryName =
            typeof parsed.category === "string" ? parsed.category : parsed.category?.name || "Faith";

          const preservedInspiration = {
            hasReceivedQuote: true,
            id: parsed._id || null,
            quoteId: parsed._id || null,
            text: parsed.text || parsed.quote || "",
            previewText: parsed.text || parsed.quote || "",
            author: parsed.author || "MyInspireTag",
            image: parsed.image || null,
            renderedImages: parsed.renderedImages || null,
            theme: parsed.theme || null,
            editorData: parsed.editorData || null,
            category: { name: categoryName, slug: categorySlug },
            receivedAt: parsed.timestamp ? new Date(parsed.timestamp).toISOString() : new Date().toISOString(),
            favorite: false,
            favoriteId: null,
            dailyUsage: dailyUsage || null,
          };
          setActiveInspiration(preservedInspiration);
        }
        // Immediately clean up from localStorage so it doesn't leak into subsequent sessions
        localStorage.removeItem("pending_dashboard_quote");
      }
    } catch (err) {
      console.error("Failed to restore pending scanned quote in dashboard:", err);
    }
  }, [dailyUsage]);

  // Sync if latestInspiration is updated from server
  useEffect(() => {
    if (latestInspiration?.hasReceivedQuote) {
      setActiveInspiration(latestInspiration);
    }
  }, [latestInspiration]);

  const currentInspiration = activeInspiration || latestInspiration;
  const hasReceivedQuote = Boolean(
    currentInspiration?.hasReceivedQuote ||
      currentInspiration?.text ||
      currentInspiration?.renderedImages ||
      currentInspiration?.editorData
  );

  const flattenQuotePayload = useCallback((payload) => {
    const q = payload?.quote || payload || {};
    return {
      _id: q._id,
      receivedQuoteId: payload?.receivedQuoteId || payload?._id,
      text: q.text,
      author: q.author || 'MyInspireTag',
      description: q.description || null,
      image: q.image || null,
      theme: q.theme || null,
      editorData: q.editorData || payload?.editorData || null,
      renderedImages: q.renderedImages || payload?.renderedImages || null,
      category: payload?.category || null,
      receivedAt: payload?.receivedAt || null,
      favorite: !!payload?.favorite,
      favoriteId: payload?.favoriteId || null,
    };
  }, []);

  const handleSelectCategory = useCallback((category) => {
    // Pre-flight daily limit check — prevents the overlay from opening only
    // to flash-close instantly when the backend returns 429.
    if (dailyUsage?.isLimitReached) {
      toast('Come back tomorrow for more inspiration ✨', {
        icon: '✨',
        style: { background: '#1e1e2e', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' },
      });
      return;
    }

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
  }, [dailyUsage, receiveQuote, flattenQuotePayload]);

  const handleReceiveFirst = useCallback(() => {
    handleSelectCategory({ slug: 'inspire', name: 'Inspiration' });
  }, [handleSelectCategory]);

  // Consume ?action=inspire from the BottomTabBar Inspire tap.
  // Fire once, then replace the URL to remove the param so it doesn't
  // re-trigger on subsequent renders or browser back navigation.
  useEffect(() => {
    if (searchParams?.get('action') === 'inspire' && !actionFiredRef.current) {
      actionFiredRef.current = true;
      handleReceiveFirst();
      // Strip the query param cleanly without adding a history entry.
      router.replace('/new-dashboard/user');
    }
    // Reset the guard whenever the param disappears (e.g. user navigates away and back)
    if (searchParams?.get('action') !== 'inspire') {
      actionFiredRef.current = false;
    }
  }, [searchParams, handleReceiveFirst, router]);

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

  const handleShare = () => {
    if (currentInspiration) {
      shareQuote(currentInspiration);
    }
  };

  const savedCount = statistics?.favorites ?? 0;
  const recentCount = statistics?.totalQuotes ?? 0;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10 space-y-6 sm:space-y-8 md:space-y-10"
    >
      {/* 1. Greeting */}
      <GreetingSection greeting={greeting} user={user} subscription={subscription} />

      {/* 2. Today's Quote — PRIMARY FOCUS */}
      {hasReceivedQuote ? (
        <LatestInspirationCard
          inspiration={currentInspiration}
          onInspire={handleReceiveFirst}
          onShare={handleShare}
          onReadAgain={() => currentInspiration?.id && handleReadAgain(currentInspiration.id)}
          isReceiving={receiveQuote.isPending}
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



      {/* 5. Inspiration Streak — full-width */}
      <InspirationStreak streak={streak} />

      {/* 4. Library */}
      <section className="w-full">
        <h2 className="text-[18px] sm:text-[19px] md:text-[20px] font-semibold tracking-tight text-foreground mb-4 sm:mb-5">
          Library
        </h2>
        <LibrarySection
          savedCount={savedCount}
          recentCount={recentCount}
        />
      </section>

      {/* 6. Your Stats — secondary, collapsible */}
      {/* <YourStats statistics={statistics} isPremium={subscription?.isPremium} /> */}

      {/* Category receive → loading → reveal overlay */}
      <ReceiveOverlay
        isOpen={isOverlayOpen && revealState !== null}
        quote={revealState?.quote || null}
        categoryName={overlayCategoryRef.current}
        onClose={handleCloseOverlay}
      />

      {/* Unified Share Quote Modal */}
      <ShareQuoteModal
        isOpen={isShareOpen}
        onClose={closeShare}
        quoteData={shareData}
      />
    </motion.div>
  );
}
