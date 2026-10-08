import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import { CurriculumProvider } from "../../context/CurriculumContext";

// Mirrors the original project's Dashboard.js shell:
// <div className="Main"><div className="site-wrap"><Header/>...<Footer/></div></div>
// BottomNav adds a fixed, app-style bottom bar (Home/About/Contact/Logout)
// that only renders on mobile widths - see .bottom-app-bar in Main.css.
export default function DashboardLayout() {
  return (
    <CurriculumProvider>
      <div className="Main">
        <div className="site-wrap has-bottom-app-bar">
          <Header />
          <div className="container-fluid py-4">
            <Outlet />
          </div>
          <Footer />
        </div>
        <BottomNav />
      </div>
    </CurriculumProvider>
  );
}
