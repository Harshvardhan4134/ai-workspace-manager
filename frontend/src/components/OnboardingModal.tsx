import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/client";
import { uploadToGcs } from "../utils/upload";

interface Props {
  open: boolean;
  onComplete: () => void;
}

const roles = ["Founder", "Manager", "Engineer", "Designer", "Ops", "Analyst"];

const OnboardingModal: React.FC<Props> = ({ open, onComplete }) => {
  const { token, profile, refreshProfile } = useAuth();
  const [skills, setSkills] = useState("");
  const [role, setRole] = useState("");
  const [availability, setAvailability] = useState("");
  const [capacity, setCapacity] = useState(40);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setSkills(profile.skills?.join(", ") ?? "");
      setRole(profile.role ?? "");
      setAvailability(profile.availability ?? "");
      setCapacity(profile.capacity_hours ?? 40);
    }
  }, [profile]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      let avatar_url = profile?.avatar_url;
      let resume_url = profile?.resume_url;
      if (avatarFile) {
        avatar_url = await uploadToGcs(avatarFile, token);
      }
      if (resumeFile) {
        resume_url = await uploadToGcs(resumeFile, token);
      }
      await apiFetch("/users/me", {
        method: "PATCH",
        token,
        body: JSON.stringify({
          role,
          skills: skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
          availability,
          capacity_hours: capacity,
          avatar_url,
          resume_url,
        }),
      });
      await refreshProfile();
      setLoading(false);
      onComplete();
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Failed to save profile. Please check Firestore setup.");
    }
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <h2>Welcome! Tell us about you.</h2>
        <p className="muted">We use this info so Gemini can route work to the right person.</p>
        {error && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem" }}>
            {error}
          </div>
        )}
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Role
            <select value={role} onChange={(event) => setRole(event.target.value)} required>
              <option value="">Select role</option>
              {roles.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Skills (comma separated)
            <input value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="AI, Ops, Design" />
          </label>
          <label>
            Weekly capacity (hrs)
            <input
              type="number"
              value={capacity}
              min={10}
              max={80}
              onChange={(event) => setCapacity(Number(event.target.value))}
            />
          </label>
          <label>
            Availability / timezone notes
            <input value={availability} onChange={(event) => setAvailability(event.target.value)} />
          </label>
          <label>
            Avatar
            <input type="file" accept="image/*" onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)} />
          </label>
          <label>
            Upload resume / portfolio
            <input type="file" onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)} />
          </label>
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save & continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingModal;

