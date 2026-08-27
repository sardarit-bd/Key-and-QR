'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Mail,
  User,
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
  AtSign,
  Globe,
  RefreshCcw,
  CheckCircle2,
  BadgeCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { formatMemberSince } from '@/utils/sidebar.utils';
import AvatarUploader from '@/components/dashboard/shared/profile/AvatarUploader';
import SectionCard from '@/components/dashboard/shared/profile/SectionCard';
import { ProviderBadge } from '@/components/dashboard/shared/profile/ProfileBadge';
import PasswordInput from '@/components/dashboard/shared/profile/PasswordInput';
import PasswordStrengthMeter, { scorePassword } from '@/components/dashboard/shared/profile/PasswordStrengthMeter';
import ProfileSkeleton from '@/components/dashboard/shared/profile/ProfileSkeleton';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  return <div className="h-px bg-white/6 dark:bg-white/6 light:bg-[#E8DFCE]/70" />;
}

export default function AdminProfilePage() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();

  // ---------- View / Edit mode ----------
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [email, setEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
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

  // ---------- Sync local state when user loads / changes ----------
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setOriginalName(user.name || '');
      setEmail(user.email || '');
      setOriginalEmail(user.email || '');
      setAvatarRemoved(false);
    }
  }, [user?._id, user?.name, user?.email]);

  // ---------- Unsaved changes guard ----------
  const hasUnsaved = useMemo(
    () =>
      isEditing &&
      (name.trim() !== (originalName || '').trim() ||
        email.trim().toLowerCase() !== (originalEmail || '').trim().toLowerCase() ||
        avatarPending ||
        avatarRemoved),
    [isEditing, name, originalName, email, originalEmail, avatarPending, avatarRemoved]
  );

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

  // Intercept in-app navigation while dirty
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
      setEmail(user.email || '');
      setOriginalEmail(user.email || '');
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
      setEmail(user.email || '');
      setOriginalEmail(user.email || '');
    }
    setAvatarPending(false);
    setAvatarRemoved(false);
    setSaveError(null);
    setIsEditing(false);
  }, [user]);

  const handleSave = useCallback(async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      toast.error('Please provide a valid email address');
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      // 1) Upload staged avatar (if any)
      if (avatarUploaderRef.current?.hasPending?.() && !avatarUploaderRef.current?.hasRemoval?.()) {
        const uploaded = await avatarUploaderRef.current.save();
        if (!uploaded) {
          setSaving(false);
          return;
        }
      }

      // 1b) Persist removal
      if (avatarUploaderRef.current?.hasRemoval?.()) {
        await avatarUploaderRef.current.remove();
      }

      // 2) Persist name/email if modified
      const isNameModified = trimmedName !== (originalName || '').trim();
      const isEmailModified = trimmedEmail !== (originalEmail || '').trim().toLowerCase();

      if (isNameModified || isEmailModified) {
        const payload = {};
        if (isNameModified) payload.name = trimmedName;
        if (isEmailModified) payload.email = trimmedEmail;

        const res = await api.patch('/auth/update-profile', payload);
        const updated = res.data?.data;
        if (updated) {
          updateUser(updated);
          setOriginalName(updated.name || trimmedName);
          setOriginalEmail(updated.email || trimmedEmail);
        }
      }

      setAvatarPending(false);
      setAvatarRemoved(false);
      setIsEditing(false);
      toast.success('Admin profile updated!');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile';
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }, [name, originalName, email, originalEmail, updateUser]);

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
    setPwOld('');
    setPwNew('');
    setPwConfirm('');
    setPwError(null);
    setPwSuccess(false);
  }, []);

  const handleChangePassword = useCallback(async () => {
    setPwError(null);
    setPwSuccess(false);

    if (!pwOld) return setPwError('Current password is required.');
    if (pwNew.length < 8) return setPwError('New password must be at least 8 characters.');
    if (scorePassword(pwNew).score < 3) {
      return setPwError('New password is too weak. Please include uppercase, lowercase, numbers, and special characters.');
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
      toast.success('Password updated successfully.');
      pwSuccessTimerRef.current = setTimeout(() => {
        setShowPasswordModal(false);
        setPwOld('');
        setPwNew('');
        setPwConfirm('');
        setPwSuccess(false);
      }, 900);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to change password. Please verify current password.';
      setPwError(message);
      toast.error(message);
    } finally {
      setPwChanging(false);
    }
  }, [pwOld, pwNew, pwConfirm]);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
        {/* ---------- Page header ---------- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Shield size={18} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Admin Profile
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-foreground-secondary mt-1">
              Manage your administrator account information and security settings.
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
                  disabled={saving || avatarUploading || name.trim().length < 2 || !email.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Saving…' : avatarUploading ? 'Uploading…' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving || avatarUploading}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground-secondary hover:bg-muted hover:text-foreground active:scale-95 disabled:opacity-50 cursor-pointer transition-all"
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
                className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 active:scale-95 cursor-pointer transition-all"
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
              <div className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs sm:text-sm text-amber-500 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                You have unsaved changes. Please save or cancel before navigating away.
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
              <div className="flex items-center gap-2 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-xs sm:text-sm text-destructive" role="alert">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {saveError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- Profile overview card ---------- */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[24px] border border-border/80 bg-gradient-to-r from-card to-card/50 p-6 sm:p-8 shadow-sm backdrop-blur-sm"
        >
          {/* Ambient glows */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/[0.06] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-primary/[0.06] blur-3xl" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
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
                    maxLength={50}
                    placeholder="Admin Name"
                    aria-label="Admin full name"
                    className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-4 text-left text-lg font-bold text-foreground placeholder:text-foreground-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              ) : (
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {user.name}
                </h2>
              )}

              {/* Email */}
              <p className="mt-1.5 flex items-center gap-1.5 text-xs sm:text-sm text-foreground-secondary">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>{user.email}</span>
              </p>

              {/* Badges */}
              <div className="mt-3.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Administrator
                </span>
                <ProviderBadge provider={user.provider} />
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              </div>

              {/* Member since */}
              {user.createdAt && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-foreground-tertiary">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Admin since {formatMemberSince(user.createdAt)}</span>
                </p>
              )}
            </div>
          </div>
        </motion.section>

        {/* ---------- Personal Information ---------- */}
        <SectionCard
          icon={User}
          title="Personal Information"
          description="Your administrator profile details"
          delay={0.05}
        >
          <div className="divide-y divide-border/60">
            <Row label="Full Name" icon={User}>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  aria-label="Full name"
                  className="w-full max-w-[240px] rounded-lg border border-border bg-background px-3 py-1.5 text-right text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              ) : (
                <span className="capitalize font-semibold">{user.name}</span>
              )}
            </Row>
            <Divider />
            <Row label="Email Address" icon={Mail}>
              {isEditing && isProviderLocal ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={100}
                  aria-label="Email address"
                  placeholder="admin@example.com"
                  className="w-full max-w-[240px] rounded-lg border border-border bg-background px-3 py-1.5 text-right text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-foreground-secondary">{user.email}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                </div>
              )}
            </Row>
            <Divider />
            <Row label="Role" icon={Shield}>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Administrator
              </span>
            </Row>
            <Divider />
            <Row label="Account Status" icon={BadgeCheck}>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={13} /> Active
              </span>
            </Row>
            <Divider />
            <Row label="Login Provider" icon={AtSign}>
              <ProviderBadge provider={user.provider} />
            </Row>
            <Divider />
            <Row label="Member Since" icon={Calendar}>
              <span className="text-foreground-secondary">
                {formatMemberSince(user.createdAt) || '—'}
              </span>
            </Row>
          </div>
        </SectionCard>

        {/* ---------- Security Center ---------- */}
        <SectionCard
          icon={ShieldCheck}
          title="Security Center"
          description="Password and authentication protection"
          delay={0.1}
        >
          <div className="divide-y divide-border/60">
            <Row
              label="Password"
              icon={KeyRound}
              value={
                isProviderLocal ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
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
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted hover:text-primary transition-all cursor-pointer shadow-xs"
                  >
                    <PencilLine className="w-3.5 h-3.5" /> Update Password
                  </button>
                </Row>
                <Divider />
                <Row label="Reset Password via Email" icon={RefreshCcw}>
                  <Link
                    href="/forgot-password"
                    className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground-secondary hover:text-foreground transition-all"
                  >
                    Send Reset Link <ChevronRight className="w-3 h-3" />
                  </Link>
                </Row>
              </>
            ) : (
              <Row label="Sign-in Method" icon={Globe}>
                <div className="flex items-center gap-2 text-right">
                  <span className="text-xs text-foreground-tertiary">
                    This admin account signs in securely using Google OAuth
                  </span>
                  <ProviderBadge provider={user.provider} />
                </div>
              </Row>
            )}
          </div>
        </SectionCard>

        {/* ---------- Account Actions ---------- */}
        <SectionCard
          icon={LogOut}
          title="Account Actions"
          description="Sign out from your administrative session"
          delay={0.15}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
            <div>
              <p className="text-sm font-semibold text-foreground">Sign Out</p>
              <p className="text-xs text-foreground-tertiary mt-0.5">
                Safely end your current admin session on this device.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs sm:text-sm font-semibold hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 cursor-pointer w-full sm:w-auto"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </SectionCard>
      </div>

      {/* ---------- Change Password Modal ---------- */}
      <AnimatePresence>
        {showPasswordModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Lock size={16} />
                  </span>
                  <h3 className="text-base font-bold text-foreground">Change Password</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="p-1 rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              {pwError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/25 text-xs text-destructive flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{pwError}</span>
                </div>
              )}

              {pwSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>Password updated successfully.</span>
                </div>
              )}

              <div className="space-y-3">
                <PasswordInput
                  id="admin-pw-current"
                  label="Current Password"
                  value={pwOld}
                  onChange={(e) => setPwOld(e.target?.value ?? e)}
                  placeholder="Enter current password"
                />

                <PasswordInput
                  id="admin-pw-new"
                  label="New Password"
                  value={pwNew}
                  onChange={(e) => setPwNew(e.target?.value ?? e)}
                  placeholder="At least 8 characters"
                />

                {pwNew && <PasswordStrengthMeter password={pwNew} />}

                <PasswordInput
                  id="admin-pw-confirm"
                  label="Confirm New Password"
                  value={pwConfirm}
                  onChange={(e) => setPwConfirm(e.target?.value ?? e)}
                  placeholder="Re-enter new password"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={pwChanging || !pwOld || !pwNew || !pwConfirm}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {pwChanging ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {pwChanging ? 'Updating…' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={pwChanging}
                  className="px-4 py-2.5 rounded-xl border border-border text-foreground-secondary text-xs sm:text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: 'var(--popover)',
            color: 'var(--popover-foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </motion.div>
  );
}
