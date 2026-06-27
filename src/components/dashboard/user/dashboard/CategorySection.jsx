'use client';

import { Sparkles, Heart, Dumbbell, Leaf, Sun, LayoutGrid } from 'lucide-react';
import Card from './Card';
import CategoryCard from './CategoryCard';

const CATEGORIES = [
  { id: 'inspire', label: 'Inspire', subtitle: 'Random', icon: Sparkles, colorClass: 'text-[#e3ba85]', isActive: true },
  { id: 'love', label: 'Love', icon: Heart, colorClass: 'text-pink-400' },
  { id: 'strength', label: 'Strength', icon: Dumbbell, colorClass: 'text-orange-400' },
  { id: 'healing', label: 'Healing', icon: Leaf, colorClass: 'text-green-400' },
  { id: 'faith', label: 'Faith', icon: Sun, colorClass: 'text-yellow-200' }, // Substitute for praying hands
  { id: 'gratitude', label: 'Gratitude', icon: Sun, colorClass: 'text-yellow-400' },
];

export default function CategorySection() {
  return (
    <Card className="p-6">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        
        {/* Left Side: Header */}
        <div className="max-w-xs relative">
          <h2 className="text-xl font-serif text-white mb-2 flex items-center gap-2">
            Ready for more inspiration? <span className="text-[#e3ba85] absolute -top-1 -right-4 text-sm">✨</span>
          </h2>
          <p className="text-[#a1a1aa] text-sm leading-relaxed">
            Choose a category and discover a new quote that speaks to your heart.
          </p>
        </div>
        
        {/* Right Side: Scrollable Categories */}
        <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-none snap-x">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="snap-start">
              <CategoryCard {...cat} />
            </div>
          ))}

          {/* View All Button */}
          <button className="flex flex-col items-center justify-center gap-1.5 px-5 py-3.5 rounded-xl hover:bg-[#151722] transition-colors ml-2 min-w-[90px] snap-start border border-transparent">
            <LayoutGrid size={20} className="text-gray-400" />
            <span className="text-gray-400 text-[11px] text-center leading-tight">View All<br/>Categories</span>
          </button>
        </div>
        
      </div>
    </Card>
  );
}