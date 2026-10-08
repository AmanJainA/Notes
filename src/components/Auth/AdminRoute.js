import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const ADMIN_EMAIL = "amanjain033@gmail.com";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
