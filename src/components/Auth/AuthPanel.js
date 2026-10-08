import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/theme.css";

// Same sliding split-panel look as the Notes reference design, but every
// bit of the actual auth logic below is unchanged Notes/Supabase code
// (useAuth -> signIn / signUp from context/AuthContext.js, which talks to
// Supabase's built-in `auth.users` table). Nothing here uses Firebase.
export default function AuthPanel({ defaultPanel = "login" }) {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [panel, setPanel] = useState(defaultPanel);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCpassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLogin = async (e) => {
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== cpassword) {
      setError("Passwords do not match");
      return;
    }

    setBusy(true);
    const { error: signUpError } = await signUp(email, password, fullName);
    setBusy(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // If email confirmation is on, there's no session yet.
    // If it's off, Supabase already returned a session and the user is in.
    setMessage("Account created! Check your email to confirm, then log in.");
    setTimeout(() => {
      setPanel("login");
      setMessage("");
    }, 2500);
  };

  return (
    <div className="cc-auth-page">
      <div className="cc-auth-panel container">
        {/* LEFT info box */}
        <div className="cc-auth-info-box">
          <h2>Have an account?</h2>
          <p>Log in to keep learning</p>
          <label
            className="cc-toggle-label"
            htmlFor="cc-show-login"
            onClick={() => setPanel("login")}
          >
            Login
          </label>
          <input
            type="radio"
            name="cc-active-panel"
            id="cc-show-login"
            checked={panel === "login"}
            onChange={() => setPanel("login")}
          />
        </div>

        {/* RIGHT info box */}
        <div className="cc-auth-info-box cc-right-info">
          <h2>New to Notes?</h2>
          <p>Create a free account to get started</p>
          <label
            className="cc-toggle-label"
            htmlFor="cc-show-register"
            onClick={() => setPanel("register")}
          >
            Register
          </label>
          <input
            type="radio"
            name="cc-active-panel"
            id="cc-show-register"
            checked={panel === "register"}
            onChange={() => setPanel("register")}
          />
        </div>

        {/* White sliding panel */}
        <div className={`cc-auth-white ${panel === "register" ? "cc-right" : ""}`}>
          {/* LOGIN form */}
          <div className={`cc-auth-form ${panel === "login" ? "cc-show" : ""}`}>
            <h3 className="fw-bold mb-1">
              <i className="fas fa-code text-danger me-2"></i>Notes
            </h3>
            <p className="text-muted mb-3">Log in to continue learning</p>

            {error && panel === "login" && (
              <div className="alert alert-danger py-2">{error}</div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <button type="submit" className="btn btn-danger w-100" disabled={busy}>
                  {busy ? "Signing in..." : "Login"}
                </button>
              </div>
            </form>
            <Link to="/forgot-password" className="cc-forgot">
              Forgot password?
            </Link>
          </div>

          {/* REGISTER form */}
          <div className={`cc-auth-form ${panel === "register" ? "cc-show" : ""}`}>
            <h3 className="fw-bold mb-1">Create your account</h3>
            <p className="text-muted mb-3">Start learning to code, for free</p>

            {error && panel === "register" && (
              <div className="alert alert-danger py-2">{error}</div>
            )}
            {message && <div className="alert alert-success py-2">{message}</div>}

            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Full name"
                  value={fullName}
                  required
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  minLength={6}
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirm password"
                  minLength={6}
                  value={cpassword}
                  required
                  onChange={(e) => setCpassword(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <button type="submit" className="btn btn-danger w-100" disabled={busy}>
                  {busy ? "Creating account..." : "Register"}
                </button>
              </div>
            </form>
          </div>

          {/* Mobile toggle (info boxes are hidden on small screens) */}
          <div className="cc-mobile-toggle d-md-none text-center">
            {panel === "login" ? (
              <div>
                <span>New here?</span>
                <button type="button" onClick={() => setPanel("register")}>
                  Register
                </button>
              </div>
            ) : (
              <div>
                <span>Already have an account?</span>
                <button type="button" onClick={() => setPanel("login")}>
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
