import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "../api/client";
import type { Meeting } from "../types";
import { useAuth } from "../context/AuthContext";

export const useMeetings = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["meetings"],
    queryFn: () => apiFetch<Meeting[]>("/meetings", { token: token ?? undefined }),
    enabled: Boolean(token),
  });
};

