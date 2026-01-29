import { memo, type ComponentType, type ReactNode } from 'react';

interface StatusRowProps {
  /** Icon component */
  icon: ComponentType<{ className?: string }>;
  /** Icon color class (e.g., 'text-green-500') */
  iconClassName?: string;
  /** Label text */
  label: string;
  /** Value to display */
  value: ReactNode;
}

/**
 * Reusable status row component for displaying key-value pairs with icons.
 * Used in ViewSupportStatus and similar components.
 *
 * Wrapped with memo to prevent unnecessary re-renders.
 */
export const StatusRow = memo(function StatusRow({
  icon: Icon,
  iconClassName = '',
  label,
  value,
}: StatusRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Icon className={`h-4 w-4 ${iconClassName}`} />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
});

export default StatusRow;
