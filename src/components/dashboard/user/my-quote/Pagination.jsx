"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-8 py-4">
      <Button 
        variant="ghost" 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="text-gray-500 hover:text-white hover:bg-white/5"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
      </Button>

      <div className="hidden sm:flex items-center gap-1.5">
        {[...Array(totalPages)].map((_, i) => {
          const page = i + 1;
          // Simple pagination logic: show first, last, and current +/- 1
          if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                onClick={() => onPageChange(page)}
                className={`w-9 h-9 p-0 ${currentPage === page ? 'bg-violet-600 text-white hover:bg-violet-700' : 'text-gray-400 hover:bg-white/5'}`}
              >
                {page}
              </Button>
            );
          } else if (page === currentPage - 2 || page === currentPage + 2) {
            return <span key={page} className="w-9 h-9 flex items-center justify-center text-gray-500">...</span>;
          }
          return null;
        })}
      </div>

      <Button 
        variant="outline" 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="border-white/10 bg-transparent text-gray-300 hover:bg-white/5 hover:text-white"
      >
        Next <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}