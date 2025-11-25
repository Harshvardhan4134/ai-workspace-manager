import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "../api/client";
import type { UserProfile } from "../types";
import { useAuth } from "../context/AuthContext";
import { USE_MOCK_DATA, MOCK_EMPLOYEES } from "../mockData";

export const useEmployees = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["users"],
    queryFn: () => {
      if (USE_MOCK_DATA) {
        return Promise.resolve(MOCK_EMPLOYEES);
      }
      return apiFetch<UserProfile[]>("/users", { token: token ?? undefined });
    },
    enabled: USE_MOCK_DATA || Boolean(token),
  });
};
