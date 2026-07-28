'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { QrCode } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import { useDebounce } from '@/hooks/search-with-debounce/useDebounce';
import {
  useAdminTags,
  useAdminTagStats,
  useAdminTagActions,
} from '@/hooks/dashboard/useAdminTags';
import TagsStatsCards from './TagsStatsCards';
import TagsFilters from './TagsFilters';
import TagsTable from './TagsTable';
import TagMobileCards from './TagMobileCards';
import TagQRDialog from './TagQRDialog';
import TagCreateDialog from './TagCreateDialog';
import ConfirmDialog from '../shared/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';

const ITEMS_PER_PAGE = 10;

// Map frontend filter names to backend query params
function mapFilters({ debouncedSearch, isActivated, isActive, page, limit }) {
  const filters = { page, limit };
  if (debouncedSearch) filters.search = debouncedSearch;
  if (isActivated && isActivated !== 'all') filters.isActivated = isActivated;
  if (isActive && isActive !== 'all') filters.isActive = isActive;
  return filters;
}

export default function AdminTagsPage() {
  // Filters
  const [search, setSearch] = useState('');
  const [isActivated, setIsActivated] = useState('all');
  const [isActive, setIsActive] = useState('all');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  // Dialogs
  const [qrTag, setQrTag] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Delete confirmation
  const [deleteTag, setDeleteTag] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Toggle status confirmation
  const [toggleTag, setToggleTag] = useState(null);
  const [toggleOpen, setToggleOpen] = useState(false);

  // Data
  const filters = mapFilters({ debouncedSearch, isActivated, isActive, page, limit: ITEMS_PER_PAGE });
  const { data, isLoading, isError, error, refetch } = useAdminTags(filters);
  const { data: statsData } = useAdminTagStats();
  const { createTag, updateTag } = useAdminTagActions();

  const tags = data?.data || [];
  const meta = data?.meta || { page: 1, totalPage: 0, total: 0 };

  // Filter handlers
  const handleSearchChange = useCallback((v) => { setSearch(v); setPage(1); }, []);
  const handleActivationChange = useCallback((v) => { setIsActivated(v); setPage(1); }, []);
  const handleStatusChange = useCallback((v) => { setIsActive(v); setPage(1); }, []);

  // QR
  const handleShowQR = useCallback((tag) => setQrTag(tag), []);

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

  // Delete
  const handleDelete = useCallback((tag) => {
    setDeleteTag(tag);
    setDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTag) return;
    try {
      await updateTag.mutateAsync({ id: deleteTag._id, payload: { isActive: false } });
      toast.success(`Tag "${deleteTag.tagCode}" disabled`);
      setDeleteOpen(false);
      setDeleteTag(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete tag');
    }
  }, [deleteTag, updateTag]);

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
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
                <QrCode size={20} className="text-primary" />
              </span>
              QR Tags Management
            </h1>
            <p className="text-sm text-foreground-secondary mt-2 ml-[52px]">
              Manage QR tags, track assignments, and generate new codes.
            </p>
          </div>
          <button onClick={() => setCreateOpen(true)} className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors text-sm cursor-pointer">
            Create Tag
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <TagsStatsCards stats={statsData || {}} />

      {/* Filters */}
      <TagsFilters
        search={search}
        onSearchChange={handleSearchChange}
        isActivated={isActivated}
        onActivationChange={handleActivationChange}
        isActive={isActive}
        onStatusChange={handleStatusChange}
        totalItems={meta.total}
      />

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
          <TagsTable tags={tags} onShowQR={handleShowQR} onToggleStatus={handleToggleStatus} onDelete={handleDelete} />
        </div>
      )}

      {/* Mobile cards */}
      {tags.length > 0 && (
        <TagMobileCards tags={tags} onShowQR={handleShowQR} onToggleStatus={handleToggleStatus} onDelete={handleDelete} />
      )}

      {/* Pagination */}
      {meta.totalPage > 1 && (
        <Pagination currentPage={meta.page} totalPages={meta.totalPage} onPageChange={setPage} className="pt-2" />
      )}

      {/* Dialogs */}
      <TagQRDialog open={!!qrTag} onOpenChange={(o) => { if (!o) setQrTag(null); }} tag={qrTag} />
      <TagCreateDialog open={createOpen} onOpenChange={setCreateOpen} onSave={handleCreateSave} isLoading={createLoading} />

      <ConfirmDialog open={toggleOpen} onOpenChange={setToggleOpen} variant={toggleTag?.isActive ? 'suspend' : 'activate'} userName={toggleTag?.tagCode || ''} onConfirm={handleToggleConfirm} isLoading={updateTag.isPending} />
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} variant="delete" userName={deleteTag?.tagCode || ''} onConfirm={handleDeleteConfirm} isLoading={updateTag.isPending} />

      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: 'var(--popover)', color: 'var(--popover-foreground)', border: '1px solid var(--border)' }, success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } } }} />
    </div>
  );
}
