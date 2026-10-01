// Client-side pagination over a list: page and page size state, the current slice, and reset when filters change.
import { useState } from 'react';

export const SHOW_ALL = -1;

export function usePagination<T>(items: T[], resetKey: string, initialPageSize = 15) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [lastResetKey, setLastResetKey] = useState(resetKey);

  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    setPage(1);
  }

  const totalPages = pageSize === SHOW_ALL ? 1 : Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = pageSize === SHOW_ALL ? 0 : (current - 1) * pageSize;
  const end = pageSize === SHOW_ALL ? items.length : Math.min(start + pageSize, items.length);

  function set_page_size(size: number) {
    setPageSizeState(size);
    setPage(1);
  }

  return { page: current, setPage, pageSize, setPageSize: set_page_size, totalPages, start, end, pageItems: items.slice(start, end) };
}
