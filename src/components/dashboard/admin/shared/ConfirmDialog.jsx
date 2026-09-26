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
    iconClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-500/10 border-red-500/20',
    title: 'Delete',
    description: 'This action is permanent and cannot be undone. All associated data will be removed.',
    confirmLabel: 'Delete',
    confirmVariant: 'destructive' ,
  },
  suspend: {
    icon: Ban,
    iconClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-500/10 border-amber-500/20',
    title: 'Suspend User',
    description: 'This user will lose access to their account until reactivated. Their data will be preserved.',
    confirmLabel: 'Suspend',
    confirmVariant: 'destructive' ,
  },
  activate: {
    icon: AlertTriangle,
    iconClass: 'text-emerald-600 dark:text-emerald-400',
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
        <DialogFooter className="w-full flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-10 px-4 rounded-lg border border-[#2A2D35] bg-transparent text-[#9BA1AD] hover:bg-[#24272D] hover:text-white font-medium transition-colors cursor-pointer select-none"
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
                ? "h-10 px-4 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium shadow-sm transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive"
                : "h-10 px-4 rounded-lg bg-[#1E2025] hover:bg-[#282B32] text-white border border-[#323640] font-medium shadow-sm transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
            }
          >
            {isLoading ? 'Processing...' : config.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
