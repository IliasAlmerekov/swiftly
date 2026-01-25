import { ApiError } from '@/types';

const formatDetails = (details: unknown): string | null => {
  if (!details) return null;

  if (Array.isArray(details)) {
    const messages = details
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'message' in item) {
          return String((item as { message?: string }).message || '').trim();
        }
        return '';
      })
      .filter(Boolean);
    return messages.length ? messages.join(', ') : null;
  }

  if (typeof details === 'string') {
    return details.trim() || null;
  }

  if (details && typeof details === 'object' && 'message' in details) {
    const message = String((details as { message?: string }).message || '').trim();
    return message || null;
  }

  return null;
};

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    const detailsMessage = formatDetails(error.details);
    return detailsMessage ? `${error.message}: ${detailsMessage}` : error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
