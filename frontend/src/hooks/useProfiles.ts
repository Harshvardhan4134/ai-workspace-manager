import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "../api/client";
import type { UserProfile } from "../types";
import { useAuth } from "../context/AuthContext";

export const useEmployees = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["users"],
    queryFn: () => apiFetch<UserProfile[]>("/users", { token: token ?? undefined }),
    enabled: Boolean(token),
  });
};

