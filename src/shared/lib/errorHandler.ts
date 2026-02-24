import { toast } from 'sonner';

import { ApiError, mapApiErrorToUserMessage } from '@/types';
import { reportError } from '@/shared/lib/observability';

// ============ Error Handler ============

export interface ErrorHandlerOptions {
  /** Custom error message to show */
  message?: string;
  /** Whether to show toast notification (default: true) */
  showToast?: boolean;
  /** Callback for specific status codes */
  onUnauthorized?: () => void;
  /** Additional context for logging */
  context?: string;
}

export function handleError(error: unknown, options: ErrorHandlerOptions = {}): void {
  const { message, showToast = true, onUnauthorized, context } = options;

  let errorMessage = message || 'An unexpected error occurred';
  let statusCode = 500;

  if (error instanceof ApiError) {
    statusCode = error.status;
    errorMessage = message || mapApiErrorToUserMessage(error, errorMessage);

    // Handle specific status codes
    if (statusCode === 401 && onUnauthorized) {
      onUnauthorized();
    }
  } else if (error instanceof Error) {
    errorMessage = message || error.message;
  }

  reportError('react-query', error, context);

  // Show toast notification
  if (showToast) {
    toast.error(errorMessage, {
      duration: statusCode >= 500 ? 5000 : 4000,
    });
  }
}

// ============ Success Handler ============

export function handleSuccess(message: string): void {
  toast.success(message, {
    duration: 3000,
  });
}

// ============ React Query Error Handler ============

/**
 * Creates an onError handler for React Query mutations
 */
export function createMutationErrorHandler(options: ErrorHandlerOptions = {}) {
  return (error: unknown) => handleError(error, options);
}

/**
 * Default query error handler for React Query
 * Can be used in QueryClient defaultOptions
 */
export function defaultQueryErrorHandler(error: unknown): void {
  handleError(error, { showToast: false, context: 'query' });
}
