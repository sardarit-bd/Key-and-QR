"use client";

/**
 * SpecificationPanel — brand, category, availability (all from backend).
 */
export default function SpecificationPanel({ product }) {
  const isOutOfStock = product.stock <= 0;

  const rows = [
    { label: "Brand", value: product.brand || "Sardar IT" },
    { label: "Category", value: product.category },
    {
      label: "Availability",
      value: isOutOfStock ? "Out of stock" : `${product.stock} in stock`,
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-bold tracking-tight text-[#2E2A24]">Specifications</h3>
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-4 border-b border-[#EDE4D0]/60 pb-3 last:border-b-0 last:pb-0"
          >
            <span className="text-[13px] text-[#8A7A5C]">{row.label}</span>
            <span className="text-[14px] font-medium text-[#2E2A24]">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
