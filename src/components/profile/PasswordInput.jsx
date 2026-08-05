'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

/**
 * PasswordInput — premium password field with show/hide toggle.
 * Pure UI, no auth logic.
 */
export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder = '',
  autoComplete = 'new-password',
  hasError = false,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-[12px] font-medium text-foreground-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        <Lock
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-tertiary"
          size={15}
        />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={hasError || undefined}
          className={`w-full rounded-xl border bg-background-secondary/50 py-2.5 pl-10 pr-11 text-sm text-foreground placeholder:text-foreground-tertiary transition-all duration-300 focus:outline-none focus:ring-2 ${
            hasError
              ? 'border-red-500/40 focus:border-red-500/50 focus:ring-red-500/20'
              : 'border-white/10 focus:border-accent/50 focus:ring-accent/20 light:border-[#E8DFCE]/80'
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-tertiary transition-colors hover:text-foreground cursor-pointer"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
