'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, Loader2, Download, FileText, CheckCircle2 } from 'lucide-react';
import QuantityInput from '@/components/ui/QuantityInput';

const PRESET_QUANTITIES = [200, 500, 1000, 5000];

export default function TagBatchGenerateDialog({
  open,
  onOpenChange,
  onSave,
  isLoading = false,
  completedBatch = null,
  onDownloadCsv = null,
  onDownloadZip = null,
}) {
  const [quantity, setQuantity] = useState(200);
  const [prefix, setPrefix] = useState('TAG');
  const [batchType, setBatchType] = useState('production');
  const [error, setError] = useState('');
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  useEffect(() => {
    if (open && !completedBatch) {
      setQuantity(200);
      setPrefix('TAG');
      setBatchType('production');
      setError('');
    }
  }, [open, completedBatch]);

  const validate = () => {
    if (!quantity || quantity < 1 || quantity > 5000) {
      setError('Quantity must be between 1 and 5,000');
      return false;
    }
    if (!prefix.trim()) {
      setError('Prefix is required');
      return false;
    }
    if (!/^[A-Za-z0-9_-]+$/.test(prefix.trim())) {
      setError('Only letters, numbers, hyphens, and underscores allowed for prefix');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ quantity: Number(quantity), prefix: prefix.trim(), batchType });
  };

  const handleCsvDownload = async () => {
    if (!completedBatch?.batchId || !onDownloadCsv) return;
    setDownloadingCsv(true);
    try {
      await onDownloadCsv(completedBatch.batchId);
    } finally {
      setDownloadingCsv(false);
    }
  };

  const handleZipDownload = async () => {
    if (!completedBatch?.batchId || !onDownloadZip) return;
    setDownloadingZip(true);
    try {
      await onDownloadZip(completedBatch.batchId);
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
            <QrCode size={24} className="text-primary" />
          </div>
          <DialogTitle>
            {completedBatch ? 'Batch Generated Successfully' : 'Generate Batch QR Codes'}
          </DialogTitle>
          <DialogDescription>
            {completedBatch
              ? `Batch ${completedBatch.batchId} created exactly ${completedBatch.created} tags.`
              : 'Generate cryptographically secure QR codes in bulk (up to 5,000) for manufacturing.'}
          </DialogDescription>
        </DialogHeader>

        {completedBatch ? (
          <div className="space-y-4 py-3">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 space-y-2">
              <div className="flex items-center gap-2 font-medium text-sm">
                <CheckCircle2 size={18} />
                <span>Exact Quantity Guaranteed</span>
              </div>
              <div className="text-xs text-foreground-secondary space-y-1">
                <p>
                  <strong>Batch ID:</strong> <span className="font-mono">{completedBatch.batchId}</span>
                </p>
                <p>
                  <strong>Total Created:</strong> {completedBatch.created} QR Tags
                </p>
                <p>
                  <strong>Initial Status:</strong> Available / Unclaimed
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="block text-xs font-medium text-foreground-secondary">
                Export Manufacturer Package
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCsvDownload}
                  disabled={downloadingCsv}
                  className="w-full flex items-center justify-center gap-2 h-11 border-border hover:bg-secondary"
                >
                  {downloadingCsv ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                  <span>Download CSV</span>
                </Button>
                <Button
                  type="button"
                  onClick={handleZipDownload}
                  disabled={downloadingZip}
                  className="w-full flex items-center justify-center gap-2 h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {downloadingZip ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  <span>Download ZIP</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-foreground-secondary">
                Preset Batch Sizes
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_QUANTITIES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setQuantity(q);
                      setError('');
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all border ${
                      quantity === q
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-foreground-secondary hover:text-foreground border-border hover:border-border/80'
                    }`}
                  >
                    {q.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-foreground-secondary">Custom Quantity</label>
              <div>
                <QuantityInput
                  value={quantity}
                  onChange={(val) => {
                    setQuantity(val);
                    setError('');
                  }}
                  min={1}
                  max={5000}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="batch-prefix" className="block text-xs font-medium text-foreground-secondary">
                Tag Prefix
              </label>
              <Input
                id="batch-prefix"
                value={prefix}
                onChange={(e) => {
                  setPrefix(e.target.value);
                  setError('');
                }}
                placeholder="e.g. TAG"
                className={`text-sm ${error && error.includes('prefix') ? 'border-destructive' : ''}`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-foreground-secondary">
                Batch Purpose / Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBatchType('production')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                    batchType === 'production'
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card text-foreground-secondary hover:text-foreground border-border'
                  }`}
                >
                  Production (Manufacturing)
                </button>
                <button
                  type="button"
                  onClick={() => setBatchType('testing')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                    batchType === 'testing'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-sm'
                      : 'bg-card text-foreground-secondary hover:text-foreground border-border'
                  }`}
                >
                  Testing (QA / Sample)
                </button>
              </div>
            </div>
            {error && <p className="text-[11px] text-destructive font-medium">{error}</p>}
          </div>
        )}

        <DialogFooter className="w-full flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading || downloadingZip || downloadingCsv}
            className="h-10 px-4 rounded-lg border border-border bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground font-medium transition-colors cursor-pointer select-none"
          >
            {completedBatch ? 'Close' : 'Cancel'}
          </Button>
          {!completedBatch && (
            <Button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="h-10 px-5 rounded-lg bg-[#1E2025] hover:bg-[#282B32] text-white border border-[#323640] font-medium shadow-sm transition-all cursor-pointer select-none min-w-[120px] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Generating...
                </>
              ) : (
                `Generate ${Number(quantity).toLocaleString()}`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
