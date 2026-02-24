import { ApiError } from '@/types';

export type ErrorSource = 'error-boundary' | 'react-query' | 'api-client' | 'app';

export interface ErrorReport {
  source: ErrorSource;
  context?: string;
  message: string;
  status?: number;
  code?: string;
}

type GlobalErrorReporter = (report: ErrorReport) => void;

const getGlobalReporter = (): GlobalErrorReporter | undefined => {
  const scope = globalThis as { __APP_ERROR_REPORTER__?: GlobalErrorReporter };
  return scope.__APP_ERROR_REPORTER__;
};

const toReport = (source: ErrorSource, error: unknown, context?: string): ErrorReport => {
  if (error instanceof ApiError) {
    return {
      source,
      context,
      message: error.message,
      status: error.status,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      source,
      context,
      message: error.message,
    };
  }

  return {
    source,
    context,
    message: 'Unknown error',
  };
};

export const reportError = (source: ErrorSource, error: unknown, context?: string): void => {
  const report = toReport(source, error, context);

  const reporter = getGlobalReporter();
  if (reporter) {
    reporter(report);
    return;
  }

  console.error('[observability]', report);
};
