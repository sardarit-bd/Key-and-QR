'use client';

import { useRouter } from 'next/navigation';
import { Quote as QuoteIcon } from 'lucide-react';
import Card from './Card';
import QuoteItem from './QuoteItem';

export default function RecentQuotesCard({ quotes }) {
 const router = useRouter();

 const handleViewAll = () => {
  router.push('/new-dashboard/user/my-quotes');
 };

 return (
 <Card className="p-4 sm:p-5 md:p-6 h-full flex flex-col">
 <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6 gap-2">
 {/* Added truncate min-w-0 for mobile overflow protection */}
 <h2 className="text-lg sm:text-xl text-foreground truncate min-w-0">
  Your Recent Quotes
 </h2>
 <button
  onClick={handleViewAll}
  className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg border border-border text-foreground-secondary text-[11px] sm:text-xs font-medium hover:bg-muted transition-colors whitespace-nowrap flex-shrink-0"
 >
  View All
 </button>
 </div>

 <div className="space-y-2 sm:space-y-3 flex-1">
 {quotes.length > 0 ? quotes.map((quote) => (
  <QuoteItem key={quote.id} quote={quote} />
 )) : (
  <div className="flex flex-col items-center justify-center py-10 text-center">
  <QuoteIcon className="w-8 h-8 text-muted-foreground/50 mb-3" />
  <p className="text-foreground-secondary text-sm">No quotes yet</p>
  <p className="text-foreground-tertiary text-xs mt-1">
  Scan your tag or pick a category to receive your first inspiration.
  </p>
  </div>
 )}
 </div>
 </Card>
 );
}
