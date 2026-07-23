'use client';

import { motion } from 'framer-motion';
import { Gift, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Gift Message Empty State
 * Shows when no message exists
 */
export default function GiftMessageEmptyState({ type = 'recipient' }) {
  const isRecipient = type === 'recipient';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-8 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center border border-gray-700 mb-6">
        <Gift className="w-10 h-10 text-gray-600" />
      </div>

      <h2 className="text-xl font-serif text-white mb-2">
        {isRecipient ? 'No Personal Message' : 'No Message Yet'}
      </h2>

      <p className="text-gray-400 max-w-sm">
        {isRecipient 
          ? 'The owner of this tag hasn\'t left a personal message yet.'
          : 'You haven\'t created a gift message for this tag yet.'}
      </p>

      {!isRecipient && (
        <Button
          className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:shadow-lg hover:shadow-amber-500/25"
        >
          <Pencil className="w-4 h-4 mr-2" />
          Create Gift Message
        </Button>
      )}
    </motion.div>
  );
}