import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/tasks", label: "Tasks" },
  { to: "/employees", label: "Employees" },
  { to: "/calendar", label: "Calendar" },
  { to: "/profile", label: "Profile" },
];

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div>
        <h1>AI Workspace</h1>
        <p className="muted">Gemini Ops Console</p>
      </div>
      <nav>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;


