import React, { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { CurriculumProvider } from "../../context/CurriculumContext";
import Sidebar from "./Sidebar";
import Aside from "./Aside";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import Breadcrumb from "./Breadcrumb";

// Mirrors the original project's per-topic page shell (page-wrapper /
// sidebar-wrapper / page-content) - an off-canvas icon sidebar on the
// left, the lesson content in the middle, and a topic list ("Aside") on
// the right. The Aside is desktop-only (no mobile drawer) - on mobile,
// topic navigation happens through the Sidebar + BottomNav instead.
// Every lesson page (any language, any topic) renders through this ONE
// layout via <Outlet />, same as the original had copy-pasted at the
// top of every single topic file.
export default function LessonLayout() {
  const { user, signOut } = useAuth();

  const [showSidebar, setShowSidebar] = useState(false);

  const sidebarRef = useRef(null);

  const toggleSidebar = () => setShowSidebar((v) => !v);
  const closeSidebar = () => setShowSidebar(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !e.target.closest(".toggle-sidebar-btn")
      ) {
        setShowSidebar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <CurriculumProvider>
      <div
        className={`page-wrapper light-theme has-bottom-app-bar ${
          showSidebar ? "toggled" : ""
        }`}
      >
        <div ref={sidebarRef}>
          <Sidebar onNavigate={closeSidebar} />
        </div>

        <main className="page-content">
          <div className="container-fluid">
            {/* Top bar */}
            <div className="d-flex justify-content-between align-items-center flex-wrap p-3 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn rounded-0 p-2 p-md-3 toggle-sidebar-btn"
                  onClick={toggleSidebar}
                >
                  <i className="fas fa-bars"></i>
                </button>
                <Breadcrumb />
              </div>

              <div className="d-flex align-items-center">
                <button
                  onClick={signOut}
                  className="btn btn-link text-dark fw-semibold p-0 me-2 d-none d-md-inline-block"
                >
                  {user?.user_metadata?.full_name || user?.email}
                </button>
              </div>
            </div>

            {/* Content + Aside (desktop only) */}
            <div className="row p-lg-4">
              <article className="main-content col-md-9 pr-lg-5">
                <Outlet />
                <Footer />
              </article>

              <div className="col-12 col-md-3 d-none d-md-block">
                <Aside />
              </div>

              {showSidebar && (
                <div className="overlay" onClick={closeSidebar}></div>
              )}
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </CurriculumProvider>
  );
}
