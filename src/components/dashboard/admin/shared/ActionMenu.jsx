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
          className="w-8 h-8 rounded-xl hover:bg-muted"
          aria-label="User actions"
        >
          <MoreHorizontal size={16} className="text-foreground-tertiary" />
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
