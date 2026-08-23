'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Save,
  Loader2,
  KeyRound,
  ShieldCheck,
  Lock,
  Calendar,
  PencilLine,
  X,
  AlertTriangle,
  LogOut,
  ChevronRight,
  HelpCircle,
  Info,
  Crown,
  AtSign,
  Globe,
  RefreshCcw,
  CheckCircle2,
  BadgeCheck,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { formatMemberSince } from '@/utils/sidebar.utils';
import AvatarUploader from '@/components/profile/AvatarUploader';
import SectionCard from '@/components/profile/SectionCard';
import { ProviderBadge, MembershipBadge } from '@/components/profile/ProfileBadge';
import ProfileBadge from '@/components/profile/ProfileBadge';
import PasswordInput from '@/components/profile/PasswordInput';
import PasswordStrengthMeter, { scorePassword } from '@/components/profile/PasswordStrengthMeter';
import QuickActions from '@/components/profile/QuickActions';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';

/**
 * Profile Page — premium Account & Security Center.
 *
 * Phase 1 (view/edit modes, avatar upload, premium header) preserved.
 * Phase 2 adds: Security Center, upgraded password experience,
 * Premium Membership card, Quick Actions, and skeleton loading.
 *
 * Uses existing endpoints ONLY — no authentication architecture changes.
 */

const SECTION_LINKS = [
  {
    id: 'help',
    label: 'Help & Support',
    description: 'FAQs, contact support',
    icon: HelpCircle,
    href: '/new-dashboard/user/profile/help',
  },
  {
    id: 'about',
    label: 'About Us',
    description: 'Learn more about InspireTag',
    icon: Info,
    href: '/new-dashboard/user/profile/about',
  },
];

