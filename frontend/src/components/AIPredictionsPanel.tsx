import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

interface PredictionData {
  type: "assignment" | "deadline" | "workload" | "meeting";
  confidence: number;
  title: string;
  description: string;
  action?: string;
  impact: "high" | "medium" | "low";
}

interface WorkflowStep {
  id: string;
  name: string;
  status: "completed" | "active" | "pending";
  aiPrediction?: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: "requirements", name: "Requirements", status: "completed" },
  { id: "design", name: "Design", status: "completed" },
  { id: "development", name: "Development", status: "active", aiPrediction: "2 days remaining" },
  { id: "testing", name: "Testing", status: "pending" },
  { id: "review", name: "Review", status: "pending" },
  { id: "deployment", name: "Deployment", status: "pending" },
];

const impactColors = {
  high: { bg: "#fef2f2", border: "#ef4444", text: "#dc2626" },
  medium: { bg: "#fffbeb", border: "#f59e0b", text: "#d97706" },
  low: { bg: "#f0fdf4", border: "#22c55e", text: "#16a34a" },
};

const typeIcons = {
  assignment: "👤",
  deadline: "📅",
  workload: "📊",
  meeting: "🗓️",
};

export const AIPredictionsPanel = () => {
  const { token } = useAuth();
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      if (!token) return;
      try {
        // Simulated AI predictions - in production these come from Gemini
        const mockPredictions: PredictionData[] = [
          {
            type: "assignment",
            confidence: 0.92,
            title: "Optimal Assignment Detected",
            description: "Sarah has 40% capacity and matching skills for 'API Integration' task",
            action: "Auto-assign",
            impact: "high",
          },
          {
            type: "deadline",
            confidence: 0.87,
            title: "Deadline Risk Identified",
            description: "3 tasks at risk of missing Friday deadline based on velocity",
            action: "Adjust priorities",
            impact: "high",
          },
          {
            type: "workload",
            confidence: 0.78,
            title: "Workload Imbalance",
            description: "Dev team at 120% capacity while QA at 45%",
            action: "Rebalance",
            impact: "medium",
          },
          {
            type: "meeting",
            confidence: 0.85,
            title: "Meeting Suggested",
            description: "Blockers detected - recommend 30min sync with 3 attendees",
            action: "Schedule",
            impact: "low",
          },
        ];
        setPredictions(mockPredictions);
      } catch (error) {
        console.error("Failed to fetch predictions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, [token]);

  return (
    <div className="ai-predictions-panel">
      <style>{`
        .ai-predictions-panel {
          font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
        }
        
        .predictions-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .predictions-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-size: 0.7rem;
          font-weight: 600;
          border-radius: 50px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .ai-badge::before {
          content: "✦";
          animation: sparkle 1.5s infinite;
        }
        
        @keyframes sparkle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
        }
        
        .predictions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        
        .prediction-card {
          position: relative;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid;
          transition: all 0.3s ease;
          cursor: pointer;
          overflow: hidden;
        }
        
        .prediction-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--border-color), transparent);
        }
        
        .prediction-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px -12px rgba(99, 102, 241, 0.3);
        }
        
        .prediction-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        
        .prediction-icon {
          font-size: 1.5rem;
        }
        
        .confidence-ring {
          position: relative;
          width: 44px;
          height: 44px;
        }
        
        .confidence-ring svg {
          transform: rotate(-90deg);
        }
        
        .confidence-ring circle {
          fill: none;
          stroke-width: 3;
        }
        
        .confidence-ring .bg {
          stroke: #e5e7eb;
        }
        
        .confidence-ring .progress {
          stroke: #6366f1;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.5s ease;
        }
        
        .confidence-value {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
          color: #6366f1;
        }
        
        .prediction-title {
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 6px;
          color: #1f2937;
        }
        
        .prediction-description {
          font-size: 0.85rem;
          color: #6b7280;
          line-height: 1.5;
          margin-bottom: 16px;
        }
        
        .prediction-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-size: 0.8rem;
          font-weight: 500;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .prediction-action:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }
        
        .workflow-section {
          margin-top: 24px;
        }
        
        .workflow-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 16px;
          color: #374151;
        }
        
        .workflow-pipeline {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 24px;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-radius: 16px;
          overflow-x: auto;
        }
        
        .workflow-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          min-width: 100px;
          position: relative;
        }
        
        .step-node {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }
        
        .step-node.completed {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }
        
        .step-node.active {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
          animation: activeGlow 2s infinite;
        }
        
        @keyframes activeGlow {
          0%, 100% { box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4); }
          50% { box-shadow: 0 4px 24px rgba(99, 102, 241, 0.6); }
        }
        
        .step-node.pending {
          background: #e5e7eb;
          color: #9ca3af;
        }
        
        .step-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
          text-align: center;
        }
        
        .step-prediction {
          font-size: 0.65rem;
          color: #8b5cf6;
          font-weight: 500;
          background: rgba(139, 92, 246, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
        }
        
        .step-connector {
          flex: 1;
          height: 3px;
          min-width: 24px;
          background: #e5e7eb;
          position: relative;
        }
        
        .step-connector.completed {
          background: linear-gradient(90deg, #22c55e, #6366f1);
        }
        
        .step-connector.active {
          background: linear-gradient(90deg, #6366f1, #e5e7eb);
        }
        
        .loading-skeleton {
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <div className="predictions-header">
        <h3>🧠 AI Predictions</h3>
        <span className="ai-badge">Powered by Gemini</span>
      </div>

      {loading ? (
        <div className="predictions-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="loading-skeleton" style={{ height: 160 }} />
          ))}
        </div>
      ) : (
        <div className="predictions-grid">
          {predictions.map((prediction, index) => {
            const colors = impactColors[prediction.impact];
            const circumference = 2 * Math.PI * 18;
            const offset = circumference - prediction.confidence * circumference;

            return (
              <div
                key={index}
                className="prediction-card"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  "--border-color": colors.border,
                } as React.CSSProperties}
              >
                <div className="prediction-header">
                  <span className="prediction-icon">{typeIcons[prediction.type]}</span>
                  <div className="confidence-ring">
                    <svg width="44" height="44">
                      <circle className="bg" cx="22" cy="22" r="18" />
                      <circle
                        className="progress"
                        cx="22"
                        cy="22"
                        r="18"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                      />
                    </svg>
                    <span className="confidence-value">{Math.round(prediction.confidence * 100)}%</span>
                  </div>
                </div>
                <div className="prediction-title">{prediction.title}</div>
                <div className="prediction-description">{prediction.description}</div>
                {prediction.action && (
                  <button className="prediction-action">
                    {prediction.action} →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="workflow-section">
        <div className="workflow-title">📋 Current Task Workflow Pipeline</div>
        <div className="workflow-pipeline">
          {WORKFLOW_STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="workflow-step">
                <div className={`step-node ${step.status}`}>
                  {step.status === "completed" ? "✓" : index + 1}
                </div>
                <span className="step-label">{step.name}</span>
                {step.aiPrediction && (
                  <span className="step-prediction">⚡ {step.aiPrediction}</span>
                )}
              </div>
              {index < WORKFLOW_STEPS.length - 1 && (
                <div
                  className={`step-connector ${
                    step.status === "completed"
                      ? "completed"
                      : step.status === "active"
                      ? "active"
                      : ""
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIPredictionsPanel;

