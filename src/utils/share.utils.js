/**
 * Share Utilities
 * Centralized helpers for quote artwork selection, formatting, and downloading
 */

/**
 * Helper to safely extract a valid HTTPS/HTTP image URL from various data structures
 */
function extractValidImageUrl(source) {
  if (!source) return null;
  if (typeof source === "string") {
    const trimmed = source.trim();
    if (
      (trimmed.startsWith("https://") ||
        trimmed.startsWith("http://") ||
        trimmed.startsWith("data:")) &&
      !trimmed.includes("undefined") &&
      !trimmed.includes("null")
    ) {
      return trimmed;
    }
    return null;
  }
  if (typeof source === "object") {
    if (source.url && typeof source.url === "string") {
      return extractValidImageUrl(source.url);
    }
    if (source.source) {
      return extractValidImageUrl(source.source);
    }
  }
  return null;
}

/**
 * Resolves the best available valid artwork URL for a quote.
 * Order of preference:
 * 1. Existing valid rendered desktop artwork URL
 * 2. Existing valid rendered mobile artwork URL
 * 3. Visual Quote Editor image elements (used by Dashboard & Visual Quote Renderer)
 * 4. Direct quote image URL (Cloudinary or public HTTPS)
 * 5. Visual Quote Editor background
 * 6. Null if no valid remote/uploaded artwork exists
 */
export function getBestShareArtwork(quote) {
  if (!quote) return null;

  const editorData = quote.editorData || quote.quote?.editorData;

  const candidates = [
    // 1. Rendered Cloudinary artwork
    quote.renderedImages?.desktop?.url,
    quote.quote?.renderedImages?.desktop?.url,
    quote.renderedImages?.mobile?.url,
    quote.quote?.renderedImages?.mobile?.url,

    // 2. Visual Quote Editor image elements (matches Dashboard & VisualQuoteRenderer)
    editorData?.desktop?.elements?.find((e) => e.type === "image")?.imageData?.source,
    editorData?.mobile?.elements?.find((e) => e.type === "image")?.imageData?.source,
    editorData?.elements?.find((e) => e.type === "image")?.imageData?.source,

    // 3. Direct quote image
    quote.image,
    quote.quote?.image,
    quote.imageUrl,
    quote.backgroundImage,

    // 4. Visual Quote Editor background
    editorData?.desktop?.background,
    editorData?.mobile?.background,
    editorData?.background,
  ];

  for (const item of candidates) {
    const validUrl = extractValidImageUrl(item);
    if (validUrl) {
      return validUrl;
    }
  }

  return null;
}

/**
 * Builds the public canonical share URL.
 */
export function getPublicShareUrl(data) {
  if (!data) {
    if (typeof window !== "undefined" && window.location.origin) {
      return window.location.origin;
    }
    return "https://myinspiretag.com";
  }

  let origin = "";
  if (typeof window !== "undefined" && window.location.origin) {
    origin = window.location.origin;
  } else {
    origin =
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://myinspiretag.com";
  }

  // In production builds, avoid localhost fallbacks
  if (process.env.NODE_ENV === "production" && origin.includes("localhost")) {
    origin = "https://myinspiretag.com";
  }

  // 1. When quoteId exists, always generate the public read-only quote URL /q/:id
  const quoteId = data.quoteId || data._id || data.id;
  if (quoteId) {
    return `${origin}/q/${quoteId}`;
  }

  // 2. Physical tag URL /t/:tagCode is only used if no quote ID exists (e.g. MyQR link)
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

  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}
