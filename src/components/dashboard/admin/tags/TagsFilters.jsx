'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';

const ACTIVATION_OPTIONS = [
  { value: 'all', label: 'All Activations' },
  { value: 'true', label: 'Activated' },
  { value: 'false', label: 'Pending' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Disabled' },
];

export default function TagsFilters({
  search,
  onSearchChange,
  isActivated,
  onActivationChange,
  isActive,
  onStatusChange,
  totalItems = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 sm:gap-4"
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by tag code..."
            className="pl-9 h-9 text-sm"
          />
        </div>

        <Select value={isActivated} onValueChange={onActivationChange}>
          <SelectTrigger className="w-full sm:w-40 h-9">
            <SelectValue placeholder="All Activations" />
          </SelectTrigger>
          <SelectContent>
            {ACTIVATION_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={isActive} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-36 h-9">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-foreground-tertiary">
        {totalItems} {totalItems === 1 ? 'tag' : 'tags'} found
      </p>
    </motion.div>
  );
}
