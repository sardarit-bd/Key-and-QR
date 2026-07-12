"use client";

import {
  Heart,
  Share2,
  MoreVertical,
  Copy,
  BookmarkCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function QuoteCard({
  quote,
  isFavorite = false,
  isSaving = false,
  onToggleFavorite,
}) {
  const handleCopy = () => {
    navigator.clipboard.writeText(`"${quote.text}" — ${quote.author}`);
    toast.success("Quote copied!");
  };

  const handleShare = async () => {
    const shareText = `"${quote.text}" — ${quote.author}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "InspireTag Quote",
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#121526] transition-all duration-300 hover:border-white/20">
      <div
        className="relative flex min-h-[260px] flex-col items-center justify-center bg-cover bg-center p-8 text-center"
        style={{
          backgroundImage: quote.image?.url
            ? `url(${quote.image.url})`
            : "none",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#090b14]/80 via-[#090b14]/70 to-[#121526]" />

        <p className="relative z-10 text-xl font-medium leading-relaxed text-white">
          “{quote.text}”
        </p>

        <span className="relative z-10 mt-6 text-sm text-gray-300">
          — {quote.author || "InspireTag"}
        </span>

        {quote.category && (
          <span className="relative z-10 mt-3 rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
            {quote.category}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/5 px-5 py-3">
        <Button
          variant="ghost"
          size="icon"
          disabled={isSaving}
          onClick={onToggleFavorite}
          className={
            isFavorite
              ? "text-rose-500 hover:bg-rose-500/10"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }
        >
          {isFavorite ? (
            <BookmarkCheck className="h-5 w-5 fill-current" />
          ) : (
            <Heart className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          className="text-gray-400 hover:bg-white/5 hover:text-white"
        >
          <Share2 className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="border-white/10 bg-[#121526] text-gray-200"
          >
            <DropdownMenuItem
              onClick={handleCopy}
              className="cursor-pointer hover:bg-white/5"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Quote
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleShare}
              className="cursor-pointer hover:bg-white/5"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Quote
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}