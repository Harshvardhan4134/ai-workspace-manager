import { useEffect, useMemo, useState } from "react";

import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { Message, Task, TaskStatus } from "../types";
import { uploadToGcs } from "../utils/upload";

interface Props {
  task: Task;
  onClose: () => void;
  onTaskUpdated: () => void;
}

const statusBadges: Record<TaskStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  in_review: "In Review",
  blocked: "Blocked",
  completed: "Completed",
};

const TaskDrawer: React.FC<Props> = ({ task, onClose, onTaskUpdated }) => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [summary, setSummary] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [localTask, setLocalTask] = useState<Task>(task);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority || 3,
    deadline: task.deadline || "",
    assigned_to: task.assigned_to || "",
    complexity: task.complexity || "medium",
  });

  useEffect(() => {
    setLocalTask(task);
    setEditForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority || 3,
      deadline: task.deadline || "",
      assigned_to: task.assigned_to || "",
      complexity: task.complexity || "medium",
    });
  }, [task]);

  const watchersText = useMemo(() => localTask.watchers?.join(", ") || "None", [localTask.watchers]);

  const loadMessages = async () => {
    if (!token) return;
    try {
      const data = await apiFetch<Message[]>(`/messages/${task.id}`, { token });
      setMessages(data);
    } catch (e) {
      console.error("Failed to load messages:", e);
    }
  };

  useEffect(() => {
    if (task.id && token) {
      loadMessages();
    }
    const interval = setInterval(() => {
      if (task.id && token) loadMessages();
    }, 10000);
    return () => clearInterval(interval);
  }, [task.id, token]);

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!chatInput.trim() || !token) return;
    await apiFetch("/messages/", {
      method: "POST",
      token,
      body: JSON.stringify({
        task_id: task.id,
        text: chatInput.trim(),
        attachments: [],
      }),
    });
    setChatInput("");
    loadMessages();
  };

  const handleSummarize = async () => {
    if (!token) return;
    setAiThinking(true);
    try {
      const data = await apiFetch<{ bullets: string[]; status: string; next_step?: string }>(
        `/messages/${task.id}/summarize`,
        { method: "POST", token },
      );
      setSummary(`${(data.bullets || []).join(" • ")} — ${data.status}`);
    } catch (e) {
      setSummary("AI summary unavailable");
    }
    setAiThinking(false);
  };

  const handleFlowchartPrediction = async () => {
    if (!token) return;
    setAiThinking(true);
    try {
      const data = await apiFetch<{ flowchart_next_step: string; recommended_action: string }>(
        "/agent/flowchart",
        {
          method: "POST",
          token,
          body: JSON.stringify({ task: localTask }),
        },
      );
      setSummary(`Next: ${data.flowchart_next_step} · ${data.recommended_action}`);
    } catch (e) {
      setSummary("AI prediction unavailable");
    }
    setAiThinking(false);
  };

  const handleAttachmentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length || !token) return;
    const file = event.target.files[0];
    try {
      const url = await uploadToGcs(file, token);
      const attachments = [...(localTask.attachments ?? []), url];
      const updated = await apiFetch<Task>(`/tasks/${task.id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ attachments }),
      });
      setLocalTask(updated);
      onTaskUpdated();
    } catch (e) {
      console.error("Upload failed:", e);
    }
    event.target.value = "";
  };

  const handleStatusChange = async (status: TaskStatus) => {
    if (!token) return;
    try {
      const updated = await apiFetch<Task>(`/tasks/${task.id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status }),
      });
      setLocalTask(updated);
      onTaskUpdated();
    } catch (e) {
      console.error("Status update failed:", e);
    }
  };

  const handleSaveEdit = async () => {
    if (!token) return;
    try {
      const updated = await apiFetch<Task>(`/tasks/${task.id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify(editForm),
      });
      setLocalTask(updated);
      setIsEditing(false);
      onTaskUpdated();
    } catch (e) {
      console.error("Update failed:", e);
    }
  };

  return (
    <aside className="drawer" style={{ 
      position: "fixed", 
      right: 0, 
      top: 0, 
      bottom: 0, 
      width: "480px", 
      background: "white", 
      boxShadow: "-4px 0 20px rgba(0,0,0,0.1)",
      zIndex: 100,
      overflowY: "auto",
      padding: "1.5rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>Task #{localTask.id?.slice(0, 8)}</p>
          {!isEditing ? (
            <h2 style={{ margin: "0.5rem 0 0 0" }}>{localTask.title}</h2>
          ) : (
            <input
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              style={{ fontSize: "1.25rem", fontWeight: "bold", width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
            />
          )}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {!isEditing ? (
            <button className="btn outline" onClick={() => setIsEditing(true)} style={{ padding: "0.5rem 1rem" }}>
              ✏️ Edit
            </button>
          ) : (
            <>
              <button className="btn" onClick={handleSaveEdit} style={{ padding: "0.5rem 1rem", background: "#22c55e", color: "white", border: "none" }}>
                💾 Save
              </button>
              <button className="btn ghost" onClick={() => setIsEditing(false)} style={{ padding: "0.5rem 1rem" }}>
                Cancel
              </button>
            </>
          )}
          <button className="btn ghost" onClick={onClose} style={{ padding: "0.5rem 1rem" }}>
            ✕
          </button>
        </div>
      </div>

      {/* Status & Priority Row */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#64748b", marginBottom: "0.25rem" }}>Status</label>
          <select 
            value={localTask.status} 
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}
          >
            {Object.entries(statusBadges).map(([status, label]) => (
              <option key={status} value={status}>{label}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#64748b", marginBottom: "0.25rem" }}>Priority</label>
          {isEditing ? (
            <select
              value={editForm.priority}
              onChange={(e) => setEditForm({ ...editForm, priority: Number(e.target.value) })}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}
            >
              {[1, 2, 3, 4, 5].map((p) => (
                <option key={p} value={p}>P{p} - {["Lowest", "Low", "Medium", "High", "Critical"][p - 1]}</option>
              ))}
            </select>
          ) : (
            <div style={{ 
              padding: "0.5rem 1rem", 
              borderRadius: "6px", 
              background: localTask.priority >= 4 ? "#fef2f2" : "#f1f5f9",
              color: localTask.priority >= 4 ? "#dc2626" : "#475569",
              fontWeight: 500,
            }}>
              P{localTask.priority || 3} - {["Lowest", "Low", "Medium", "High", "Critical"][(localTask.priority || 3) - 1]}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", fontSize: "0.85rem", color: "#64748b", marginBottom: "0.5rem" }}>Description</label>
        {isEditing ? (
          <textarea
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            rows={4}
            style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #e2e8f0", resize: "vertical" }}
          />
        ) : (
          <p style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", margin: 0 }}>
            {localTask.description || "No description provided"}
          </p>
        )}
      </div>

      {/* Details Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#64748b", marginBottom: "0.25rem" }}>Assigned To</label>
          {isEditing ? (
            <input
              value={editForm.assigned_to}
              onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}
              placeholder="Employee ID or name"
              style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}
            />
          ) : (
            <strong style={{ display: "block" }}>{localTask.assigned_to || "Unassigned (AI pending)"}</strong>
          )}
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#64748b", marginBottom: "0.25rem" }}>Deadline</label>
          {isEditing ? (
            <input
              type="date"
              value={editForm.deadline}
              onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}
            />
          ) : (
            <strong style={{ display: "block" }}>{localTask.deadline || "No deadline"}</strong>
          )}
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#64748b", marginBottom: "0.25rem" }}>Est. Hours</label>
          <strong style={{ display: "block" }}>{localTask.predicted_hours || "--"} hours</strong>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#64748b", marginBottom: "0.25rem" }}>Complexity</label>
          {isEditing ? (
            <select
              value={editForm.complexity}
              onChange={(e) => setEditForm({ ...editForm, complexity: e.target.value as any })}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          ) : (
            <strong style={{ display: "block", textTransform: "capitalize" }}>{localTask.complexity}</strong>
          )}
        </div>
      </div>

      {/* AI Actions */}
      <div style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem", color: "white" }}>
        <h4 style={{ margin: "0 0 0.75rem 0" }}>🤖 AI Actions</h4>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button 
            onClick={handleFlowchartPrediction}
            style={{ padding: "0.5rem 1rem", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "6px", color: "white", cursor: "pointer" }}
          >
            📊 Predict Next Step
          </button>
          <button 
            onClick={handleSummarize}
            style={{ padding: "0.5rem 1rem", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "6px", color: "white", cursor: "pointer" }}
          >
            📝 Summarize Chat
          </button>
        </div>
        {(aiThinking || summary) && (
          <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "0.9rem" }}>
            {aiThinking ? "🤔 AI is thinking..." : summary}
          </div>
        )}
      </div>

      {/* Attachments */}
      <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h4 style={{ margin: 0 }}>📎 Attachments</h4>
          <label style={{ padding: "0.5rem 1rem", background: "#818cf8", color: "white", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
            + Add File
            <input type="file" onChange={handleAttachmentUpload} style={{ display: "none" }} />
          </label>
        </div>
        {localTask.attachments?.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {localTask.attachments.map((url) => (
              <a 
                key={url} 
                href={url} 
                target="_blank" 
                rel="noreferrer"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.5rem", 
                  padding: "0.5rem", 
                  background: "white", 
                  borderRadius: "6px",
                  color: "#3b82f6",
                  textDecoration: "none",
                }}
              >
                📄 {url.split("/").pop()?.slice(0, 30)}...
              </a>
            ))}
          </div>
        ) : (
          <p style={{ color: "#64748b", margin: 0 }}>No attachments yet. Upload PRD, designs, or other files.</p>
        )}
      </div>

      {/* Chat */}
      <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "1rem" }}>
        <h4 style={{ margin: "0 0 0.75rem 0" }}>💬 Comments ({messages.length})</h4>
        <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "1rem" }}>
          {messages.length > 0 ? messages.map((msg) => (
            <div key={msg.id} style={{ padding: "0.75rem", background: "white", borderRadius: "8px", marginBottom: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                <strong style={{ fontSize: "0.85rem" }}>{msg.sender_id}</strong>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  {new Date(msg.created_at).toLocaleString()}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>{msg.text}</p>
            </div>
          )) : (
            <p style={{ color: "#64748b", textAlign: "center", padding: "1rem" }}>No comments yet</p>
          )}
        </div>
        <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "0.5rem" }}>
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Add a comment..."
            style={{ flex: 1, padding: "0.75rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}
          />
          <button 
            type="submit"
            style={{ padding: "0.75rem 1.5rem", background: "#818cf8", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            Send
          </button>
        </form>
      </div>
    </aside>
  );
};

export default TaskDrawer;
