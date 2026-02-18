import { memo } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';

interface PaginationControlsProps {
  /** Current page index (0-based) */
  pageIndex: number;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether navigation is disabled (e.g., during loading) */
  isDisabled?: boolean;
  /** Called when user clicks previous */
  onPreviousPage: () => void;
  /** Called when user clicks next */
  onNextPage: () => void;
}

/**
 * Reusable pagination controls component.
 * Handles previous/next navigation with proper disabled states.
 *
 * Wrapped with memo to prevent unnecessary re-renders when parent updates.
 */
export const PaginationControls = memo(function PaginationControls({
  pageIndex,
  hasPreviousPage,
  hasNextPage,
  isDisabled = false,
  onPreviousPage,
  onNextPage,
}: PaginationControlsProps) {
  const isPrevDisabled = !hasPreviousPage || isDisabled;
  const isNextDisabled = !hasNextPage || isDisabled;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={isPrevDisabled}
            tabIndex={isPrevDisabled ? -1 : 0}
            className={isPrevDisabled ? 'pointer-events-none opacity-50' : undefined}
            onClick={(event) => {
              event.preventDefault();
              if (!isPrevDisabled) {
                onPreviousPage();
              }
            }}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            href="#"
            isActive
            size="default"
            className="pointer-events-none"
            onClick={(event) => event.preventDefault()}
          >
            {pageIndex + 1}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={isNextDisabled}
            tabIndex={isNextDisabled ? -1 : 0}
            className={isNextDisabled ? 'pointer-events-none opacity-50' : undefined}
            onClick={(event) => {
              event.preventDefault();
              if (!isNextDisabled) {
                onNextPage();
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
});

export default PaginationControls;
