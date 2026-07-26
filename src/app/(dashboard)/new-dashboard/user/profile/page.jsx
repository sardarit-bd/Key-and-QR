'use client';

import { motion } from 'framer-motion';
import { User, Mail, Camera, Save, Loader2, ChevronRight, Bell, Shield, HelpCircle, Info, Settings } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const SETTINGS_ENTRIES = [
  {
    id: 'preferences',
    label: 'Preferences',
    description: 'Language, theme, and display settings',
    icon: Settings,
    href: '/new-dashboard/user/profile/preferences',
  },
  {
    id: 'notifications',
    label: 'Notification Settings',
    description: 'Manage email and push notifications',
    icon: Bell,
    href: '/new-dashboard/user/profile/notifications',
  },
  {
    id: 'privacy',
    label: 'Privacy',
    description: 'Data sharing and visibility settings',
    icon: Shield,
    href: '/new-dashboard/user/profile/privacy',
  },
  {
    id: 'help',
    label: 'Help & Support',
    description: 'FAQs, contact support, report an issue',
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

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    setSaving(true);
    try {
      const res = await api.patch('/auth/update-profile', { name: name.trim() });
      if (res.data?.data) {
        setUser(res.data.data);
        toast.success('Profile updated');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.data) {
        setUser({ profileImage: res.data.data.url });
        toast.success('Avatar updated');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account information</p>
        </div>

        {/* Avatar Section */}
        <div className="mt-8 flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-accent/30">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-muted-foreground" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-accent rounded-full cursor-pointer hover:bg-accent/90 transition-colors">
              <Camera size={14} className="text-accent-foreground" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
          <div>
            <p className="text-foreground font-medium">{user?.name}</p>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            <p className="text-foreground-tertiary text-xs mt-1 capitalize">{user?.role} account</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-2">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-muted-foreground cursor-not-allowed"
              />
            </div>
            <p className="mt-1 text-xs text-foreground-tertiary">Email cannot be changed</p>
          </div>

          <button
            type="submit"
            disabled={saving || name.trim().length < 2}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-medium rounded-xl hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Settings Entries */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-foreground mb-4">Settings</h2>
          <div className="space-y-2">
            {SETTINGS_ENTRIES.map((entry) => {
              const Icon = entry.icon;
              return (
                <Link
                  key={entry.id}
                  href={entry.href}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-accent/30 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                    <Icon size={20} className="text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium text-sm">{entry.label}</p>
                    <p className="text-foreground-tertiary text-xs mt-0.5">{entry.description}</p>
                  </div>
                  <ChevronRight size={18} className="text-foreground-tertiary group-hover:text-accent transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
