import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";

export interface Update {
  id: string;
  user_id: string;
  user_name?: string;
  priority: "low" | "medium" | "high";
  message: string;
  task_id?: string;
  created_at?: string;
}

export const useUpdates = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["updates"],
    queryFn: () => apiFetch<Update[]>("/updates", { token: token ?? undefined }),
    enabled: Boolean(token),
  });
};

