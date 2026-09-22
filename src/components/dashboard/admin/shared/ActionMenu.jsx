'use client';

import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function ActionMenu({ actions = [] }) {
  if (actions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-muted border border-transparent hover:border-border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Actions"
        >
          <MoreHorizontal size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {actions.map((action, i) => {
          if (action.separator) {
            return <DropdownMenuSeparator key={`sep-${i}`} />;
          }
          return (
            <DropdownMenuItem
              key={action.label}
              onClick={action.onClick}
              disabled={action.disabled}
              className={action.destructive ? 'text-destructive data-[variant=destructive]:text-destructive' : ''}
            >
              {action.icon && <action.icon size={15} className="mr-1.5" />}
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
