'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Package, Plus } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import { useDebounce } from '@/hooks/search-with-debounce/useDebounce';
import {
  useAdminProducts,
  useAdminProductCategories,
  useAdminProductActions,
} from '@/hooks/dashboard/useAdminProducts';
import ProductsFilters from './ProductsFilters';
import ProductsTable from './ProductsTable';
import ProductMobileCards from './ProductMobileCards';
import ProductViewDialog from './ProductViewDialog';
import ProductEditDialog from './ProductEditDialog';
import ConfirmDialog from '../shared/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';

const ITEMS_PER_PAGE = 10;

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('active');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogVariant, setDialogVariant] = useState('delete');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [pDeleteOpen, setPDeleteOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useAdminProducts({
    page,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch,
    category: category !== 'all' ? category : undefined,
    status,
    sort,
  });
  const { data: categories = [] } = useAdminProductCategories();
  const {
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
    permanentDeleteProduct,
  } = useAdminProductActions();

  const isProcessing = deleteProduct.isPending || restoreProduct.isPending || permanentDeleteProduct.isPending;

  const products = data?.data || [];
  const meta = data?.meta || { page: 1, totalPage: 0, total: 0 };

  const handleSearchChange = useCallback((v) => { setSearch(v); setPage(1); }, []);
  const handleCategoryChange = useCallback((v) => { setCategory(v); setPage(1); }, []);
  const handleStatusChange = useCallback((v) => { setStatus(v); setPage(1); }, []);
  const handleSortChange = useCallback((v) => { setSort(v); setPage(1); }, []);

  const viewTrash = status === 'inactive';

  const handleView = useCallback((product) => {
    setSelectedProduct(product);
    setViewOpen(true);
  }, []);

  const handleEdit = useCallback((product) => {
    setSelectedProduct(product);
    setEditOpen(true);
  }, []);

  const handleCreateSave = useCallback(async (formData) => {
    setFormLoading(true);
    try {
      await createProduct.mutateAsync(formData);
      toast.success('Product created successfully');
      setCreateOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to create product');
      throw err;
    } finally {
      setFormLoading(false);
    }
  }, [createProduct]);

  const handleEditSave = useCallback(async (formData) => {
    if (!selectedProduct) return;
    setFormLoading(true);
    try {
      await updateProduct.mutateAsync({ id: selectedProduct._id, formData });
      toast.success('Product updated successfully');
      setEditOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update product');
      throw err;
    } finally {
      setFormLoading(false);
    }
  }, [selectedProduct, updateProduct]);

  const handleDelete = useCallback((id) => {
    setDialogVariant('delete');
    setSelectedProductId(id);
    setDialogOpen(true);
  }, []);

  const handleRestore = useCallback(async (id) => {
    try {
      await restoreProduct.mutateAsync(id);
      toast.success('Product restored from trash');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to restore product');
    }
  }, [restoreProduct]);

  const handlePermanentDelete = useCallback((id) => {
    setSelectedProductId(id);
    setPDeleteOpen(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selectedProductId) return;
    try {
      await deleteProduct.mutateAsync(selectedProductId);
      toast.success('Product moved to trash');
      setDialogOpen(false);
      setSelectedProductId(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete product');
    }
  }, [selectedProductId, deleteProduct]);

  const handlePermanentConfirm = useCallback(async () => {
    if (!selectedProductId) return;
    try {
      await permanentDeleteProduct.mutateAsync(selectedProductId);
      toast.success('Product permanently deleted');
      setPDeleteOpen(false);
      setSelectedProductId(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to permanently delete');
    }
  }, [selectedProductId, permanentDeleteProduct]);

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6 animate-pulse">
        <div className="h-9 bg-card rounded-lg border border-border w-full" />
        <div className="bg-card rounded-[22px] border border-border p-6 space-y-4">
          <div className="h-4 bg-muted rounded w-24" />
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (isError && products.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <Package size={28} className="text-destructive" />
          </div>
          <p className="text-destructive text-sm mb-2 font-medium">Failed to load products</p>
          <p className="text-foreground-tertiary text-xs mb-6">{error?.message || 'An unexpected error occurred.'}</p>
          <button onClick={() => refetch()} className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors cursor-pointer">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
                <Package size={20} className="text-primary" />
              </span>
              Products Management
            </h1>
            <p className="text-sm text-foreground-secondary mt-2 ml-[52px]">
              Manage your product catalog and inventory.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="px-4.5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-medium rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer select-none text-sm shrink-0 ml-[52px] sm:ml-0"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </motion.div>

      <ProductsFilters
        search={search}
        onSearchChange={handleSearchChange}
        category={category}
        onCategoryChange={handleCategoryChange}
        categories={categories}
        status={status}
        onStatusChange={handleStatusChange}
        sort={sort}
        onSortChange={handleSortChange}
        totalItems={meta.total}
      />

      {/* No results */}
      {!isLoading && products.length === 0 && (
        <Card className="p-10 sm:p-12">
          <div className="text-center">
            <Package size={40} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground mb-1">
              {viewTrash ? 'Trash is empty' : 'No products found'}
            </p>
            <p className="text-xs text-foreground-tertiary">
              {viewTrash ? 'No products have been moved to trash.' : 'Try adjusting your search or filter criteria.'}
            </p>
          </div>
        </Card>
      )}

      {/* Desktop table */}
      {products.length > 0 && (
        <div className="hidden lg:block">
          <ProductsTable
            products={products}
            viewTrash={viewTrash}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onPermanentDelete={handlePermanentDelete}
          />
        </div>
      )}

      {/* Mobile cards */}
      {products.length > 0 && (
        <ProductMobileCards
          products={products}
          viewTrash={viewTrash}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
        />
      )}

      {/* Pagination */}
      {meta.totalPage > 1 && (
        <Pagination currentPage={meta.page} totalPages={meta.totalPage} onPageChange={setPage} className="pt-2" />
      )}

      {/* View dialog */}
      <ProductViewDialog open={viewOpen} onOpenChange={setViewOpen} product={selectedProduct} />

      {/* Edit dialog */}
      <ProductEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        product={selectedProduct}
        onSave={handleEditSave}
        isLoading={formLoading}
        mode="edit"
      />

      {/* Create dialog */}
      <ProductEditDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        product={null}
        onSave={handleCreateSave}
        isLoading={formLoading}
        mode="create"
      />

      {/* Delete confirmation (move to trash) */}
      <ConfirmDialog open={dialogOpen} onOpenChange={setDialogOpen} variant="delete" onConfirm={handleConfirm} isLoading={isProcessing} userName="" />

      {/* Permanent delete confirmation */}
      <ConfirmDialog open={pDeleteOpen} onOpenChange={setPDeleteOpen} variant="delete" onConfirm={handlePermanentConfirm} isLoading={permanentDeleteProduct.isPending} userName="" />

      {/* Toast */}
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: 'var(--popover)', color: 'var(--popover-foreground)', border: '1px solid var(--border)' }, success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } } }} />
    </div>
  );
}
