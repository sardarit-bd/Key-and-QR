"use client";

import { SearchX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EmptyState({ onReset }) {
  return (
    <Card className="w-full bg-[#121526] border-white/5 rounded-2xl col-span-full">
      <CardContent className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <SearchX className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">No quotes found</h3>
        <p className="text-sm text-gray-400 max-w-sm mb-6">
          We couldn't find any quotes matching your current filters. Try adjusting your search or selecting a different category.
        </p>
        {onReset && (
          <Button onClick={onReset} variant="outline" className="border-white/10 text-gray-200 hover:bg-white/5 hover:text-white">
            Reset Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}