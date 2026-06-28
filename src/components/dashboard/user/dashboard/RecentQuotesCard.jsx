'use client';

import Card from './Card';
import QuoteItem from './QuoteItem';

export default function RecentQuotesCard({ quotes }) {
  return (
    <Card className="p-4 sm:p-5 md:p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
        <h2 className="text-lg sm:text-xl font-serif text-white">
          Your Recent Quotes
        </h2>
        <button className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg border border-[#1e2235] text-gray-300 text-[11px] sm:text-xs font-medium hover:bg-[#1a1d29] transition-colors whitespace-nowrap">
          View All
        </button>
      </div>
      
      <div className="space-y-2 sm:space-y-3 flex-1">
        {quotes.map((quote) => (
          <QuoteItem key={quote.id} quote={quote} />
        ))}
      </div>
    </Card>
  );
}