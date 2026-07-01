"use client";

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuotesData, useQuoteStats } from '@/hooks/user-dashboard/quotes/useQuotes';
import MobileHeader from '@/components/dashboard/user/my-quote/MobileHeader';
import MyQuoteFilters from '@/components/dashboard/user/my-quote/MyQuoteFilters';
import MyQuoteStats from '@/components/dashboard/user/my-quote/MyQuoteStats';
import QuoteGrid from '@/components/dashboard/user/my-quote/QuoteGrid';
import Pagination from '@/components/dashboard/user/my-quote/Pagination';
import BottomNavigation from '@/components/dashboard/user/my-quote/BottomNavigation';
import { useQuoteFilters } from '@/hooks/user-dashboard/quotes/useQuoteFilters';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function MyQuotePage() {
  const filters = useQuoteFilters();
  
  const { data: quotesData, isLoading, isError, refetch } = useQuotesData({
    page: filters.page,
    search: filters.debouncedSearch,
    category: filters.category,
    sort: filters.sort,
  });

  const { data: statsData, isLoading: statsLoading } = useQuoteStats();

  return (
    <div className="min-h-screen bg-[#090b14] text-white p-4 md:p-6 lg:p-8 font-sans relative pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        
        <MobileHeader filters={filters} />

        <div className="hidden md:flex flex-col gap-6">
          <MyQuoteFilters filters={filters} />
          <MyQuoteStats stats={statsData} isLoading={statsLoading} />
        </div>

        {isError ? (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              Failed to load quotes.
              <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <QuoteGrid
              quotes={quotesData?.data || []} 
              isLoading={isLoading} 
              view={filters.view}
              onResetFilters={() => {
                filters.setSearch('');
                filters.setCategory('all');
              }}
            />

            <div className="hidden md:block">
              {quotesData?.totalPages > 1 && (
                <Pagination
                  currentPage={filters.page} 
                  totalPages={quotesData.totalPages} 
                  onPageChange={filters.setPage}
                />
              )}
            </div>
          </>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}