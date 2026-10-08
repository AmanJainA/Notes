import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ADMIN_EMAIL } from "../Auth/AdminRoute";

// Mobile-only fixed bottom "app bar" - shown on every page (Dashboard,
// About, Contact, Admin, and Lesson pages alike) so the app feels like
// a native app on small screens. Mirrors the same Home/About/Contact +
// Logout items that live in Header's desktop nav, just re-laid-out as
// a bottom tab bar. Hidden entirely on desktop via CSS (min-width: 768px).
// The Admin tab only shows up for the admin account (ADMIN_EMAIL, same
// constant AdminRoute.js already guards /admindashboard with).
export default function BottomNav() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;

  // Mobile browsers (Chrome/Safari) show and hide their own address-bar /
  // toolbar chrome as you scroll, which changes how much of the screen is
  // actually visible - CSS's `position: fixed; bottom: 0` has no way to
  // know about that, so the bar can end up partly hidden behind the
  // browser's own UI while scrolling. The VisualViewport API is the only
  // way to detect that in real time, so we measure the gap it leaves and
  // feed it into a CSS variable the bar's `bottom` reads from.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const updateOffset = () => {
      const offset = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
      document.documentElement.style.setProperty("--mobile-toolbar-offset", `${offset}px`);
    };

    updateOffset();
    vv.addEventListener("resize", updateOffset);
    vv.addEventListener("scroll", updateOffset);
    return () => {
      vv.removeEventListener("resize", updateOffset);
      vv.removeEventListener("scroll", updateOffset);
    };
  }, []);

  const navItems = [
    { to: "/dashboard", label: "Home", icon: "fa-home" },
    { to: "/about", label: "About", icon: "fa-info-circle" },
    { to: "/contact", label: "Contact", icon: "fa-envelope" },
    ...(isAdmin
      ? [{ to: "/admindashboard", label: "Admin", icon: "fa-user-shield" }]
      : []),
  ];

  const isActive = (to) => {
    if (to === "/dashboard") {
      return (
        location.pathname === "/dashboard" ||
        location.pathname.startsWith("/learn")
      );
    }
    return location.pathname === to;
  };

  return (
    <nav className="bottom-app-bar d-md-none" role="navigation" aria-label="Mobile">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`bottom-app-bar-item ${isActive(item.to) ? "active" : ""}`}
        >
          <i className={`fas ${item.icon}`}></i>
          <span>{item.label}</span>
        </Link>
      ))}

      <button
        type="button"
        onClick={signOut}
        className="bottom-app-bar-item bottom-app-bar-logout"
        title={user?.full_name || user?.email}
      >
        <i className="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </button>
    </nav>
  );
}