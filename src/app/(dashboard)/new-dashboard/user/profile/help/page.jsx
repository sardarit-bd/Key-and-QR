'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#090b14]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24">
        <Link href="/new-dashboard/user/profile" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft size={18} /> Back to Profile
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle size={24} className="text-[#e3ba85]" />
          <h1 className="text-2xl font-bold text-white">Help & Support</h1>
        </div>
        <div className="space-y-3">
          <Link href="/faq" className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-[#e3ba85]/30 transition-colors">
            <span className="text-white">Frequently Asked Questions</span>
            <ExternalLink size={16} className="text-gray-500 ml-auto" />
          </Link>
          <a href="mailto:support@myinspiretag.com" className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-[#e3ba85]/30 transition-colors">
            <Mail size={18} className="text-gray-400" />
            <span className="text-white">Contact Support</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
