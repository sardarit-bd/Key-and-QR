'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import heroService from '@/services/hero-service/hero.service';

export const HERO_KEYS = {
  all: ['hero'],
  content: ['hero', 'content'],
  shop: ['hero', 'shop'],
  announcement: ['hero', 'announcement-banner'],
};

const DEFAULT_HERO = {
  key: 'homepage-hero',
  eyebrow: 'ONE SCAN. A BETTER YOU.',
  title: 'Carry inspiration.\nShare what matters.',
  description:
    'A meaningful shell charm with a surprise inside. Scan to discover daily inspiration, heartfelt messages, and moments that stay with you.',
  primaryCta: { label: 'Shop Collection', href: '/shop' },
  secondaryCta: { label: 'How It Works', href: '/how-it-works' },
  heroImage: { url: '/hero/hero-bg.png', publicId: '', alt: '' },
  features: [
    { icon: 'Gift', title: 'Gift a Personal Message', description: '', enabled: true, order: 1 },
    { icon: 'Sun', title: 'Discover Daily Inspiration', description: '', enabled: true, order: 2 },
    { icon: 'Heart', title: 'Keep What Matters', description: '', enabled: true, order: 3 },
  ],
  enabled: true,
};

const DEFAULT_SHOP_HERO = {
  imageUrl: '',
  publicId: '',
};

const DEFAULT_ANNOUNCEMENT_BANNER = {
  isEnabled: true,
  backgroundColor: '#000000',
  textColor: '#ffffff',
  isDismissible: true,
  rotationSpeed: 5,
  messages: [
    { text: 'FREE SHIPPING ON ORDERS OVER $50', icon: 'Truck', linkUrl: '/shop', enabled: true },
    { text: 'GET 10% OFF YOUR FIRST ORDER', icon: 'Gift', linkUrl: '/shop', enabled: true },
    { text: '24/7 CUSTOMER SUPPORT', icon: 'Clock', linkUrl: '/how-it-works', enabled: true },
  ],
  text: 'FREE SHIPPING ON ORDERS OVER $50',
  linkUrl: '',
};

/**
 * Fetch the singleton homepage hero content.
 * Returns the data payload.
 */
export function useHeroContent(enabled = true) {
  return useQuery({
    queryKey: HERO_KEYS.content,
    queryFn: async () => {
      const res = await heroService.getHero();
      return res?.data || null;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Alias for useHeroContent.
 */
export const useHomepageHeroContent = useHeroContent;

/**
 * Admin mutation: save homepage hero content.
 * Invalidates the hero cache so the public site refreshes.
 */
export function useUpdateHero() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: HERO_KEYS.all });
  };

  return useMutation({
    mutationFn: async (payload) => {
      const res = await heroService.updateHero(payload);
      return res?.data || res;
    },
    onSettled: invalidate,
  });
}

/**
 * Alias for useUpdateHero.
 */
export const useUpdateHomepageHero = useUpdateHero;

/**
 * Fetch the shop hero image content.
 */
export function useShopHeroContent(enabled = true) {
  return useQuery({
    queryKey: HERO_KEYS.shop,
    queryFn: async () => {
      const res = await heroService.getShopHero();
      return res?.data || null;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Admin mutation: save shop hero image data.
 * Invalidates the shop hero cache.
 */
export function useUpdateShopHero() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: HERO_KEYS.shop });
    queryClient.invalidateQueries({ queryKey: HERO_KEYS.all });
  };

  return useMutation({
    mutationFn: async (payload) => {
      const res = await heroService.updateShopHero(payload);
      return res?.data || res;
    },
    onSettled: invalidate,
  });
}

/**
 * Fetch the announcement banner content.
 */
export function useAnnouncementBanner(enabled = true) {
  return useQuery({
    queryKey: HERO_KEYS.announcement,
    queryFn: async () => {
      const res = await heroService.getAnnouncementBanner();
      return res?.data || DEFAULT_ANNOUNCEMENT_BANNER;
    },
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Admin mutation: save announcement banner data.
 * Invalidates the announcement banner cache.
 */
export function useUpdateAnnouncementBanner() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: HERO_KEYS.announcement });
    queryClient.invalidateQueries({ queryKey: HERO_KEYS.all });
  };

  return useMutation({
    mutationFn: async (payload) => {
      const res = await heroService.updateAnnouncementBanner(payload);
      return res?.data || res;
    },
    onSettled: invalidate,
  });
}

/**
 * Admin mutation: upload a new hero image (works for both Homepage & Shop Hero).
 * Returns { url, publicId }.
 */
export function useUploadHeroImage() {
  return useMutation({
    mutationFn: async (file) => {
      const res = await heroService.uploadHeroImage(file);
      return res?.data || res;
    },
  });
}

export { DEFAULT_HERO, DEFAULT_SHOP_HERO, DEFAULT_ANNOUNCEMENT_BANNER };

