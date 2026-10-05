'use client';

import DataTablePagination from './DataTablePagination';

/**
 * Re-export DataTablePagination as Pagination for full backward compatibility
 * across all existing pages and components in the dashboard.
 */
export default function Pagination(props) {
  return <DataTablePagination {...props} />;
}

export { DataTablePagination };