import React from "react";
import { Link, useParams } from "react-router-dom";
import { useCurriculum } from "../../context/CurriculumContext";

// Renders "Home / <Language> / <Topic>" in the lesson top bar next to the
// sidebar toggle button, instead of each page (TopicPage, LanguagePage)
// building its own breadcrumb further down the layout.
export default function Breadcrumb() {
  const { languageSlug, topicSlug } = useParams();
  const { getLanguage, getTopic, loading } = useCurriculum();

  if (loading || !languageSlug) return null;

  const language = getLanguage(languageSlug);
  if (!language) return null;

  const topic = topicSlug ? getTopic(languageSlug, topicSlug) : null;

  return (
    <nav aria-label="breadcrumb" className="lesson-breadcrumb">
      <ol className="breadcrumb small mb-0">
        <li className="breadcrumb-item">
          <Link to="/dashboard">Home</Link>
        </li>
        <li className={`breadcrumb-item ${topic ? "" : "active"}`}>
          {topic ? (
            <Link to={`/learn/${language.slug}`}>{language.name}</Link>
          ) : (
            language.name
          )}
        </li>
        {topic && <li className="breadcrumb-item active">{topic.title}</li>}
      </ol>
    </nav>
  );
}
