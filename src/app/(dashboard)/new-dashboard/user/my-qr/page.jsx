'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Download,
  Copy,
  ExternalLink,
  Check,
  Package,
  ShoppingBag,
  Calendar,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  Clock,
  AlertCircle,
  Tag as TagIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { QRCodeCanvas } from 'qrcode.react';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function MyQRPage() {
  const [copiedCode, setCopiedCode] = useState(null);

  // Fetch assigned tags for the authenticated user
  const {
    data: tags = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['my-assigned-tags'],
    queryFn: async () => {
      const res = await api.get('/tags/me');
      return res.data?.data || res.data || [];
    },
    staleTime: 30_000,
  });

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin;
    }
    return '';
  };

  const handleCopy = async (tagCode) => {
    const url = `${getBaseUrl()}/t/${tagCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedCode(tagCode);
      toast.success('Public QR scan link copied to clipboard!');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleDownload = (tagCode) => {
    const canvas = document.querySelector(`#canvas-${tagCode} canvas`);
    if (!canvas) {
      toast.error('Could not generate QR image');
      return;
    }
    const link = document.createElement('a');
    link.download = `InspireTag-QR-${tagCode}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code image downloaded!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent border border-accent/20">
                <QrCode size={18} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                My QR
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-foreground-secondary mt-1">
              View your assigned physical QR tags, download digital codes, and share inspirational scan links.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="self-start sm:self-auto rounded-xl border-border bg-card text-xs font-medium cursor-pointer"
          >
            <RefreshCw size={13} className="mr-1.5" />
            Refresh
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/60 bg-card p-6 space-y-4 animate-pulse"
              >
                <div className="h-6 bg-muted rounded-lg w-1/3" />
                <div className="h-48 bg-muted rounded-2xl w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="rounded-2xl border border-destructive/25 bg-destructive/10 p-8 text-center space-y-3">
            <AlertCircle size={32} className="mx-auto text-destructive" />
            <h3 className="text-base font-semibold text-destructive">
              Failed to load assigned QR codes
            </h3>
            <p className="text-xs sm:text-sm text-foreground-tertiary max-w-md mx-auto">
              {error?.response?.data?.message || error?.message || 'An error occurred while fetching your assigned tags.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-2 rounded-xl"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && tags.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[24px] border border-border/80 bg-card p-10 sm:p-14 text-center space-y-5 shadow-sm max-w-2xl mx-auto"
          >
            <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-3xl bg-accent/10 border border-accent/20 text-accent">
              <QrCode size={40} strokeWidth={1.5} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                No QR Assigned Yet
              </h2>
              <p className="text-xs sm:text-sm text-foreground-secondary max-w-md mx-auto leading-relaxed">
                Your assigned QR tags will appear here as soon as an administrator links a physical tag to your order.
              </p>
            </div>

            <div className="pt-3">
              <Link href="/new-dashboard/user/orders">
                <Button className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer shadow-sm">
                  <Package size={16} className="mr-2" />
                  View My Orders
                  <ArrowRight size={14} className="ml-1.5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Tags List */}
        {!isLoading && !isError && tags.length > 0 && (
          <div className="space-y-6">
            {/* Stats Header */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-border/60 bg-card p-4">
                <p className="text-[11px] font-medium text-foreground-tertiary uppercase tracking-wider">
                  Total QR Tags
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {tags.length}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-4">
                <p className="text-[11px] font-medium text-foreground-tertiary uppercase tracking-wider">
                  Active Status
                </p>
                <p className="text-2xl font-bold text-emerald-500 mt-1 flex items-center gap-1.5">
                  <ShieldCheck size={20} />
                  {tags.filter((t) => t.isActive).length} Active
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-2xl border border-border/60 bg-card p-4">
                <p className="text-[11px] font-medium text-foreground-tertiary uppercase tracking-wider">
                  Access Mode
                </p>
                <p className="text-2xl font-bold text-foreground mt-1 capitalize">
                  {tags[0]?.subscriptionType || 'Free'}
                </p>
              </div>
            </div>

            {/* QR Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tags.map((tag) => {
                const tagUrl = `${getBaseUrl()}/t/${tag.tagCode}`;
                const orderData = tag.assignedOrderId;
                const orderNumber = orderData?._id
                  ? `#${orderData._id.slice(-8).toUpperCase()}`
                  : null;
                const product = orderData?.items?.[0]?.product;

                return (
                  <motion.div
                    key={tag._id || tag.tagCode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-[24px] border border-border bg-card p-6 sm:p-7 shadow-sm space-y-6 flex flex-col justify-between"
                  >
                    {/* Top Row: Tag Code & Status */}
                    <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                          <TagIcon size={16} />
                        </span>
                        <div>
                          <p className="text-xs text-foreground-tertiary font-medium">Tag Identifier</p>
                          <p className="text-sm sm:text-base font-bold text-foreground tracking-wide font-mono">
                            {tag.tagCode}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {tag.isActivated ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-500 dark:text-emerald-400">
                            <ShieldCheck size={12} /> Activated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/25 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-500 dark:text-blue-400">
                            <Clock size={12} /> Ready
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Section: QR Code & Metadata */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
                      {/* QR Canvas Container */}
                      <div
                        id={`canvas-${tag.tagCode}`}
                        className="flex-shrink-0 p-3.5 bg-white rounded-2xl border border-border shadow-md"
                      >
                        <QRCodeCanvas
                          value={tagUrl}
                          size={160}
                          level="H"
                          includeMargin={false}
                        />
                      </div>

                      {/* Info Column */}
                      <div className="space-y-3 w-full text-center sm:text-left">
                        {product?.name && (
                          <div>
                            <p className="text-[11px] font-medium text-foreground-tertiary">Product</p>
                            <p className="text-sm font-semibold text-foreground truncate">
                              {product.name}
                            </p>
                          </div>
                        )}

                        {orderNumber && (
                          <div>
                            <p className="text-[11px] font-medium text-foreground-tertiary">Associated Order</p>
                            <Link
                              href="/new-dashboard/user/orders"
                              className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1"
                            >
                              <Package size={12} />
                              {orderNumber}
                            </Link>
                          </div>
                        )}

                        {tag.createdAt && (
                          <div>
                            <p className="text-[11px] font-medium text-foreground-tertiary">Assignment Date</p>
                            <p className="text-xs text-foreground-secondary flex items-center justify-center sm:justify-start gap-1">
                              <Calendar size={12} />
                              {new Date(tag.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        )}

                        {tag.personalMessage && (
                          <div className="p-2.5 rounded-xl bg-background border border-border/80 text-left">
                            <p className="text-[10px] font-medium text-foreground-tertiary flex items-center gap-1">
                              <MessageSquare size={11} /> Personal Message
                            </p>
                            <p className="text-xs text-foreground mt-0.5 italic line-clamp-2">
                              &ldquo;{tag.personalMessage}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border/60">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(tag.tagCode)}
                        className="flex-1 rounded-xl text-xs font-medium cursor-pointer"
                      >
                        <Download size={13} className="mr-1.5" />
                        Download QR
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(tag.tagCode)}
                        className="flex-1 rounded-xl text-xs font-medium cursor-pointer"
                      >
                        {copiedCode === tag.tagCode ? (
                          <Check size={13} className="mr-1.5 text-emerald-500" />
                        ) : (
                          <Copy size={13} className="mr-1.5" />
                        )}
                        {copiedCode === tag.tagCode ? 'Copied' : 'Copy Link'}
                      </Button>

                      <a
                        href={tagUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial"
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          <ExternalLink size={13} className="mr-1.5" />
                          Open
                        </Button>
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
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
