import { useState } from "react";
import { useAuth } from "../context/AuthContext";

interface Props {
  onComplete: () => void;
}

export const WelcomeModal: React.FC<Props> = ({ onComplete }) => {
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    role: profile?.role || "",
    resume: null as File | null,
    prd: null as File | null,
  });

  const handleSubmit = () => {
    // In a real app, we'd save this data
    localStorage.setItem("onboarding_complete", "true");
    onComplete();
  };

  return (
    <div className="modal-overlay" style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div className="modal-content panel" style={{
        maxWidth: "500px",
        width: "90%",
        padding: "2rem",
        background: "#1e1b4b",
        borderRadius: "16px",
        color: "white",
      }}>
        {step === 1 && (
          <>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🚀 Welcome to AI Workspace</h1>
              <p style={{ color: "rgba(255,255,255,0.7)" }}>
                Powered by Google Gemini AI + Cloud Run
              </p>
            </div>

            <div style={{ 
              background: "rgba(255,255,255,0.1)", 
              borderRadius: "12px", 
              padding: "1.5rem",
              marginBottom: "1.5rem"
            }}>
              <h3 style={{ marginBottom: "1rem" }}>👤 Your Profile</h3>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(0,0,0,0.3)",
                    color: "white",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(0,0,0,0.3)",
                    color: "white",
                  }}
                >
                  <option value="">Select your role</option>
                  <option value="developer">Developer</option>
                  <option value="designer">Designer</option>
                  <option value="manager">Project Manager</option>
                  <option value="qa">QA Engineer</option>
                  <option value="devops">DevOps Engineer</option>
                  <option value="Founder">Founder</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Resume (Optional)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFormData({ ...formData, resume: e.target.files?.[0] || null })}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(0,0,0,0.3)",
                    color: "white",
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              style={{
                width: "100%",
                padding: "1rem",
                background: "linear-gradient(135deg, #818cf8, #6366f1)",
                border: "none",
                borderRadius: "8px",
                color: "white",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Continue →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📄 Share Your PRD</h2>
              <p style={{ color: "rgba(255,255,255,0.7)" }}>
                Upload a Product Requirements Document and AI will analyze it
              </p>
            </div>

            <div style={{ 
              background: "rgba(255,255,255,0.1)", 
              borderRadius: "12px", 
              padding: "1.5rem",
              marginBottom: "1.5rem",
              border: "2px dashed rgba(255,255,255,0.3)",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📁</div>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFormData({ ...formData, prd: e.target.files?.[0] || null })}
                style={{ display: "none" }}
                id="prd-upload"
              />
              <label
                htmlFor="prd-upload"
                style={{
                  display: "inline-block",
                  padding: "0.75rem 1.5rem",
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                {formData.prd ? formData.prd.name : "Choose PRD file"}
              </label>
              <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>
                Supported: PDF, DOC, DOCX
              </p>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: "1rem",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "8px",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                style={{
                  flex: 2,
                  padding: "1rem",
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                🚀 Get Started
              </button>
            </div>

            <p style={{ 
              marginTop: "1rem", 
              textAlign: "center", 
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.5)",
            }}>
              You can skip this and upload PRD later from Tasks page
            </p>
          </>
        )}
      </div>
    </div>
  );
};

