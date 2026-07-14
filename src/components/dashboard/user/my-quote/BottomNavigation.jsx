"use client";

import { Home, Compass, BookOpen, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BottomNavigation() {
  const navItems = [
    { icon: Home, label: 'Home', active: false },
    { icon: Compass, label: 'Inspire', active: false },
    { icon: BookOpen, label: 'Library', active: true },
    { icon: User, label: 'Profile', active: false },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#090b14]/95 backdrop-blur-md border-t border-white/5 flex md:hidden items-center justify-around px-2 z-50">
      {navItems.map((item) => (
        <Button 
          key={item.label}
          variant="ghost" 
          className={`flex flex-col items-center gap-1.5 h-16 w-16 p-0 hover:bg-white/5 ${item.active ? 'text-[#d946ef]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </Button>
      ))}
    </div>
  );
}