'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

/**
 * PasswordStrengthMeter
 *
 * Live password strength scoring with:
 * - 5-tier strength indicator (Weak → Excellent)
 * - Per-rule live validation (length, upper, lower, number, special)
 *
 * Pure UI — no auth logic.
 */

export const PASSWORD_RULES = {
  length: { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  uppercase: { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  lowercase: { label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  number: { label: 'One number', test: (v) => /[0-9]/.test(v) },
  special: { label: 'One special character', test: (v) => /[^A-Za-z0-9]/.test(v) },
};

export function scorePassword(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  Object.values(PASSWORD_RULES).forEach((rule) => {
    if (rule.test(password)) score += 1;
  });
  return {
    score,
    label: ['Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][score],
    color: ['bg-red-500', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-emerald-400'][score],
    textColor: ['text-red-400', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-emerald-400', 'text-emerald-300'][score],
  };
}

export default function PasswordStrengthMeter({ password }) {
  const { score, label, color, textColor } = useMemo(
    () => scorePassword(password),
    [password]
  );

  const rulesPassed = useMemo(() => {
    return Object.entries(PASSWORD_RULES).map(([key, rule]) => ({
      key,
      label: rule.label,
      passed: rule.test(password || ''),
    }));
  }, [password]);

  const hasInput = (password || '').length > 0;

  return (
    <div className="space-y-2.5">
      {/* Strength bar */}
      {hasInput && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-foreground-tertiary">
              Strength
            </span>
            <span className={`text-[11px] font-semibold ${textColor}`}>
              {label}
            </span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((segment) => (
              <motion.div
                key={segment}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{
                  scaleX: segment <= score ? 1 : 0.25,
                  opacity: segment <= score ? 1 : 0.25,
                }}
                transition={{ duration: 0.2, delay: segment * 0.03 }}
                className={`h-1 flex-1 rounded-full ${segment <= score ? color : 'bg-white/10'}`}
                style={{ transformOrigin: 'left' }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Live validation checklist */}
      {hasInput && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
          {rulesPassed.map((rule) => (
            <li
              key={rule.key}
              className={`flex items-center gap-1.5 text-[11px] transition-colors duration-200 ${
                rule.passed ? 'text-emerald-400' : 'text-foreground-tertiary'
              }`}
            >
              {rule.passed ? (
                <Check className="w-3 h-3 shrink-0" />
              ) : (
                <X className="w-3 h-3 shrink-0 opacity-50" />
              )}
              {rule.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
