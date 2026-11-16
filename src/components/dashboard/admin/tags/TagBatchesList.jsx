'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, FileText, Download, Trash2, Loader2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import Pagination from '@/components/ui/Pagination';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TagBatchesList({
  batches = [],
  meta = { page: 1, totalPage: 1, total: 0 },
  onPageChange,
  onDownloadCsv,
  onDownloadZip,
  onDeleteBatch,
  onFilterByBatch,
  isLoading = false,
}) {
  const [downloadingCsvId, setDownloadingCsvId] = useState(null);
  const [downloadingZipId, setDownloadingZipId] = useState(null);

  const handleCsv = async (batchId) => {
    setDownloadingCsvId(batchId);
    try {
      await onDownloadCsv(batchId);
    } finally {
      setDownloadingCsvId(null);
    }
  };

  const handleZip = async (batchId) => {
    setDownloadingZipId(batchId);
    try {
      await onDownloadZip(batchId);
    } finally {
      setDownloadingZipId(null);
    }
  };

  if (isLoading && batches.length === 0) {
    return (
      <Card className="p-6 space-y-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-32" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-lg" />
        ))}
      </Card>
    );
  }

  if (batches.length === 0) {
    return (
      <Card className="p-10 text-center">
        <Layers size={40} className="mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground mb-1">No batches generated yet</p>
        <p className="text-xs text-foreground-tertiary">
          Click "Batch Generate" above to create a new batch of manufacturing QR tags.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Layers size={18} className="text-primary" />
            Generated QR Batches History
          </h2>
          <p className="text-xs text-foreground-tertiary mt-0.5">
            Manage batches, download manufacturing files, and clean up test batches safely.
          </p>
        </div>
        <span className="text-xs text-foreground-tertiary">{meta.total} total batch(es)</span>
      </div>

      <div className="hidden lg:grid grid-cols-[minmax(0,1.8fr)_minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,1.5fr)_minmax(0,1.8fr)] items-center gap-2 px-2 pb-2 text-[10px] text-foreground-tertiary font-medium uppercase tracking-wider border-b border-border/50">
        <span>Batch ID & Prefix</span>
        <span>Type</span>
        <span>Status</span>
        <span>Created / Requested</span>
        <span>Available / Claimed</span>
        <span className="text-right">Actions</span>
      </div>

      <div className="divide-y divide-border/50">
        {batches.map((batch) => {
          const isTesting = batch.batchType === 'testing';
          const isComplete = batch.status === 'completed';
          const remaining = batch.remainingCount ?? batch.createdQuantity;
          const available = batch.availableCount ?? remaining;
          const claimed = batch.claimedCount ?? 0;

          return (
            <div
              key={batch._id || batch.batchId}
              className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,1.5fr)_minmax(0,1.8fr)] items-center gap-3 py-3 px-2 hover:bg-muted/30 rounded-lg transition-colors text-xs"
            >
              {/* Batch ID & Created At */}
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => onFilterByBatch && onFilterByBatch(batch.batchId)}
                  className="font-mono text-xs font-semibold text-primary hover:underline text-left truncate block max-w-full"
                  title="Click to filter tags by this batch"
                >
                  {batch.batchId}
                </button>
                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-foreground-tertiary">
                  <span>Prefix: <strong>{batch.prefix}</strong></span>
                  <span>•</span>
                  <span>{formatDate(batch.createdAt)}</span>
                </div>
              </div>

              {/* Type Badge */}
              <div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-medium inline-flex items-center gap-1 ${
                    isTesting
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {isTesting ? 'Testing' : 'Production'}
                </span>
              </div>

              {/* Status */}
              <div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-medium inline-flex items-center gap-1 ${
                    isComplete
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : batch.status === 'processing'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-destructive/10 text-destructive border-destructive/20'
                  }`}
                >
                  {isComplete ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                  <span className="capitalize">{batch.status}</span>
                </span>
              </div>

              {/* Quantities */}
              <div>
                <span className="font-semibold text-foreground">{remaining}</span>
                <span className="text-foreground-tertiary"> / {batch.requestedQuantity} tags</span>
              </div>

              {/* Available vs Claimed */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-blue-400">● {available} Available</span>
                  <span className="text-foreground-tertiary">•</span>
                  <span className="text-emerald-400">● {claimed} Claimed</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-start lg:justify-end gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleCsv(batch.batchId)}
                  disabled={downloadingCsvId === batch.batchId || remaining === 0}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border bg-card hover:bg-muted text-[11px] font-medium text-foreground transition-all cursor-pointer disabled:opacity-40"
                  title="Download CSV manifest"
                >
                  {downloadingCsvId === batch.batchId ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <FileText size={12} />
                  )}
                  CSV
                </button>

                <button
                  type="button"
                  onClick={() => handleZip(batch.batchId)}
                  disabled={downloadingZipId === batch.batchId || remaining === 0}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-primary/30 bg-primary/10 hover:bg-primary/20 text-[11px] font-medium text-primary transition-all cursor-pointer disabled:opacity-40"
                  title="Download ZIP with high-res QR images"
                >
                  {downloadingZipId === batch.batchId ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Download size={12} />
                  )}
                  ZIP
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteBatch && onDeleteBatch(batch)}
                  disabled={remaining === 0}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-destructive/30 bg-destructive/10 hover:bg-destructive/20 text-[11px] font-medium text-destructive transition-all cursor-pointer disabled:opacity-40"
                  title="Delete all eligible tags in this batch"
                >
                  <Trash2 size={12} />
                  Delete Batch
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {meta.totalPage > 1 && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPage}
          totalItems={meta.total}
          itemsPerPage={meta.limit || 10}
          onPageChange={onPageChange}
          label="batches"
          className="pt-2"
        />
      )}
    </Card>
  );
}
