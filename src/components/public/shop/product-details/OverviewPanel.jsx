"use client";

/**
 * OverviewPanel — full product description.
 */
export default function OverviewPanel({ product }) {
  return (
    <div>
      <h3 className="text-lg font-bold tracking-tight text-[#2E2A24]">Overview</h3>
      <p className="mt-3 text-[14px] leading-relaxed text-[#5C5346]">
        {product.description}
      </p>
    </div>
  );
}
