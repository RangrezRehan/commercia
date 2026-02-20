import { Link, useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";

export default function Signup() {
  const nav = useNavigate();

  async function handleGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      nav("/dashboard");
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div
      style={{
        // minHeight: "100vh",
        height:'100vh',
        width:'100vw',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        fontFamily: "Inter, system-ui, sans-serif",
        // padding: 16, // responsive padding (mobile)
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 10px 20px rgba(0,0,0,0.06)",
          border: "1px solid #e5e7eb",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>Create account</h2>

        <button
          onClick={handleGoogle}
          style={{
            width: "100%",
            padding: 10,
            background: "#0f172a",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Continue with Google
        </button>

        <p style={{ marginTop: 14, marginBottom: 0 }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
        <p style={{ marginTop: 18, fontSize: 13, color: "#334155" }}>
          Commercial variation tracker for QS teams
        </p>
      </div>
    </div>
  );
} 