import { toast } from 'sonner';

import { ApiError } from '@/types';

// ============ Error Messages ============

const DEFAULT_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Session expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This resource already exists.',
  422: 'Validation error. Please check your input.',
  429: 'Too many requests. Please try again later.',
  500: 'Server error. Please try again later.',
  502: 'Server is temporarily unavailable.',
  503: 'Service unavailable. Please try again later.',
};

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
    errorMessage = message || error.message || DEFAULT_ERROR_MESSAGES[statusCode] || errorMessage;

    // Handle specific status codes
    if (statusCode === 401 && onUnauthorized) {
      onUnauthorized();
    }
  } else if (error instanceof Error) {
    errorMessage = message || error.message;
  }

  // Log error for debugging
  if (import.meta.env.DEV) {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, {
      message: errorMessage,
      statusCode,
      error,
    });
  }

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
  handleError(error, { showToast: false });
}
