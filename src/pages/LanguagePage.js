import React from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { useCurriculum } from "../context/CurriculumContext";

// ONE component renders the overview page for every language (C, C++, Java,
// PHP, HTML, CSS, JavaScript, Bootstrap, ...). Adding a new language never
// requires a new React file - just a new row in Supabase.
export default function LanguagePage() {
  const { languageSlug } = useParams();
  const { getLanguage, loading } = useCurriculum();

  if (loading) return <p>Loading...</p>;

  const language = getLanguage(languageSlug);

  if (!language) {
    return (
      <div className="alert alert-warning">
        Language "{languageSlug}" not found.{" "}
        <Link to="/dashboard">Back to dashboard</Link>
      </div>
    );
  }

  const topics = language.topics || [];

  // If there's only ever going to be a topic list, auto-jump into the first
  // topic once one exists - comment this out if you'd rather always show
  // the overview screen first.
  if (topics.length === 0) {
    return (
      <div>
        <h2 className="fw-bold">{language.name}</h2>
        <p className="text-muted">{language.description}</p>
        <div className="alert alert-info">
          No topics yet for this language. Add rows to the <code>topics</code> table.
        </div>
      </div>
    );
  }

  return <Navigate to={`/learn/${language.slug}/${topics[0].slug}`} replace />;
}
