'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Layers, Plus } from 'lucide-react';
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
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState('all');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [toggleCategory, setToggleCategory] = useState(null);
  const [toggleOpen, setToggleOpen] = useState(false);

  const [deleteCategoryItem, setDeleteCategoryItem] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const filters = mapFilters({ debouncedSearch, isActive, page, limit: ITEMS_PER_PAGE });
  const { data, isLoading, isError, error, refetch } = useAdminCategories(filters);
  const { data: countsData } = useAdminCategoryQuoteCounts();
  const { createCategory, updateCategory, deleteCategory } = useAdminCategoryActions();

  const categories = data?.data || [];
  const meta = data?.meta || { page: 1, totalPage: 0, total: 0 };
  const counts = countsData?.data || {};

  const handleSearchChange = useCallback((v) => { setSearch(v); setPage(1); }, []);
  const handleStatusChange = useCallback((v) => { setIsActive(v); setPage(1); }, []);

  const handleOpenCreate = useCallback(() => {
    setSelectedCategory(null);
    setFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((category) => {
    setSelectedCategory(category);
    setFormOpen(true);
  }, []);

  const handleFormSave = useCallback(async (payload) => {
    setFormLoading(true);
    try {
      if (selectedCategory) {
        await updateCategory.mutateAsync({ id: selectedCategory._id, payload });
        toast.success(`Category "${payload.name}" updated successfully`);
      } else {
        await createCategory.mutateAsync(payload);
        toast.success(`Category "${payload.name}" created successfully`);
      }
      setFormOpen(false);
      setSelectedCategory(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save category');
      throw err;
    } finally {
      setFormLoading(false);
    }
  }, [selectedCategory, createCategory, updateCategory]);

  const handleToggleStatus = useCallback((category) => {
    setToggleCategory(category);
    setToggleOpen(true);
  }, []);

  const handleToggleConfirm = useCallback(async () => {
    if (!toggleCategory) return;
    const newActive = !toggleCategory.isActive;
    try {
      await updateCategory.mutateAsync({ id: toggleCategory._id, payload: { isActive: newActive } });
      toast.success(newActive ? 'Category activated' : 'Category deactivated');
      setToggleOpen(false);
      setToggleCategory(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update status');
    }
  }, [toggleCategory, updateCategory]);

  const handleDelete = useCallback((category) => {
    setDeleteCategoryItem(category);
    setDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteCategoryItem) return;
    try {
      await deleteCategory.mutateAsync(deleteCategoryItem._id);
      toast.success(`Category "${deleteCategoryItem.name}" deleted successfully`);
      setDeleteOpen(false);
      setDeleteCategoryItem(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete category');
    }
  }, [deleteCategoryItem, deleteCategory]);

  if (isLoading && categories.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
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
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4.5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-medium rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer select-none text-sm shrink-0 ml-[52px] sm:ml-0"
          >
            <Plus size={16} />
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
            onToggle={handleToggleStatus}
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
          onToggle={handleToggleStatus}
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
        category={selectedCategory}
        isLoading={formLoading}
      />

      <ConfirmDialog
        open={toggleOpen}
        onOpenChange={setToggleOpen}
        variant={toggleCategory?.isActive ? 'suspend' : 'activate'}
        userName={toggleCategory?.name || ''}
        title={toggleCategory?.isActive ? 'Deactivate Category' : 'Activate Category'}
        description={
          toggleCategory?.isActive
            ? 'This category will be hidden from public selection.'
            : 'This category will be visible and active for quotes.'
        }
        confirmLabel={toggleCategory?.isActive ? 'Deactivate' : 'Activate'}
        onConfirm={handleToggleConfirm}
        isLoading={updateCategory.isPending}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        variant="delete"
        userName={deleteCategoryItem?.name || ''}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        confirmLabel="Delete Category"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteCategory.isPending}
      />

      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: 'var(--popover)', color: 'var(--popover-foreground)', border: '1px solid var(--border)' }, success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } } }} />
    </div>
  );
}
