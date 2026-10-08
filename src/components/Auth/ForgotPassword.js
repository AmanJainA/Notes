import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    const { error: resetError } = await resetPassword(email);
    setBusy(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setMessage("If that email exists, a reset link has been sent.");
  };

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <div className="auth-info-box d-none d-md-flex">
          <h2 className="fw-bold">
            <i className="fas fa-code me-2"></i>Notes
          </h2>
          <p className="mb-0">No worries — it happens. We'll send you a reset link.</p>
          <div className="tabs">
            <Link to="/login">Back to login</Link>
          </div>
        </div>

        <div className="auth-white-panel">
          <h3 className="mb-1 fw-bold">Reset your password</h3>
          <p className="text-muted mb-4">Enter the email on your account</p>

          {error && <div className="alert alert-danger py-2">{error}</div>}
          {message && <div className="alert alert-success py-2">{message}</div>}

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
            <button className="btn btn-danger w-100" disabled={busy}>
              {busy ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <p className="text-center mt-3 mb-0 d-md-none">
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
