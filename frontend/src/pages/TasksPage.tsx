import { useMemo, useState } from "react";

import { useTasks } from "../hooks/useTasks";
import TaskComposer from "../components/TaskComposer";
import TaskDrawer from "../components/TaskDrawer";
import InviteMemberModal from "../components/InviteMemberModal";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/client";
import { useEmployees } from "../hooks/useProfiles";
import { useMeetings } from "../hooks/useMeetings";
import { useUpdates } from "../hooks/useUpdates";
import type { Task, TaskStatus } from "../types";

const columns = [
  { key: "backlog", title: "Backlog", accent: "#4bd5ff", statuses: ["open", "blocked"] },
  { key: "progress", title: "In progress", accent: "#facc15", statuses: ["in_progress", "in_review"] },
  { key: "done", title: "Done", accent: "#a5f3fc", statuses: ["completed"] },
  { key: "archived", title: "Archived", accent: "#c4b5fd", statuses: [] },
];

const TasksPage = () => {
  const { token } = useAuth();
  const { data: tasks = [], refetch } = useTasks();
  const { data: employees = [] } = useEmployees();
  const { data: meetings = [] } = useMeetings();
  const { data: updates = [], refetch: refetchUpdates } = useUpdates();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [postText, setPostText] = useState("");
  const [postPriority, setPostPriority] = useState<"low" | "medium" | "high">("medium");
  const [posting, setPosting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTaskComposer, setShowTaskComposer] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const projectName = "Quickit Project";
  const customerName = "Rentshare Ops";
  const projectDates = useMemo(() => {
    if (!tasks.length) return { start: "—", end: "—" };
    const start = tasks.reduce((acc, task) => Math.min(acc, new Date(task.created_at ?? Date.now()).getTime()), Date.now());
    const end = tasks
      .filter((task) => task.deadline)
      .reduce((acc, task) => Math.max(acc, new Date(task.deadline ?? "").getTime()), 0);
    return {
      start: new Date(start).toLocaleDateString(),
      end: end ? new Date(end).toLocaleDateString() : "TBD",
    };
  }, [tasks]);

  const filteredTasks = useMemo(
    () => tasks.filter((task) => task.title.toLowerCase().includes(search.toLowerCase())),
    [tasks, search],
  );

  const grouped = columns.map((column) => ({
    ...column,
    tasks:
      column.key === "archived"
        ? filteredTasks.filter((task) => task.status === "blocked")
        : filteredTasks.filter((task) => column.statuses.includes(task.status ?? "open")),
  }));

  const todaysMeetings = meetings.filter(
    (meeting) => new Date(meeting.date).toDateString() === new Date().toDateString(),
  );

  const notifications = updates.filter((update) => update.priority === "high").slice(0, 3);

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    if (!token) return;
    await apiFetch(`/tasks/${task.id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    });
    refetch();
  };

  const handleAutoAssign = async (task: Task) => {
    if (!token) return;
    await apiFetch(`/tasks/${task.id}/auto-assign`, { method: "POST", token });
    refetch();
  };

  const handlePostUpdate = async () => {
    if (!token || !postText.trim()) return;
    setPosting(true);
    await apiFetch("/updates", {
      method: "POST",
      token,
      body: JSON.stringify({ priority: postPriority, message: postText }),
    });
    setPostText("");
    setPosting(false);
    refetchUpdates();
  };

  return (
    <div className="tasks-layout">
      <header className="project-hero">
        <div>
          <p className="muted tiny">Projects / {projectName}</p>
          <h1>{projectName}</h1>
          <div className="project-tags">
            <span className="chip">High priority</span>
            <span className="chip">Research</span>
            <span className="chip">Design</span>
            <span className="chip">Development</span>
          </div>
        </div>
        <div className="project-meta">
          <div>
            <p className="muted tiny">Start date</p>
            <strong>{projectDates.start}</strong>
          </div>
          <div>
            <p className="muted tiny">Due date</p>
            <strong>{projectDates.end}</strong>
          </div>
          <div>
            <p className="muted tiny">Members</p>
            <div className="member-list">
              {employees.slice(0, 4).map((employee) => (
                <span key={employee.id} className="avatar tiny">
                  {employee.avatar_url ? <img src={employee.avatar_url} /> : employee.name[0]}
                </span>
              ))}
              <button className="btn ghost small" onClick={() => setShowInviteModal(true)}>
                Invite
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="project-toolbar">
        <div className="customer-card">
          <p className="muted tiny">Customer</p>
          <strong>{customerName}</strong>
          <button
            className="btn ghost small"
            onClick={() => {
              const taskWithPRD = tasks.find((t) => t.customer_name === customerName && t.prd_url);
              if (taskWithPRD?.prd_url) {
                window.open(taskWithPRD.prd_url, "_blank");
              } else {
                alert("No PRD available for this customer yet.");
              }
            }}
          >
            View brief
          </button>
        </div>
        <div className="toolbar-actions">
          <input
            className="search-input"
            placeholder="Search tasks..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button className="btn outline" onClick={() => setShowFilters(!showFilters)}>
            Filters {showFilters ? "▼" : "▶"}
          </button>
          <button className="btn outline" onClick={() => setShowSort(!showSort)}>
            Sort {showSort ? "▼" : "▶"}
          </button>
          <button className="btn primary" onClick={() => setShowTaskComposer(!showTaskComposer)}>
            + New task
          </button>
        </div>
      </div>

      <div className="kanban-board">
        {grouped.map((column) => (
          <section key={column.key} className="kanban-column">
            <div className="kanban-column-header">
              <div>
                <span className="dot" style={{ background: column.accent }} />
                <strong>
                  {column.title} ({column.tasks.length})
                </strong>
              </div>
              <button className="btn ghost small" onClick={() => setSelectedTask(null)}>
                +
              </button>
            </div>
            <div className="kanban-cards">
              {column.tasks.map((task) => (
                <article key={task.id} className="kanban-card">
                  <div className="kanban-card-top">
                    <span className="badge">{task.status}</span>
                    <button className="icon-button" onClick={() => handleAutoAssign(task)}>
                      ⚡
                    </button>
                  </div>
                  <h4>{task.title}</h4>
                  <p className="muted">{task.description || "No description yet"}</p>
                  <div className="kanban-card-meta">
                    <span>{task.deadline ?? "TBD"}</span>
                    <span>{task.priority ? `Priority ${task.priority}` : "No priority"}</span>
                  </div>
                  <div className="kanban-card-footer">
                    <div className="avatar tiny">{task.assigned_to?.[0] ?? "?"}</div>
                    <div className="card-actions">
                      <button className="btn ghost small" onClick={() => handleStatusChange(task, "completed")}>
                        Mark done
                      </button>
                      <button className="btn outline small" onClick={() => setSelectedTask(task)}>
                        Open
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="side-panels">
        {showTaskComposer && (
          <div className="panel glass">
            <div className="panel-header">
              <div>
                <h3>Quick create</h3>
                <p className="muted">Auto-assign new task</p>
              </div>
              <button className="btn ghost small" onClick={() => setShowTaskComposer(false)}>
                ✕
              </button>
            </div>
            <TaskComposer
              onCreated={() => {
                refetch();
                setShowTaskComposer(false);
              }}
            />
          </div>
        )}

        <div className="panel glass">
          <div className="panel-header">
            <div>
              <h3>Today’s schedule</h3>
              <p className="muted">Calendar sync</p>
            </div>
          </div>
          {todaysMeetings.length ? (
            todaysMeetings.map((meeting) => (
              <div key={meeting.id} className="schedule-item">
                <div>
                  <strong>{meeting.title}</strong>
                  <p className="muted">
                    {new Date(meeting.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ·{" "}
                    {meeting.attendees.length} attendees
                  </p>
                </div>
                <button
                  className="btn ghost small"
                  onClick={() => {
                    if (meeting.meet_url) {
                      window.open(meeting.meet_url, "_blank");
                    } else {
                      alert(`Meeting: ${meeting.title}\nTime: ${new Date(meeting.date).toLocaleString()}`);
                    }
                  }}
                >
                  Join
                </button>
              </div>
            ))
          ) : (
            <p className="muted">No meetings today.</p>
          )}
        </div>

        <div className="panel glass">
          <div className="panel-header">
            <div>
              <h3>Team updates</h3>
              <p className="muted">Share what you’re tackling</p>
            </div>
          </div>
          <div className="form">
            <textarea
              placeholder="What are you working on?"
              value={postText}
              onChange={(event) => setPostText(event.target.value)}
              rows={3}
            />
            <select value={postPriority} onChange={(event) => setPostPriority(event.target.value as "low" | "medium" | "high")}>
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
            <button className="btn primary" onClick={handlePostUpdate} disabled={posting}>
              {posting ? "Posting..." : "Post update"}
            </button>
          </div>
          <div className="updates-list">
            {updates.slice(0, 4).map((update) => (
              <div key={update.id} className="update-item">
                <div>
                  <strong>{update.user_name ?? "Teammate"}</strong>
                  <p className="muted">{update.message}</p>
                </div>
                <span className={`badge priority-${update.priority}`}>{update.priority}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel glass">
          <div className="panel-header">
            <div>
              <h3>Notifications</h3>
              <p className="muted">High-priority signals</p>
            </div>
          </div>
          <ul>
            {notifications.length ? (
              notifications.map((notification) => (
                <li key={notification.id}>
                  <strong>{notification.user_name ?? "AI Alert"}</strong> — {notification.message}
                </li>
              ))
            ) : (
              <li className="muted">No urgent notifications.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="floating-actions">
        <button className="fab">+</button>
        <div className="fab-menu">
          <button>New project</button>
          <button onClick={() => setShowTaskComposer(!showTaskComposer)}>Create task</button>
          <button onClick={() => setShowInviteModal(true)}>Invite member</button>
        </div>
      </div>

      {selectedTask && (
        <TaskDrawer task={selectedTask} onClose={() => setSelectedTask(null)} onTaskUpdated={refetch} />
      )}
      <InviteMemberModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvited={() => {
          // Refresh employees list if needed
        }}
      />
    </div>
  );
};

export default TasksPage;


