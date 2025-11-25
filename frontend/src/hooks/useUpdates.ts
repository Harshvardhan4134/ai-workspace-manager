import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { USE_MOCK_DATA, MOCK_EMPLOYEES } from "../mockData";

export interface Update {
  id: string;
  user_id: string;
  user_name?: string;
  priority: "low" | "medium" | "high";
  message: string;
  task_id?: string;
  created_at?: string;
}

const MOCK_UPDATES: Update[] = [
  {
    id: "update-001",
    user_id: "user-002",
    user_name: MOCK_EMPLOYEES.find(e => e.id === "user-002")?.name,
    priority: "high",
    message: "OAuth authentication flow is 80% complete. Token refresh working.",
    task_id: "task-001",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "update-002",
    user_id: "user-003",
    user_name: MOCK_EMPLOYEES.find(e => e.id === "user-003")?.name,
    priority: "medium",
    message: "Dashboard wireframes submitted for review. Waiting for feedback.",
    task_id: "task-002",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "update-003",
    user_id: "user-004",
    user_name: MOCK_EMPLOYEES.find(e => e.id === "user-004")?.name,
    priority: "low",
    message: "Starting CI/CD pipeline setup tomorrow. Will use GitHub Actions.",
    task_id: "task-003",
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "update-004",
    user_id: "user-002",
    user_name: MOCK_EMPLOYEES.find(e => e.id === "user-002")?.name,
    priority: "high",
    message: "Gemini AI integration in progress. API connection established.",
    task_id: "task-007",
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

export const useUpdates = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["updates"],
    queryFn: () => {
      if (USE_MOCK_DATA) {
        return Promise.resolve(MOCK_UPDATES);
      }
      return apiFetch<Update[]>("/updates", { token: token ?? undefined });
    },
    enabled: USE_MOCK_DATA || Boolean(token),
  });
};
