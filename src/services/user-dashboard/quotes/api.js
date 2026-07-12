import api from "@/lib/api";

// Get random quote (Public API)
export const fetchQuote = async (category = "random") => {
  const { data } = await api.get("/quotes/random", {
    params: {
      category,
    },
  });

  return data?.data || data;
};

// Check if quote is favorite (Login required)
export const checkFavoriteApi = async (quoteId) => {
  const { data } = await api.get("/favorites/check", {
    params: {
      quoteId,
    },
  });

  return data?.data || data;
};

// Add quote to favorites (Login required)
export const addFavoriteApi = async (quoteId) => {
  const { data } = await api.post("/favorites", {
    quoteId,
  });

  return data?.data || data;
};

// Remove favorite (Login required)
export const removeFavoriteApi = async (favoriteId) => {
  const { data } = await api.delete(`/favorites/${favoriteId}`);

  return data?.data || data;
};