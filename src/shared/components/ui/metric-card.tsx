import { memo, type ComponentType } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface MetricCardProps {
  /** Card title */
  title: string;
  /** Numeric or string value to display prominently */
  value: number | string;
  /** Icon component to display in header */
  icon?: ComponentType<{ className?: string }>;
  /** Additional description text */
  description?: string;
  /** Optional children for custom content (e.g., chart) */
  children?: React.ReactNode;
}

/**
 * Reusable metric card component for dashboards.
 * Displays a title, value, optional icon and description.
 *
 * Follows Single Responsibility Principle - only responsible for
 * displaying a single metric with consistent styling.
 *
 * Wrapped with memo to prevent unnecessary re-renders when parent updates.
 */
export const MetricCard = memo(function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  children,
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="text-muted-foreground h-4 w-4" />}
      </CardHeader>
      <CardContent>
        {children ? (
          children
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <div className="text-muted-foreground flex items-center space-x-2 text-xs">
                <span>{description}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
});

export default MetricCard;
