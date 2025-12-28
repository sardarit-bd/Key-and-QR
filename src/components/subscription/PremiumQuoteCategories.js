import { Dice5, HandHeart, Handshake, PartyPopper, Rocket, Sparkles } from "lucide-react";

export default function PremiumQuoteCategories() {
  const categories = [
    {
      title: "Motivation",
      desc: "Stay driven with quotes that spark your ambition and push you forward.",
      icon: <Rocket className="text-purple-600" />,
    },
    {
      title: "Love",
      desc: "Discover words that warm your heart and celebrate meaningful connections.",
      icon: <HandHeart className="text-red-600" />,
    },
    {
      title: "Gratitude",
      desc: "Find calm and appreciation through quotes that remind you to cherish life’s blessings.",
      icon: <Handshake className="text-blue-700" />,
    },
    {
      title: "Faith",
      desc: "Uplifting thoughts to strengthen your spirit and renew your sense of hope.",
      icon: <Sparkles className="text-yellow-500" />,
    },
    {
      title: "Joy",
      desc: "Spread smiles with quotes that celebrate positivity and simple joys.",
      icon: <PartyPopper className="text-purple-600" />,
    },
    {
      title: "Random",
      desc: "Let fate pick your quote — a fresh dose of inspiration every time.",
      icon: <Dice5 className="text-sky-600" />,
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl px-4 mx-auto">

        {/* Heading */}
        <h2 className="text-center text-3xl font-semibold text-gray-900 mb-12">
          Premium Quote Categories
        </h2>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((item, index) => (
            <div
              key={index}
              className="rounded-lg bg-[#F4F5F7] p-6 transition hover:shadow-md"
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