function Row({ label, value, icon: Icon, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
      <div className="flex items-center gap-2.5 text-foreground-tertiary">
        {Icon && <Icon size={16} className="w-4 h-4 shrink-0" />}
        <span className="text-[13px] font-medium">{label}</span>
      </div>
      <div className="text-right text-foreground text-[13px] font-medium flex items-center gap-2">
        {children || value}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-white/6 light:bg-[#E8DFCE]/70" />;
}

// Account type label per role.
function accountTypeLabel(role) {
  if (role === 'admin') return 'Administrator';
  if (role === 'moderator') return 'Moderator';
  return 'Standard';
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();
  const { mySubscriptions, fetchMySubscriptions } = useSubscriptionStore();

  // ---------- View / Edit mode ----------
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // ---------- Avatar state ----------
  const [avatarPending, setAvatarPending] = useState(false);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // ---------- Change password modal ----------
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwOld, setPwOld] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwChanging, setPwChanging] = useState(false);
  const [pwError, setPwError] = useState(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const pwSuccessTimerRef = useRef(null);

  // Unsaved-changes tracking
  const dirtyRef = useRef(false);
  const avatarUploaderRef = useRef(null);
  const isProviderLocal = (user?.provider || 'local') === 'local';

  // ---------- Subscription ----------
  useEffect(() => {
    fetchMySubscriptions().catch(() => { });
  }, [fetchMySubscriptions]);

  const isPremium = useMemo(() => {
    if (user?.role === 'admin' || user?.role === 'ADMIN') return true;
    if (user?.isPremium === true || user?.premium === true || user?.plan === 'premium') return true;
    return Array.isArray(mySubscriptions)
      ? mySubscriptions.some(
        (sub) => sub?.status === 'active' || sub?.status === 'trialing'
      )
      : false;
  }, [user, mySubscriptions]);

  const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN';

  // ---------- Subscription summary ----------
  const activeSubscription = useMemo(() => {
    if (!Array.isArray(mySubscriptions)) return null;
    return (
      mySubscriptions.find(
        (sub) => sub?.status === 'active' || sub?.status === 'trialing'
      ) || null
    );
  }, [mySubscriptions]);

  const subscriptionSummary = useMemo(() => {
    if (!activeSubscription) {
      return {
        plan: 'Free',
        status: 'inactive',
        statusLabel: 'Not subscribed',
        renewalDate: null,
        billingCycle: '—',
      };
    }
    const cycle = activeSubscription.currentPeriodEnd
      ? new Date(activeSubscription.currentPeriodEnd).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      : null;
    return {
      plan: activeSubscription.subscriptionType === 'subscriber' ? 'Premium' : 'Premium',
      status: activeSubscription.status,
      statusLabel:
        activeSubscription.status === 'trialing' ? 'Trial active' : 'Active',
      renewalDate: cycle,
      billingCycle: activeSubscription.billingCycle || 'Monthly',
    };
  }, [activeSubscription]);

  // ---------- 30-Day Name Change Cooldown Calculation ----------
  const nameCooldownInfo = useMemo(() => {
    if (!user?.nameChangedAt) {
      return { isLocked: false, remainingDays: 0, nextAllowedDate: null };
    }
    // Admin and Support/Moderator roles override the restriction
    if (user?.role === 'admin' || user?.role === 'ADMIN' || user?.role === 'moderator') {
      return { isLocked: false, remainingDays: 0, nextAllowedDate: null };
    }

    const lastChangedTime = new Date(user.nameChangedAt).getTime();
    const cooldownMs = 30 * 24 * 60 * 60 * 1000;
    const nextAllowedTime = lastChangedTime + cooldownMs;
    const now = Date.now();

    if (now < nextAllowedTime) {
      const remainingMs = nextAllowedTime - now;
      const remainingDays = Math.max(1, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
      const nextAllowedDate = new Date(nextAllowedTime).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      return { isLocked: true, remainingDays, nextAllowedDate };
    }

    return { isLocked: false, remainingDays: 0, nextAllowedDate: null };
  }, [user?.nameChangedAt, user?.role]);

  // ---------- Sync local state when user loads / changes ----------
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setOriginalName(user.name || '');
      setAvatarRemoved(false);
    }
  }, [user?._id, user?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- Unsaved changes guard ----------
  const hasUnsaved = useMemo(
    () =>
      isEditing &&
      (name.trim() !== (originalName || '').trim() || avatarPending || avatarRemoved),
    [isEditing, name, originalName, avatarPending, avatarRemoved]
  );

  // Keep ref in sync for beforeunload
  useEffect(() => {
    dirtyRef.current = hasUnsaved;
  }, [hasUnsaved]);

  useEffect(() => {
    if (!isEditing) return;

    const handleBeforeUnload = (e) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditing]);

  // Intercept in-app navigation while dirty (Next.js App Router)
  useEffect(() => {
    const originalPush = router.push;
    const guard = (...args) => {
      if (dirtyRef.current) {
        const leave = window.confirm(
          'You have unsaved changes. Leave without saving?'
        );
        if (!leave) return Promise.resolve(false);
      }
      return originalPush(...args);
    };
    router.push = guard;
    return () => {
      router.push = originalPush;
    };
  }, [router]);

  // ---------- Actions ----------
  const handleEnterEdit = useCallback(() => {
    if (user) {
      setName(user.name || '');
      setOriginalName(user.name || '');
    }
    setAvatarPending(false);
    setAvatarRemoved(false);
    setSaveError(null);
    setIsEditing(true);
  }, [user]);

  const handleCancel = useCallback(() => {
    if (user) {
      setName(user.name || '');
      setOriginalName(user.name || '');
    }
    setAvatarPending(false);
    setAvatarRemoved(false);
    setSaveError(null);
    setIsEditing(false);
  }, [user]);

  const handleSave = useCallback(async () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    setSaving(true);
    setSaveError(null);

    try {
      // 1) Upload staged avatar (if any) — existing POST /auth/upload-avatar.
      if (avatarUploaderRef.current?.hasPending?.() && !avatarUploaderRef.current?.hasRemoval?.()) {
        const uploaded = await avatarUploaderRef.current.save();
        if (!uploaded) {
          // Upload failed — keep edit mode so the user can retry.
          setSaving(false);
          return;
        }
      }

      // 1b) Persist removal — existing PATCH /auth/update-profile (profileImage: null).
      if (avatarUploaderRef.current?.hasRemoval?.()) {
        await avatarUploaderRef.current.remove();
      }

      // 2) Persist name if modified — existing PATCH /auth/update-profile.
      const isNameModified = trimmedName !== (originalName || '').trim();
      if (isNameModified) {
        const res = await api.patch('/auth/update-profile', { name: trimmedName });
        const updated = res.data?.data;
        if (updated) {
          updateUser(updated);
          setOriginalName(updated.name || trimmedName);
        }
      }

      setAvatarPending(false);
      setAvatarRemoved(false);
      setIsEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile';
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }, [name, originalName, updateUser]);

  const handleAvatarPendingChange = useCallback((pending) => {
    setAvatarPending(pending);
  }, []);

  const handleAvatarRemoved = useCallback((removed) => {
    setAvatarRemoved(removed);
  }, []);

  const handleAvatarUploadStateChange = useCallback((uploading) => {
    setAvatarUploading(uploading);
  }, []);

  const handleOpenPassword = useCallback(() => {
    setShowPasswordModal(true);
    setPwError(null);
    setPwSuccess(false);
  }, []);

  const handleChangePassword = useCallback(async () => {
    // Reset
    setPwError(null);
    setPwSuccess(false);

    if (!pwOld) return setPwError('Current password is required.');
    if (pwNew.length < 6) return setPwError('New password must be at least 6 characters.');
    if (scorePassword(pwNew).score < 3) {
      return setPwError('New password is too weak. Aim for at least 8 characters with upper/lowercase, a number, and a special character.');
    }
    if (pwNew !== pwConfirm) return setPwError('New passwords do not match.');
    if (pwOld === pwNew) return setPwError('New password must be different from current password.');

    setPwChanging(true);
    try {
      await api.post('/auth/change-password', {
        oldPassword: pwOld,
        newPassword: pwNew,
      });
      setPwSuccess(true);
      toast.success('Password changed successfully!');
      // Brief success animation, then close.
      pwSuccessTimerRef.current = setTimeout(() => {
        setShowPasswordModal(false);
        setPwOld('');
        setPwNew('');
        setPwConfirm('');
        setPwSuccess(false);
      }, 900);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to change password.';
      setPwError(message);
    } finally {
      setPwChanging(false);
    }
  }, [pwOld, pwNew, pwConfirm]);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  // ---------- Loading / empty states ----------
  if (!user) {
    return <ProfileSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* ---------- Page header ---------- */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Profile
            </h1>
            <p className="text-sm text-foreground-tertiary mt-1">
              Manage your account information
            </p>
          </div>

          {/* Mode toggle */}
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || avatarUploading || name.trim().length < 2}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-accent-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Saving…' : avatarUploading ? 'Uploading…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving || avatarUploading}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-background-secondary/40 px-4 py-2 text-[13px] font-medium text-foreground-secondary transition-all duration-300 hover:border-white/20 hover:text-foreground active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="viewing"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                type="button"
                onClick={handleEnterEdit}
                className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-[13px] font-semibold text-accent transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent/20 active:scale-95 cursor-pointer"
              >
                <PencilLine className="w-4 h-4" />
                Edit Profile
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ---------- Unsaved changes banner ---------- */}
        <AnimatePresence>
          {hasUnsaved && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                You have unsaved changes. Save or cancel before leaving.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- Save error banner ---------- */}
        <AnimatePresence>
          {saveError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-[13px] text-red-400" role="alert">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {saveError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- Profile header card ---------- */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[24px] border border-white/6 bg-gradient-to-r from-card to-card/60 p-6 sm:p-8 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)] backdrop-blur-sm light:border-[#E8DFCE]/80 light:bg-gradient-to-r light:from-[#FBF7EF]/75 light:to-[#FBF7EF]/40 light:shadow-[0_20px_50px_-20px_rgba(100,72,24,0.28),0_10px_30px_-18px_rgba(100,72,24,0.16)]"
        >
          {/* Ambient glows */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-accent/[0.07] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-primary/[0.08] blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent light:via-[#E8DFCE]/70" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar — editing allows replace/remove; viewing shows compact */}
            <div className="shrink-0">
              <AvatarUploader
                ref={avatarUploaderRef}
                editing={isEditing}
                compact={!isEditing}
                size="lg"
                onPendingChange={handleAvatarPendingChange}
                onRemoved={handleAvatarRemoved}
                onUploadStateChange={handleAvatarUploadStateChange}
              />
            </div>

            {/* Info & Badges Section (Right) */}
            <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start text-center sm:text-left">
              {/* Name */}
              {isEditing ? (
                <div className="relative w-full max-w-[340px]">
                  <User className="absolute left-3 top-3 text-foreground-tertiary" size={16} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={nameCooldownInfo.isLocked}
                    maxLength={50}
                    placeholder="Your name"
                    aria-label="Full name"
                    className={`w-full rounded-xl border border-white/10 py-2.5 pl-9 pr-4 text-left text-lg font-semibold text-foreground placeholder:text-foreground-tertiary transition-all duration-300 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 light:border-[#E8DFCE]/80 ${nameCooldownInfo.isLocked
                      ? 'bg-muted/40 cursor-not-allowed opacity-80 select-none'
                      : 'bg-background-secondary/50 light:bg-white/70'
                      }`}
                  />
                  {nameCooldownInfo.isLocked ? (
                    <p className="text-[11px] text-amber-500/90 dark:text-amber-400/90 font-medium mt-2 flex items-center justify-start gap-1.5 px-1">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>Name changes available in {nameCooldownInfo.remainingDays} {nameCooldownInfo.remainingDays === 1 ? 'day' : 'days'} ({nameCooldownInfo.nextAllowedDate})</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-foreground-tertiary font-medium mt-1.5 flex items-center justify-start gap-1.5 px-1">
                      <Info className="w-3.5 h-3.5 shrink-0 text-foreground-tertiary" />
                      <span>Note: You can only change your name once every 30 days.</span>
                    </p>
                  )}
                </div>
              ) : (
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {user.name}
                </h2>
              )}

              {/* Email */}
              <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-foreground-secondary">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>{user.email}</span>
              </p>

              {/* Badges */}
              <div className="mt-3.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <MembershipBadge isPremium={isPremium} isAdmin={isAdmin} />
                <ProviderBadge provider={user.provider} />
                {user.role === 'moderator' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-medium text-blue-400 backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5" /> Moderator
                  </span>
                )}
              </div>

              {/* Member since */}
              {user.createdAt && (
                <p className="mt-3 flex items-center gap-1.5 text-[12px] text-foreground-tertiary">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Member since {formatMemberSince(user.createdAt)}</span>
                </p>
              )}
            </div>
          </div>
        </motion.section>

        {/* ---------- Account Information ---------- */}
        <div className="mt-5">
          <SectionCard
            icon={User}
            title="Account Information"
            description="Your basic account details"
            delay={0.05}
          >
            <div className="divide-y divide-white/6 light:divide-[#E8DFCE]/70">
              <Row label="Full Name" icon={User}>
                {isEditing ? (
                  <div className="text-right flex flex-col items-end">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={nameCooldownInfo.isLocked}
                      maxLength={50}
                      aria-label="Full name"
                      className={`w-full max-w-[220px] rounded-lg border border-white/10 px-3 py-1.5 text-right text-[13px] text-foreground focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 ${nameCooldownInfo.isLocked
                        ? 'bg-muted/40 cursor-not-allowed opacity-80 select-none'
                        : 'bg-background-secondary/50'
                        }`}
                    />
                    {nameCooldownInfo.isLocked ? (
                      <p className="text-[11px] text-amber-500/90 dark:text-amber-400/90 mt-1 flex items-center justify-end gap-1 font-medium">
                        <Lock className="w-3 h-3 shrink-0" />
                        <span>Available {nameCooldownInfo.nextAllowedDate}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-foreground-tertiary mt-1 flex items-center justify-end gap-1 font-medium">
                        <Info className="w-3 h-3 shrink-0" />
                        <span>Note: You can only change your name once every 30 days.</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="capitalize">{user.name}</span>
                )}
              </Row>
              <Divider />
              <Row label="Email" icon={Mail}>
                <span className="text-foreground-secondary">{user.email}</span>
              </Row>
              <Divider />
              <Row label="Account Type" icon={ShieldCheck}>
                <span className="capitalize">{accountTypeLabel(user.role)}</span>
              </Row>
              <Divider />
              <Row label="Login Provider" icon={AtSign}>
                <ProviderBadge provider={user.provider} />
              </Row>
              <Divider />
              <Row label="Account Created" icon={BadgeCheck}>
                <span className="text-foreground-secondary">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                    : '—'}
                </span>
              </Row>
            </div>
          </SectionCard>
        </div>

        {/* ---------- Premium Membership ---------- */}
        <div className="mt-5">
          <SectionCard
            icon={Crown}
            title="Premium Membership"
            description="Your subscription at a glance"
            delay={0.13}
            action={
              isPremium && (
                <ProfileBadge icon={Crown} tone="premium">
                  Premium
                </ProfileBadge>
              )
            }
          >
            {/* Membership hero — merged plan/status/renewal/billing */}
            <div className="relative overflow-hidden rounded-2xl border border-white/6 bg-gradient-to-br from-background-secondary/80 to-background-secondary/30 p-5 sm:p-6 light:border-[#E8DFCE]/80 light:bg-white/60">
              {/* Soft premium glow */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/[0.08] blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-primary/[0.08] blur-3xl" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Plan + status */}
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 shadow-[0_0_24px_rgba(253,182,92,0.15)]">
                    <Crown size={24} className="text-accent" />
                  </span>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-foreground-tertiary">
                      Current Plan
                    </p>
                    <p className="mt-0.5 text-xl font-bold tracking-tight text-foreground">
                      {subscriptionSummary.plan}
                    </p>
                    <div className="mt-1.5">
                      {isPremium ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          {subscriptionSummary.statusLabel}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-background-secondary/50 px-2.5 py-0.5 text-[11px] font-medium text-foreground-tertiary">
                          Free plan
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info divider */}
                <div className="hidden sm:block h-14 w-px bg-white/8 light:bg-[#E8DFCE]/70" />

                {/* Renewal + billing */}
                <div className="flex flex-1 flex-wrap gap-x-8 gap-y-3">
                  <div>
                    <p className="text-[11px] font-medium text-foreground-tertiary">Billing Cycle</p>
                    <p className="mt-1 text-[14px] font-semibold text-foreground">
                      {subscriptionSummary.billingCycle}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-foreground-tertiary">Renewal Date</p>
                    <p className="mt-1 text-[14px] font-semibold text-foreground">
                      {subscriptionSummary.renewalDate || '—'}
                    </p>
                  </div>
                  <div className="sm:ml-auto flex items-end">
                    <Link
                      href="/new-dashboard/user/premium"
                      className="inline-flex items-center gap-1 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1.5 text-[12px] font-medium text-accent transition-all duration-300 hover:bg-accent/20"
                    >
                      {isPremium ? 'Manage Subscription' : 'View Plans'}
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 text-[12px] leading-relaxed text-foreground-tertiary">
              {isPremium
                ? 'Your premium membership is active — enjoy unlimited inspiration, all categories, and an ad-free experience.'
                : 'Upgrade to Premium for unlimited quotes, all categories, and an elevated experience.'}
            </p>
          </SectionCard>
        </div>

        {/* ---------- Security Center ---------- */}
        <div className="mt-5">
          <SectionCard
            icon={ShieldCheck}
            title="Security Center"
            description="Password and account protection"
            delay={0.15}
          >
            <div className="divide-y divide-white/6 light:divide-[#E8DFCE]/70">
              {/* Password status */}
              <Row
                label="Password"
                icon={KeyRound}
                value={
                  isProviderLocal ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> Password is configured
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-400">
                      <Globe className="w-3 h-3" /> Managed by Google
                    </span>
                  )
                }
              />

              <Divider />

              {isProviderLocal ? (
                <>
                  <Row label="Change Password" icon={Lock}>
                    <button
                      type="button"
                      onClick={handleOpenPassword}
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-background-secondary/40 px-3 py-1.5 text-[12px] font-medium text-foreground-secondary transition-all duration-300 hover:border-accent/30 hover:text-accent cursor-pointer"
                    >
                      <PencilLine className="w-3.5 h-3.5" /> Change
                    </button>
                  </Row>
                  <Divider />
                  <Row label="Forgot Password" icon={RefreshCcw}>
                    <Link
                      href="/forgot-password"
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-background-secondary/40 px-3 py-1.5 text-[12px] font-medium text-foreground-secondary transition-all duration-300 hover:border-accent/30 hover:text-accent"
                    >
                      Reset <ChevronRight className="w-3 h-3" />
                    </Link>
                  </Row>
                </>
              ) : (
                <Row label="Sign-in Method" icon={Globe}>
                  <div className="flex items-center gap-2 text-right">
                    <span className="text-[12px] text-foreground-tertiary">
                      This account signs in using Google
                    </span>
                    <ProviderBadge provider={user.provider} />
                  </div>
                </Row>
              )}

              <Divider />

              <Row label="Session" icon={LogOut}>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1.5 text-[12px] font-medium text-red-400 transition-all duration-300 hover:bg-red-500/20 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </Row>
            </div>
          </SectionCard>
        </div>

        {/* ---------- Quick Actions ---------- */}
        {/* <div className="mt-5">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-accent/25 bg-accent/10 shadow-[0_0_16px_rgba(253,182,92,0.12)]">
              <Zap className="w-3.5 h-3.5 text-accent" />
            </span>
            <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
              Quick Actions
            </h2>
          </div>
          <QuickActions />
        </div> */}

        {/* ---------- Support links ---------- */}
        {/* <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SECTION_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.id}
                href={link.href}
                className="group flex items-center gap-3 rounded-[18px] border border-white/6 bg-card p-4 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_16px_36px_-12px_rgb(0_0_0/0.5)] light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/55"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-background-secondary/50 text-foreground-secondary transition-all duration-300 group-hover:border-accent/25 group-hover:bg-accent/10 group-hover:text-accent">
                  <Icon size={18} className="w-[18px] h-[18px]" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground">{link.label}</p>
                  <p className="text-[11px] text-foreground-tertiary mt-0.5">{link.description}</p>
                </div>
                <ChevronRight size={16} className="text-foreground-tertiary group-hover:text-accent transition-colors" />
              </Link>
            );
          })}
        </div> */}
      </div>

      {/* ---------- Change Password Modal ---------- */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm px-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 14 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-accent/20 bg-card p-6 sm:p-8 shadow-2xl light:border-[#E8DFCE]/80"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Ambient glows */}
              <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-accent/25 bg-accent/10">
                      <Lock size={16} className="text-accent" />
                    </span>
                    <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    aria-label="Close"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-background-secondary/60 text-foreground-secondary transition-all duration-300 hover:rotate-90 hover:text-foreground cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {pwError && !pwSuccess && (
                  <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-400" role="alert">
                    {pwError}
                  </div>
                )}

                {pwSuccess ? (
                  /* Success state */
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center py-8 text-center"
                  >
                    <motion.span
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30 shadow-[0_0_32px_rgba(52,211,153,0.35)]"
                    >
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </motion.span>
                    <h3 className="mt-4 text-[15px] font-semibold text-foreground">
                      Password changed!
                    </h3>
                    <p className="mt-1 text-[12px] text-foreground-tertiary">
                      Your new password is active. Signing you back in seamlessly.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <PasswordInput
                        id="pw-old"
                        label="Current Password"
                        value={pwOld}
                        onChange={(e) => setPwOld(e.target?.value ?? e)}
                        placeholder="Enter current password"
                        autoComplete="current-password"
                        hasError={!!pwError}
                      />
                      <div className="space-y-2.5">
                        <PasswordInput
                          id="pw-new"
                          label="New Password"
                          value={pwNew}
                          onChange={(e) => setPwNew(e.target?.value ?? e)}
                          placeholder="Min 8 characters"
                          autoComplete="new-password"
                          hasError={!!pwError}
                        />
                        <PasswordStrengthMeter password={pwNew} />
                      </div>
                      <PasswordInput
                        id="pw-confirm"
                        label="Confirm New Password"
                        value={pwConfirm}
                        onChange={(e) => setPwConfirm(e.target?.value ?? e)}
                        placeholder="Re-enter new password"
                        autoComplete="new-password"
                        hasError={!!pwError}
                      />
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        onClick={handleChangePassword}
                        disabled={pwChanging}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-all duration-300 hover:bg-accent/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {pwChanging ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {pwChanging ? 'Updating…' : 'Update Password'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPasswordModal(false)}
                        disabled={pwChanging}
                        className="flex-1 rounded-xl border border-white/10 bg-background-secondary/40 px-4 py-2.5 text-sm font-medium text-foreground-secondary transition-all duration-300 hover:border-white/20 hover:text-foreground disabled:opacity-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
