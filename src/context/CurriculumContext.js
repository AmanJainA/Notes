import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const CurriculumContext = createContext(null);

// Fetches the full languages + topics tree ONCE and shares it everywhere
// (Sidebar, Dashboard, LanguagePage, TopicPage) so we don't re-query
// Supabase on every navigation. This is what makes the whole nav "reusable" -
// add a row in Supabase and it shows up everywhere automatically.
export function CurriculumProvider({ children }) {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from("languages")
        .select(
          `
          id, slug, name, icon, images, description, sort_order,
          topics ( id, slug, title, sort_order )
        `
        )
        .order("sort_order", { ascending: true })
        .order("sort_order", { referencedTable: "topics", ascending: true });

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setLanguages(data || []);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const getLanguage = (slug) => languages.find((l) => l.slug === slug);

  const getTopic = (languageSlug, topicSlug) => {
    const lang = getLanguage(languageSlug);
    return lang?.topics?.find((t) => t.slug === topicSlug);
  };

  const value = { languages, loading, error, getLanguage, getTopic };

  return (
    <CurriculumContext.Provider value={value}>
      {children}
    </CurriculumContext.Provider>
  );
}

export const useCurriculum = () => useContext(CurriculumContext);
