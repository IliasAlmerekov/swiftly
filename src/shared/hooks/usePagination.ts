import { useState, useCallback, useEffect, useMemo } from 'react';

interface UsePaginationOptions {
  /** Initial page size */
  initialPageSize?: number;
  /** Key to reset pagination when it changes */
  resetKey?: string;
}

interface UsePaginationResult {
  /** Current page index (0-based) */
  pageIndex: number;
  /** Current page size */
  pageSize: number;
  /** Array of cursors for each page */
  pageCursors: Array<string | null>;
  /** Current cursor for API request */
  cursor: string | null;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
  /** Set page size */
  setPageSize: (size: number) => void;
  /** Go to previous page */
  goToPreviousPage: () => void;
  /** Go to next page with cursor */
  goToNextPage: (nextCursor: string | null) => void;
  /** Reset pagination to first page */
  reset: () => void;
}

/**
 * Custom hook for managing cursor-based pagination state.
 * Centralizes pagination logic to avoid duplication across components.
 *
 * @param options Configuration options
 * @returns Pagination state and handlers
 */
export function usePagination({
  initialPageSize = 20,
  resetKey = '',
}: UsePaginationOptions = {}): UsePaginationResult {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCursors, setPageCursors] = useState<Array<string | null>>([null]);

  const cursor = useMemo(() => pageCursors[pageIndex] ?? null, [pageCursors, pageIndex]);
  const hasPreviousPage = pageIndex > 0;

  // Reset pagination when resetKey or pageSize changes
  useEffect(() => {
    setPageIndex(0);
    setPageCursors([null]);
  }, [pageSize, resetKey]);

  const goToPreviousPage = useCallback(() => {
    setPageIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNextPage = useCallback(
    (nextCursor: string | null) => {
      if (!nextCursor) return;

      setPageCursors((prev) => {
        const next = [...prev];
        if (!next[pageIndex + 1]) {
          next[pageIndex + 1] = nextCursor;
        }
        return next;
      });
      setPageIndex((prev) => prev + 1);
    },
    [pageIndex],
  );

  const reset = useCallback(() => {
    setPageIndex(0);
    setPageCursors([null]);
  }, []);

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
  }, []);

  return {
    pageIndex,
    pageSize,
    pageCursors,
    cursor,
    hasPreviousPage,
    setPageSize: handleSetPageSize,
    goToPreviousPage,
    goToNextPage,
    reset,
  };
}
