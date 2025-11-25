import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import EmployeesPage from "./pages/EmployeesPage";
import CalendarPage from "./pages/CalendarPage";
import ProfilePage from "./pages/ProfilePage";
import Sidebar from "./components/Sidebar";
import HeaderBar from "./components/HeaderBar";
import OnboardingModal from "./components/OnboardingModal";
import ErrorBanner from "./components/ErrorBanner";

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  );
}

function AppShell() {
  const { user, loading, login, profile } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (profile && (!profile.role || !profile.resume_url)) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="auth-screen">
        <p>Loading workspace...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h1>AI Workspace Manager</h1>
          <p>Gemini-powered Jira alternative for ops teams.</p>
          <button className="btn primary" onClick={login}>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <HeaderBar />
        <ErrorBanner
          message="Firestore database setup required: Create the database in Google Cloud Console and ensure your service account has 'Cloud Datastore User' role. This enables task management, chat, and all workspace features."
          actionUrl="https://console.cloud.google.com/datastore/setup?project=bnbm-harsh-2025"
          actionText="Open Setup Guide →"
          storageKey="firestore_setup_banner_dismissed"
        />
        <div className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>
      <OnboardingModal open={showOnboarding} onComplete={() => setShowOnboarding(false)} />
    </div>
  );
}

export default App;
