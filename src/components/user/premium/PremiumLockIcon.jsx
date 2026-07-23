'use client';

import { Lock } from 'lucide-react';

/**
 * Premium Lock Icon
 * Displayed for premium features when user is free
 */
export default function PremiumLockIcon({ size = 'default', className = '' }) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    default: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={`inline-flex items-center gap-1 text-gray-500 ${className}`}>
      <Lock className={sizeClasses[size]} />
      <span className="text-[10px] font-medium">Premium</span>
    </div>
  );
}