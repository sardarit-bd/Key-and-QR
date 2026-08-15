import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminTagsService } from '@/services/dashboard-service/admin-tags.service';

export const ADMIN_TAGS_KEYS = {
  all: ['admin-tags'],
  list: (filters) => ['admin-tags', 'list', filters],
  stats: ['admin-tags', 'stats'],
  detail: (code) => ['admin-tags', 'detail', code],
};

/** Fetch paginated + filtered tags */
export function useAdminTags(filters = {}) {
  return useQuery({
    queryKey: ADMIN_TAGS_KEYS.list(filters),
    queryFn: async () => {
      const res = await adminTagsService.getTags(filters);
      return res.data; // { meta, data }
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  });
}

/** Fetch aggregate tag stats */
export function useAdminTagStats() {
  return useQuery({
    queryKey: ADMIN_TAGS_KEYS.stats,
    queryFn: async () => {
      return adminTagsService.getStats();
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/** Fetch a single tag by code */
export function useAdminTagDetail(tagCode, options = {}) {
  return useQuery({
    queryKey: ADMIN_TAGS_KEYS.detail(tagCode),
    queryFn: async () => {
      const res = await adminTagsService.getTagByCode(tagCode);
      return res.data;
    },
    enabled: !!tagCode && options.enabled !== false,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/** Mutations for tag management */
export function useAdminTagActions() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_TAGS_KEYS.all });
  };

  const createTag = useMutation({
    mutationFn: async (payload) => {
      const res = await adminTagsService.createTag(payload);
      return res.data;
    },
    onSettled: invalidate,
  });

  const updateTag = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await adminTagsService.updateTag(id, payload);
      return res.data;
    },
    onSettled: invalidate,
  });

  const bulkGenerateTags = useMutation({
    mutationFn: async ({ quantity, prefix }) => {
      const res = await adminTagsService.bulkGenerateTags({ quantity, prefix });
      return res;
    },
    onSettled: invalidate,
  });

  return { createTag, updateTag, bulkGenerateTags };
}
