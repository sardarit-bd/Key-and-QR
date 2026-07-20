'use client';

import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQRResolution } from '@/hooks/useQRResolution';
import {
  QRLoading,
  QRNotFound,
  QRDisabled,
  QRActivation,
  QRReady,
} from '@/components/qr';

/**
 * Public QR Page
 * Route: /tag/[tagCode]
 */
export default function QRPage() {
  const params = useParams();
  const tagCode = params?.tagCode;

  const {
    status,
    data,
    loading,
    error,
    isFavorite,
    toggleFavorite,
    showPersonalMessage,
    isAuthenticated,
    user,
    refresh,
  } = useQRResolution(tagCode);

  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-black flex items-center justify-center"
      >
        <QRLoading />
      </motion.div>
    );
  }

  // Render appropriate screen based on status
  const renderScreen = () => {
    switch (status) {
      case 'not_found':
        return <QRNotFound tagCode={tagCode} />;
      
      case 'disabled':
        return <QRDisabled tagCode={tagCode} />;
      
      case 'needs_activation':
        return <QRActivation tagCode={tagCode} data={data} />;
      
      case 'ready':
        return (
          <QRReady
            data={data}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            isAuthenticated={isAuthenticated}
            tagCode={tagCode}
            user={user}
          />
        );
      
      case 'error':
        return (
          <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="text-center">
              <p className="text-gray-400 mb-4">{error || 'Something went wrong'}</p>
              <button
                onClick={refresh}
                className="px-6 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-black"
      >
        {renderScreen()}
      </motion.div>
    </AnimatePresence>
  );
}