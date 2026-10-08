import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Reached via the link emailed by the custom-auth Edge Function:
// {NOTES_APP_URL}/reset-password?token=...
export default function ResetPassword() {
  const { resetPasswordWithToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    const { error: updateError } = await resetPasswordWithToken(token, password);
    setBusy(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setMessage("Password updated! Redirecting to login…");
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <div className="auth-info-box d-none d-md-flex">
          <h2 className="fw-bold">
            <i className="fas fa-code me-2"></i>Notes
          </h2>
          <p className="mb-0">Almost done — set a new password for your account.</p>
        </div>

        <div className="auth-white-panel">
          <h3 className="mb-1 fw-bold">Set a new password</h3>
          <p className="text-muted mb-4">Choose a new password to finish resetting.</p>

          {!token ? (
            <div className="alert alert-danger py-2">This reset link is missing its token. Please use the link from your email.</div>
          ) : message ? (
            <div className="alert alert-success py-2">{message}</div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="alert alert-danger py-2">{error}</div>}
              <div className="mb-3">
                <label className="form-label">New password</label>
                <input
                  type="password"
                  className="form-control"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm new password</label>
                <input
                  type="password"
                  className="form-control"
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <button className="btn btn-danger w-100" disabled={busy}>
                {busy ? "Updating..." : "Update password"}
              </button>
            </form>
          )}

          <p className="text-center mt-3 mb-0">
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
