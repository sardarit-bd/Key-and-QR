'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Info, Heart } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24">
        <Link href="/dashboard/user/profile" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft size={18} /> Back to Profile
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <Info size={24} className="text-accent" />
          <h1 className="text-2xl font-bold text-foreground">About InspireTag</h1>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-foreground-secondary leading-relaxed">
            InspireTag is a physical NFC/QR Tag product that delivers daily inspirational quotes.
            Scan your tag to receive a personalized quote, save favorites, and explore categories
            that resonate with you.
          </p>
          <div className="mt-6 pt-6 border-t border-border flex items-center justify-center gap-2 text-foreground-tertiary text-sm">
            <span>Made with</span>
            <Heart size={14} className="text-red-400 fill-current" />
            <span>by InspireTag Team</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
