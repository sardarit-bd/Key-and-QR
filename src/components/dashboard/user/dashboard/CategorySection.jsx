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

export default function CategorySection() {
  const [activeCategory, setActiveCategory] = useState('inspire');

  return (
    <Card className="relative overflow-hidden rounded-[22px] px-7 py-6">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-16 h-72 w-72 rounded-full bg-[#f2b96b]/5 blur-3xl" />
        <div className="absolute -right-24 -bottom-20 h-72 w-72 rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
        {/* Left */}
        <div className="relative shrink-0 xl:w-[400px]">
          <Sparkles
            size={15}
            fill="currentColor"
            className="absolute right-8 -top-1 text-[#E6BE84]"
          />

          <h2 className="font-serif text-[28px] leading-tight text-[#F8F5EF]">
            Ready for more inspiration?
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#8C909C]">
            Choose a category and discover a new quote that
            speaks to your heart.
          </p>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-x-auto scrollbar-none">
          <div className="flex min-w-max items-center gap-6 p-10">
            {CATEGORIES.map((category) => (
              <CategoryCard
                key={category.id}
                {...category}
                isActive={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              />
            ))}

            {/* Divider */}
            <div className="mx-1 h-14 w-px bg-[#242837]" />

            {/* View All */}
            <button
              className="
                group
                flex
                items-center
                gap-3
                rounded-xl
                px-2
                transition-all
                duration-300
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
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
                  className="text-[#D3D5DD]"
                />
              </div>

              <div className="text-left">
                <p className="text-[13px] font-medium text-white">
                  View All
                </p>

                <p className="text-[12px] text-[#8D9099]">
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