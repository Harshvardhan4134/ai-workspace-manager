import { useState } from "react";

import { useEmployees } from "../hooks/useProfiles";
import type { UserProfile } from "../types";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/client";

const EmployeesPage = () => {
  const { token } = useAuth();
  const { data: employees = [], refetch } = useEmployees();
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const [skillsInput, setSkillsInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || !token) return;
    setError(null);
    setSuccess(false);
    try {
      const formData = new FormData(event.currentTarget);
      await apiFetch(`/users/${selected.id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({
          name: formData.get("name"),
          role: formData.get("role"),
          capacity_hours: Number(formData.get("capacity_hours")),
          assigned_hours: Number(formData.get("assigned_hours")),
          phone: formData.get("phone"),
          bio: formData.get("bio"),
          skills: skillsInput.split(",").map((skill) => skill.trim()).filter(Boolean),
          status: formData.get("status"),
        }),
      });
      setSuccess(true);
      setSelected(null);
      await refetch();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile. Please check Firestore setup.");
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h3>Employees</h3>
          <p className="muted">{employees.length} teammates</p>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Capacity</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.name}</td>
              <td>{employee.role}</td>
              <td>
                {employee.assigned_hours}/{employee.capacity_hours} hrs
              </td>
              <td>{employee.status}</td>
              <td>
                <button className="btn outline" onClick={() => {
                  setSelected(employee);
                  setSkillsInput(employee.skills.join(", "));
                }}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <div className="drawer">
          <div className="drawer-header">
            <div>
              <p className="muted">Profile Editor</p>
              <h3>{selected.name}</h3>
            </div>
            <button className="btn ghost" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
          {error && (
            <div style={{ background: "#fee2e2", color: "#991b1b", padding: "0.75rem", borderRadius: "8px", margin: "1rem" }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: "#d1fae5", color: "#065f46", padding: "0.75rem", borderRadius: "8px", margin: "1rem" }}>
              Profile saved successfully!
            </div>
          )}
          <form className="form" onSubmit={handleSave}>
            <label>
              Name
              <input name="name" defaultValue={selected.name} />
            </label>
            <label>
              Role
              <input name="role" defaultValue={selected.role ?? ""} />
            </label>
            <label>
              Phone
              <input name="phone" defaultValue={selected.phone ?? ""} />
            </label>
            <label>
              Bio
              <textarea name="bio" defaultValue={selected.bio ?? ""} rows={3} />
            </label>
            <label>
              Skills (comma separated)
              <input value={skillsInput} onChange={(event) => setSkillsInput(event.target.value)} />
            </label>
            <label>
              Weekly capacity hours
              <input name="capacity_hours" type="number" defaultValue={selected.capacity_hours} />
            </label>
            <label>
              Assigned hours
              <input name="assigned_hours" type="number" defaultValue={selected.assigned_hours} />
            </label>
            <label>
              Status
              <select name="status" defaultValue={selected.status}>
                <option value="active">Active</option>
                <option value="busy">Busy</option>
                <option value="on_leave">On leave</option>
              </select>
            </label>
            <button className="btn primary" type="submit">
              Save profile
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;

