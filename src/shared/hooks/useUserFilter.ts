import { useMemo } from "react";
import type { User } from "@/types";

interface UseUserFilterOptions {
  users: User[];
  searchQuery: string;
}

export function useUserFilter({ users, searchQuery }: UseUserFilterOptions) {
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.position?.toLowerCase().includes(query) ||
        user.department?.toLowerCase().includes(query) ||
        user.company?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  return filteredUsers;
}
