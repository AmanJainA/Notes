import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import DashboardLayout from "./components/Layout/DashboardLayout";
import LessonLayout from "./components/Layout/LessonLayout";
import PageTracker from "./components/Layout/PageTracker";

import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import LanguagePage from "./pages/LanguagePage";
import TopicPage from "./pages/TopicPage";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/Notes">
        <PageTracker />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify" element={<VerifyEmail />} />

          {/* Dashboard - Header + Footer shell, same as the original Dashboard.js.
              No RequireNotesProfile wrapper needed anymore: under the new
              custom-auth system, signing up for Notes always creates a
              notes.profiles row directly, so a logged-in Notes user
              already has everything this app needs. */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admindashboard" element={<AdminDashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Lessons - off-canvas Sidebar + Aside shell, same as the
              original per-topic page layout */}
          <Route
            element={
              <ProtectedRoute>
                <LessonLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/learn/:languageSlug" element={<LanguagePage />} />
            <Route path="/learn/:languageSlug/:topicSlug" element={<TopicPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
