import type { Task, TaskStatus } from "../types";

interface Props {
  task: Task;
  onOpen: (task: Task) => void;
  onAutoAssign: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

const statusOptions: TaskStatus[] = ["open", "in_progress", "in_review", "blocked", "completed"];

const TaskCard: React.FC<Props> = ({ task, onOpen, onAutoAssign, onStatusChange }) => {
  return (
    <div className="task-card">
      <div className="task-title-row">
        <h4>{task.title}</h4>
        <span className="badge">{task.status}</span>
      </div>
      <p className="muted">{task.description || "No description"}</p>
      <div>
        {task.tags?.map((tag) => (
          <span className="chip" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className="task-meta">
        <small>Assigned</small>
        <strong>{task.assigned_to ?? "AI pending"}</strong>
      </div>
      <div className="task-meta">
        <small>ETA</small>
        <strong>{task.deadline ?? "TBD"}</strong>
      </div>
      <div className="task-actions">
        <select
          value={task.status}
          onChange={(event) => onStatusChange(task, event.target.value as TaskStatus)}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status.replace("_", " ")}
            </option>
          ))}
        </select>
        <button className="btn ghost" onClick={() => onOpen(task)}>
          Open
        </button>
        <button className="btn outline" onClick={() => onAutoAssign(task)}>
          Auto assign
        </button>
      </div>
    </div>
  );
};

export default TaskCard;

