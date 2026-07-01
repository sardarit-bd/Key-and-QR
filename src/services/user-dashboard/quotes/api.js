import api from "@/lib/api";

export const fetchQuotes = async (filters) => {
  const { data } = await api.get("/quotes", {
    params: {
      page: filters.page,
      limit: 12,
      search: filters.search,
      category:
        filters.category !== "all" ? filters.category : undefined,
      sort: filters.sort,
    },
  });

  return data;
};

export const fetchStats = async () => {
  const { data } = await api.get("/quotes/stats");
  return data;
};

export const fetchCategories = async () => {
  const { data } = await api.get("/quotes/categories");
  return data;
};

export const toggleFavoriteApi = async (id) => {
  const { data } = await api.post(`/quotes/${id}/favorite`);
  return data;
};

export const deleteQuoteApi = async (id) => {
  const { data } = await api.delete(`/quotes/${id}`);
  return data;
};