import type { Task, TaskStatus } from "../types";
import TaskCard from "./TaskCard";

const columns: { key: TaskStatus; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "in_review", label: "In Review" },
  { key: "blocked", label: "Blocked" },
  { key: "completed", label: "Completed" },
];

interface Props {
  tasks: Task[];
  onOpen: (task: Task) => void;
  onAutoAssign: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

const TaskBoard: React.FC<Props> = ({ tasks, onOpen, onAutoAssign, onStatusChange }) => {
  return (
    <div className="kanban">
      {columns.map((column) => (
        <div className="kanban-column" key={column.key}>
          <div className="panel-header">
            <strong>{column.label}</strong>
            <span className="muted">{tasks.filter((t) => t.status === column.key).length}</span>
          </div>
          {tasks
            .filter((task) => task.status === column.key)
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onOpen={onOpen}
                onAutoAssign={onAutoAssign}
                onStatusChange={onStatusChange}
              />
            ))}
        </div>
      ))}
    </div>
  );
};

export default TaskBoard;

