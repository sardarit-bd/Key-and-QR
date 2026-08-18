/**
 * Share Utilities
 * Centralized helpers for quote artwork selection, formatting, and downloading
 */

/**
 * Resolves the best available high-resolution artwork URL for a quote.
 * Order of preference:
 * 1. renderedImages.desktop.url
 * 2. renderedImages.mobile.url
 * 3. image (string or object.url)
 * 4. Fallback null
 */
export function getBestShareArtwork(quote) {
  if (!quote) return null;

  if (quote.renderedImages?.desktop?.url) {
    return quote.renderedImages.desktop.url;
  }
  if (quote.quote?.renderedImages?.desktop?.url) {
    return quote.quote.renderedImages.desktop.url;
  }

  if (quote.renderedImages?.mobile?.url) {
    return quote.renderedImages.mobile.url;
  }
  if (quote.quote?.renderedImages?.mobile?.url) {
    return quote.quote.renderedImages.mobile.url;
  }

  if (typeof quote.image === "string" && quote.image.trim() !== "") {
    return quote.image;
  }
  if (quote.image?.url) {
    return quote.image.url;
  }
  if (quote.quote?.image?.url) {
    return quote.quote.image.url;
  }

  return null;
}

/**
 * Builds the public canonical share URL.
 */
export function getPublicShareUrl(data) {
  if (!data) return typeof window !== "undefined" ? window.location.origin : "";

  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "https://myinspiretag.com";

  if (data.type === "tag" && data.tagCode) {
    return `${origin}/t/${data.tagCode}`;
  }

  const quoteId = data.quoteId || data._id || data.id;
  if (quoteId) {
    return `${origin}/q/${quoteId}`;
  }

  if (data.tagCode) {
    return `${origin}/t/${data.tagCode}`;
  }

  return origin;
}

/**
 * Formats clean share text.
 * Format: "Quote text" — Author
 */
export function formatShareText(quote) {
  const text = quote?.text || quote?.quote || "";
  const author = quote?.author;

  if (!text) return "MyInspireTag — Daily Inspiration";

  if (author && author.trim() && author !== "InspireTag" && author !== "MyInspireTag") {
    return `"${text}" — ${author}`;
  }

  return `"${text}"`;
}

/**
 * Downloads a quote artwork image to the user's device.
 */
export async function downloadQuoteArtwork(imageUrl, filename = "myinspiretag-inspiration.webp") {
  if (!imageUrl) {
    throw new Error("No artwork URL available to download");
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch image data");
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up blob URL after a short delay
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}
