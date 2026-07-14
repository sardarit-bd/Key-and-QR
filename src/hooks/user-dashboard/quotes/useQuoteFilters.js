import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

export function useQuoteFilters() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [view, setView] = useState('grid');

  useEffect(() => {
    const savedView = localStorage.getItem('myQuotesView');
    if (savedView) setView(savedView);
  }, []);

  const handleViewChange = (newView) => {
    setView(newView);
    localStorage.setItem('myQuotesView', newView);
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, sort]);

  return {
    search, setSearch,
    debouncedSearch,
    category, setCategory,
    sort, setSort,
    page, setPage,
    view, handleViewChange
  };
}