import { memo } from 'react';
import type { MouseEvent } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';

export interface UserCellProps {
  name: string;
  avatarUrl?: string;
  userId?: string;
  isClickable: boolean;
  onUserClick?: (userId: string) => void;
}

export const UserCell = memo(function UserCell({
  name,
  avatarUrl,
  userId,
  isClickable,
  onUserClick,
}: UserCellProps) {
  const initial = name.charAt(0).toUpperCase() || '?';

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (userId && onUserClick) {
      onUserClick(userId);
    }
  };

  return (
    <div className="flex items-center truncate" title={name}>
      <Avatar className="mr-2 h-8 w-8">
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback>{initial}</AvatarFallback>
      </Avatar>
      {isClickable && userId ? (
        <button onClick={handleClick} className="cursor-pointer font-medium hover:underline">
          {name}
        </button>
      ) : (
        <span>{name}</span>
      )}
    </div>
  );
});
