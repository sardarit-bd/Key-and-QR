export default function PremiumSection() {
  return (
    <section className="flex items-center justify-center bg-white py-20 px-4">
      <div className="w-full max-w-md text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1 text-sm text-gray-700 mb-6">
          <span className="text-base">👑</span>
          <span>Premium Membership</span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">
          Unlock Premium Quotes
        </h2>

        {/* Subtitle */}
        <p className="text-gray-500 mb-8">
          Get access to hundreds of categorized quotes for only $2.99/month
        </p>

        {/* Card */}
        <div className="rounded-xl border border-gray-200 p-8 shadow-sm">
          
          {/* Price */}
          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">$2.99</span>
            <span className="text-gray-500">/month</span>
            <p className="text-sm text-gray-500 mt-1">
              Cancel anytime, no commitment
            </p>
          </div>

          {/* Features */}
          <ul className="space-y-3 text-left mb-8">
            {[
              "Access to all premium quote categories",
              "Hundreds of curated motivational quotes",
              "New quotes added weekly",
              "Ad-free experience",
              "Priority customer support",
              "Exclusive quote collections",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-700">
                <span className="mt-1 h-4 w-4 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button className="w-full rounded-lg bg-gray-900 py-3 text-white font-medium hover:bg-gray-800 transition">
            Start Premium Trial – 7 Days Free
          </button>

          {/* Footer text */}
          <p className="mt-4 text-xs text-gray-500">
            Then $2.99/month. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
