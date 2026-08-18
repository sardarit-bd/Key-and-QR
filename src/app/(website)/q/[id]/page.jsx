import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles, ShoppingBag, ArrowRight } from "lucide-react";
import PublicQuoteView from "@/components/quote/PublicQuoteView";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://key-and-qr-backend.vercel.app/api/v1"
    : "http://localhost:5001/api/v1");

async function getPublicQuote(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/quotes/public/${id}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error("Error fetching public quote for metadata/render:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const quote = await getPublicQuote(id);

  if (!quote) {
    return {
      title: "Inspiration | MyInspireTag",
      description: "Discover daily inspiration and uplifting messages with MyInspireTag.",
    };
  }

  const quoteText = quote.text || "Daily Inspiration";
  const author = quote.author && quote.author !== "InspireTag" ? quote.author : "MyInspireTag";
  const artworkUrl =
    quote.renderedImages?.desktop?.url ||
    quote.renderedImages?.mobile?.url ||
    (typeof quote.image === "string" ? quote.image : quote.image?.url) ||
    "/logo.png";

  const cleanTitle = `"${quoteText.length > 70 ? quoteText.slice(0, 67) + "..." : quoteText}" — ${author}`;

  return {
    title: `${cleanTitle} | MyInspireTag`,
    description: `"${quoteText}" — ${author}. Receive and share daily inspirational messages with MyInspireTag.`,
    openGraph: {
      title: cleanTitle,
      description: `Daily Inspiration from MyInspireTag: "${quoteText}"`,
      type: "article",
      images: [
        {
          url: artworkUrl,
          width: 1200,
          height: 630,
          alt: quoteText,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: cleanTitle,
      description: `Daily Inspiration: "${quoteText}" — ${author}`,
      images: [artworkUrl],
    },
  };
}

export default async function PublicQuotePage({ params }) {
  const { id } = await params;
  const quote = await getPublicQuote(id);

  if (!quote) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-between">
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto px-6 py-5 flex items-center justify-between border-b border-white/10 z-20">
        <Link href="/" className="flex items-center gap-2 text-white hover:opacity-85 transition">
          <Sparkles className="h-5 w-5 text-amber-400" />
          <span className="font-semibold text-base tracking-tight">MyInspireTag</span>
        </Link>
        <Link
          href="/shop"
          className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 transition"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Get Your Tag</span>
        </Link>
      </header>

      {/* Quote Display Area */}
      <section className="flex-1 w-full flex items-center justify-center p-4 sm:p-6 my-auto">
        <PublicQuoteView quote={quote} quoteId={id} />
      </section>

      {/* Footer Branding & Call to Action */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left z-20">
        <div>
          <p className="text-xs text-white/70">
            Powered by <span className="text-amber-400 font-medium">MyInspireTag</span> — Physical NFC/QR Daily Inspiration Tags.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 px-4 py-2 text-xs font-bold text-black shadow-lg transition"
          >
            <span>Explore Tags</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
