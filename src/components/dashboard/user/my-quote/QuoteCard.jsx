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
    <Card className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/20">
      <div
        className="relative flex min-h-[260px] flex-col items-center justify-center bg-cover bg-center p-8 text-center"
        style={{
          backgroundImage: quote.image?.url
            ? `url(${quote.image.url})`
            : "none",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-card" />

        <p className="relative z-10 text-xl font-medium leading-relaxed text-foreground">
          "{quote.text}"
        </p>

        <span className="relative z-10 mt-6 text-sm text-foreground-secondary">
          — {quote.author || "InspireTag"}
        </span>

        {quote.category && (
          <span className="relative z-10 mt-3 rounded-full bg-muted px-3 py-1 text-xs text-foreground-secondary">
            {quote.category}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <Button
          variant="ghost"
          size="icon"
          disabled={isSaving}
          onClick={onToggleFavorite}
          className={
            isFavorite
              ? "text-rose-500 hover:bg-rose-500/10"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
          className="text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Share2 className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="border-border bg-popover text-popover-foreground"
          >
            <DropdownMenuItem
              onClick={handleCopy}
              className="cursor-pointer hover:bg-muted"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Quote
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleShare}
              className="cursor-pointer hover:bg-muted"
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
