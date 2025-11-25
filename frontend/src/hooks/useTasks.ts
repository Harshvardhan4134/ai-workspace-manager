import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "../api/client";
import type { Task } from "../types";
import { useAuth } from "../context/AuthContext";

interface TaskFilters {
  status?: string;
  priority?: string;
}

export const useTasks = (filters: TaskFilters = {}) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      const query = params.toString();
      return apiFetch<Task[]>(`/tasks/${query ? `?${query}` : ""}`, { token: token ?? undefined });
    },
    enabled: Boolean(token),
  });
};

