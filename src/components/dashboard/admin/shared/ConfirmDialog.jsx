'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, Ban } from 'lucide-react';

const CONFIG = {
  delete: {
    icon: Trash2,
    iconClass: 'text-red-400',
    bgClass: 'bg-red-500/10 border-red-500/20',
    title: 'Delete',
    description: 'This action is permanent and cannot be undone. All associated data will be removed.',
    confirmLabel: 'Delete',
    confirmVariant: 'destructive' ,
  },
  suspend: {
    icon: Ban,
    iconClass: 'text-amber-400',
    bgClass: 'bg-amber-500/10 border-amber-500/20',
    title: 'Suspend User',
    description: 'This user will lose access to their account until reactivated. Their data will be preserved.',
    confirmLabel: 'Suspend',
    confirmVariant: 'destructive' ,
  },
  activate: {
    icon: AlertTriangle,
    iconClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10 border-emerald-500/20',
    title: 'Activate User',
    description: 'This will restore full access to the user account.',
    confirmLabel: 'Activate',
    confirmVariant: 'default',
  },
};

export default function ConfirmDialog({
  open,
  onOpenChange,
  variant = 'delete',
  userName = '',
  title,
  description,
  confirmLabel,
  onConfirm,
  isLoading = false,
}) {
  const baseConfig = CONFIG[variant] || CONFIG.delete;
  const config = {
    ...baseConfig,
    ...(title && { title }),
    ...(description && { description }),
    ...(confirmLabel && { confirmLabel }),
  };
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 ${config.bgClass}`}>
            <Icon size={24} className={config.iconClass} />
          </div>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>
            {config.description}
            {userName && (
              <span className="block mt-1 font-medium text-foreground">
                &ldquo;{userName}&rdquo;
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-10 px-4 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/80 font-medium transition-all cursor-pointer select-none"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={config.confirmVariant}
            onClick={onConfirm}
            disabled={isLoading}
            className={
              config.confirmVariant === 'destructive'
                ? "h-10 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all cursor-pointer select-none"
                : "h-10 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all cursor-pointer select-none"
            }
          >
            {isLoading ? 'Processing...' : config.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
