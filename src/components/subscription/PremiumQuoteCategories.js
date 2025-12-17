export default function PremiumQuoteCategories() {
  const categories = [
    {
      title: "Motivation",
      desc: "Stay driven with quotes that spark your ambition and push you forward.",
      icon: "🚀",
    },
    {
      title: "Love",
      desc: "Discover words that warm your heart and celebrate meaningful connections.",
      icon: "💞",
    },
    {
      title: "Gratitude",
      desc: "Find calm and appreciation through quotes that remind you to cherish life’s blessings.",
      icon: "🙏",
    },
    {
      title: "Faith",
      desc: "Uplifting thoughts to strengthen your spirit and renew your sense of hope.",
      icon: "✨",
    },
    {
      title: "Joy",
      desc: "Spread smiles with quotes that celebrate positivity and simple joys.",
      icon: "🎉",
    },
    {
      title: "Random",
      desc: "Let fate pick your quote — a fresh dose of inspiration every time.",
      icon: "🎲",
    },
  ];

  return (
    <section className="bg-white py-20 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Heading */}
        <h2 className="text-center text-2xl font-semibold text-gray-900 mb-12">
          Premium Quote Categories
        </h2>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((item, index) => (
            <div
              key={index}
              className="rounded-xl bg-gray-50 p-6 transition hover:shadow-md"
            >
              {/* Icon */}
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-lg shadow-sm">
                {item.icon}
              </div>

              {/* Title */}
              <h3 className="mb-2 text-base font-semibold text-gray-900">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
