import { useState } from "react";

import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { uploadToGcs } from "../utils/upload";
import type { Task } from "../types";
import { USE_MOCK_DATA } from "../mockData";

interface Props {
  onCreated: () => void;
}

const TaskComposer: React.FC<Props> = ({ onCreated }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [prdFile, setPrdFile] = useState<File | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [projectName, setProjectName] = useState("");

  const canShowPRD = customerName.trim() && projectName.trim();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    
    if (USE_MOCK_DATA) {
      // Simulate delay
      await new Promise(r => setTimeout(r, 800));
      console.log("Mock task created:", {
        title: formData.get("title"),
        customer_name: customerName,
        project_name: projectName,
      });
      setAttachments([]);
      setPrdFile(null);
      setCustomerName("");
      setProjectName("");
      (event.target as HTMLFormElement).reset();
      onCreated();
      setLoading(false);
      return;
    }
    
    if (!token) return;
    let attachmentUrls: string[] = [];
    if (attachments.length) {
      attachmentUrls = await Promise.all(attachments.map((file) => uploadToGcs(file, token)));
    }
    let prdUrl = "";
    if (prdFile) {
      prdUrl = await uploadToGcs(prdFile, token);
    }
    const payload = {
      title: formData.get("title"),
      description: formData.get("description"),
      complexity: formData.get("complexity"),
      tags: String(formData.get("tags") ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      priority: Number(formData.get("priority")) || undefined,
      attachments: attachmentUrls,
      customer_name: customerName.trim() || undefined,
      project_name: projectName.trim() || undefined,
      prd_url: prdUrl || undefined,
    };
    await apiFetch<Task>("/tasks/", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
    setAttachments([]);
    setPrdFile(null);
    setCustomerName("");
    setProjectName("");
    (event.target as HTMLFormElement).reset();
    onCreated();
    setLoading(false);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Customer Name *
        <input
          name="customer_name"
          placeholder="e.g., Rentshare Ops"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
        />
      </label>
      <label>
        Project Name *
        <input
          name="project_name"
          placeholder="e.g., Quickit Project"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
        />
      </label>
      <label>
        Task Title *
        <input name="title" placeholder="Launch ops review" required />
      </label>
      <label>
        Description
        <textarea name="description" rows={3} placeholder="PRD, blockers, expected output" />
      </label>
      <label>
        Tags
        <input name="tags" placeholder="ops, urgent" />
      </label>
      <label>
        Complexity
        <select name="complexity" defaultValue="medium">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <label>
        Priority
        <select name="priority" defaultValue="3">
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      {canShowPRD && (
        <label>
          Attach PRD / docs
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(event) => setPrdFile(event.target.files?.[0] || null)}
          />
          {prdFile && <small className="muted">Selected: {prdFile.name}</small>}
        </label>
      )}
      <label>
        Additional Attachments
        <input
          type="file"
          multiple
          onChange={(event) => setAttachments(event.target.files ? Array.from(event.target.files) : [])}
        />
        {attachments.length > 0 && <small className="muted">{attachments.length} file(s) selected</small>}
      </label>
      <button className="btn primary" type="submit" disabled={loading || !canShowPRD}>
        {loading ? "Creating..." : "Create & auto assign"}
      </button>
      {!canShowPRD && <small className="muted">Please fill customer and project name to enable PRD upload</small>}
    </form>
  );
};

export default TaskComposer;
