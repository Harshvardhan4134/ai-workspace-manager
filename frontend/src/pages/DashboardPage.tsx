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
} from "recharts";

import { useTasks } from "../hooks/useTasks";
import { useEmployees } from "../hooks/useProfiles";
import { useUpdates } from "../hooks/useUpdates";
import { useAuth } from "../context/AuthContext";
import { WelcomeModal } from "../components/WelcomeModal";

const statusColors: Record<string, string> = {
  open: "#a5b4fc",
  in_progress: "#fbbf24",
  in_review: "#34d399",
  blocked: "#f87171",
  completed: "#22c55e",
};

// Mock recent activity
const mockActivity = [
  { id: 1, user: "Alice Johnson", action: "completed", target: "User Authentication", time: "2 hours ago", avatar: "👩‍💻" },
  { id: 2, user: "Bob Smith", action: "started", target: "API Integration", time: "3 hours ago", avatar: "👨‍💻" },
  { id: 3, user: "Carol Williams", action: "commented on", target: "Dashboard UI", time: "4 hours ago", avatar: "🎨" },
  { id: 4, user: "David Chen", action: "assigned", target: "Bug Fix #234", time: "5 hours ago", avatar: "📋" },
  { id: 5, user: "Eva Martinez", action: "created", target: "AI Prediction Engine", time: "6 hours ago", avatar: "🤖" },
];

// Mock sprint data
const mockSprint = {
  name: "Sprint 23",
  startDate: "Nov 18, 2025",
  endDate: "Nov 29, 2025",
  daysRemaining: 4,
  progress: 65,
};

