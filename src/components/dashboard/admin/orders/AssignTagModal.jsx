'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Tag } from 'lucide-react';
import { useDebounce } from '@/hooks/search-with-debounce/useDebounce';
import { adminAssignmentService } from '@/services/dashboard-service/admin-assignment.service';
import Pagination from '@/components/ui/Pagination';

const ITEMS_PER_PAGE = 10;

export default function AssignTagModal({ open, onOpenChange, onAssign }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const filters = { search: debouncedSearch, page, limit: ITEMS_PER_PAGE };
  const { data, isLoading } = useQuery({
    queryKey: ['admin-assignment', 'unassigned-tags', filters],
    queryFn: () => adminAssignmentService.getUnassignedTags(filters),
    staleTime: 10 * 1000,
    enabled: open,
  });

  const tags = data?.data || [];
  const meta = data?.meta || { page: 1, totalPage: 0, total: 0 };

  const handleSearchChange = useCallback((v) => { setSearch(v); setPage(1); setSelectedTagId(null); }, []);

  const handleAssign = async () => {
    if (!selectedTagId) return;
    setAssigning(true);
    try {
      await onAssign(selectedTagId);
      setSelectedTagId(null);
      setSearch('');
      setPage(1);
      onOpenChange(false);
    } catch (err) {
      // toast handled by parent
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedTagId(null);
    setSearch('');
    setPage(1);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign QR Tag</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary pointer-events-none" />
            <Input value={search} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Search unassigned tags..." className="pl-9 h-9 text-sm" />
          </div>

          <p className="text-xs text-foreground-tertiary">{meta.total} unassigned tags</p>

          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-muted rounded-lg" />)}
            </div>
          ) : tags.length === 0 ? (
            <div className="text-center py-8">
              <Tag size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-foreground-tertiary">No unassigned tags available</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {tags.map((tag) => (
                <button
                  key={tag._id}
                  onClick={() => setSelectedTagId(tag._id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    selectedTagId === tag._id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedTagId === tag._id ? 'bg-primary/20 text-primary' : 'bg-muted text-foreground-tertiary'
                  }`}>
                    <Tag size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{tag.tagCode}</p>
                    <p className="text-[10px] text-foreground-tertiary">{tag.subscriptionType || 'free'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {meta.totalPage > 1 && (
            <Pagination currentPage={meta.page} totalPages={meta.totalPage} onPageChange={setPage} className="pt-1" />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={assigning}>Cancel</Button>
          <Button onClick={handleAssign} disabled={!selectedTagId || assigning}>
            {assigning ? 'Assigning...' : 'Assign Tag'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
