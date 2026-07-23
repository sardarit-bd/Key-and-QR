'use client';

import { useState } from 'react';
import {
  Sparkles,
  Heart,
  Dumbbell,
  Leaf,
  Sun,
  LayoutGrid,
} from 'lucide-react';

import Card from './Card';
import CategoryCard from './CategoryCard';

const CATEGORIES = [
  {
    id: 'inspire',
    label: 'Inspire',
    subtitle: 'Random',
    icon: Sparkles,
    colorClass: 'text-[#E6BE84]',
  },
  {
    id: 'love',
    label: 'Love',
    icon: Heart,
    colorClass: 'text-pink-400',
  },
  {
    id: 'strength',
    label: 'Strength',
    icon: Dumbbell,
    colorClass: 'text-orange-400',
  },
  {
    id: 'healing',
    label: 'Healing',
    icon: Leaf,
    colorClass: 'text-green-400',
  },
  {
    id: 'faith',
    label: 'Faith',
    icon: Sun,
    colorClass: 'text-yellow-200',
  },
  {
    id: 'gratitude',
    label: 'Gratitude',
    icon: Sun,
    colorClass: 'text-yellow-400',
  },
];

export default function CategorySection({ categories }) {
  const [activeCategory, setActiveCategory] = useState('inspire');

  // Map backend category counts to the static category list
  const categoryCounts = {};
  if (Array.isArray(categories)) {
    for (const cat of categories) {
      categoryCounts[cat.name] = cat.count;
    }
  }

  return (
    <Card className="relative overflow-hidden rounded-[18px] sm:rounded-[22px] px-4 sm:px-5 md:px-6 lg:px-7 py-4 sm:py-5 md:py-6">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-16 h-72 w-72 rounded-full bg-[#f2b96b]/5 blur-3xl" />
        <div className="absolute -right-24 -bottom-20 h-72 w-72 rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-4 sm:gap-6 md:gap-8 xl:flex-row xl:items-center xl:justify-between">
        {/* Left */}
        <div className="relative shrink-0 xl:w-[300px] lg:w-[280px] md:w-auto">
          <Sparkles
            size={15}
            fill="currentColor"
            className="absolute right-4 sm:right-6 md:right-8 -top-0.5 sm:-top-1 text-[#E6BE84] w-[14px] h-[14px] sm:w-[15px] sm:h-[15px]"
          />

          <h2 className="font-serif text-[22px] sm:text-[24px] md:text-[28px] leading-tight text-[#F8F5EF]">
            Ready for more inspiration?
          </h2>

          <p className="mt-2 sm:mt-3 text-[13px] sm:text-[14px] leading-6 text-[#8C909C]">
            Choose a category and discover a new quote that
            speaks to your heart.
          </p>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-x-auto hide-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0 snap-x snap-mandatory">
          <div className="flex min-w-max items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 py-4 sm:py-6 md:py-8 lg:py-10 px-4 sm:px-6 lg:px-12">
            {CATEGORIES.map((category) => (
              <div key={category.id} className="snap-start">
                <CategoryCard
                  {...category}
                  count={categoryCounts[category.id]}
                  isActive={activeCategory === category.id}
                  onClick={() => setActiveCategory(category.id)}
                />
              </div>
            ))}

            {/* Divider */}
            <div className="mx-0.5 sm:mx-1 h-10 sm:h-12 md:h-14 w-px bg-[#242837]" />

            {/* View All */}
            <button
              className="
                group
                flex
                items-center
                gap-2 sm:gap-3
                rounded-xl
                px-1.5 sm:px-2
                transition-all
                duration-300
                flex-shrink-0
              "
            >
              <div
                className="
                  flex
                  h-9 sm:h-10 md:h-11
                  w-9 sm:w-10 md:w-11
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-[#2B3040]
                  bg-[#141823]
                  transition-all
                  duration-300
                  group-hover:border-[#43485f]
                  group-hover:bg-[#1a1f2b]
                "
              >
                <LayoutGrid
                  size={18}
                  className="text-[#D3D5DD] w-[15px] h-[15px] sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]"
                />
              </div>

              <div className="text-left">
                <p className="text-[12px] sm:text-[13px] font-medium text-white">
                  View All
                </p>

                <p className="text-[11px] sm:text-[12px] text-[#8D9099]">
                  Categories
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
