import { memo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface PageSizeSelectorProps {
  /** Current page size */
  pageSize: number;
  /** Called when page size changes */
  onPageSizeChange: (size: number) => void;
  /** Available page size options */
  options?: number[];
  /** Label text */
  label?: string;
}

/**
 * Reusable page size selector component.
 *
 * Wrapped with memo to prevent unnecessary re-renders.
 */
export const PageSizeSelector = memo(function PageSizeSelector({
  pageSize,
  onPageSizeChange,
  options = [20, 50, 100],
  label = 'Rows per page',
}: PageSizeSelectorProps) {
  return (
    <div className="flex items-center justify-between gap-3 md:justify-end">
      <span className="text-muted-foreground text-sm">{label}</span>
      <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
        <SelectTrigger className="h-8 w-[90px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

export default PageSizeSelector;
