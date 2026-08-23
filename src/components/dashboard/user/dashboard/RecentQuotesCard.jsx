'use client';

import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { Quote as QuoteIcon, ArrowRight } from 'lucide-react';
import Card from './Card';
import QuoteItem from './QuoteItem';

export default function RecentQuotesCard({ quotes, onQuoteClick }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const handleViewAll = () => {
    router.push('/new-dashboard/user/favorites');
  };

  const handleClick = (quote) => {
    if (onQuoteClick && quote?.receivedQuoteId) {
      onQuoteClick(quote);
    }
  };

  return (
    <Card className="p-5 sm:p-6 md:p-7 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3">
        <div>
          <h2 className="text-lg sm:text-xl text-foreground truncate min-w-0 font-semibold tracking-tight">
            Your Recent Quotes
          </h2>
          <p className="text-[12px] text-foreground-tertiary mt-0.5">
            Your latest inspirations
          </p>
        </div>
        <button
          onClick={handleViewAll}
          className="group inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-white/8 bg-background-secondary/50 px-4 py-1.5 text-[12px] font-medium text-foreground-secondary transition-all duration-300 hover:border-accent/30 hover:text-foreground hover:bg-accent/5 active:scale-95"
        >
          View All
          <ArrowRight size={13} className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="space-y-2.5 sm:space-y-3 flex-1">
        {quotes.length > 0 ? (
          quotes.map((quote, index) => (
            <motion.button
              key={quote.id}
              onClick={() => handleClick(quote)}
              initial={reduceMotion ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduceMotion ? undefined : { y: -2, scale: 1.005 }}
              whileTap={reduceMotion ? undefined : { scale: 0.995 }}
              className="block w-full text-left cursor-pointer"
            >
              <QuoteItem quote={quote} />
            </motion.button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full bg-accent/10 blur-xl" />
              <QuoteIcon className="relative w-9 h-9 text-muted-foreground/60" />
            </div>
            <p className="text-foreground-secondary text-sm font-medium">No quotes yet</p>
            <p className="text-foreground-tertiary text-xs mt-1.5 max-w-[240px]">
              Pick a category to receive your first inspiration.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
