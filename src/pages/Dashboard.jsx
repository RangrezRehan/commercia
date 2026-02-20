import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [vars, setVars] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Projects
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "projects"), where("ownerUid", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  // Variations
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "variations"), where("ownerUid", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setVars(rows);
    });
    return () => unsub();
  }, [user]);

  const totals = useMemo(() => {
    const totalAll = vars.reduce((s, v) => s + (v.estCost || 0), 0);
    const totalAgreed = vars.filter((v) => v.status === "Agreed").reduce((s, v) => s + (v.estCost || 0), 0);
    const totalPending = vars.filter((v) => v.status !== "Agreed").reduce((s, v) => s + (v.estCost || 0), 0);
    return { totalAll, totalAgreed, totalPending };
  }, [vars]);

  return (
    <div>
      <p style={{ color: "#475569", marginTop: 0 }}>
        Overview across all your projects.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Card label="Projects" value={projects.length} />
        <Card label="Variations" value={vars.length} />
        <Card label="Total value" value={`£${totals.totalAll.toFixed(2)}`} />
        <Card label="Agreed" value={`£${totals.totalAgreed.toFixed(2)}`} />
        <Card label="Pending / risk" value={`£${totals.totalPending.toFixed(2)}`} />
      </div>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 14,
        minWidth: 200,
      }}
    >
      <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, marginTop: 6, color: "#0f172a" }}>
        {value}
      </div>
    </div>
  );
}