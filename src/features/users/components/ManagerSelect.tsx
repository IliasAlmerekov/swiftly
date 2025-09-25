import { useState, useDeferredValue, memo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Avatar, AvatarImage } from "@/shared/components/ui/avatar";
import { UserSearchBar } from "./UserSearchBar";
import type { User } from "@/types";
import { useUserFilter } from "@/shared/hooks/useUserFilter";

interface ManagerSelectProps {
  selectedManagerId: string;
  allUsers: User[];
  disabled?: boolean;
  onValueChange: (value: string) => void;
}

const ManagerSelect = memo(function ManagerSelect({
  selectedManagerId,
  allUsers,
  disabled = false,
  onValueChange,
}: ManagerSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredUsers = useUserFilter({
    users: allUsers,
    searchQuery: deferredSearchQuery,
  });

  return (
    <Select
      value={selectedManagerId}
      disabled={disabled}
      onValueChange={onValueChange}
    >
      <SelectTrigger className="w-[180px] mt-2">
        <SelectValue placeholder="Select a manager" />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        <div className="p-2 border-b">
          <UserSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Search managers..."
          />
        </div>
        <div className="max-h-60 overflow-auto">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <SelectItem
                key={user._id}
                value={user._id}
                className="flex items-center gap-2 p-2"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage
                      src={user.avatar?.url || ""}
                      alt={user.name || "Manager"}
                    />
                  </Avatar>
                  <span className="truncate">{user.name}</span>
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-sm text-muted-foreground text-center">
              No managers found
            </div>
          )}
        </div>
      </SelectContent>
    </Select>
  );
});

export default ManagerSelect;
