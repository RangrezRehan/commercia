import { useEffect, useState } from "react";
import { addDoc, collection, onSnapshot, query, where, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";
import { Link } from "react-router-dom";

export default function Projects() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);

  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [contractType, setContractType] = useState("JCT");
  const [location, setLocation] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "projects"), where("ownerUid", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProjects(rows);
    });

    return () => unsub();
  }, [user]);

  async function createProject(e) {
    e.preventDefault();
    if (!user) return;

    if (!name.trim()) return alert("Project name required");

    await addDoc(collection(db, "projects"), {
      ownerUid: user.uid,
      name: name.trim(),
      client: client.trim(),
      contractType,
      location: location.trim(),
      createdAt: serverTimestamp(),
    });

    setName("");
    setClient("");
    setLocation("");
    setContractType("JCT");
  }

  return (
    <div >
      {/* <h2 style={{ marginTop: 0 }}>Projects</h2> */}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
          <h3 style={{ marginTop: 0 }}>Create project</h3>

          <form onSubmit={createProject}>
            <input
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "90%", padding: 10, marginBottom: 10 }}
            />
            <input
              placeholder="Client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              style={{ width: "90%", padding: 10, marginBottom: 10 }}
            />
            <input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ width: "90%", padding: 10, marginBottom: 10 }}
            />

            <select
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
              style={{ width: "95%", padding: 10, marginBottom: 10 }}
            >
              <option value="JCT">JCT</option>
              <option value="NEC">NEC</option>
              <option value="FIDIC">FIDIC</option>
              <option value="Other">Other</option>
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
              Create
            </button>
          </form>
        </div>

        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
          <h3 style={{ marginTop: 0 }}>Your projects</h3>

          {projects.length === 0 ? (
            <p style={{ color: "#555" }}>No projects yet.</p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {projects.map((p) => (
                <li key={p.id} style={{ marginBottom: 8 }}>
                  <Link to={`/projects/${p.id}`}>{p.name}</Link>
                  <div style={{ color: "#666", fontSize: 12 }}>
                    {p.client || "—"} • {p.contractType} • {p.location || "—"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}