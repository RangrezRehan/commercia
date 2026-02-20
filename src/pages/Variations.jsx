import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Variations() {
  const [user, setUser] = useState(null);
  const [rows, setRows] = useState([]);
  const [projectMap, setProjectMap] = useState({}); // projectId -> project name

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Load variations
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "variations"), where("ownerUid", "==", user.uid));

    const unsub = onSnapshot(q, (snap) => {
      const r = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      r.sort((a, b) => {
        const ta = a.createdAt?.seconds ?? 0;
        const tb = b.createdAt?.seconds ?? 0;
        return tb - ta; // newest first
      });

      setRows(r);
    });

    return () => unsub();
  }, [user]);

  // Load projects (for names)
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "projects"), where("ownerUid", "==", user.uid));

    const unsub = onSnapshot(q, (snap) => {
      const map = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        map[d.id] = data?.name || d.id;
      });
      setProjectMap(map);
    });

    return () => unsub();
  }, [user]);

  const totals = useMemo(() => {
    const totalAll = rows.reduce((s, v) => s + (v.estCost || 0), 0);
    const totalAgreed = rows.filter((v) => v.status === "Agreed").reduce((s, v) => s + (v.estCost || 0), 0);
    const totalPending = rows.filter((v) => v.status !== "Agreed").reduce((s, v) => s + (v.estCost || 0), 0);

    return { totalAll, totalAgreed, totalPending };
  }, [rows]);

  return (
    <div>
      <p style={{ color: "#475569", marginTop: 0 }}>All variations across all projects.</p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <Stat label="Total" value={`£${totals.totalAll.toFixed(2)}`} />
        <Stat label="Agreed" value={`£${totals.totalAgreed.toFixed(2)}`} />
        <Stat label="Pending / risk" value={`£${totals.totalPending.toFixed(2)}`} />
      </div>

      <div
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          overflowX: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <Th>Project</Th>
              <Th>Ref</Th>
              <Th>Type</Th>
              <Th>Title</Th>
              <Th>Cost</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.id}>
                <Td>
                  <Link
                    to={`/projects/${v.projectId}`}
                    style={{ color: "#0f172a", textDecoration: "underline" }}
                  >
                    {projectMap[v.projectId] || v.projectId}
                  </Link>
                </Td>
                <Td>{v.refNo || "—"}</Td>
                <Td>{v.type}</Td>
                <Td>{v.title}</Td>
                <Td>£{Number(v.estCost || 0).toFixed(2)}</Td>
                <Td>{v.status}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 12,
        minWidth: 180,
      }}
    >
      <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: 10,
        borderBottom: "1px solid #e5e7eb",
        fontSize: 12,
        color: "#475569",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td style={{ padding: 10, borderBottom: "1px solid #f1f5f9", fontSize: 13 }}>
      {children}
    </td>
  );
}