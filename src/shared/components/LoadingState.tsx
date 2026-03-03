interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="py-8 text-center">
        <div
          aria-label="Loading"
          className="border-primary mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          role="status"
        />
        <p>{message}</p>
      </div>
    </div>
  );
}
