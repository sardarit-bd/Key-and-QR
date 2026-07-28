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
import { Download, Copy, ExternalLink, Check, Printer } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

export default function TagQRDialog({ open, onOpenChange, tag }) {
  const [copied, setCopied] = useState(false);

  if (!tag) return null;

  const baseUrl = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin)
    : '';
  const tagUrl = `${baseUrl}/t/${tag.tagCode}`;

  const handleDownload = () => {
    const canvas = document.querySelector('#qr-dialog-canvas canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-${tag.tagCode}.png`;
    link.href = canvas.toDataURL();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const canvas = document.querySelector('#qr-dialog-canvas canvas');
    if (!canvas) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<img src="${canvas.toDataURL()}" onload="window.print();window.close()" />`);
    win.document.close();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tagUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>QR Code — {tag.tagCode}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div id="qr-dialog-canvas" className="bg-white p-4 rounded-2xl">
            <QRCodeCanvas value={tagUrl} size={220} level="H" includeMargin />
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs font-mono font-semibold text-foreground">{tag.tagCode}</p>
            <p className="text-[10px] text-foreground-tertiary break-all">{tagUrl}</p>
            {tag.subscriptionType && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground-tertiary capitalize inline-block mt-1">
                {tag.subscriptionType}
              </span>
            )}
          </div>
        </div>

        <DialogFooter className="flex-row justify-center gap-2 sm:justify-center flex-wrap">
          <Button variant="outline" size="sm" onClick={handleDownload} className="cursor-pointer">
            <Download size={14} className="mr-1.5" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="cursor-pointer">
            <Printer size={14} className="mr-1.5" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy} className="cursor-pointer">
            {copied ? <Check size={14} className="mr-1.5 text-emerald-400" /> : <Copy size={14} className="mr-1.5" />}
            {copied ? 'Copied' : 'Copy URL'}
          </Button>
          <a href={tagUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="cursor-pointer">
              <ExternalLink size={14} className="mr-1.5" />
              Open
            </Button>
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
