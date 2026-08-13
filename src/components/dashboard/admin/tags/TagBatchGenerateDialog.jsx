'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, Loader2 } from 'lucide-react';
import QuantityInput from '@/components/ui/QuantityInput';

export default function TagBatchGenerateDialog({ open, onOpenChange, onSave, isLoading = false }) {
  const [quantity, setQuantity] = useState(50);
  const [prefix, setPrefix] = useState('TAG');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setQuantity(50);
      setPrefix('TAG');
      setError('');
    }
  }, [open]);

  const validate = () => {
    if (!quantity || quantity < 1 || quantity > 1000) {
      setError('Quantity must be between 1 and 1,000');
      return false;
    }
    if (!prefix.trim()) {
      setError('Prefix is required');
      return false;
    }
    if (!/^[A-Za-z0-9_-]+$/.test(prefix.trim())) {
      setError('Only letters, numbers, hyphens, and underscores allowed for prefix');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ quantity: Number(quantity), prefix: prefix.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
            <QrCode size={24} className="text-primary" />
          </div>
          <DialogTitle>Generate Batch QR Codes</DialogTitle>
          <DialogDescription>Generate multiple unique QR codes at once.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground-secondary">Quantity</label>
            <div>
              <QuantityInput
                value={quantity}
                onChange={(val) => { setQuantity(val); setError(''); }}
                min={1}
                max={1000}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="batch-prefix" className="block text-xs font-medium text-foreground-secondary">Tag Prefix</label>
            <Input
              id="batch-prefix"
              value={prefix}
              onChange={(e) => { setPrefix(e.target.value); setError(''); }}
              placeholder="e.g. TAG"
              className={`text-sm ${error && error.includes('prefix') ? 'border-destructive' : ''}`}
            />
          </div>
          {error && <p className="text-[11px] text-destructive font-medium">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading} className="min-w-[100px] flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Generating...
              </>
            ) : 'Generate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
