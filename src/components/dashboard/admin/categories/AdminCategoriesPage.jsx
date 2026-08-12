'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import { useDebounce } from '@/hooks/search-with-debounce/useDebounce';
import {
  useAdminCategories,
  useAdminCategoryQuoteCounts,
  useAdminCategoryActions,
} from '@/hooks/dashboard/useAdminCategories';
import CategoryStatsCards from './CategoryStatsCards';
import CategoryFilters from './CategoryFilters';
import CategoryTable from './CategoryTable';
import CategoryMobileCards from './CategoryMobileCards';
import CategoryFormDialog from './CategoryFormDialog';
import ConfirmDialog from '../shared/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';

const ITEMS_PER_PAGE = 10;

// Map frontend filter names to backend query params
function mapFilters({ debouncedSearch, isActive, page, limit }) {
  const filters = { page, limit };
  if (debouncedSearch) filters.search = debouncedSearch;
  if (isActive && isActive !== 'all') filters.isActive = isActive;
  return filters;
}

export default function AdminCategoriesPage() {
  // Filters
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState('all');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Toggle confirmation
  const [toggleCategoryState, setToggleCategoryState] = useState(null);
  const [toggleOpen, setToggleOpen] = useState(false);

  // Delete confirmation
  const [deleteCategoryState, setDeleteCategoryState] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Data
  const filters = mapFilters({ debouncedSearch, isActive, page, limit: ITEMS_PER_PAGE });
  const { data, isLoading, isError, error, refetch } = useAdminCategories(filters);
  const { data: countsData } = useAdminCategoryQuoteCounts();
  const { createCategory, updateCategory, toggleCategory, deleteCategory } = useAdminCategoryActions();

  const categories = data?.data || [];
  const meta = data?.meta || { page: 1, totalPage: 0, total: 0 };
  const counts = countsData?.counts || {};

  const handleSearchChange = useCallback((v) => { setSearch(v); setPage(1); }, []);
  const handleStatusChange = useCallback((v) => { setIsActive(v); setPage(1); }, []);

  const handleOpenCreate = useCallback(() => {
    setEditingCategory(null);
    setFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((category) => {
    setEditingCategory(category);
    setFormOpen(true);
  }, []);

  const handleFormSave = useCallback(async ({ name, description, color, icon, iconType, iconUrl, sortOrder, isActive: active, isPremium }) => {
    setFormLoading(true);
    try {
      const payload = { name, description, color, icon, iconType, iconUrl, sortOrder, isActive: active, isPremium };
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory._id, payload });
        toast.success(`Category "${name}" updated successfully`);
      } else {
        await createCategory.mutateAsync(payload);
        toast.success(`Category "${name}" created successfully`);
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save category');
    } finally {
      setFormLoading(false);
    }
  }, [editingCategory, createCategory, updateCategory]);

  const handleToggle = useCallback((category) => {
    setToggleCategoryState(category);
    setToggleOpen(true);
  }, []);

  const handleToggleConfirm = useCallback(async () => {
    if (!toggleCategoryState) return;
    try {
      await toggleCategory.mutateAsync(toggleCategoryState._id);
      toast.success(toggleCategoryState.isActive ? 'Category deactivated' : 'Category activated');
      setToggleOpen(false);
      setToggleCategoryState(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update category status');
    }
  }, [toggleCategoryState, toggleCategory]);

  const handleDelete = useCallback((category) => {
    setDeleteCategoryState(category);
    setDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteCategoryState) return;
    try {
      await deleteCategory.mutateAsync(deleteCategoryState._id);
      toast.success(`Category "${deleteCategoryState.name}" deleted`);
      setDeleteOpen(false);
      setDeleteCategoryState(null);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to delete category';
      toast.error(message);
      // Data-integrity: if the backend refuses, surface it clearly.
      setDeleteOpen(false);
      setDeleteCategoryState(null);
    }
  }, [deleteCategoryState, deleteCategory]);

  // Loading
  if (isLoading && categories.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-card rounded-[22px] border border-border h-20" />)}
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
  if (isError && categories.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <Layers size={28} className="text-destructive" />
          </div>
          <p className="text-destructive text-sm mb-2 font-medium">Failed to load categories</p>
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
                <Layers size={20} className="text-primary" />
              </span>
              Category Management
            </h1>
            <p className="text-sm text-foreground-secondary mt-2 ml-[52px]">
              Organize quote categories, manage visibility, and track usage.
            </p>
          </div>
          <button onClick={handleOpenCreate} className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors text-sm cursor-pointer">
            Create Category
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <CategoryStatsCards categories={categories} total={meta.total} counts={counts} />

      {/* Filters */}
      <CategoryFilters
        search={search}
        onSearchChange={handleSearchChange}
        isActive={isActive}
        onStatusChange={handleStatusChange}
        totalItems={meta.total}
      />

      {/* No results */}
      {!isLoading && categories.length === 0 && (
        <Card className="p-10 sm:p-12">
          <div className="text-center">
            <Layers size={40} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground mb-1">No categories found</p>
            <p className="text-xs text-foreground-tertiary">Try adjusting your search or filter criteria.</p>
          </div>
        </Card>
      )}

      {/* Desktop table */}
      {categories.length > 0 && (
        <div className="hidden lg:block">
          <CategoryTable
            categories={categories}
            counts={counts}
            onEdit={handleOpenEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* Mobile cards */}
      {categories.length > 0 && (
        <CategoryMobileCards
          categories={categories}
          counts={counts}
          onEdit={handleOpenEdit}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      )}

      {/* Pagination */}
      {meta.totalPage > 1 && (
        <Pagination currentPage={meta.page} totalPages={meta.totalPage} onPageChange={setPage} className="pt-2" />
      )}

      {/* Dialogs */}
      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleFormSave}
        category={editingCategory}
        isLoading={formLoading}
      />

      <ConfirmDialog
        open={toggleOpen}
        onOpenChange={setToggleOpen}
        variant={toggleCategoryState?.isActive ? 'suspend' : 'activate'}
        userName={toggleCategoryState?.name || ''}
        onConfirm={handleToggleConfirm}
        isLoading={toggleCategory.isPending}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        variant="delete"
        userName={deleteCategoryState?.name || ''}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteCategory.isPending}
      />

      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: 'var(--popover)', color: 'var(--popover-foreground)', border: '1px solid var(--border)' }, success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } } }} />
    </div>
  );
}
