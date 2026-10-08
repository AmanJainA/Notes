import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Reached via the link emailed by the custom-auth Edge Function:
// {NOTES_APP_URL}/verify?token=...
export default function VerifyEmail() {
  const { verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState("checking"); // checking | ok | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This confirmation link is missing its token.");
      return;
    }
    verifyEmail(token).then(({ error }) => {
      if (error) {
        setStatus("error");
        setMessage(error.message);
      } else {
        setStatus("ok");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <div className="auth-info-box d-none d-md-flex">
          <h2 className="fw-bold"><i className="fas fa-code me-2"></i>Notes</h2>
          <p className="mb-0">Confirming your email address.</p>
        </div>
        <div className="auth-white-panel text-center">
          {status === "checking" && <p className="text-muted">Confirming your email…</p>}
          {status === "ok" && (
            <>
              <div className="alert alert-success py-2">Your email is confirmed! You can sign in now.</div>
              <Link to="/login">Go to sign in</Link>
            </>
          )}
          {status === "error" && (
            <>
              <div className="alert alert-danger py-2">{message}</div>
              <Link to="/login">Back to sign in</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
