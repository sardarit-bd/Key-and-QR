'use client';

import { motion } from 'framer-motion';
import { Send, CheckCircle, Clock, XCircle, Quote } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const CATEGORIES = [
  { value: 'love', label: 'Love' },
  { value: 'strength', label: 'Strength' },
  { value: 'healing', label: 'Healing' },
  { value: 'faith', label: 'Faith' },
  { value: 'gratitude', label: 'Gratitude' },
  { value: 'other', label: 'Other' },
];

export default function SubmitQuotePage() {
  const { user } = useAuthStore();
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('other');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (text.trim().length < 3) {
      setError('Quote must be at least 3 characters');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.post('/pending-quotes/submit', {
        text: text.trim(),
        category,
        author: author.trim() || null,
        type: 'community',
      });
      setSubmitted(true);
      setText('');
      setAuthor('');
      setCategory('other');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quote');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <CheckCircle className="mx-auto text-green-500" size={64} />
          <h2 className="mt-6 text-2xl font-bold text-foreground">Quote Submitted!</h2>
          <p className="mt-3 text-muted-foreground">
            Your quote has been submitted for review. You&apos;ll see it in your quotes once approved by an admin.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-3 bg-accent text-accent-foreground font-medium rounded-xl hover:bg-accent/90 transition-colors"
            >
              Submit Another
            </button>
            <button
              onClick={() => window.location.href = '/new-dashboard/user/my-quotes'}
              className="px-6 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors"
            >
              View My Quotes
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Submit a Quote</h1>
          <p className="text-sm text-muted-foreground mt-1">Share an inspirational quote with the community</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Quote Text */}
          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-2">
              Quote <span className="text-destructive">*</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the inspirational quote..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 resize-none"
            />
            <p className="mt-1 text-xs text-foreground-tertiary">{text.length}/500 characters</p>
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-2">
              Author <span className="text-foreground-tertiary">(optional)</span>
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Who said this? (e.g., Maya Angelou)"
              maxLength={100}
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-2">
              Category <span className="text-foreground-tertiary">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                    category === cat.value
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'bg-muted text-foreground-secondary hover:bg-muted/80'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || text.trim().length < 3}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-medium rounded-xl hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
            {submitting ? 'Submitting...' : 'Submit Quote'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
