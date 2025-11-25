import React, { useState } from "react";

interface WorkflowNode {
  id: string;
  type: "input" | "process" | "ai" | "output" | "database";
  label: string;
  description: string;
  x: number;
  y: number;
  connections: string[];
  status?: "active" | "complete" | "pending";
}

const WORKFLOW_NODES: WorkflowNode[] = [
  {
    id: "task-input",
    type: "input",
    label: "Task Created",
    description: "User creates new task with title, description, and attachments",
    x: 80,
    y: 60,
    connections: ["gemini-analyze"],
    status: "complete",
  },
  {
    id: "gemini-analyze",
    type: "ai",
    label: "Gemini Analysis",
    description: "AI analyzes task complexity, skills required, and estimates hours",
    x: 280,
    y: 60,
    connections: ["predict-assign", "predict-deadline"],
    status: "active",
  },
  {
    id: "predict-assign",
    type: "ai",
    label: "Smart Assignment",
    description: "Match task to team member based on skills & capacity",
    x: 480,
    y: 30,
    connections: ["firestore-save"],
    status: "pending",
  },
  {
    id: "predict-deadline",
    type: "ai",
    label: "Deadline Prediction",
    description: "Calculate optimal deadline based on workload",
    x: 480,
    y: 120,
    connections: ["firestore-save"],
    status: "pending",
  },
  {
    id: "firestore-save",
    type: "database",
    label: "Firestore",
    description: "Persist task with AI predictions to GCP Firestore",
    x: 680,
    y: 60,
    connections: ["dashboard-update", "notify"],
    status: "pending",
  },
  {
    id: "dashboard-update",
    type: "output",
    label: "Dashboard",
    description: "Real-time update via Firestore listeners",
    x: 880,
    y: 30,
    connections: [],
    status: "pending",
  },
  {
    id: "notify",
    type: "output",
    label: "Notifications",
    description: "Alert assigned team member",
    x: 880,
    y: 120,
    connections: [],
    status: "pending",
  },
];

const nodeStyles = {
  input: {
    bg: "linear-gradient(135deg, #22c55e, #16a34a)",
    border: "#16a34a",
    icon: "📥",
  },
  process: {
    bg: "linear-gradient(135deg, #3b82f6, #2563eb)",
    border: "#2563eb",
    icon: "⚙️",
  },
  ai: {
    bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    border: "#7c3aed",
    icon: "🧠",
  },
  output: {
    bg: "linear-gradient(135deg, #f59e0b, #d97706)",
    border: "#d97706",
    icon: "📤",
  },
  database: {
    bg: "linear-gradient(135deg, #06b6d4, #0891b2)",
    border: "#0891b2",
    icon: "🗄️",
  },
};

