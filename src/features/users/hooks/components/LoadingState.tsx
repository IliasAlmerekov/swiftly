interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading profile...' }: LoadingStateProps) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
        <p className="text-foreground">{message}</p>
      </div>
    </div>
  );
}
