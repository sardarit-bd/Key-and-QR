'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '@/store/authStore';
import useGiftMessage from '@/hooks/useGiftMessage';
import GiftMessageDisplay from './GiftMessageDisplay';
import GiftMessageEditor from './GiftMessageEditor';
import GiftMessageEmptyState from './GiftMessageEmptyState';
import GiftMessageSkeleton from './GiftMessageSkeleton';

/**
 * Gift Message Modal
 * Main modal container with animations
 */
export default function GiftMessageModal({
  isOpen,
  onClose,
  tagCode,
  initialData = null,
}) {
  const modalRef = useRef(null);
  const { user } = useAuthStore();
  
  const {
    message,
    hasMessage,
    loading,
    saving,
    isOwner,
    saveMessage,
    removeMessage,
    setMessage,
  } = useGiftMessage(tagCode, initialData);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Render content based on state
  const renderContent = () => {
    if (loading) {
      return <GiftMessageSkeleton />;
    }

    if (!hasMessage && !isOwner) {
      return <GiftMessageEmptyState type="recipient" />;
    }

    if (!hasMessage && isOwner) {
      return (
        <GiftMessageEditor
          message={message}
          setMessage={setMessage}
          onSave={saveMessage}
          onRemove={removeMessage}
          saving={saving}
          isOwner={isOwner}
        />
      );
    }

    // Has message
    return (
      <GiftMessageDisplay
        message={message}
        isOwner={isOwner}
        tagCode={tagCode}
        onEdit={() => {}}
        onSave={saveMessage}
        onRemove={removeMessage}
        saving={saving}
      />
    );
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gift-message-title"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-6 pt-14">
            {renderContent()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}