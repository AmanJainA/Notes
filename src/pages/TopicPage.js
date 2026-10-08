import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useCurriculum } from "../context/CurriculumContext";
import { useAuth } from "../context/AuthContext";
import ContentRenderer from "../components/Content/ContentRenderer";

// This ONE component is what used to be ~100 separate files
// (C-Introduction.js, C-Loop.js, CCPointer.js, PhpArray.js, ...).
// It reads :languageSlug/:topicSlug from the URL, looks up the topic in
// Supabase, fetches its content blocks, and renders them. New topics for
// any language (including brand-new languages like Java/HTML/CSS/JS/
// Bootstrap) appear automatically the moment they're added to the DB.
export default function TopicPage() {
  const { languageSlug, topicSlug } = useParams();
  const { getLanguage, getTopic, loading: curriculumLoading } = useCurriculum();
  const { user } = useAuth();

  const [content, setContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(true);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  const language = getLanguage(languageSlug);
  const topic = getTopic(languageSlug, topicSlug);

  // Fetch the actual lesson content for this topic
  useEffect(() => {
    if (!topic) return;

    let cancelled = false;
    setLoadingContent(true);

    supabase
      .from("topic_content")
      .select("content")
      .eq("topic_id", topic.id)
      .maybeSingle()
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) setError(fetchError.message);
        setContent(data?.content || []);
        setLoadingContent(false);
      });

    return () => {
      cancelled = true;
    };
  }, [topic]);

  // Fetch whether the current user has already marked this topic complete
  useEffect(() => {
    if (!topic || !user) return;

    let cancelled = false;
    supabase
      .from("user_progress")
      .select("completed")
      .eq("user_id", user.id)
      .eq("topic_id", topic.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setCompleted(!!data?.completed);
      });

    return () => {
      cancelled = true;
    };
  }, [topic, user]);

  const toggleComplete = async () => {
    if (!topic || !user) return;
    setSavingProgress(true);

    const nextValue = !completed;

    const { error: upsertError } = await supabase.from("user_progress").upsert(
      {
        user_id: user.id,
        topic_id: topic.id,
        completed: nextValue,
        completed_at: nextValue ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,topic_id" }
    );

    setSavingProgress(false);
    if (!upsertError) setCompleted(nextValue);
  };

  if (curriculumLoading || loadingContent) return <p>Loading lesson...</p>;

  if (!language || !topic) {
    return (
      <div className="alert alert-warning">
        Topic not found. <Link to="/dashboard">Back to dashboard</Link>
      </div>
    );
  }

  const topics = language.topics || [];
  const idx = topics.findIndex((t) => t.slug === topicSlug);
  const prevTopic = idx > 0 ? topics[idx - 1] : null;
  const nextTopic = idx < topics.length - 1 ? topics[idx + 1] : null;

  return (
    <article>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <h1 className="mb-3">{topic.title}</h1>
        <button
          className={`btn btn-sm ${completed ? "btn-success" : "btn-outline-success"}`}
          onClick={toggleComplete}
          disabled={savingProgress}
        >
          <i className={`fas ${completed ? "fa-check-circle" : "fa-circle"} me-1`}></i>
          {completed ? "Completed" : "Mark as complete"}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <ContentRenderer blocks={content} />

      <hr className="my-5" />

      <div className="d-flex justify-content-between">
        {prevTopic ? (
          <Link
            to={`/learn/${language.slug}/${prevTopic.slug}`}
            className="btn btn-outline-primary"
          >
            <i className="fas fa-arrow-left me-2"></i>
            {prevTopic.title}
          </Link>
        ) : (
          <span />
        )}
        {nextTopic ? (
          <Link
            to={`/learn/${language.slug}/${nextTopic.slug}`}
            className="btn btn-primary"
          >
            {nextTopic.title}
            <i className="fas fa-arrow-right ms-2"></i>
          </Link>
        ) : (
          <span />
        )}
      </div>
    </article>
  );
}
