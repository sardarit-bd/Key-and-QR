'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';

export default function PreferencesPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#090b14]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24">
        <Link href="/new-dashboard/user/profile" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft size={18} /> Back to Profile
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <Settings size={24} className="text-[#e3ba85]" />
          <h1 className="text-2xl font-bold text-white">Preferences</h1>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <p className="text-gray-400">Language, theme, and display settings coming soon.</p>
        </div>
      </div>
    </motion.div>
  );
}
