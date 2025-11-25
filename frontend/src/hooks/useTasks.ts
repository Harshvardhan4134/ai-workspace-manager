import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "../api/client";
import type { Task } from "../types";
import { useAuth } from "../context/AuthContext";
import { USE_MOCK_DATA, MOCK_TASKS } from "../mockData";

interface TaskFilters {
  status?: string;
  priority?: string;
}

export const useTasks = (filters: TaskFilters = {}) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => {
      if (USE_MOCK_DATA) {
        let tasks = [...MOCK_TASKS];
        if (filters.status) {
          tasks = tasks.filter((t) => t.status === filters.status);
        }
        return Promise.resolve(tasks);
      }
      
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      const query = params.toString();
      return apiFetch<Task[]>(`/tasks/${query ? `?${query}` : ""}`, { token: token ?? undefined });
    },
    enabled: USE_MOCK_DATA || Boolean(token),
  });
};
