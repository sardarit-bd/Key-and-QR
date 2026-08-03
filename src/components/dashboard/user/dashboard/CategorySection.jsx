'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Heart,
  Dumbbell,
  LayoutGrid,
  Lock,
  Church,
  Shield,
  BookOpen,
  HandHeart,
  Bandage,
} from 'lucide-react';

import Card from './Card';
import CategoryCard from './CategoryCard';
import { useReceiveQuoteMutation } from '@/hooks/received-quote/useReceivedQuote';

// Map backend category slug → icon + color (preserves the original card design)
const CATEGORY_STYLES = {
  inspire: { icon: Sparkles, colorClass: 'text-accent' },
  love: { icon: Heart, colorClass: 'text-pink-400' },
  strength: { icon: Dumbbell, colorClass: 'text-orange-400' },
  healing: { icon: Bandage, colorClass: 'text-green-400' },
  faith: { icon: Church, colorClass: 'text-yellow-200' },
  gratitude: { icon: HandHeart, colorClass: 'text-yellow-400' },
  courage: { icon: Shield, colorClass: 'text-orange-400' },
  wisdom: { icon: BookOpen, colorClass: 'text-emerald-400' },
  motivation: { icon: Sparkles, colorClass: 'text-accent' },
};

export default function CategorySection({ categories }) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('inspire');
  const receiveQuote = useReceiveQuoteMutation();

  // Normalize backend categories: [{id, name, slug, count, isPremium, isLocked, isAvailableToday}]
  const categoryList = Array.isArray(categories) ? categories : [];

  const handleCategoryClick = (category) => {
    const slug = category?.slug || category?.id || category?.name || 'inspire';
    setActiveCategory(slug);

    // Locked categories (premium / daily-limit) — don't attempt to receive
    if (category?.isLocked) return;

    receiveQuote.mutate(slug);
  };

  const handleViewAll = () => {
    router.push('/new-dashboard/user/my-quotes');
  };

  return (
    <Card className="relative overflow-hidden rounded-[18px] sm:rounded-[22px] px-4 sm:px-5 md:px-6 lg:px-7 py-4 sm:py-5 md:py-6">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-16 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -right-24 -bottom-20 h-72 w-72 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-4 sm:gap-6 md:gap-8 xl:flex-row xl:items-center xl:justify-between">
        {/* Left */}
        <div className="relative shrink-0 xl:w-[300px] lg:w-[280px] md:w-auto">
          <Sparkles
            size={15}
            fill="currentColor"
            className="absolute right-4 sm:right-6 md:right-8 -top-0.5 sm:-top-1 text-accent w-[14px] h-[14px] sm:w-[15px] sm:h-[15px]"
          />

          <h2 className=" text-[22px] sm:text-[24px] md:text-[28px] leading-tight text-foreground">
            Ready for more inspiration?
          </h2>

          <p className="mt-2 sm:mt-3 text-[13px] sm:text-[14px] leading-6 text-foreground-secondary">
            Choose a category and discover a new quote that
            speaks to your heart.
          </p>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-x-auto hide-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0 snap-x snap-mandatory">
          <div className="flex min-w-max items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 py-4 sm:py-6 md:py-8 lg:py-10 px-4 sm:px-6 lg:px-12">
            {categoryList.length > 0 ? categoryList.map((category) => {
              const slug = category?.slug || category?.id || category?.name || '';
              const style = CATEGORY_STYLES[slug] || CATEGORY_STYLES.inspire;
              return (
                <div key={slug || category?.name || category?._id} className="snap-start">
                  <CategoryCard
                    icon={category?.isLocked ? Lock : style.icon}
                    label={category?.name || category?.slug || 'Inspire'}
                    subtitle={category?.count != null ? String(category.count) : undefined}
                    colorClass={style.colorClass}
                    isActive={activeCategory === slug}
                    isLocked={category?.isLocked}
                    onClick={() => handleCategoryClick(category)}
                  />
                </div>
              );
            }) : (
              /* Fallback when backend returns no categories yet — keeps the card populated */
              <div className="snap-start">
                <CategoryCard
                  icon={Sparkles}
                  label="Inspire"
                  subtitle="Random"
                  colorClass="text-accent"
                  isActive={activeCategory === 'inspire'}
                  onClick={() => setActiveCategory('inspire')}
                />
              </div>
            )}

            {/* Divider */}
            <div className="mx-0.5 sm:mx-1 h-10 sm:h-12 md:h-14 w-px bg-border" />

            {/* View All */}
            <button
              onClick={handleViewAll}
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
                  border-border
                  bg-muted
                  transition-all
                  duration-300
                  group-hover:border-primary/30
                  group-hover:bg-muted/80
                "
              >
                <LayoutGrid
                  size={18}
                  className="text-foreground-secondary w-[15px] h-[15px] sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]"
                />
              </div>

              <div className="text-left">
                <p className="text-[12px] sm:text-[13px] font-medium text-foreground">
                  View All
                </p>

                <p className="text-[11px] sm:text-[12px] text-foreground-secondary">
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
