import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  async function handleLogout() {
    await signOut(auth);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      alert("Copy failed. Your browser blocked it.");
    }
  }

  return (
    <div style={{ display: "grid", gap: 14, maxWidth: 720 }}>
      
      {/* Account */}
      <Card title="Account">
        <Row label="Signed in as" value={user?.email || "Loading..."} />
      </Card>

      {/* App Controls */}
      <Card title="App">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={copyLink} style={btnPrimary}>
            {copied ? "Copied!" : "Copy app link"}
          </button>

          <button onClick={handleLogout} style={btnDanger}>
            Logout
          </button>
        </div>

        <p style={{ marginTop: 12, fontSize: 12, color: "#64748b" }}>
          Commercia • v1.0
        </p>
      </Card>

      {/* About Section */}
      <Card title="About Commercia">
        <p style={aboutText}>
          Commercia is a lightweight commercial management tool built for
          Quantity Surveyors and project teams.
        </p>

        <p style={aboutText}>
          Track variations, monitor risk exposure, and maintain a clear
          commercial audit trail across all your projects.
        </p>

        <p style={aboutText}>
          Designed for clarity, speed, and practical site use.
        </p>
      </Card>

    </div>
  );
}

function Card({ title, children }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <h4 style={{ marginTop: 0, marginBottom: 12 }}>{title}</h4>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
      <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 600 }}>
        {value}
      </div>
    </div>
  );
}

const btnPrimary = {
  padding: "10px 14px",
  background: "#0f172a",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const btnDanger = {
  padding: "10px 14px",
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const aboutText = {
  fontSize: 14,
  color: "#334155",
  lineHeight: 1.6,
  marginBottom: 10,
};