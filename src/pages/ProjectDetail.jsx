import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  onSnapshot,
  query,
  updateDoc,
  where,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";

export default function ProjectDetail() {
  const { projectId } = useParams();

  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [vars, setVars] = useState([]);

  const [refNo, setRefNo] = useState("");
  const [type, setType] = useState("VO");
  const [title, setTitle] = useState("");
  const [estCost, setEstCost] = useState("");
  const [status, setStatus] = useState("Draft");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Load project once
  useEffect(() => {
    async function loadProject() {
      const snap = await getDoc(doc(db, "projects", projectId));
      if (snap.exists()) setProject({ id: snap.id, ...snap.data() });
      else setProject(null);
    }
    loadProject();
  }, [projectId]);

  // Live variations for this project
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "variations"),
      where("ownerUid", "==", user.uid),
      where("projectId", "==", projectId)
    );

    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // newest first (no index needed)
      rows.sort((a, b) => {
        const ta = a.createdAt?.seconds ?? 0;
        const tb = b.createdAt?.seconds ?? 0;
        return tb - ta;
      });

      setVars(rows);
    });

    return () => unsub();
  }, [user, projectId]);

  async function addVariation(e) {
    e.preventDefault();
    if (!user) return;

    if (!title.trim()) return alert("Title required");
    const costNum = Number(estCost);
    if (Number.isNaN(costNum)) return alert("Enter a valid number for cost");

    await addDoc(collection(db, "variations"), {
      ownerUid: user.uid,
      projectId,
      refNo: refNo.trim(),
      type,
      title: title.trim(),
      estCost: costNum,
      status,
      createdAt: serverTimestamp(),
    });

    setRefNo("");
    setType("VO");
    setTitle("");
    setEstCost("");
    setStatus("Draft");
  }

  async function changeStatus(varId, newStatus) {
  try {
    const updateData = { status: newStatus };

    // If switching to Submitted, set submittedAt if not already set
    if (newStatus === "Submitted") {
  const current = vars.find((x) => x.id === varId);
  if (!current?.submittedAt) updateData.submittedAt = serverTimestamp();
}

    // If switching to Agreed, set agreedAt (optional but nice)
    if (newStatus === "Agreed") {
      updateData.agreedAt = serverTimestamp();
    }

    await updateDoc(doc(db, "variations", varId), updateData);
  } catch (err) {
    alert("Status update failed: " + err.message);
    console.error(err);
  }
    }
    async function deleteVariation(varId) {
  const ok = confirm("Delete this variation? This cannot be undone.");
  if (!ok) return;

  try {
    await deleteDoc(doc(db, "variations", varId));
  } catch (err) {
    alert("Delete failed: " + err.message);
    console.error(err);
  }
}

  const totals = useMemo(() => {
    const totalAll = vars.reduce((s, v) => s + (v.estCost || 0), 0);
    const totalAgreed = vars
      .filter((v) => v.status === "Agreed")
      .reduce((s, v) => s + (v.estCost || 0), 0);
    const totalPending = vars
      .filter((v) => v.status !== "Agreed")
      .reduce((s, v) => s + (v.estCost || 0), 0);

    return { totalAll, totalAgreed, totalPending };
  }, [vars]);

  function isOverdue(v) {
  if (v.status === "Agreed" || v.status === "Rejected") return false;

  // Use submittedAt if available; otherwise fall back to createdAt
  const seconds = v.submittedAt?.seconds ?? v.createdAt?.seconds;
  if (!seconds) return false;

  const dateMs = seconds * 1000;
  const days = (Date.now() - dateMs) / (1000 * 60 * 60 * 24);

  // Only overdue if it's been submitted and not agreed for > 30 days
  if (v.status !== "Submitted") return false;

  return days > 0;
}

  function ageDays(v) {
    const seconds = v.createdAt?.seconds;
    if (!seconds) return null;

    const createdMs = seconds * 1000;
    const days = Math.floor((Date.now() - createdMs) / (1000 * 60 * 60 * 24));
    return days;
    }
    function submittedDays(v) {
  const seconds = v.submittedAt?.seconds;
  if (!seconds) return null;

  const submittedMs = seconds * 1000;
  const days = Math.floor((Date.now() - submittedMs) / (1000 * 60 * 60 * 24));
  return days;
}

  return (
    <div>
      {/* Project header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ color: "#666", fontSize: 12 }}>Project</div>
        <h3 style={{ margin: "6px 0" }}>{project?.name || "Loading..."}</h3>
        <div style={{ color: "#666", fontSize: 13 }}>
          {project?.client || "—"} • {project?.contractType || "—"} •{" "}
          {project?.location || "—"}
        </div>
      </div>

      {/* Totals */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <StatCard label="Total variations" value={`£${totals.totalAll.toFixed(2)}`} />
        <StatCard label="Agreed" value={`£${totals.totalAgreed.toFixed(2)}`} />
        <StatCard label="Pending / risk" value={`£${totals.totalPending.toFixed(2)}`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16 }}>
        {/* Add variation */}
        <div style={cardStyle}>
          <h4 style={{ marginTop: 0 }}>Add variation</h4>

          <form onSubmit={addVariation}>
            <input
              placeholder="Reference (optional) e.g. VO-001"
              value={refNo}
              onChange={(e) => setRefNo(e.target.value)}
              style={inputStyle}
            />

            <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
              <option value="VO">VO (Variation Order)</option>
              <option value="AI">AI (Architect’s Instruction)</option>
              <option value="CE">CE (Compensation Event)</option>
              <option value="SI">SI (Site Instruction)</option>
              <option value="Other">Other</option>
            </select>

            <input
              placeholder="Title / description"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />

            <input
              placeholder="Estimated cost (£)"
              value={estCost}
              onChange={(e) => setEstCost(e.target.value)}
              style={inputStyle}
            />

            <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Agreed">Agreed</option>
              <option value="Rejected">Rejected</option>
            </select>

            <button
  type="submit"
  style={{
    width: "40%",
    padding: 10,
    background: "#0f172a",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  }}
>
              Add
            </button>
          </form>
        </div>

        {/* Register */}
        <div style={cardStyle}>
          <h4 style={{ marginTop: 0 }}>Variation register</h4>

          {vars.length === 0 ? (
            <p style={{ color: "#666" }}>No variations yet.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <Th>Ref</Th>
                    <Th>Type</Th>
                    <Th>Title</Th>
                    <Th>Cost</Th>
                    <Th>Age</Th>
                    <Th>Submitted</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                    
                  </tr>
                </thead>
                <tbody>
                  {vars.map((v) => (
                    <tr
                      key={v.id}
                      style={{ background: isOverdue(v) ? "#fff7ed" : "transparent" }}
                    >
                      <Td>{v.refNo || "—"}</Td>
<Td>{v.type}</Td>
<Td>{v.title}</Td>
<Td>£{Number(v.estCost || 0).toFixed(2)}</Td>
<Td>{ageDays(v) === null ? "—" : `${ageDays(v)}d`}</Td>

<Td>
  {v.submittedAt?.seconds
    ? new Date(v.submittedAt.seconds * 1000).toLocaleDateString()
    : "—"}
</Td>

<Td>
  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
    <select
      value={v.status}
      onChange={(e) => changeStatus(v.id, e.target.value)}
      style={{ padding: 6 }}
    >
      <option value="Draft">Draft</option>
      <option value="Submitted">Submitted</option>
      <option value="Agreed">Agreed</option>
      <option value="Rejected">Rejected</option>
    </select>

    {isOverdue(v) && (
      <span
        style={{
          fontSize: 12,
          padding: "2px 8px",
          border: "1px solid #fdba74",
          borderRadius: 999,
        }}
      >
        Overdue {submittedDays(v) ?? "—"}d
      </span>
    )}
  </div>
                          </Td>
                          <Td>
  <button
    onClick={() => deleteVariation(v.id)}
    style={{
    padding: "6px 10px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  }}
  >
    Delete
  </button>
</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ ...cardStyle, minWidth: 180 }}>
      <div style={{ color: "#666", fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>{value}</div>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 14,
};

const inputStyle = {
  width: "90%",
  maxwidth:'300px',
  padding: 10,
  marginBottom: 10,
};

function Th({ children }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: 10,
        borderBottom: "1px solid #e5e7eb",
        fontSize: 12,
        color: "#555",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0", fontSize: 13 }}>
      {children}
    </td>
  );
}