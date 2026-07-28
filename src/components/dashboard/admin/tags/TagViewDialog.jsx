'use client';

import { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Tag, Activity, Download, Printer } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Skeleton } from '@/components/ui/skeleton';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Row({ label, value, className = '' }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-foreground-tertiary">{label}</span>
      <span className={`text-xs text-foreground font-medium text-right ${className}`}>{value || '—'}</span>
    </div>
  );
}

export default function TagViewDialog({ open, onOpenChange, tag, isLoading = false }) {
  const [copied, setCopied] = useState(false);

  const statusColor = !tag?.isActive ? 'text-red-400' : tag?.isActivated ? 'text-emerald-400' : 'text-amber-400';
  const statusLabel = !tag?.isActive ? 'Disabled' : tag?.isActivated ? 'Activated' : 'Pending';

  const baseUrl = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin)
    : '';
  const tagUrl = tag ? `${baseUrl}/t/${tag.tagCode}` : '';

  const handleDownload = () => {
    const canvas = document.querySelector('#view-qr-canvas canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-${tag.tagCode}.png`;
    link.href = canvas.toDataURL();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const canvas = document.querySelector('#view-qr-canvas canvas');
    if (!canvas) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<img src="${canvas.toDataURL()}" onload="window.print();window.close()" />`);
    win.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tag Details — {tag?.tagCode || ''}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
          </div>
        ) : tag ? (
          <div className="py-2 space-y-4">
            {/* QR Preview */}
            <div className="flex flex-col items-center gap-2">
              <div id="view-qr-canvas" className="bg-white p-3 rounded-2xl">
                <QRCodeCanvas value={tagUrl} size={160} level="H" includeMargin />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="xs" onClick={handleDownload} className="cursor-pointer">
                  <Download size={13} className="mr-1" /> Download
                </Button>
                <Button variant="outline" size="xs" onClick={handlePrint} className="cursor-pointer">
                  <Printer size={13} className="mr-1" /> Print
                </Button>
              </div>
            </div>

            {/* Info rows */}
            <div className="bg-muted/30 rounded-xl p-3 space-y-1">
              <Row label="Tag Code" value={tag.tagCode} className="font-mono font-semibold" />
              <Row label="ID" value={tag._id} className="font-mono text-[10px]" />
              <Row label="Status" value={statusLabel} className={statusColor} />
              <Row label="Plan" value={tag.subscriptionType || 'free'} className="capitalize" />
              <Row label="Active" value={tag.isActive ? 'Yes' : 'No'} className={tag.isActive ? 'text-emerald-400' : 'text-red-400'} />
              <Row label="Activated" value={tag.isActivated ? 'Yes' : 'No'} className={tag.isActivated ? 'text-emerald-400' : 'text-amber-400'} />
              {tag.activatedAt && <Row label="Activated At" value={formatDate(tag.activatedAt)} />}
              <Row label="Created" value={formatDate(tag.createdAt)} />
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-foreground-tertiary">Tag not found.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
