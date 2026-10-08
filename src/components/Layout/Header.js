import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ADMIN_EMAIL } from "../Auth/AdminRoute";

// Desktop header only.
// Mobile navigation is handled by BottomNav.
export default function Header() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;

  const navLinks = [
    { to: "/dashboard", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
    ...(isAdmin
      ? [{ to: "/admindashboard", label: "Admin" }]
      : []),
  ];

  return (
    <header className="site-navbar py-3 shadow-sm" role="banner">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center">

          {/* Logo */}
          <div data-aos="fade-down">
            <h1 className="mb-0">
              <Link
                to="/dashboard"
                className="text-white h2 mb-0 text-decoration-none"
              >
                <i className="fas fa-code me-2"></i>
                Notes
              </Link>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav
            className="site-navigation d-none d-xl-block"
            data-aos="fade-down"
            role="navigation"
          >
            <ul className="site-menu d-flex gap-4 list-unstyled mb-0">
              {navLinks.map((link) => (
                <li
                  key={link.to}
                  className={
                    location.pathname === link.to ? "active" : ""
                  }
                >
                  <Link to={link.to}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User / Logout */}
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={signOut}
              className="btn btn-sm text-light fw-semibold align-items-center gap-2 d-none d-xl-flex"
            >
              {user?.full_name || user?.email}

              <i className="fas fa-sign-out-alt text-danger ms-1"></i>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}