export const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-[var(--destructive)] text-white dark:bg-[var(--destructive)] dark:text-white';
    case 'medium':
      return 'bg-[var(--chart-5)] text-white dark:bg-[var(--chart-5)] dark:text-white';
    case 'low':
      return 'bg-[var(--chart-2)] text-white dark:bg-[var(--chart-2)] dark:text-white';
    case 'untriaged':
      return 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return 'bg-[var(--chart-1)] text-white dark:bg-[var(--chart-1)] dark:text-white';
    case 'in-progress':
      return 'bg-[var(--chart-6)] text-white dark:bg-[var(--chart-6)] dark:text-white';
    case 'resolved':
      return 'bg-[var(--chart-5)] text-white dark:bg-[var(--chart-10)] dark:text-white';
    case 'closed':
      return 'bg-[var(--chart-4)] text-white dark:bg-[var(--chart-4)] dark:text-white';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

export const CATEGORY_OPTIONS = [
  { value: 'Hardware', label: 'Hardware' },
  { value: 'Software', label: 'Software' },
  { value: 'Network', label: 'Network' },
  { value: 'Account', label: 'Account' },
  { value: 'Email', label: 'Email' },
  { value: 'Other', label: 'Other' },
];

export const normalizeCategoryValue = (category?: string): string | undefined => {
  if (!category) return undefined;
  const trimmed = category.trim();
  if (!trimmed) return undefined;
  const normalized = trimmed.toLowerCase();
  const known = CATEGORY_OPTIONS.find(
    (option) =>
      option.value.toLowerCase() === normalized || option.label.toLowerCase() === normalized,
  );
  return known ? known.value : trimmed;
};

export const formatCategoryLabel = (category?: string): string => {
  if (!category) return 'Not set';
  const trimmed = category.trim();
  if (!trimmed) return 'Not set';
  const normalized = trimmed.toLowerCase();
  const known = CATEGORY_OPTIONS.find(
    (option) =>
      option.value.toLowerCase() === normalized || option.label.toLowerCase() === normalized,
  );
  return known ? known.label : trimmed;
};

export const getInitials = (value?: string): string => {
  if (!value) return 'U';
  const parts = value.trim().split(' ');
  const letters = parts
    .map((part) => part[0])
    .slice(0, 2)
    .join('');
  return letters.toUpperCase();
};