export const TaskWorkflowWireframe = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const getNodeCenter = (node: WorkflowNode) => ({
    x: node.x + 70,
    y: node.y + 35,
  });

  const renderConnections = () => {
    const paths: React.ReactElement[] = [];

    WORKFLOW_NODES.forEach((node) => {
      const start = getNodeCenter(node);
      node.connections.forEach((targetId) => {
        const target = WORKFLOW_NODES.find((n) => n.id === targetId);
        if (!target) return;
        const end = getNodeCenter(target);

        // Calculate control points for curved line
        const midX = (start.x + end.x) / 2;
        const path = `M ${start.x} ${start.y} Q ${midX} ${start.y} ${midX} ${(start.y + end.y) / 2} T ${end.x} ${end.y}`;

        const isActive = node.status === "active" || node.status === "complete";

        paths.push(
          <g key={`${node.id}-${targetId}`}>
            <path
              d={path}
              fill="none"
              stroke={isActive ? "#8b5cf6" : "#e5e7eb"}
              strokeWidth="2"
              strokeDasharray={isActive ? "0" : "6 4"}
              style={{
                transition: "all 0.3s ease",
              }}
            />
            {isActive && (
              <circle r="4" fill="#8b5cf6">
                <animateMotion dur="2s" repeatCount="indefinite" path={path} />
              </circle>
            )}
          </g>
        );
      });
    });

    return paths;
  };

  return (
    <div className="workflow-wireframe">
      <style>{`
        .workflow-wireframe {
          padding: 24px;
          background: linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%);
          border-radius: 20px;
          overflow: hidden;
          position: relative;
        }
        
        .workflow-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        
        .workflow-title {
          color: white;
          font-size: 1.25rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .workflow-title span {
          font-size: 0.7rem;
          background: rgba(139, 92, 246, 0.3);
          color: #c4b5fd;
          padding: 4px 12px;
          border-radius: 50px;
          font-weight: 500;
        }
        
        .workflow-legend {
          display: flex;
          gap: 16px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.75rem;
        }
        
        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        
        .workflow-canvas {
          position: relative;
          height: 200px;
          overflow: visible;
        }
        
        .workflow-svg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .workflow-node {
          position: absolute;
          width: 140px;
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        
        .workflow-node:hover {
          transform: scale(1.05);
          z-index: 10;
        }
        
        .workflow-node.selected {
          border-color: white;
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
        }
        
        .workflow-node.active {
          animation: nodeGlow 2s infinite;
        }
        
        @keyframes nodeGlow {
          0%, 100% { box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 4px 30px rgba(139, 92, 246, 0.6); }
        }
        
        .node-icon {
          font-size: 1.25rem;
          margin-bottom: 6px;
        }
        
        .node-label {
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
          line-height: 1.2;
        }
        
        .node-status {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          color: white;
        }
        
        .node-status.complete {
          background: #22c55e;
        }
        
        .node-status.active {
          background: #8b5cf6;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        
        .node-status.pending {
          background: #6b7280;
        }
        
        .node-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 12px;
          padding: 12px 16px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          width: 200px;
          z-index: 100;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .workflow-node:hover .node-tooltip {
          opacity: 1;
        }
        
        .tooltip-title {
          font-weight: 600;
          font-size: 0.85rem;
          color: #1f2937;
          margin-bottom: 4px;
        }
        
        .tooltip-desc {
          font-size: 0.75rem;
          color: #6b7280;
          line-height: 1.4;
        }
        
        .gcp-badge {
          position: absolute;
          bottom: 16px;
          right: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }
        
        .gcp-badge img {
          height: 20px;
        }
        
        .gcp-badge span {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(139, 92, 246, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
      `}</style>

      <div className="grid-bg" />

      <div className="workflow-header">
        <div className="workflow-title">
          🔄 AI Task Pipeline
          <span>Google Cloud Architecture</span>
        </div>
        <div className="workflow-legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ background: "#22c55e" }} />
            Complete
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: "#8b5cf6" }} />
            Active
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: "#6b7280" }} />
            Pending
          </div>
        </div>
      </div>

      <div className="workflow-canvas">
        <svg className="workflow-svg" viewBox="0 0 1000 200" preserveAspectRatio="xMidYMid meet">
          {renderConnections()}
        </svg>

        {WORKFLOW_NODES.map((node) => {
          const style = nodeStyles[node.type];
          return (
            <div
              key={node.id}
              className={`workflow-node ${node.status} ${selectedNode === node.id ? "selected" : ""}`}
              style={{
                left: node.x,
                top: node.y,
                background: style.bg,
              }}
              onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
            >
              <div className="node-icon">{style.icon}</div>
              <div className="node-label">{node.label}</div>
              <div className={`node-status ${node.status}`}>
                {node.status === "complete" ? "✓" : node.status === "active" ? "⚡" : "○"}
              </div>
              <div className="node-tooltip">
                <div className="tooltip-title">{node.label}</div>
                <div className="tooltip-desc">{node.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="gcp-badge">
        <span>☁️ Deployed on Google Cloud Run</span>
      </div>
    </div>
  );
};

export default TaskWorkflowWireframe;

