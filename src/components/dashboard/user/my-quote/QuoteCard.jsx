"use client";

import { Heart, Share2, MoreVertical, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteQuoteMutation, useFavoriteMutation } from '@/hooks/user-dashboard/quotes/useQuotes';

export default function QuoteCard({ quote, view }) {
  const { mutate: toggleFavorite } = useFavoriteMutation();
  const { mutate: deleteQuote } = useDeleteQuoteMutation();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Quote',
          text: `"${quote.text}"`,
        });
      } catch (err) {
        // User cancelled share, ignore
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${quote.text}"`);
    toast.success("Quote copied to clipboard!"); // react-hot-toast এর syntax ব্যবহার করা হয়েছে
  };

  return (
    <Card className="group relative bg-[#121526] border-white/5 rounded-2xl md:rounded-2xl rounded-xl overflow-hidden flex flex-col hover:border-white/20 transition-all duration-300">
      
      <div 
        className={`relative ${view === 'list' ? 'h-32 md:h-40' : 'h-44 md:h-48'} p-4 md:p-6 flex flex-col items-center justify-center text-center bg-cover bg-center`}
        style={{ backgroundImage: `url(${quote.bgUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#090b14]/80 via-[#090b14]/60 to-[#121526]"></div>
        
        <p className={`relative z-10 font-serif ${view === 'list' ? 'text-sm md:text-lg' : 'text-[13px] md:text-xl'} font-medium text-gray-100 leading-snug drop-shadow-lg`}>
          “{quote.text}”
        </p>
        
        <span className="relative z-10 text-[10px] md:text-[11px] text-gray-300/80 mt-3 md:mt-4 font-medium uppercase tracking-wider">
          {quote.date}
        </span>
      </div>

      <div className="hidden md:flex items-center justify-between px-6 py-3 border-t border-white/5 bg-[#121526]">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => toggleFavorite(quote.id)}
          className={`hover:bg-rose-500/10 ${quote.isFavorite ? 'text-rose-500' : 'text-gray-400 hover:text-rose-400'}`}
        >
          <Heart className={`w-5 h-5 ${quote.isFavorite ? 'fill-current' : ''}`} />
          <span className="sr-only">Toggle Favorite</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleShare}
          className="text-gray-400 hover:text-white hover:bg-white/5"
        >
          <Share2 className="w-5 h-5" />
          <span className="sr-only">Share</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/5">
              <MoreVertical className="w-5 h-5" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#121526] border-white/10 text-gray-200">
            <DropdownMenuItem onClick={handleCopy} className="hover:bg-white/5 cursor-pointer">
              <Copy className="w-4 h-4 mr-2" /> Copy Quote
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare} className="hover:bg-white/5 cursor-pointer">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem 
              onClick={() => deleteQuote(quote.id)} 
              className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}