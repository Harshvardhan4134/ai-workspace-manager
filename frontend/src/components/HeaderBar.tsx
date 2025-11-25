import { useAuth } from "../context/AuthContext";

const HeaderBar = () => {
  const { profile, logout } = useAuth();

  const initials = profile?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="header-bar">
      <div>
        <h2>Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}</h2>
        <p className="muted">Let Gemini auto-assign and keep ops on track.</p>
      </div>
      <div className="header-meta">
        <div className="avatar">{profile?.avatar_url ? <img src={profile.avatar_url} /> : initials}</div>
        <button className="btn outline" onClick={logout}>
          Sign out
        </button>
      </div>
    </div>
  );
};

export default HeaderBar;


