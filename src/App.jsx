import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import ProjectDetail from "./pages/ProjectDetail";
import Variations from "./pages/Variations";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { auth } from "./firebase";

import Projects from "./pages/Projects"; // ✅ real Projects page

function Shell({ title, children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <div
  style={{
    fontFamily: "Inter, system-ui, sans-serif",
    background: "#f8fafc",
        minHeight: "100vh",
        width:"100vw"
  }}
>
      <div
        style={{
          display: "flex",
          gap: 14,
          alignItems: "center",
          padding: 14,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <strong>Commercia</strong>

        <Link to="/dashboard" style={{marginLeft:"20px"}} >Dashboard</Link>
        <Link to="/projects" style={{marginLeft:"20px"}}>Projects</Link>
        <Link to="/variations" style={{marginLeft:"20px"}}>Variations</Link>
        <Link to="/settings" style={{marginLeft:"20px"}}>Settings</Link>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          {user ? (
            <>
              <span style={{ color: "#555",padding:"10px" }}>{user.email}</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </div>

      <div
  style={{
    padding: 24,
    maxWidth: 1100,
    margin: "0 auto",
  }}
>
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}







export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Shell title="Dashboard">
        <Dashboard />
      </Shell>
    </ProtectedRoute>
  }
/>

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              {/* ✅ wrap Projects page inside Shell so it keeps navbar + layout */}
              <Shell title="Projects">
                <Projects />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
  path="/projects/:projectId"
  element={
    <ProtectedRoute>
      <Shell title="Project">
        <ProjectDetail />
      </Shell>
    </ProtectedRoute>
  }
/>

       <Route
  path="/variations"
  element={
    <ProtectedRoute>
      <Shell title="Variations Register">
        <Variations />
      </Shell>
    </ProtectedRoute>
  }
/>

        <Route
  path="/settings"
  element={
    <ProtectedRoute>
      <Shell title="Settings">
        <Settings />
      </Shell>
    </ProtectedRoute>
  }
/>

        <Route path="*" element={<Shell title="404">Page not found.</Shell>} />
      </Routes>
    </BrowserRouter>
  );
}

