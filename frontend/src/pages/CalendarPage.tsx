import { useState } from "react";
import dayjs from "dayjs";

import { useMeetings } from "../hooks/useMeetings";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/client";
import type { Meeting } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

const CalendarPage = () => {
  const { token } = useAuth();
  const { data: meetings = [], refetch } = useMeetings();
  const [form, setForm] = useState({
    title: "",
    date: dayjs().format("YYYY-MM-DDTHH:mm"),
    duration: 30,
    attendees: "",
    description: "",
    meet_url: "",
  });
  const [aiSuggestion, setAiSuggestion] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    await apiFetch<Meeting>("/meetings/", {
      method: "POST",
      token,
      body: JSON.stringify({
        title: form.title,
        date: new Date(form.date).toISOString(),
        duration_minutes: Number(form.duration),
        attendees: form.attendees.split(",").map((attendee) => attendee.trim()).filter(Boolean),
        description: form.description,
        meet_url: form.meet_url,
      }),
    });
    refetch();
  };

  const handleAISuggest = async () => {
    if (!token) return;
    const response = await apiFetch<{ attendees: string[]; day: string; duration: number; reason: string }>(
      "/agent/meeting-suggestion",
      {
        method: "POST",
        token,
        body: JSON.stringify({
          context: {
            attendees: form.attendees.split(",").map((attendee) => attendee.trim()).filter(Boolean),
            preferred_day: dayjs(form.date).format("YYYY-MM-DD"),
            description: form.description,
          },
        }),
      },
    );
    setAiSuggestion(`AI suggests ${response.day} for ${response.duration} mins with ${response.attendees.join(", ")}`);
  };

  return (
    <div className="grid" style={{ gap: "1.5rem" }}>
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Schedule meeting</h3>
            <p className="muted">Attach AI suggestion or create manually</p>
          </div>
          <button className="btn ghost" onClick={handleAISuggest}>
            AI suggestion
          </button>
        </div>
        <form className="form" onSubmit={handleCreate}>
          <label>
            Title
            <input name="title" value={form.title} onChange={handleChange} required />
          </label>
          <label>
            Date & time
            <input type="datetime-local" name="date" value={form.date} onChange={handleChange} required />
          </label>
          <label>
            Duration (minutes)
            <input type="number" name="duration" value={form.duration} onChange={handleChange} />
          </label>
          <label>
            Attendees (comma separated IDs)
            <input name="attendees" value={form.attendees} onChange={handleChange} />
          </label>
          <label>
            Description
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
          </label>
          <label>
            Meeting link
            <input name="meet_url" value={form.meet_url} onChange={handleChange} />
          </label>
          <button className="btn primary" type="submit">
            Create meeting
          </button>
        </form>
        <p className="muted">{aiSuggestion || "Gemini can propose attendees + slots based on workload."}</p>
      </div>
      <div className="panel">
        <div className="panel-header">
          <h3>Upcoming meetings</h3>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Attendees</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
          {meetings.map((meeting) => (
              <tr key={meeting.id}>
                <td>{meeting.title}</td>
                <td>{new Date(meeting.date).toLocaleString()}</td>
                <td>{meeting.attendees.join(", ")}</td>
                <td>
                <button
                  className="btn outline"
                  onClick={async () => {
                    if (!token) return;
                    const response = await fetch(`${API_BASE}/meetings/${meeting.id}/ics`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `${meeting.title}.ics`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                >
                  ICS
                </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CalendarPage;

