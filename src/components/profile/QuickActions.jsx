'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/**
 * QuickActions — premium navigation shortcuts.
 * Purely navigational; links to existing pages only.
 */
const DEFAULT_ACTIONS = [
  {
    id: 'subscription',
    label: 'Manage Subscription',
    description: 'Plans, billing, and renewal',
    href: '/new-dashboard/user/premium',
    tone: 'accent',
  },
  {
    id: 'orders',
    label: 'View Orders',
    description: 'Your orders and purchases',
    href: '/new-dashboard/user/orders',
    tone: 'default',
  },
  {
    id: 'scan-history',
    label: 'Scan History',
    description: 'Your scanned tags and QR codes',
    href: '/new-dashboard/user/scan-history',
    tone: 'default',
  },
  {
    id: 'favorites',
    label: 'Favorites',
    description: 'Quotes you saved',
    href: '/new-dashboard/user/favorites',
    tone: 'default',
  },
];

const TONES = {
  accent:
    'border-accent/30 bg-accent/10 text-accent hover:bg-accent/20',
  default:
    'border-white/10 bg-background-secondary/50 text-foreground-secondary hover:border-accent/30 hover:text-accent',
};

export default function QuickActions({ actions = DEFAULT_ACTIONS }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {actions.map((action, i) => (
        <Link
          key={action.id}
          href={action.href}
          className={`group flex items-center justify-between gap-3 rounded-[18px] border p-4 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.99] ${TONES[action.tone] || TONES.default}`}
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground">
              {action.label}
            </p>
            <p className="mt-0.5 text-[11px] text-foreground-tertiary">
              {action.description}
            </p>
          </div>
          <ChevronRight
            size={16}
            className="shrink-0 text-foreground-tertiary transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-accent"
          />
        </Link>
      ))}
    </div>
  );
}
