import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "../api/client";
import type { Meeting } from "../types";
import { useAuth } from "../context/AuthContext";
import { USE_MOCK_DATA, MOCK_MEETINGS } from "../mockData";

export const useMeetings = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["meetings"],
    queryFn: () => {
      if (USE_MOCK_DATA) {
        return Promise.resolve(MOCK_MEETINGS);
      }
      return apiFetch<Meeting[]>("/meetings", { token: token ?? undefined });
    },
    enabled: USE_MOCK_DATA || Boolean(token),
  });
};
