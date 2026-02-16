import { memo, type ReactNode } from 'react';

interface TabPageLayoutProps {
  /** Main page title - string or custom ReactNode */
  title: string | ReactNode;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Page content */
  children: ReactNode;
  /** Optional header content slot (between title and main content) */
  headerContent?: ReactNode;
  /** Optional padding override for content area */
  contentClassName?: string;
}

/**
 * Reusable layout component for tab pages.
 * Follows bulletproof-react pattern of composition over configuration.
 *
 * Features:
 * - Consistent header styling across tabs
 * - Flexible content area
 * - Optional header content slot for custom elements
 *
 * Usage:
 * ```tsx
 * <TabPageLayout title="Dashboard" subtitle="Overview of your tickets">
 *   <DashboardContent />
 * </TabPageLayout>
 * ```
 */
export const TabPageLayout = memo(function TabPageLayout({
  title,
  subtitle,
  children,
  headerContent,
  contentClassName = 'px-4 py-6 lg:px-6',
}: TabPageLayoutProps) {
  return (
    <div className="@container/main flex-1 overflow-auto">
      <header className="border-b px-4 py-6 lg:px-6">
        {typeof title === 'string' ? <h1 className="text-2xl font-semibold">{title}</h1> : title}
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        {headerContent}
      </header>
      <div className={contentClassName}>{children}</div>
    </div>
  );
});

export default TabPageLayout;
