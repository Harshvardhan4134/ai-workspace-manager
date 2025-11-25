import { useState } from "react";

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/client";
import { uploadToGcs } from "../utils/upload";
import type { UserProfile } from "../types";

const ProfilePage = () => {
  const { profile, token, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setError(null);
    setSuccess(false);
    try {
      const form = new FormData(event.currentTarget);
      await apiFetch<UserProfile>("/users/me", {
        method: "PATCH",
        token,
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          bio: form.get("bio"),
          availability: form.get("availability"),
        }),
      });
      setSuccess(true);
      await refreshProfile();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile. Please check Firestore setup.");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length || !token) return;
    setUploading(true);
    const url = await uploadToGcs(event.target.files[0], token);
    await apiFetch<UserProfile>("/users/me", {
      method: "PATCH",
      token,
      body: JSON.stringify({ avatar_url: url }),
    });
    setUploading(false);
    refreshProfile();
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length || !token) return;
    setResumeUploading(true);
    const url = await uploadToGcs(event.target.files[0], token);
    await apiFetch<UserProfile>("/users/me", {
      method: "PATCH",
      token,
      body: JSON.stringify({ resume_url: url }),
    });
    setResumeUploading(false);
    refreshProfile();
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h3>Profile</h3>
          <p className="muted">Update your info and availability</p>
        </div>
      </div>
      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: "#d1fae5", color: "#065f46", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem" }}>
          Profile saved successfully!
        </div>
      )}
      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
        <div>
          <div className="avatar" style={{ width: 80, height: 80, borderRadius: 20 }}>
            {profile.avatar_url ? <img src={profile.avatar_url} /> : profile.name[0]}
          </div>
          <input type="file" onChange={handleAvatarUpload} disabled={uploading} />
        </div>
        <form className="form" onSubmit={handleUpdate} style={{ flex: 1 }}>
          <label>
            Name
            <input name="name" defaultValue={profile.name} />
          </label>
          <label>
            Phone
            <input name="phone" defaultValue={profile.phone ?? ""} />
          </label>
          <label>
            Availability
            <input name="availability" defaultValue={profile.availability ?? ""} />
          </label>
          <label>
            Resume
            {profile.resume_url ? (
              <a href={profile.resume_url} target="_blank" rel="noreferrer">
                View current resume
              </a>
            ) : (
              <p className="muted">Upload via onboarding or drop a file below.</p>
            )}
            <input type="file" onChange={handleResumeUpload} disabled={resumeUploading} />
          </label>
          <label>
            Bio
            <textarea name="bio" defaultValue={profile.bio ?? ""} rows={3} />
          </label>
          <button className="btn primary" type="submit">
            Save profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;

