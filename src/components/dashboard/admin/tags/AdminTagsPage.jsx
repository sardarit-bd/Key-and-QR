'use client';

import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { QrCode, Layers, Plus, Download, FileText, Trash2, X, Loader2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { getPublicTagUrl } from '@/utils/qr.utils';
import Card from '@/components/dashboard/user/dashboard/Card';
import {
  useAdminTags,
  useAdminTagStats,
  useAdminTagActions,
} from '@/hooks/dashboard/useAdminTags';
import { adminTagsService } from '@/services/dashboard-service/admin-tags.service';
import { adminOrdersService } from '@/services/dashboard-service/admin-orders.service';
import TagsStatsCards from './TagsStatsCards';
import TagsFilters from './TagsFilters';
import TagsTable from './TagsTable';
import TagMobileCards from './TagMobileCards';
import TagBatchesList from './TagBatchesList';
import TagQRDialog from './TagQRDialog';
import TagCreateDialog from './TagCreateDialog';
import TagBatchGenerateDialog from './TagBatchGenerateDialog';
import AssignOrderModal from './AssignOrderModal';
import ConfirmDialog from '../shared/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';

const ITEMS_PER_PAGE = 10;

// Map frontend filter names to backend query params
function mapFilters({ search, status, page, limit }) {
  const filters = { page, limit };
  if (search) filters.search = search;
  if (status && status !== 'all') filters.status = status;
  return filters;
}

export default function AdminTagsPage() {
  // Tabs: 'all' | 'batches'
  const [activeTab, setActiveTab] = useState('all');

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  // Batch history state
  const [batchesPage, setBatchesPage] = useState(1);
  const [batchesData, setBatchesData] = useState({ data: [], meta: { page: 1, totalPage: 1, total: 0 } });
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false);

  // Dialogs
  const [qrTag, setQrTag] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [batchOpen, setBatchOpen] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [completedBatch, setCompletedBatch] = useState(null);

  const [assignTag, setAssignTag] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);

  const [downloadTag, setDownloadTag] = useState(null);

  // Delete confirmation
  const [tagToDelete, setTagToDelete] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toggle status confirmation
  const [toggleTag, setToggleTag] = useState(null);
  const [toggleOpen, setToggleOpen] = useState(false);

  // Data
  const [limit, setLimit] = useState(ITEMS_PER_PAGE);
  const filters = mapFilters({ search, status, page, limit });
  const { data, isLoading, isError, error, refetch } = useAdminTags(filters);
  const { data: statsData } = useAdminTagStats();
  const { createTag, updateTag, bulkGenerateTags, deleteTag: deleteTagMutation } = useAdminTagActions();

  const tags = data?.data || [];
  const meta = data?.meta || { page: 1, totalPage: 0, total: 0 };

  // Fetch batches
  const fetchBatches = useCallback(async (p = 1) => {
    setBatchesLoading(true);
    try {
      const res = await adminTagsService.getAllBatches({ page: p, limit: 10 });
      setBatchesData(res || { data: [], meta: { page: 1, totalPage: 1, total: 0 } });
    } catch (err) {
      toast.error('Failed to load batch history');
    } finally {
      setBatchesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'batches') {
      fetchBatches(batchesPage);
    }
  }, [activeTab, batchesPage, fetchBatches]);

  // Trigger file download offscreen when downloadTag is set
  useEffect(() => {
    if (downloadTag) {
      const timer = setTimeout(() => {
        const canvas = document.querySelector('#hidden-qr-download canvas');
        if (canvas) {
          const link = document.createElement('a');
          link.download = `qr-${downloadTag.tagCode}.png`;
          link.href = canvas.toDataURL();
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        setDownloadTag(null);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [downloadTag]);

  // Filter handlers
  const handleSearchChange = useCallback((v) => { setSearch(v); setPage(1); setSelectedIds([]); }, []);
  const handleStatusChange = useCallback((v) => { setStatus(v); setPage(1); setSelectedIds([]); }, []);

  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [bulkExportCsvLoading, setBulkExportCsvLoading] = useState(false);
  const [bulkExportZipLoading, setBulkExportZipLoading] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const handleToggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === tags.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tags.map((t) => t._id));
    }
  }, [tags, selectedIds]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const handleExportSelectedCsv = useCallback(async () => {
    if (selectedIds.length === 0) return;
    setBulkExportCsvLoading(true);
    try {
      await adminTagsService.downloadSelectedCsv(selectedIds);
      toast.success(`Exported ${selectedIds.length} tags to CSV`);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to export CSV');
    } finally {
      setBulkExportCsvLoading(false);
    }
  }, [selectedIds]);

  const handleExportSelectedZip = useCallback(async () => {
    if (selectedIds.length === 0) return;
    setBulkExportZipLoading(true);
    try {
      toast.loading(`Generating ZIP for ${selectedIds.length} QR codes...`, { id: 'bulk-zip-download' });
      await adminTagsService.downloadSelectedZip(selectedIds);
      toast.success(`Exported ${selectedIds.length} QR codes to ZIP`, { id: 'bulk-zip-download' });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to export ZIP', { id: 'bulk-zip-download' });
    } finally {
      setBulkExportZipLoading(false);
    }
  }, [selectedIds]);

  const handleBulkDeleteConfirm = useCallback(async () => {
    if (selectedIds.length === 0) return;
    setBulkDeleteLoading(true);
    try {
      const res = await adminTagsService.bulkDeleteTags(selectedIds);
      const data = res?.data || res;
      if (data.deleted > 0) {
        toast.success(`Successfully deleted ${data.deleted} tag(s)`);
      }
      if (data.failed > 0) {
        toast.error(`${data.failed} tag(s) could not be deleted (already assigned or claimed)`);
      }
      setBulkDeleteOpen(false);
      setSelectedIds([]);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete tags');
    } finally {
      setBulkDeleteLoading(false);
    }
  }, [selectedIds, refetch]);

  // QR & Download Actions
  const handleShowQR = useCallback((tag) => setQrTag(tag), []);
  const handleDownload = useCallback((tag) => setDownloadTag(tag), []);

  // Create
  const handleCreateSave = useCallback(async ({ tagCode, subscriptionType }) => {
    setCreateLoading(true);
    try {
      await createTag.mutateAsync({ tagCode, subscriptionType });
      toast.success(`Tag "${tagCode}" created successfully`);
      setCreateOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to create tag');
    } finally {
      setCreateLoading(false);
    }
  }, [createTag]);

  // Batch generate
  const handleBatchGenerateSave = useCallback(async ({ quantity, prefix, batchType }) => {
    setBatchLoading(true);
    try {
      const response = await bulkGenerateTags.mutateAsync({ quantity, prefix, batchType });
      const batchData = response?.data || response;
      setCompletedBatch(batchData);
      toast.success(`Batch generated exactly ${quantity} QR tags successfully`);
      refetch();
      if (activeTab === 'batches') {
        fetchBatches(1);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to generate tags');
    } finally {
      setBatchLoading(false);
    }
  }, [bulkGenerateTags, refetch, activeTab, fetchBatches]);

  const handleDeleteBatchPrompt = useCallback((batch) => {
    setBatchToDelete(batch);
    setBatchDeleteOpen(true);
  }, []);

  const handleDeleteBatchConfirm = useCallback(async () => {
    if (!batchToDelete?.batchId) return;
    setBatchDeleteLoading(true);
    try {
      const res = await adminTagsService.deleteBatchTags(batchToDelete.batchId);
      const data = res?.data || res;
      if (data.deleted > 0) {
        toast.success(`Deleted ${data.deleted} tag(s) from batch ${data.batchId}`);
      }
      if (data.skipped > 0) {
        toast.error(`${data.skipped} tag(s) skipped (already claimed or ordered)`);
      }
      setBatchDeleteOpen(false);
      setBatchToDelete(null);
      fetchBatches(batchesPage);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete batch');
    } finally {
      setBatchDeleteLoading(false);
    }
  }, [batchToDelete, batchesPage, fetchBatches, refetch]);

  const handleFilterByBatch = useCallback((batchId) => {
    setSearch(batchId);
    setActiveTab('all');
    setPage(1);
  }, []);

  const handleDownloadCsv = useCallback(async (batchId) => {
    try {
      await adminTagsService.downloadBatchCsv(batchId);
      toast.success('CSV downloaded successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to download CSV');
    }
  }, []);

  const handleDownloadZip = useCallback(async (batchId) => {
    try {
      toast.loading('Generating ZIP package, please wait...', { id: 'zip-download' });
      await adminTagsService.downloadBatchZip(batchId);
      toast.success('ZIP package downloaded successfully', { id: 'zip-download' });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to download ZIP', { id: 'zip-download' });
    }
  }, []);

  // Assignment
  const handleAssignToOrder = useCallback((tag) => {
    setAssignTag(tag);
    setAssignOpen(true);
  }, []);

  const handleAssignConfirm = useCallback(async (orderId) => {
    if (!assignTag) return;
    try {
      await adminOrdersService.addTagToOrder({ orderId, tagId: assignTag._id });
      toast.success(`Tag "${assignTag.tagCode}" assigned to order successfully`);
      setAssignOpen(false);
      setAssignTag(null);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to assign tag');
      throw err;
    }
  }, [assignTag, refetch]);

  // Toggle status (enable/disable)
  const handleToggleStatus = useCallback((tag) => {
    setToggleTag(tag);
    setToggleOpen(true);
  }, []);

  const handleToggleConfirm = useCallback(async () => {
    if (!toggleTag) return;
    const newActive = !toggleTag.isActive;
    try {
      await updateTag.mutateAsync({ id: toggleTag._id, payload: { isActive: newActive } });
      toast.success(newActive ? 'Tag enabled successfully' : 'Tag disabled successfully');
      setToggleOpen(false);
      setToggleTag(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update tag status');
    }
  }, [toggleTag, updateTag]);

  // Permanent Delete (Guardrailed for unassigned tags)
  const handleDelete = useCallback((tag) => {
    if (tag.isActivated || tag.owner || tag.assignedOrderId) {
      toast.error('Assigned or activated tags cannot be deleted. You can disable them instead.', {
        duration: 4000,
        icon: '⚠️',
      });
      return;
    }
    setTagToDelete(tag);
    setDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!tagToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteTagMutation.mutateAsync(tagToDelete._id);
      toast.success(`Tag "${tagToDelete.tagCode}" permanently deleted successfully`);
      setDeleteOpen(false);
      setTagToDelete(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete tag');
    } finally {
      setDeleteLoading(false);
    }
  }, [tagToDelete, deleteTagMutation]);

  // Loading
  if (isLoading && tags.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-card rounded-[22px] border border-border h-20" />)}
        </div>
        <div className="h-9 bg-card rounded-lg border border-border w-full" />
        <div className="bg-card rounded-[22px] border border-border p-6 space-y-4">
          <div className="h-4 bg-muted rounded w-24" />
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted rounded-lg" />)}
        </div>
      </div>
    );
  }

  // Error
  if (isError && tags.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <QrCode size={28} className="text-destructive" />
          </div>
          <p className="text-destructive text-sm mb-2 font-medium">Failed to load tags</p>
          <p className="text-foreground-tertiary text-xs mb-6">{error?.message || 'An unexpected error occurred.'}</p>
          <button onClick={() => refetch()} className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors cursor-pointer">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-secondary border border-border">
                <QrCode size={20} className="text-muted-foreground" />
              </span>
              QR Tags Management
            </h1>
            <p className="text-sm text-foreground-secondary mt-2 ml-[52px]">
              Manage QR tags, track assignments, and generate new codes.
            </p>
          </div>
          <div className="flex items-center gap-2.5 ml-[52px] sm:ml-0 flex-wrap">
            <button
              type="button"
              onClick={() => setBatchOpen(true)}
              className="px-4 py-2.5 bg-card hover:bg-muted text-foreground-secondary hover:text-foreground border border-border rounded-xl font-medium transition-all shadow-sm active:scale-95 flex items-center gap-2 text-sm cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Layers size={16} className="text-foreground-secondary" />
              Batch Generate
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="px-4.5 py-2.5 bg-[#1E2025] hover:bg-[#282B32] text-white border border-[#323640] rounded-lg font-medium shadow-sm transition-all active:scale-95 flex items-center gap-2 text-sm cursor-pointer select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
            >
              <Plus size={16} />
              Create Tag
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <TagsStatsCards stats={statsData || {}} />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-foreground-secondary hover:text-foreground hover:bg-muted'
          }`}
        >
          All QR Tags
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('batches')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'batches'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-foreground-secondary hover:text-foreground hover:bg-muted'
          }`}
        >
          <Layers size={15} />
          <span>Generated Batches</span>
          {batchesData?.meta?.total > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {batchesData.meta.total}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'batches' ? (
        <TagBatchesList
          batches={batchesData.data}
          meta={batchesData.meta}
          onPageChange={(p) => setBatchesPage(p)}
          onDownloadCsv={handleDownloadCsv}
          onDownloadZip={handleDownloadZip}
          onDeleteBatch={handleDeleteBatchPrompt}
          onFilterByBatch={handleFilterByBatch}
          isLoading={batchesLoading}
        />
      ) : (
        <>
          {/* Filters */}
          <TagsFilters
            search={search}
            onSearchChange={handleSearchChange}
            status={status}
            onStatusChange={handleStatusChange}
            totalItems={meta.total}
          />

          {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3 p-3 sm:px-4 rounded-xl bg-card border border-primary/30 shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
              {selectedIds.length} selected
            </span>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-xs text-foreground-secondary hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X size={13} />
              Clear Selection
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleExportSelectedCsv}
              disabled={bulkExportCsvLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer disabled:opacity-50"
            >
              {bulkExportCsvLoading ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
              Export CSV
            </button>

            <button
              type="button"
              onClick={handleExportSelectedZip}
              disabled={bulkExportZipLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-xs font-medium text-primary transition-all cursor-pointer disabled:opacity-50"
            >
              {bulkExportZipLoading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              Download ZIP
            </button>

            <button
              type="button"
              onClick={() => setBulkDeleteOpen(true)}
              disabled={bulkDeleteLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 bg-destructive/10 hover:bg-destructive/20 text-xs font-medium text-destructive transition-all cursor-pointer disabled:opacity-50"
            >
              {bulkDeleteLoading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              Delete Selected
            </button>
          </div>
        </motion.div>
      )}

      {/* No results */}
      {!isLoading && tags.length === 0 && (
        <Card className="p-10 sm:p-12">
          <div className="text-center">
            <QrCode size={40} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground mb-1">No tags found</p>
            <p className="text-xs text-foreground-tertiary">Try adjusting your search or filter criteria.</p>
          </div>
        </Card>
      )}

      {/* Desktop table */}
      {tags.length > 0 && (
        <div className="hidden lg:block">
          <TagsTable
            tags={tags}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onShowQR={handleShowQR}
            onDownload={handleDownload}
            onAssign={handleAssignToOrder}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* Mobile cards */}
      {tags.length > 0 && (
        <TagMobileCards
          tags={tags}
          onShowQR={handleShowQR}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      )}

      {/* Pagination */}
      {meta.totalPage > 1 && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPage}
          totalItems={meta.total}
          itemsPerPage={limit}
          onPageChange={setPage}
          onItemsPerPageChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
            setSelectedIds([]);
          }}
          itemsPerPageOptions={[5, 10, 20, 50]}
          label="tags"
          className="pt-2"
        />
      )}
        </>
      )}

      {/* Offscreen Canvas for Direct PNG Downloads */}
      {downloadTag && (
        <div id="hidden-qr-download" className="hidden" style={{ display: 'none' }}>
          <QRCodeCanvas
            value={getPublicTagUrl(downloadTag.tagCode)}
            size={220}
            level="H"
            includeMargin
          />
        </div>
      )}

      {/* Dialogs */}
      <TagQRDialog open={!!qrTag} onOpenChange={(o) => { if (!o) setQrTag(null); }} tag={qrTag} />
      <TagCreateDialog open={createOpen} onOpenChange={setCreateOpen} onSave={handleCreateSave} isLoading={createLoading} />
      <TagBatchGenerateDialog
        open={batchOpen}
        onOpenChange={(open) => {
          setBatchOpen(open);
          if (!open) setCompletedBatch(null);
        }}
        onSave={handleBatchGenerateSave}
        isLoading={batchLoading}
        completedBatch={completedBatch}
        onDownloadCsv={handleDownloadCsv}
        onDownloadZip={handleDownloadZip}
      />
      <AssignOrderModal open={assignOpen} onOpenChange={setAssignOpen} onAssign={handleAssignConfirm} />

      <ConfirmDialog
        open={toggleOpen}
        onOpenChange={setToggleOpen}
        variant={toggleTag?.isActive ? 'suspend' : 'activate'}
        userName={toggleTag?.tagCode || ''}
        title={toggleTag?.isActive ? 'Disable QR Tag' : 'Enable QR Tag'}
        description={
          toggleTag?.isActive
            ? 'This tag will be disabled and will not resolve quotes until re-enabled.'
            : 'This tag will be activated and ready to resolve quotes.'
        }
        confirmLabel={toggleTag?.isActive ? 'Disable Tag' : 'Enable Tag'}
        onConfirm={handleToggleConfirm}
        isLoading={updateTag.isPending}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        variant="delete"
        userName={tagToDelete?.tagCode || ''}
        title="Permanently Delete QR Tag"
        description="Are you sure you want to permanently delete this unassigned tag? This action cannot be undone."
        confirmLabel="Delete Permanently"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteLoading || deleteTagMutation.isPending}
      />
      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        variant="delete"
        userName={`${selectedIds.length} tag(s)`}
        title="Delete Selected QR Tags"
        description="Are you sure you want to delete the selected tags? Note that only unassigned and unactivated tags will be deleted. Any claimed or order-assigned tags will be protected and preserved."
        confirmLabel={`Delete ${selectedIds.length} Tag(s)`}
        onConfirm={handleBulkDeleteConfirm}
        isLoading={bulkDeleteLoading}
      />
      <ConfirmDialog
        open={batchDeleteOpen}
        onOpenChange={setBatchDeleteOpen}
        variant="delete"
        userName={batchToDelete?.batchId || ''}
        title={`Delete QR Batch: ${batchToDelete?.batchId || ''}`}
        description={`Are you sure you want to delete this batch? All eligible unassigned/unclaimed tags (approx. ${
          batchToDelete?.availableCount ?? batchToDelete?.createdQuantity ?? 0
        }) will be permanently deleted. Any claimed or order-linked tags (${
          batchToDelete?.claimedCount ?? 0
        }) will remain strictly protected and preserved.`}
        confirmLabel="Delete Eligible Batch Tags"
        onConfirm={handleDeleteBatchConfirm}
        isLoading={batchDeleteLoading}
      />

      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: 'var(--popover)', color: 'var(--popover-foreground)', border: '1px solid var(--border)' }, success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } } }} />
    </div>
  );
}
