"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import api from "@/lib/api";

import MobileHeader from "@/components/dashboard/user/my-quote/MobileHeader";
import MyQuoteFilters from "@/components/dashboard/user/my-quote/MyQuoteFilters";
import MyQuoteStats from "@/components/dashboard/user/my-quote/MyQuoteStats";
import QuoteGrid from "@/components/dashboard/user/my-quote/QuoteGrid";
import BottomNavigation from "@/components/dashboard/user/my-quote/BottomNavigation";

export default function MyQuotePage() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [category, setCategory] = useState("random");
  const [favoriteCount] = useState(0);

  const fetchQuote = async (selectedCategory = "random") => {
    try {
      setLoading(true);
      setError(false);

      const res = await api.get("/quotes/random", {
        params: {
          category: selectedCategory,
        },
      });

      const data = res.data?.data || res.data;

      setQuote({
        id: data._id,
        text: data.text,
        author: data.author || "InspireTag",
        category: data.category,
        image: data.image,
      });
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote(category);
  }, [category]);

  const filters = {
    search: "",
    setSearch: () => {},
    category,
    setCategory,
    sort: "newest",
    setSort: () => {},
    view: "grid",
    handleViewChange: () => {},
  };

  return (
    <div className="min-h-screen bg-[#090b14] pb-24 font-sans text-white md:pb-0 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        <MobileHeader filters={filters} />

        <div className="hidden md:flex flex-col gap-6">
          <MyQuoteFilters filters={filters} />

          <MyQuoteStats
            favoriteCount={favoriteCount}
            currentCategory={category}
          />
        </div>

        {error ? (
          <Alert className="border-red-500/20 bg-red-500/10 text-red-400">
            <AlertCircle className="h-4 w-4" />

            <AlertTitle>Error</AlertTitle>

            <AlertDescription className="flex items-center justify-between">
              Failed to load quote.

              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchQuote(category)}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <QuoteGrid
            quote={quote}
            isLoading={loading}
            onResetFilters={() => {
              setCategory("random");
            }}
          />
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}