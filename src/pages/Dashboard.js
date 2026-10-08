import React from "react";
import { Link } from "react-router-dom";
import { useCurriculum } from "../context/CurriculumContext";
import { useAuth } from "../context/AuthContext";
// Same card-grid pattern as the original Dashboard.js (image-wrap-2 /
// image-info / btn-outline-white), just driven by Supabase instead of
// three hardcoded <img> imports - so every language you add shows up
// here as its own tile automatically.
export default function Dashboard() {
  const { languages, loading, error } = useCurriculum();
  const { user } = useAuth();

  return (
    <div>
      {loading && <p>Loading languages...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      <div
        className="container-fluid"
        data-aos="fade"
        data-aos-delay="500"
      ></div>
      <div className="container-fluid" data-aos="fade" data-aos-delay="500">
        <div className="row">
          {languages.map((lang, index) => (
            <div
              key={lang.id}
              data-aos="fade-up"
              data-aos-delay={index * 150}
              className="col-lg-4 col-md-6 mb-4"
            >
              <div className="image-wrap-2 position-relative">
                <img
                  src={lang.images}
                  alt={lang.title || lang.name}
                  className="img-fluid"
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                  }}
                />

                <div className="image-info">
                  <p className="small mb-2">
                    {lang.topics?.length || 0} topics
                  </p>

                  <Link
                    to={`/learn/${lang.slug}`}
                    className="btn btn-outline-white py-1 px-3"
                  >
                    More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {!loading && languages.length === 0 && (
        <div className="alert alert-info mt-3">
          No languages found yet. Add rows to the <code>languages</code> table
          in Supabase.
        </div>
      )}
    </div>
  );
}
