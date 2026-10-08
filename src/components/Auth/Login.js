import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Matches the original project's Login.css look: full-bleed background
// image, a translucent red info panel, and a white floating card for
// the actual form (originally a flip-toggle between login/register on
// one page - here it's two routes, /login and /signup, sharing the
// same auth-screen/auth-panel visual shell).
export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    const { error: signInError } = await signIn(email, password);
    setBusy(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <div className="auth-info-box d-none d-md-flex">
          <h2 className="fw-bold">
            <i className="fas fa-code me-2"></i>Notes
          </h2>
          <p className="mb-0">
            Learn C, C++, Java, PHP, HTML, CSS, JavaScript &amp; Bootstrap —
            all in one place, built for BCA/MCA students.
          </p>
          <div className="tabs">
            <Link to="/signup">New here? Create an account</Link>
          </div>
        </div>

        <div className="auth-white-panel">
          <h3 className="mb-1 fw-bold">Log In</h3>
          <p className="text-muted mb-4">Welcome back — let's keep learning.</p>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="d-flex justify-content-between mb-3">
              <Link to="/forgot-password" className="small forgot">
                Forgot password?
              </Link>
            </div>
            <button className="btn btn-danger w-100" disabled={busy}>
              {busy ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center mt-3 mb-0 d-md-none">
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
