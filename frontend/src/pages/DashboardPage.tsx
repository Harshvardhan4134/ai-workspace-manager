import { useEffect, useMemo, useState } from "react";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Cell,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  LineChart,
  Line,
} from "recharts";

import { useTasks } from "../hooks/useTasks";
import { useEmployees } from "../hooks/useProfiles";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/client";
import { AIPredictionsPanel } from "../components/AIPredictionsPanel";
import { TaskWorkflowWireframe } from "../components/TaskWorkflowWireframe";

const statusColors = {
  open: "#a5b4fc",
  in_progress: "#fbbf24",
  in_review: "#34d399",
  blocked: "#f87171",
  completed: "#22c55e",
};

const DashboardPage = () => {
  const { profile, token } = useAuth();
  const { data: tasks = [], refetch } = useTasks();
  const { data: employees = [] } = useEmployees();
  const [aiInsights, setAiInsights] = useState<string[]>([]);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!token) return;
      try {
        const data = await apiFetch<{ overloaded: { name: string; utilization: number }[]; suggestions: string[] }>(
          "/agent/who-is-overloaded",
          { token },
        );
        const overload = (data.overloaded ?? [])
          .map((member) => `${member.name ?? "Member"} at ${(member.utilization * 100).toFixed(0)}% load`)
          .slice(0, 3);
        setAiInsights([...overload, ...(data.suggestions ?? [])]);
      } catch (error) {
        console.error(error);
      }
    };
    fetchInsights();
  }, [token]);

  const statusData = useMemo(
    () =>
      Object.entries(statusColors).map(([status, color]) => ({
        name: status.replace("_", " "),
        value: tasks.filter((task) => task.status === status).length,
        fill: color,
      })),
    [tasks],
  );

  const workloadData = useMemo(
    () =>
      employees.map((employee) => ({
        name: employee.name.split(" ")[0],
        workload: Math.round((employee.assigned_hours / Math.max(employee.capacity_hours, 1)) * 100),
      })),
    [employees],
  );

  const timelineData = useMemo(
    () =>
      tasks
        .filter((task) => task.deadline)
        .sort((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? ""))
        .slice(0, 6)
        .map((task) => ({
          name: task.title.slice(0, 12),
          hours: task.predicted_hours ?? 0,
        })),
    [tasks],
  );

  return (
    <div className="grid" style={{ gap: "1.5rem" }}>
      <div className="panel" style={{ background: "linear-gradient(135deg,#312e81,#1e1b4b)", color: "white" }}>
        <div className="panel-header">
          <div>
            <h2>Hey {profile?.name?.split(" ")[0] ?? "there"} 👋</h2>
            <p className="muted" style={{ color: "rgba(255,255,255,0.7)" }}>
              Gemini is watching workloads and timelines for you.
            </p>
          </div>
          <button className="btn outline" onClick={() => refetch()}>
            Refresh data
          </button>
        </div>
        <div className="stat-grid grid">
          <div className="stat-card panel" style={{ background: "rgba(15, 23, 42, 0.3)", color: "white" }}>
            <p className="muted">Active tasks</p>
            <h2>{tasks.filter((task) => task.status !== "completed").length}</h2>
          </div>
          <div className="stat-card panel" style={{ background: "rgba(15, 23, 42, 0.3)", color: "white" }}>
            <p className="muted">Late this week</p>
            <h2>{tasks.filter((task) => task.deadline && task.status !== "completed").length}</h2>
          </div>
          <div className="stat-card panel" style={{ background: "rgba(15, 23, 42, 0.3)", color: "white" }}>
            <p className="muted">High priority</p>
            <h2>{tasks.filter((task) => (task.priority ?? 0) >= 4).length}</h2>
          </div>
          <div className="stat-card panel" style={{ background: "rgba(15, 23, 42, 0.3)", color: "white" }}>
            <p className="muted">Avg hours / task</p>
            <h2>
              {(
                tasks.reduce((acc, task) => acc + (task.predicted_hours ?? 0), 0) / Math.max(tasks.length, 1)
              ).toFixed(1)}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
          <div className="panel">
            <div className="panel-header">
              <div>
                <h3>AI Focus</h3>
                <p className="muted">Where Gemini wants you to look</p>
              </div>
            </div>
            <ul>
              {aiInsights.length ? (
                aiInsights.map((insight, index) => (
                  <li key={index}>
                    <strong>Insight {index + 1}:</strong> {insight}
                  </li>
                ))
              ) : (
                <li className="muted">Gathering signals...</li>
              )}
            </ul>
          </div>
          <div className="panel">
            <div className="panel-header">
              <h3>Today vs Tomorrow</h3>
            </div>
            <div className="muted">
              <p>Today: {tasks.filter((task) => task.status === "in_progress").length} in-flight</p>
              <p>Tomorrow: {tasks.filter((task) => task.status === "open").length} queued</p>
              <p>Gemini says: keep {profile?.name?.split(" ")[0] ?? "team"} focused on design reviews.</p>
            </div>
          </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        <div className="panel">
          <div className="panel-header">
            <strong>Status mix</strong>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" label>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="panel">
          <div className="panel-header">
            <strong>Workload load</strong>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={workloadData}>
              <XAxis dataKey="name" />
              <YAxis unit="%" />
              <Tooltip />
              <Bar dataKey="workload" fill="#818cf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="panel">
          <div className="panel-header">
            <strong>Timeline forecast</strong>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={timelineData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="hours" stroke="#34d399" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Upcoming deadlines</h3>
        </div>
        <div className="timeline-list">
          {tasks
            .filter((task) => task.deadline)
            .sort((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? ""))
            .slice(0, 5)
            .map((task) => (
              <div key={task.id} className="timeline-item">
                <div>
                  <strong>{task.title}</strong>
                  <p className="muted">
                    Due {task.deadline} • Owner {task.assigned_to ?? "AI pending"}
                  </p>
                </div>
                <span className="badge">ETA {task.predicted_hours ?? "--"}h</span>
              </div>
            ))}
        </div>
      </div>

      {/* AI Predictions Panel */}
      <div className="panel">
        <AIPredictionsPanel />
      </div>

      {/* Task Workflow Wireframe */}
      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <TaskWorkflowWireframe />
      </div>
    </div>
  );
};

export default DashboardPage;


