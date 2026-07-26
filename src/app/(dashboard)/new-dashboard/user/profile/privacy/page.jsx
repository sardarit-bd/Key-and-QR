'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24">
        <Link href="/new-dashboard/user/profile" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft size={18} /> Back to Profile
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <Shield size={24} className="text-accent" />
          <h1 className="text-2xl font-bold text-foreground">Privacy</h1>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <p className="text-muted-foreground">Data sharing and visibility settings coming soon.</p>
        </div>
      </div>
    </motion.div>
  );
}
