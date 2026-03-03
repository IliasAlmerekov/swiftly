interface ErrorStateProps {
  message: string;
  onClose?: () => void;
}

export function ErrorState({ message, onClose }: ErrorStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="py-8 text-center">
        <p className="text-destructive">{message}</p>
        {onClose ? (
          <button className="mt-3 underline" onClick={onClose} type="button">
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
}
