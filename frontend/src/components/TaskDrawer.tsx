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

  useEffect(() => {
    setLocalTask(task);
  }, [task]);

  const watchersText = useMemo(() => localTask.watchers?.join(", ") || "None", [localTask.watchers]);

  const loadMessages = async () => {
    if (!token) return;
    const data = await apiFetch<Message[]>(`/messages/${task.id}`, { token });
    setMessages(data);
  };

  useEffect(() => {
    if (task.id && token) {
      loadMessages();
    }
    const interval = setInterval(() => {
      if (task.id && token) loadMessages();
    }, 5000);
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
    const data = await apiFetch<{ bullets: string[]; status: string; next_step?: string }>(
      `/messages/${task.id}/summarize`,
      { method: "POST", token },
    );
    setSummary(`${(data.bullets || []).join(" • ")} — ${data.status}`);
    setAiThinking(false);
  };

  const handleFlowchartPrediction = async () => {
    if (!token) return;
    setAiThinking(true);
    const data = await apiFetch<{ flowchart_next_step: string; recommended_action: string }>(
      "/agent/flowchart",
      {
        method: "POST",
        token,
        body: JSON.stringify({ task: localTask }),
      },
    );
    setSummary(`Next: ${data.flowchart_next_step} · ${data.recommended_action}`);
    setAiThinking(false);
  };

  const handleAttachmentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length || !token) return;
    const file = event.target.files[0];
    const url = await uploadToGcs(file, token);
    const attachments = [...(localTask.attachments ?? []), url];
    const updated = await apiFetch<Task>(`/tasks/${task.id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ attachments }),
    });
    setLocalTask(updated);
    onTaskUpdated();
    event.target.value = "";
  };

  const handleStatusChange = async (status: TaskStatus) => {
    if (!token) return;
    const updated = await apiFetch<Task>(`/tasks/${task.id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    });
    setLocalTask(updated);
    onTaskUpdated();
  };

  return (
    <aside className="drawer">
      <div className="drawer-header">
        <div>
          <p className="muted">Task detail</p>
          <h3>{localTask.title}</h3>
        </div>
        <button className="btn ghost" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="drawer-meta">
        <span className="badge">{statusBadges[localTask.status]}</span>
        <span className="badge">Priority {localTask.priority ?? "-"}</span>
      </div>
      <p>{localTask.description}</p>
      <div className="drawer-grid">
        <div>
          <small>Assigned to</small>
          <strong>{localTask.assigned_to ?? "AI pending"}</strong>
        </div>
        <div>
          <small>Predicted hours</small>
          <strong>{localTask.predicted_hours ?? "--"}</strong>
        </div>
        <div>
          <small>Deadline</small>
          <strong>{localTask.deadline ?? "TBD"}</strong>
        </div>
      </div>
      <div className="flowchart-panel">
        <strong>Flowchart step</strong>
        <p className="muted">{localTask.flowchart_step ?? "Awaiting AI"}</p>
        <button className="btn outline" onClick={handleFlowchartPrediction}>
          Predict next step
        </button>
      </div>
      <div className="panel">
        <div className="panel-header">
          <strong>Attachments</strong>
          <input type="file" onChange={handleAttachmentUpload} />
        </div>
        {localTask.attachments?.length ? (
          <ul>
            {localTask.attachments.map((attachment) => (
              <li key={attachment}>
                <a href={attachment} target="_blank" rel="noreferrer">
                  {attachment.split("/").pop()}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No files yet.</p>
        )}
      </div>
      <div className="panel">
        <div className="panel-header">
          <strong>Watchers</strong>
        </div>
        <p>{watchersText}</p>
      </div>
      <div className="chat-panel">
        <div className="panel-header">
          <strong>Chat</strong>
          <div className="btn-group">
            <button className="btn ghost" onClick={handleSummarize}>
              Summarize
            </button>
            <select value={localTask.status} onChange={(event) => handleStatusChange(event.target.value as TaskStatus)}>
              {Object.keys(statusBadges).map((status) => (
                <option key={status} value={status}>
                  {statusBadges[status as TaskStatus]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="chat-thread">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble ${msg.sender_id === localTask.assigned_to ? "me" : ""}`}>
              <strong>{msg.sender_id}</strong>
              <p>{msg.text}</p>
              <small className="muted">{new Date(msg.created_at).toLocaleString()}</small>
            </div>
          ))}
        </div>
        <form className="chat-form" onSubmit={handleSendMessage}>
          <input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Share an update..." />
          <button className="btn primary" type="submit">
            Send
          </button>
        </form>
        <div className="ai-note">
          {aiThinking ? "Gemini is thinking..." : summary || "Use AI actions to summarize or plan next steps."}
        </div>
      </div>
    </aside>
  );
};

export default TaskDrawer;

