interface ErrorStateProps {
  message: string;
  onClose: () => void;
}

export default function ErrorState({ message, onClose }: ErrorStateProps) {
  return (
    <div className="bg-destructive text-destructive-foreground mb-4 rounded-lg p-4">
      {message}
      <button onClick={onClose} className="ml-2 underline">
        Close
      </button>
    </div>
  );
}
