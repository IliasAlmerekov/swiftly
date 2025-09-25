import { useState, useDeferredValue, useRef, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Avatar, AvatarImage } from '@/shared/components/ui/avatar';
import { UserSearchBar } from './UserSearchBar';
import type { User } from '@/types';
import { useUserFilter } from '@/shared/hooks/useUserFilter';

interface VirtualizedManagerSelectProps {
  selectedManagerId: string;
  allUsers: User[];
  disabled?: boolean;
  onValueChange: (value: string) => void;
}

const VirtualizedManagerSelect = memo(function VirtualizedManagerSelect({
  selectedManagerId,
  allUsers,
  disabled = false,
  onValueChange,
}: VirtualizedManagerSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const parentRef = useRef<HTMLDivElement>(null);

  const filteredUsers = useUserFilter({
    users: allUsers,
    searchQuery: deferredSearchQuery,
  });

  const virtualizer = useVirtualizer({
    count: filteredUsers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // Height of each item
    overscan: 5,
  });

  // For large lists (>50 items), use virtualization
  const useVirtualization = filteredUsers.length > 50;

  if (!useVirtualization) {
    // Use regular rendering for smaller lists
    return (
      <Select value={selectedManagerId} disabled={disabled} onValueChange={onValueChange}>
        <SelectTrigger className="mt-2 w-[180px]">
          <SelectValue placeholder="Select a manager" />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          <div className="border-b p-2">
            <UserSearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search managers..."
            />
          </div>
          <div className="max-h-60 overflow-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <SelectItem key={user._id} value={user._id} className="flex items-center gap-2 p-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar?.url || ''} alt={user.name || 'Manager'} />
                    </Avatar>
                    <span className="truncate">{user.name}</span>
                  </div>
                </SelectItem>
              ))
            ) : (
              <div className="text-muted-foreground p-2 text-center text-sm">No managers found</div>
            )}
          </div>
        </SelectContent>
      </Select>
    );
  }

  // Virtualized rendering for large lists
  return (
    <Select value={selectedManagerId} disabled={disabled} onValueChange={onValueChange}>
      <SelectTrigger className="mt-2 w-[180px]">
        <SelectValue placeholder="Select a manager" />
      </SelectTrigger>
      <SelectContent className="p-0">
        <div className="border-b p-2">
          <UserSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Search managers..."
          />
        </div>
        <div ref={parentRef} className="h-60 overflow-auto">
          {filteredUsers.length > 0 ? (
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const user = filteredUsers[virtualItem.index];
                return (
                  <div
                    key={user._id}
                    className="hover:bg-accent absolute top-0 left-0 w-full cursor-pointer"
                    style={{
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    onClick={() => onValueChange(user._id)}
                  >
                    <div className="flex h-full items-center gap-2 p-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar?.url || ''} alt={user.name || 'Manager'} />
                      </Avatar>
                      <span className="truncate">{user.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-muted-foreground p-2 text-center text-sm">No managers found</div>
          )}
        </div>
      </SelectContent>
    </Select>
  );
});

export default VirtualizedManagerSelect;
