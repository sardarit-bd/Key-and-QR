'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QuantityInput({
  value,
  onChange,
  min = 0,
  max = Infinity,
  disabled = false,
  className = '',
}) {
  const handleDecrement = (e) => {
    e.preventDefault();
    if (disabled) return;
    const newVal = Math.max(min, Number(value || 0) - 1);
    onChange(newVal);
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    if (disabled) return;
    const newVal = Math.min(max, Number(value || 0) + 1);
    onChange(newVal);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      onChange('');
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      onChange(Math.max(min, Math.min(max, num)));
    }
  };

  const handleBlur = () => {
    if (value === '' || isNaN(Number(value))) {
      onChange(min);
    }
  };

  return (
    <div className={`flex items-center gap-1.5 inline-flex font-sans ${className}`}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={disabled || Number(value || 0) <= min}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed select-none transition-colors cursor-pointer"
        aria-label="Decrement quantity"
      >
        <Minus size={14} />
      </Button>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        disabled={disabled}
        className="w-14 h-9 text-center text-sm font-medium border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={disabled || Number(value || 0) >= max}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed select-none transition-colors cursor-pointer"
        aria-label="Increment quantity"
      >
        <Plus size={14} />
      </Button>
    </div>
  );
}
