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
        className="text-muted-foreground hover:text-foreground hover:bg-muted"
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
                className={`w-9 h-9 p-0 ${currentPage === page ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:bg-muted'}`}
              >
                {page}
              </Button>
            );
          } else if (page === currentPage - 2 || page === currentPage + 2) {
            return <span key={page} className="w-9 h-9 flex items-center justify-center text-muted-foreground">...</span>;
          }
          return null;
        })}
      </div>

      <Button 
        variant="outline" 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="border-border bg-transparent text-foreground hover:bg-muted hover:text-foreground"
      >
        Next <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
