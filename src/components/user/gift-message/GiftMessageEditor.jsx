'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

/**
 * Gift Message Editor
 * Owner interface for editing gift messages
 */
export default function GiftMessageEditor({
  message,
  setMessage,
  onSave,
  onRemove,
  saving,
  isOwner,
}) {
  const [tempMessage, setTempMessage] = useState(message || '');
  const [isEditing, setIsEditing] = useState(!message);

  const maxLength = 500;
  const remaining = maxLength - tempMessage.length;

  const handleSave = async () => {
    if (tempMessage.trim().length === 0) {
      return;
    }
    const success = await onSave(tempMessage.trim());
    if (success) {
      setIsEditing(false);
    }
  };

  const handleRemove = async () => {
    const success = await onRemove();
    if (success) {
      setIsEditing(true);
      setTempMessage('');
    }
  };

  const handleCancel = () => {
    setTempMessage(message || '');
    setIsEditing(false);
  };

  if (!isEditing && message) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <Gift className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-serif text-white">
            Your Gift Message
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            This is the message visible to recipients
          </p>
        </div>

        <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <p className="text-gray-200 text-lg leading-relaxed text-center italic">
            “{message}”
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Edit Message
          </Button>

          <Button
            variant="outline"
            onClick={handleRemove}
            disabled={saving}
            className="border-white/10 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
          >
            Remove Message
          </Button>
        </div>
      </motion.div>
    );
  }

  // Editor view
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
          <Gift className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-2xl font-serif text-white">
          {message ? 'Edit Your Gift Message' : 'Create a Gift Message'}
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Write a personal message for the recipient
        </p>
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <Textarea
          value={tempMessage}
          onChange={(e) => setTempMessage(e.target.value.slice(0, maxLength))}
          placeholder="Write your personal message here..."
          className="min-h-[120px] bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 resize-none focus:ring-amber-500/50"
          maxLength={maxLength}
          disabled={saving}
        />
        
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">
            {remaining} characters remaining
          </span>
          {remaining < 50 && (
            <span className={`${remaining < 10 ? 'text-rose-400' : 'text-amber-400'}`}>
              {remaining < 10 ? '⚠️ Almost at limit' : 'Getting close to limit'}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button
          onClick={handleSave}
          disabled={!tempMessage.trim() || saving}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:shadow-lg hover:shadow-amber-500/25"
        >
          <Send className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : message ? 'Update Message' : 'Save Message'}
        </Button>

        {(message || tempMessage) && (
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
            className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}

        {message && (
          <Button
            variant="outline"
            onClick={handleRemove}
            disabled={saving}
            className="border-white/10 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
          >
            Remove
          </Button>
        )}
      </div>
    </motion.div>
  );
}