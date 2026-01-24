import { useRef, useEffect } from 'react';
import { Input } from '@/shared/components/ui/input';
import { IconSearch } from '@tabler/icons-react';

interface UserSearchBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  placeholder?: string;
}

export function UserSearchBar({
  searchQuery = '',
  onSearchChange,
  placeholder = 'Search users...',
}: UserSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Save and restore cursor position on searchQuery change
  useEffect(() => {
    if (searchQuery && inputRef.current) {
      // Save current cursor position
      const selectionStart = inputRef.current.selectionStart;
      const selectionEnd = inputRef.current.selectionEnd;

      // Restore cursor position after re-render
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          if (selectionStart !== null && selectionEnd !== null) {
            inputRef.current.setSelectionRange(selectionStart, selectionEnd);
          }
        }
      }, 0);
    }
  }, [searchQuery]);

  return (
    <div className="flex gap-4">
      <div className="relative flex-1">
        <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          className="pl-9"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>
    </div>
  );
}
