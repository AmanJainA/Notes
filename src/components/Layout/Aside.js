import React from "react";
import { Link, useParams } from "react-router-dom";
import { useCurriculum } from "../../context/CurriculumContext";

// Same role as the original project's Aside.js (a right-hand list of
// every topic in the current language, with the active one highlighted)
// but instead of three hardcoded arrays (cNavItems/cppNavItems/
// phpNavItems), it reads whichever language is active from Supabase -
// so it automatically works for Java, HTML, CSS, JavaScript, Bootstrap,
// or anything else you add later.
export default function Aside() {
  const { languageSlug, topicSlug } = useParams();
  const { getLanguage, loading } = useCurriculum();

  const language = getLanguage(languageSlug);
  const topics = language?.topics || [];

  return (
    <aside className="border-start p-3 bg-white shadow-sm rounded-3">
      {loading && <p className="text-muted small mb-0">Loading...</p>}

      {!loading && language && (
        <>
          <div className="fw-bold text-uppercase small text-muted mb-2">
            {language.name}
          </div>
          <ul className="aside-nav nav flex-column">
            {topics.map((topic) => (
              <li key={topic.id} className="nav-item">
                <Link
                  to={`/learn/${language.slug}/${topic.slug}`}
                  className={`nav-link ${
                    topic.slug === topicSlug ? "active" : "text-muted"
                  }`}
                >
                  {topic.title}
                </Link>
              </li>
            ))}
            {topics.length === 0 && (
              <li className="text-muted small">No topics yet.</li>
            )}
          </ul>
        </>
      )}
    </aside>
  );
}
