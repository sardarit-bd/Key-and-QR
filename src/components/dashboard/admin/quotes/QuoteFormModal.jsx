'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminQuoteActions } from '@/hooks/dashboard/useAdminQuotes';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'love', label: 'Love' },
  { value: 'strength', label: 'Strength' },
  { value: 'healing', label: 'Healing' },
  { value: 'faith', label: 'Faith' },
  { value: 'gratitude', label: 'Gratitude' },
];

const INITIAL = { text: '', author: '', category: 'love', description: '', allowReuse: true };

export default function QuoteFormModal({ open, onOpenChange, editQuote, onSuccess }) {
  const isEditing = !!editQuote;
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (editQuote) {
        setForm({
          text: editQuote.text || '',
          author: editQuote.author || '',
          category: editQuote.category || 'love',
          description: editQuote.description || '',
          allowReuse: editQuote.allowReuse !== false,
        });
      } else {
        setForm(INITIAL);
      }
      setErrors({});
    }
  }, [open, editQuote]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.text.trim() || form.text.trim().length < 3) errs.text = 'Quote text must be at least 3 characters';
    if (!form.category) errs.category = 'Category is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        text: form.text.trim(),
        author: form.author.trim() || 'InspireTag',
        category: form.category,
        description: form.description.trim() || undefined,
        allowReuse: form.allowReuse,
      };

      if (isEditing) {
        await api.patch(`/quotes/${editQuote._id}`, payload);
        toast.success('Quote updated successfully');
      } else {
        await api.post('/quotes', payload);
        toast.success('Quote created successfully');
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save quote');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Quote size={14} className="text-purple-400" />
            </span>
            {isEditing ? 'Edit Quote' : 'Create Quote'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Quote Text *</label>
            <textarea
              value={form.text}
              onChange={handleChange('text')}
              rows={4}
              placeholder="Enter the quote text..."
              className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-tertiary resize-none outline-none focus:ring-1 focus:ring-primary transition-colors ${
                errors.text ? 'border-destructive' : 'border-border'
              }`}
            />
            {errors.text && <p className="text-[11px] text-destructive mt-1">{errors.text}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Author</label>
            <Input
              value={form.author}
              onChange={handleChange('author')}
              placeholder="InspireTag"
              className="h-9 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Category *</label>
            <Select value={form.category} onValueChange={(v) => { setForm((prev) => ({ ...prev, category: v })); setErrors((prev) => ({ ...prev, category: null })); }}>
              <SelectTrigger className={`h-9 text-sm ${errors.category ? 'border-destructive' : ''}`}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-[11px] text-destructive mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={handleChange('description')}
              rows={2}
              placeholder="Optional description or context..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-tertiary resize-none outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 rounded-lg border border-border bg-background text-sm font-medium text-foreground-secondary hover:bg-muted transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-5 inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Save size={14} />
            {saving ? 'Saving...' : isEditing ? 'Update Quote' : 'Create Quote'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
