import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import { giftMessageService } from '@/services/giftMessage-service/giftMessage.service';

/**
 * Gift Message Hook
 * Manages gift message state and operations
 */
export const useGiftMessage = (tagCode, initialData = null) => {
  const { user, isInitialized } = useAuthStore();
  
  const [message, setMessage] = useState(initialData?.personalMessage || '');
  const [hasMessage, setHasMessage] = useState(initialData?.hasPersonalMessage || false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [tagData, setTagData] = useState(initialData || null);

  /**
   * Fetch personal message
   */
  const fetchMessage = useCallback(async () => {
    if (!tagCode) return;

    setLoading(true);
    setError(null);

    try {
      const result = await giftMessageService.getPersonalMessage(tagCode);
      
      if (result.success && result.data) {
        setHasMessage(result.data.hasPersonalMessage || false);
        setMessage(result.data.personalMessage || '');
        setTagData(result.data);
      } else {
        setHasMessage(false);
        setMessage('');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch message');
      setHasMessage(false);
      setMessage('');
    } finally {
      setLoading(false);
    }
  }, [tagCode]);

  /**
   * Save personal message
   */
  const saveMessage = useCallback(async (newMessage) => {
    if (!tagCode) return false;

    // Validate message length
    if (newMessage && newMessage.length > 500) {
      toast.error('Message cannot exceed 500 characters');
      return false;
    }

    setSaving(true);
    setError(null);

    try {
      const result = await giftMessageService.setPersonalMessage(tagCode, newMessage || '');
      
      if (result.success) {
        setMessage(newMessage || '');
        setHasMessage(!!newMessage);
        toast.success(newMessage ? 'Message saved successfully!' : 'Message removed');
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to save message');
      toast.error(err.message || 'Failed to save message');
      return false;
    } finally {
      setSaving(false);
    }
  }, [tagCode]);

  /**
   * Remove personal message
   */
  const removeMessage = useCallback(async () => {
    if (!tagCode) return false;

    setSaving(true);
    setError(null);

    try {
      const result = await giftMessageService.removePersonalMessage(tagCode);
      
      if (result.success) {
        setMessage('');
        setHasMessage(false);
        toast.success('Message removed successfully');
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to remove message');
      toast.error(err.message || 'Failed to remove message');
      return false;
    } finally {
      setSaving(false);
    }
  }, [tagCode]);

  /**
   * Check if current user owns the tag
   */
  const checkOwnership = useCallback(async () => {
    if (!user || !tagCode) return;

    try {
      // Use the resolve endpoint to check ownership
      const response = await api.get(`/tags/resolve/${tagCode}`);
      const tag = response.data?.data;
      
      if (tag?.owner && user?._id) {
        setIsOwner(tag.owner === user._id || tag.owner === user.id);
      }
    } catch (err) {
      setIsOwner(false);
    }
  }, [tagCode, user]);

  // Initial fetch
  useEffect(() => {
    if (tagCode && isInitialized) {
      fetchMessage();
      checkOwnership();
    }
  }, [tagCode, isInitialized, fetchMessage, checkOwnership]);

  return {
    message,
    hasMessage,
    loading,
    saving,
    error,
    isOwner,
    tagData,
    fetchMessage,
    saveMessage,
    removeMessage,
    setMessage: (value) => setMessage(value),
    setHasMessage,
  };
};

export default useGiftMessage;