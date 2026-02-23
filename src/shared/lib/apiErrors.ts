import { ApiError, mapApiErrorToUserMessage } from '@/types';

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

  if (details && typeof details === 'object' && 'issues' in details) {
    const issues = (details as { issues?: Array<{ message?: string }> }).issues;
    if (Array.isArray(issues)) {
      const messages = issues.map((issue) => String(issue?.message ?? '').trim()).filter(Boolean);
      return messages.length ? messages.join(', ') : null;
    }
  }

  return null;
};

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    const baseMessage = mapApiErrorToUserMessage(error, fallback);
    const detailsMessage = formatDetails(error.details);
    return detailsMessage ? `${baseMessage}: ${detailsMessage}` : baseMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
