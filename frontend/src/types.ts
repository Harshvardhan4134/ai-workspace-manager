export type TaskStatus = "open" | "in_progress" | "in_review" | "blocked" | "completed";
export type Complexity = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  attachments: string[];
  complexity: Complexity;
  priority?: number;
  deadline?: string;
  status: TaskStatus;
  predicted_hours?: number;
  assigned_to?: string;
  created_by?: string;
  flowchart_step?: string;
  watchers: string[];
  activity_log: ActivityLogEntry[];
  created_at?: string;
  updated_at?: string;
  ai_reason?: string;
  meeting_suggestion?: MeetingSuggestion;
  customer_name?: string;
  project_name?: string;
  prd_url?: string;
}

export interface ActivityLogEntry {
  timestamp: string;
  actor: string;
  action: string;
}

export interface Message {
  id: string;
  task_id: string;
  sender_id: string;
  text: string;
  attachments: string[];
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  role?: string;
  skills: string[];
  capacity_hours: number;
  assigned_hours: number;
  avatar_url?: string;
  resume_url?: string;
  phone?: string;
  bio?: string;
  status: "active" | "busy" | "on_leave";
  availability?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  attendees: string[];
  date: string;
  duration_minutes: number;
  task_id?: string;
  created_by: string;
  meet_url?: string;
}

export interface MeetingSuggestion {
  attendees: string[];
  duration: number;
  day: string;
}

