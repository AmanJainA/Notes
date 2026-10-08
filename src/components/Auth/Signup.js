import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    const { error: signUpError } = await signUp(email, password, fullName);
    setBusy(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setMessage("Account created. Check your inbox (and spam/promotions) for the confirmation link, then sign in with your password.");
    setTimeout(() => navigate("/login"), 2500);
  };

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <div className="auth-info-box d-none d-md-flex">
          <h2 className="fw-bold"><i className="fas fa-code me-2"></i>Notes</h2>
          <p className="mb-0">Create a free account to track your progress across every language, from Introduction to your last topic.</p>
          <div className="tabs"><Link to="/login">Already have an account? Log in</Link></div>
        </div>
        <div className="auth-white-panel">
          <h3 className="mb-1 fw-bold">Create your account</h3>
          <p className="text-muted mb-4">Start learning to code, for free</p>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          {message && <div className="alert alert-success py-2">{message}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3"><label className="form-label">Full Name</label><input type="text" className="form-control" value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
            <div className="mb-3"><label className="form-label">Email</label><input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="mb-3"><label className="form-label">Password</label><input type="password" className="form-control" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            <button className="btn btn-danger w-100" disabled={busy}>{busy ? "Creating account..." : "Sign Up"}</button>
          </form>
          <p className="text-center mt-3 mb-0 d-md-none">Already have an account? <Link to="/login">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}