const DashboardPage = () => {
  const { profile } = useAuth();
  const { data: tasks = [], refetch } = useTasks();
  const { data: employees = [] } = useEmployees();
  const { data: updates = [] } = useUpdates();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const onboardingComplete = localStorage.getItem("onboarding_complete");
    if (!onboardingComplete && profile) {
      setShowWelcome(true);
    }
  }, [profile]);

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
      employees.slice(0, 6).map((employee) => ({
        name: employee.name.split(" ")[0],
        workload: Math.round((employee.assigned_hours / Math.max(employee.capacity_hours, 1)) * 100),
        capacity: employee.capacity_hours,
      })),
    [employees],
  );

  const completedThisWeek = tasks.filter((t) => t.status === "completed").length;
  const totalTasks = tasks.length;
  const blockedTasks = tasks.filter((t) => t.status === "blocked").length;
  const highPriorityTasks = tasks.filter((t) => (t.priority || 0) >= 4).length;

  return (
    <>
      {showWelcome && <WelcomeModal onComplete={() => setShowWelcome(false)} />}
      
      <div className="dashboard-container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Header Banner */}
        <div className="panel" style={{ 
          background: "linear-gradient(135deg, #312e81, #1e1b4b)", 
          color: "white",
          padding: "1.5rem 2rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>
                Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {profile?.name?.split(" ")[0] || "there"} 👋
              </h1>
              <p style={{ color: "rgba(255,255,255,0.7)", margin: 0 }}>
                {mockSprint.name} • {mockSprint.daysRemaining} days remaining • {mockSprint.progress}% complete
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn" style={{ background: "rgba(255,255,255,0.2)", border: "none" }} onClick={() => refetch()}>
                🔄 Refresh
              </button>
              <button className="btn" style={{ background: "#22c55e", border: "none" }} onClick={() => setShowWelcome(true)}>
                + New Task
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div className="panel" style={{ background: "#312e81", color: "white", textAlign: "center", padding: "1.5rem" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{totalTasks}</div>
            <div style={{ color: "rgba(255,255,255,0.7)" }}>Total Tasks</div>
          </div>
          <div className="panel" style={{ background: "#166534", color: "white", textAlign: "center", padding: "1.5rem" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{completedThisWeek}</div>
            <div style={{ color: "rgba(255,255,255,0.7)" }}>Completed</div>
          </div>
          <div className="panel" style={{ background: "#b45309", color: "white", textAlign: "center", padding: "1.5rem" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{highPriorityTasks}</div>
            <div style={{ color: "rgba(255,255,255,0.7)" }}>High Priority</div>
          </div>
          <div className="panel" style={{ background: "#b91c1c", color: "white", textAlign: "center", padding: "1.5rem" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{blockedTasks}</div>
            <div style={{ color: "rgba(255,255,255,0.7)" }}>Blocked</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="panel">
                <h3 style={{ marginBottom: "1rem" }}>📊 Task Status</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                      {statusData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
                  {Object.entries(statusColors).map(([status, color]) => (
                    <span key={status} style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem" }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: color }}></span>
                      {status.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>

              <div className="panel">
                <h3 style={{ marginBottom: "1rem" }}>👥 Team Workload</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={workloadData} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} unit="%" />
                    <YAxis type="category" dataKey="name" width={60} />
                    <Tooltip />
                    <Bar dataKey="workload" fill="#818cf8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* My Tasks */}
            <div className="panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3>📋 My Tasks</h3>
                <a href="/tasks" style={{ color: "#818cf8", fontSize: "0.9rem" }}>View all →</a>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    background: "rgba(129, 140, 248, 0.1)",
                    borderRadius: "8px",
                    borderLeft: `4px solid ${statusColors[task.status] || "#818cf8"}`,
                  }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{task.title}</div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        {task.deadline ? `Due: ${task.deadline}` : "No deadline"} • {task.assigned_to || "Unassigned"}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        background: statusColors[task.status] || "#818cf8",
                        color: "white",
                      }}>
                        {task.status.replace("_", " ")}
                      </span>
                      {task.priority && task.priority >= 4 && (
                        <span style={{ color: "#ef4444" }}>🔥</span>
                      )}
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p style={{ color: "#64748b", textAlign: "center", padding: "2rem" }}>
                    No tasks yet. Create your first task!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Activity Feed */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Team Members */}
            <div className="panel">
              <h3 style={{ marginBottom: "1rem" }}>👥 Team ({employees.length})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {employees.slice(0, 5).map((emp) => (
                  <div key={emp.id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.5rem",
                    borderRadius: "8px",
                    background: "rgba(129, 140, 248, 0.05)",
                  }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #818cf8, #6366f1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                    }}>
                      {emp.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{emp.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{emp.role}</div>
                    </div>
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: emp.status === "active" ? "#22c55e" : emp.status === "busy" ? "#fbbf24" : "#64748b",
                    }}></span>
                  </div>
                ))}
                <a href="/employees" style={{ color: "#818cf8", fontSize: "0.9rem", textAlign: "center", marginTop: "0.5rem" }}>
                  View all team members →
                </a>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="panel" style={{ flex: 1 }}>
              <h3 style={{ marginBottom: "1rem" }}>📰 Recent Activity</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {(updates.length > 0 ? updates.slice(0, 5) : mockActivity).map((activity: any, index) => (
                  <div key={activity.id || index} style={{
                    display: "flex",
                    gap: "0.75rem",
                    paddingBottom: "0.75rem",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}>
                    <div style={{ fontSize: "1.5rem" }}>{activity.avatar || "📌"}</div>
                    <div>
                      <div style={{ fontSize: "0.9rem" }}>
                        <strong>{activity.user || activity.user_name}</strong>{" "}
                        <span style={{ color: "#64748b" }}>{activity.action || "posted"}</span>{" "}
                        <strong>{activity.target || activity.message}</strong>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                        {activity.time || activity.created_at || "Just now"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="panel" style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", color: "white" }}>
              <h3 style={{ marginBottom: "1rem" }}>🤖 AI Insights</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.1)", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.9rem" }}>💡 Consider reassigning 2 tasks from Bob - workload at 95%</div>
                </div>
                <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.1)", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.9rem" }}>⚠️ 3 tasks at risk of missing deadline</div>
                </div>
                <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.1)", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.9rem" }}>✅ Sprint velocity up 15% this week</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
