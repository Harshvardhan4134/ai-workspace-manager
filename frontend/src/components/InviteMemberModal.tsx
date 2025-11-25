import { useState } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";

interface Props {
  open: boolean;
  onClose: () => void;
  onInvited?: () => void;
}

const InviteMemberModal: React.FC<Props> = ({ open, onClose, onInvited }) => {
  const { token } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !email.trim()) return;
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await apiFetch("/users/invite", {
        method: "POST",
        token,
        body: JSON.stringify({
          email: email.trim(),
          role,
          name: email.split("@")[0],
        }),
      });
      setSuccess(true);
      setEmail("");
      setTimeout(() => {
        onClose();
        setSuccess(false);
        if (onInvited) onInvited();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to invite member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Invite Team Member</h3>
          <button className="btn ghost" onClick={onClose}>
            ✕
          </button>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Email Address *
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@example.com"
              required
              disabled={loading}
            />
          </label>
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">Invitation sent successfully!</div>}
          <div className="form-actions">
            <button type="button" className="btn outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={loading || !email.trim()}>
              {loading ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;

