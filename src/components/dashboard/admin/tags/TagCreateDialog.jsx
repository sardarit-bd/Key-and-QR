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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QrCode, Wand } from 'lucide-react';

function generateCode() {
  const prefix = 'TAG';
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

export default function TagCreateDialog({ open, onOpenChange, onSave, isLoading = false }) {
  const [tagCode, setTagCode] = useState('');
  const [subscriptionType, setSubscriptionType] = useState('free');
  const [manual, setManual] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTagCode(generateCode());
      setSubscriptionType('free');
      setManual(false);
      setError('');
    }
  }, [open]);

  const handleGenerate = () => {
    setTagCode(generateCode());
    setManual(false);
    setError('');
  };

  const validate = () => {
    if (!tagCode.trim() || tagCode.trim().length < 3) {
      setError('Tag code must be at least 3 characters');
      return false;
    }
    if (!/^[A-Za-z0-9_-]+$/.test(tagCode.trim())) {
      setError('Only letters, numbers, hyphens, and underscores allowed');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ tagCode: tagCode.trim(), subscriptionType });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
            <QrCode size={24} className="text-primary" />
          </div>
          <DialogTitle>Create Tag</DialogTitle>
          <DialogDescription>Generate a new QR tag code.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label htmlFor="tag-code" className="block text-xs font-medium text-foreground-secondary">Tag Code</label>
            <div className="flex gap-2">
              <Input
                id="tag-code"
                value={tagCode}
                onChange={(e) => { setTagCode(e.target.value); setManual(true); setError(''); }}
                placeholder="Enter tag code"
 className={` text-sm flex-1 ${error ? 'border-destructive' : ''}`}
              />
              <Button variant="outline" size="icon" onClick={handleGenerate} title="Generate random code" className="cursor-pointer">
                <Wand size={16} />
              </Button>
            </div>
            {error && <p className="text-[11px] text-destructive">{error}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="tag-plan" className="block text-xs font-medium text-foreground-secondary">Subscription Plan</label>
            <Select value={subscriptionType} onValueChange={setSubscriptionType}>
              <SelectTrigger id="tag-plan" className="w-full h-9">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="subscriber">Subscriber</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Tag'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
