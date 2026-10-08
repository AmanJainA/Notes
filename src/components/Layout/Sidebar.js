import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCurriculum } from "../../context/CurriculumContext";

// Off-canvas icon sidebar, same pattern as the original project's
// Sidebar.js/Sidebar-themes.css: hidden by default, slides in from the
// left when toggled, light background, blue "brand" header. Unlike the
// old version (which hardcoded 3 languages), this one is driven entirely
// by Supabase - add a language row and it shows up here automatically.
export default function Sidebar({ onNavigate }) {
  const { languages, loading } = useCurriculum();
  const { languageSlug } = useParams();
  const [openLang, setOpenLang] = useState(languageSlug || null);

  return (
    <nav id="sidebar" className="sidebar-wrapper">
      <div className="sidebar-content">
        <div className="sidebar-brand">
          <Link to="/dashboard">
            <i className="fas fa-code me-2"></i>Notes
          </Link>
        </div>

        <div className="sidebar-menu">
          <div className="header-menu">
            <span>Languages</span>
          </div>

          {loading && (
            <div className="px-3 py-2 text-muted small">Loading...</div>
          )}

          <ul>
            {languages.map((lang) => {
              const isOpen = openLang === lang.slug;
              return (
                <li key={lang.id}>
                  <button
                    type="button"
                    className={`sidebar-lang-toggle ${isOpen ? "active" : ""}`}
                    onClick={() => setOpenLang(isOpen ? null : lang.slug)}
                  >
                    <span className="menu-icon">
                      <i className={lang.icon || "fas fa-code"}></i>
                    </span>
                    <span className="menu-text">{lang.name}</span>
                    <i
                      className={`fas fa-chevron-${
                        isOpen ? "down" : "right"
                      }`}
                      style={{ fontSize: 10 }}
                    ></i>
                  </button>

                  {isOpen && (
                    <div className="sidebar-submenu">
                      {(lang.topics || []).map((topic) => (
                        <Link
                          key={topic.id}
                          to={`/learn/${lang.slug}/${topic.slug}`}
                          onClick={onNavigate}
                        >
                          {topic.title}
                        </Link>
                      ))}
                      {(!lang.topics || lang.topics.length === 0) && (
                        <span className="text-muted small ps-2">
                          No topics yet
                        </span>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
