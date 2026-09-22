'use client';

import { useState, useCallback, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Tag, Plus } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import { useDebounce } from '@/hooks/search-with-debounce/useDebounce';
import {
  useAdminProductCategories,
  useProductCategoryActions,
} from '@/hooks/product-category/useProductCategories';
import ProductCategoryFilters from './ProductCategoryFilters';
import ProductCategoryTable from './ProductCategoryTable';
import ProductCategoryMobileCards from './ProductCategoryMobileCards';
import ProductCategoryDialog from './ProductCategoryDialog';
import ConfirmDialog from '../shared/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';

const DEFAULT_LIMIT = 10;

export default function AdminProductCategoriesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const debouncedSearch = useDebounce(search, 300);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteCategoryItem, setDeleteCategoryItem] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [toggleCategoryItem, setToggleCategoryItem] = useState(null);
  const [toggleOpen, setToggleOpen] = useState(false);

  const handleSearchChange = useCallback((v) => {
    setSearch(v);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((v) => {
    setStatus(v);
    setPage(1);
  }, []);

  const handleLimitChange = useCallback((v) => {
    setLimit(Number(v));
    setPage(1);
  }, []);

  const { data, isLoading, isError, error, refetch } = useAdminProductCategories({
    page,
    limit,
    search: debouncedSearch || undefined,
    isActive: status !== 'all' ? (status === 'active') : undefined,
    includeInactive: true,
  });
  const { createCategory, updateCategory, toggleCategory, deleteCategory } = useProductCategoryActions();

  const categories = Array.isArray(data) ? data : data?.data || [];
  const meta = data?.meta || {
    page: 1,
    limit,
    total: categories.length,
    totalPage: Math.ceil(categories.length / limit) || 1,
  };

  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setDialogOpen(true);
  };

  const handleEdit = useCallback((category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  }, []);

  const handleSave = async (payload) => {
    setFormLoading(true);
    try {
      if (selectedCategory) {
        await updateCategory.mutateAsync(payload);
        toast.success('Product category updated successfully');
      } else {
        await createCategory.mutateAsync(payload);
        toast.success('Product category created successfully');
      }
      setDialogOpen(false);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save product category');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleClick = useCallback((category) => {
    setToggleCategoryItem(category);
    setToggleOpen(true);
  }, []);

  const handleConfirmToggle = async () => {
    if (!toggleCategoryItem) return;
    try {
      await toggleCategory.mutateAsync(toggleCategoryItem._id || toggleCategoryItem.id);
      toast.success(
        `Category ${toggleCategoryItem.isActive ? 'deactivated' : 'activated'} successfully`
      );
      setToggleOpen(false);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update category status');
    }
  };

  const handleDeleteClick = useCallback((category) => {
    setDeleteCategoryItem(category);
    setDeleteOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteCategoryItem) return;
    try {
      await deleteCategory.mutateAsync(deleteCategoryItem._id || deleteCategoryItem.id);
      toast.success('Product category deleted successfully');
      setDeleteOpen(false);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete category');
    }
  };

  // Loading skeleton state
  if (isLoading && categories.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6 animate-pulse">
        <div className="h-9 bg-card rounded-lg border border-border w-full" />
        <div className="bg-card rounded-[22px] border border-border p-6 space-y-4">
          <div className="h-4 bg-muted rounded w-24" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError && categories.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <Tag size={28} className="text-destructive" />
          </div>
          <p className="text-destructive text-sm mb-2 font-medium">Failed to load product categories</p>
          <p className="text-foreground-tertiary text-xs mb-6">{error?.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#24272D] border border-[#2A2D35]">
                <Tag size={20} className="text-muted-foreground" />
              </span>
              Product Categories
            </h1>
            <p className="text-sm text-foreground-secondary mt-2 ml-[52px]">
              Manage physical merchandise categories for products and shop filters.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4.5 py-2.5 bg-[#1E2025] hover:bg-[#282B32] text-white border border-[#323640] font-medium rounded-lg shadow-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer select-none text-sm shrink-0 ml-[52px] sm:ml-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </motion.div>

      {/* Search & Filter Bar */}
      <ProductCategoryFilters
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        limit={limit}
        onLimitChange={handleLimitChange}
        totalItems={meta.total}
      />

      {/* No results */}
      {!isLoading && categories.length === 0 && (
        <Card className="p-10 sm:p-12">
          <div className="text-center">
            <Tag size={40} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground mb-1">
              No categories found
            </p>
            <p className="text-xs text-foreground-tertiary">
              {search || status !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first product category.'}
            </p>
          </div>
        </Card>
      )}

      {/* Desktop table */}
      {categories.length > 0 && (
        <div className="hidden lg:block">
          <ProductCategoryTable
            categories={categories}
            onEdit={handleEdit}
            onToggle={handleToggleClick}
            onDelete={handleDeleteClick}
          />
        </div>
      )}

      {/* Mobile cards */}
      {categories.length > 0 && (
        <ProductCategoryMobileCards
          categories={categories}
          onEdit={handleEdit}
          onToggle={handleToggleClick}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Pagination */}
      {meta.totalPage > 1 && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPage}
          onPageChange={setPage}
          className="pt-2"
        />
      )}

      {/* Create / Edit Dialog */}
      <ProductCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
        onSave={handleSave}
        isLoading={formLoading}
      />

      {/* Toggle Status Confirmation Dialog */}
      <ConfirmDialog
        open={toggleOpen}
        onOpenChange={setToggleOpen}
        variant={toggleCategoryItem?.isActive ? 'suspend' : 'activate'}
        title={toggleCategoryItem?.isActive ? 'Deactivate Category?' : 'Activate Category?'}
        description={
          toggleCategoryItem?.isActive
            ? `Deactivating "${toggleCategoryItem?.name}" will hide it from the public shop.`
            : `Activating "${toggleCategoryItem?.name}" will make it available in the shop.`
        }
        confirmLabel={toggleCategoryItem?.isActive ? 'Deactivate' : 'Activate'}
        onConfirm={handleConfirmToggle}
        isLoading={toggleCategory.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        variant="delete"
        title="Delete Product Category?"
        userName={deleteCategoryItem?.name}
        description="Are you sure you want to delete this category? If products are currently linked to it, deletion will be blocked."
        confirmLabel="Delete Category"
        onConfirm={handleConfirmDelete}
        isLoading={deleteCategory.isPending}
      />

      {/* Toast Notification Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: 'var(--popover)',
            color: 'var(--popover-foreground)',
            border: '1px solid var(--border)',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </div>
  );
}
