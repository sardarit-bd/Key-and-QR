'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24">
        <Link href="/new-dashboard/user/profile" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft size={18} /> Back to Profile
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle size={24} className="text-accent" />
          <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
        </div>
        <div className="space-y-3">
          <Link href="/faq" className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-accent/30 transition-colors">
            <span className="text-foreground">Frequently Asked Questions</span>
            <ExternalLink size={16} className="text-foreground-tertiary ml-auto" />
          </Link>
          <a href="mailto:support@myinspiretag.com" className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-accent/30 transition-colors">
            <Mail size={18} className="text-muted-foreground" />
            <span className="text-foreground">Contact Support</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
