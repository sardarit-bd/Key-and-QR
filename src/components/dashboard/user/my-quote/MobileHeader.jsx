"use client";

import { Menu, ChevronDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import MyQuoteFilters from './MyQuoteFilters';

export default function MobileHeader({ filters }) {
  return (
    <div className="flex md:hidden items-center justify-between py-2 mb-2">
      <div className="flex items-center gap-3">
        <Menu className="w-6 h-6 text-white" />
        <h1 className="text-xl font-semibold text-white">My Quotes</h1>
      </div>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="text-[13px] text-gray-400 font-medium hover:text-white hover:bg-white/5">
            <Filter className="w-3 h-3 mr-1.5" /> Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="bg-[#121526] border-t-white/10 text-white rounded-t-2xl">
          <SheetHeader className="mb-4 text-left">
            <SheetTitle className="text-white">Filter Quotes</SheetTitle>
          </SheetHeader>
          <MyQuoteFilters filters={filters} />
        </SheetContent>
      </Sheet>
    </div>
  );
}