import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { ADMIN_EMAIL } from "../components/Auth/AdminRoute";
import ExportButtons from "../components/Admin/ExportButtons";

const emptyLanguage = { id: null, slug: "", name: "", icon: "fas fa-code", description: "", sort_order: 0 };
const emptyTopic = { id: null, language_id: "", slug: "", title: "", sort_order: 0 };

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [languages, setLanguages] = useState([]);
  const [topics, setTopics] = useState([]);
  const [contents, setContents] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loginActivity, setLoginActivity] = useState([]);
  const [pageVisits, setPageVisits] = useState([]);
  const [activitySubTab, setActivitySubTab] = useState("online");
  const [visitSearch, setVisitSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [languageForm, setLanguageForm] = useState(emptyLanguage);
  const [topicForm, setTopicForm] = useState(emptyTopic);
  const [contentForm, setContentForm] = useState({ topic_id: "", content: "[]" });
  const [profileForm, setProfileForm] = useState({ id: "", full_name: "", email: "" });
  const [profileEditing, setProfileEditing] = useState(false);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;

  const refresh = async () => {
    setLoading(true);
    setError("");

    const [langs, tops, conts, profs] = await Promise.all([
      supabase.from("languages").select("*").order("sort_order"),
      supabase.from("topics").select("id, language_id, slug, title, sort_order, languages(name, slug)").order("sort_order"),
      supabase.from("topic_content").select("id, topic_id, content, updated_at, topics(title, slug, language_id, languages(name, slug))"),
      supabase.from("profiles").select("id, full_name, email, created_at").order("created_at", { ascending: false }),
    ]);

    const failed = [langs, tops, conts, profs].find((r) => r.error);
    if (failed?.error) setError(failed.error.message);

    setLanguages(langs.data || []);
    setTopics(tops.data || []);
    setContents(conts.data || []);
    setProfiles(profs.data || []);
    await refreshActivity();
    setLoading(false);
  };

  // Only the 3 Activity-tab datasets - kept separate from refresh() so
  // the polling/realtime below can update just these without re-fetching
  // languages/topics/profiles every few seconds.
  const refreshActivity = async () => {
    const [online, logins, visits] = await Promise.all([
      supabase.from("currently_online").select("*").order("last_seen_at", { ascending: false }),
      supabase.from("login_activity").select("*").order("login_time", { ascending: false }).limit(50),
      supabase.from("page_visits").select("*").order("visit_time", { ascending: false }).limit(100),
    ]);
    if (online.data) setOnlineUsers(online.data);
    if (logins.data) setLoginActivity(logins.data);
    if (visits.data) setPageVisits(visits.data);
  };

  useEffect(() => {
    if (isAdmin) refresh();
  }, [isAdmin]);

  // Live-updating Activity tab: Supabase Realtime pushes an update the
  // instant a row changes in login_activity/page_visits (near-instant,
  // "AJAX-like", no page refresh needed) - this also covers
  // "currently online" since that view reads from page_visits. A 10s
  // poll runs alongside it as a fallback in case Realtime isn't enabled
  // yet on these tables (see the note in 05_realtime.sql). Both only run
  // while the Activity tab is actually open, so it isn't hammering the
  // DB in the background while you're on Overview/Languages/etc.
  useEffect(() => {
    if (!isAdmin || tab !== "activity") return;

    refreshActivity();

    const channel = supabase
      .channel("admin-activity-feed")
      .on("postgres_changes", { event: "*", schema: "notes", table: "page_visits" }, () => refreshActivity())
      .on("postgres_changes", { event: "*", schema: "notes", table: "login_activity" }, () => refreshActivity())
      .subscribe();

    const interval = setInterval(refreshActivity, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [isAdmin, tab]);

  const filteredVisits = useMemo(() => {
    const q = visitSearch.trim().toLowerCase();
    if (!q) return pageVisits;
    return pageVisits.filter((v) =>
      [v.username, v.page_name, v.page_url, v.device, v.browser, v.operating_system, v.ip_address]
        .some((field) => String(field ?? "").toLowerCase().includes(q))
    );
  }, [pageVisits, visitSearch]);

  const topicsByLanguage = useMemo(() => {
    const map = {};
    topics.forEach((t) => {
      if (!map[t.language_id]) map[t.language_id] = [];
      map[t.language_id].push(t);
    });
    return map;
  }, [topics]);

  const notify = (text) => {
    setMessage(text);
    setError("");
    window.setTimeout(() => setMessage(""), 3000);
  };

  const saveLanguage = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      slug: languageForm.slug.trim().toLowerCase(),
      name: languageForm.name.trim(),
      icon: languageForm.icon.trim() || "fas fa-code",
      description: languageForm.description.trim() || null,
      sort_order: Number(languageForm.sort_order) || 0,
    };
    const result = languageForm.id
      ? await supabase.from("languages").update(payload).eq("id", languageForm.id)
      : await supabase.from("languages").insert(payload);

    if (result.error) return setError(result.error.message);
    setLanguageForm(emptyLanguage);
    await refresh();
    notify(languageForm.id ? "Language updated." : "Language added.");
  };

  const editLanguage = (item) => {
    setLanguageForm({ ...item });
    setTab("languages");
  };

  const deleteLanguage = async (id) => {
    if (!window.confirm("Delete this language? Its topics/content will also be deleted because of CASCADE.")) return;
    const { error: deleteError } = await supabase.from("languages").delete().eq("id", id);
    if (deleteError) return setError(deleteError.message);
    await refresh();
    notify("Language deleted.");
  };

  const saveTopic = async (e) => {
    e.preventDefault();
    if (!topicForm.language_id) return setError("Select a language.");
    const payload = {
      language_id: topicForm.language_id,
      slug: topicForm.slug.trim().toLowerCase(),
      title: topicForm.title.trim(),
      sort_order: Number(topicForm.sort_order) || 0,
    };
    const result = topicForm.id
      ? await supabase.from("topics").update(payload).eq("id", topicForm.id)
      : await supabase.from("topics").insert(payload);

    if (result.error) return setError(result.error.message);
    setTopicForm(emptyTopic);
    await refresh();
    notify(topicForm.id ? "Topic updated." : "Topic added.");
  };

  const editTopic = (item) => {
    setTopicForm({
      id: item.id,
      language_id: item.language_id,
      slug: item.slug,
      title: item.title,
      sort_order: item.sort_order,
    });
    setTab("topics");
  };

  const deleteTopic = async (id) => {
    if (!window.confirm("Delete this topic and its lesson content?")) return;
    const { error: deleteError } = await supabase.from("topics").delete().eq("id", id);
    if (deleteError) return setError(deleteError.message);
    await refresh();
    notify("Topic deleted.");
  };

  const loadContent = (item) => {
    setContentForm({
      topic_id: item.topic_id,
      content: JSON.stringify(item.content || [], null, 2),
    });
    setTab("content");
  };

  const newContent = () => {
    setContentForm({ topic_id: "", content: "[]" });
    setTab("content");
  };

  const saveContent = async (e) => {
    e.preventDefault();
    let parsed;
    try {
      parsed = JSON.parse(contentForm.content);
      if (!Array.isArray(parsed)) throw new Error("Content must be a JSON array.");
    } catch (err) {
      return setError(`Invalid JSON: ${err.message}`);
    }

    if (!contentForm.topic_id) return setError("Select a topic.");

    const { error: saveError } = await supabase
      .from("topic_content")
      .upsert(
        { topic_id: contentForm.topic_id, content: parsed, updated_at: new Date().toISOString() },
        { onConflict: "topic_id" }
      );

    if (saveError) return setError(saveError.message);
    await refresh();
    notify("Topic content saved.");
  };

  const deleteContent = async (id) => {
    if (!window.confirm("Delete this topic content?")) return;
    const { error: deleteError } = await supabase.from("topic_content").delete().eq("id", id);
    if (deleteError) return setError(deleteError.message);
    await refresh();
    notify("Content deleted.");
  };

  const editProfile = (p) => {
    setProfileForm({ id: p.id, full_name: p.full_name || "", email: p.email || "" });
    setProfileEditing(true);
    setTab("profiles");
  };

  const newProfile = () => {
    setProfileForm({ id: "", full_name: "", email: "" });
    setProfileEditing(false);
    setTab("profiles");
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    if (!profileForm.id.trim()) {
      return setError("For a new profile, enter the UUID of an existing Supabase Auth user.");
    }

    if (profileEditing) {
      const { error: saveError } = await supabase
        .from("profiles")
        .update({ full_name: profileForm.full_name.trim() || null })
        .eq("id", profileForm.id.trim());

      if (saveError) return setError(saveError.message);
      notify("Profile updated.");
    } else {
      const { error: saveError } = await supabase.from("profiles").insert({
        id: profileForm.id.trim(),
        email: profileForm.email.trim() || null,
        full_name: profileForm.full_name.trim() || null,
      });

      if (saveError) return setError(saveError.message);
      notify("Profile added.");
    }

    setProfileForm({ id: "", full_name: "", email: "" });
    setProfileEditing(false);
    await refresh();
  };

  const deleteProfile = async (id) => {
    if (!window.confirm("Delete this profile row? The Supabase Auth account is NOT deleted.")) return;
    const { error: deleteError } = await supabase.from("profiles").delete().eq("id", id);
    if (deleteError) return setError(deleteError.message);
    await refresh();
    notify("Profile row deleted.");
  };

  if (!isAdmin) {
    return <div className="alert alert-danger m-4">Access denied. Admin access is restricted.</div>;
  }

  return (
    <div className="admin-page">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="fw-bold mb-1"><i className="fas fa-shield-alt text-primary me-2" />Admin Management</h2>
          <p className="text-muted mb-0">Manage Notes content and profiles.</p>
        </div>
        <Link to="/dashboard" className="btn btn-outline-secondary">
          <i className="fas fa-arrow-left me-1" /> Dashboard
        </Link>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="d-flex flex-wrap gap-2 mb-4">
        {[
          ["overview", "Overview", "fa-chart-pie"],
          ["languages", "Languages", "fa-code"],
          ["topics", "Topics", "fa-list"],
          ["content", "Topic Content", "fa-file-code"],
          ["profiles", "Profiles", "fa-users"],
          ["activity", "Activity", "fa-signal"],
        ].map(([key, label, icon]) => (
          <button
            type="button"
            key={key}
            className={`btn ${tab === key ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setTab(key)}
          >
            <i className={`fas ${icon} me-1`} />{label}
          </button>
        ))}
      </div>

      {loading ? <p>Loading admin data...</p> : (
        <>
          {tab === "overview" && (
            <div className="row g-3">
              {[
                ["Languages", languages.length, "fa-code"],
                ["Topics", topics.length, "fa-list"],
                ["Lessons", contents.length, "fa-file-code"],
                ["Profiles", profiles.length, "fa-users"],
                ["Online Now", onlineUsers.length, "fa-signal"],
              ].map(([label, count, icon]) => (
                <div className="col-6 col-lg-3" key={label}>
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <i className={`fas ${icon} fa-2x text-primary mb-3`} />
                      <h6 className="text-muted">{label}</h6>
                      <h2 className="fw-bold">{count}</h2>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "languages" && (
            <section>
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                  <h5 className="fw-bold">{languageForm.id ? "Edit Language" : "Add Language"}</h5>
                  <form onSubmit={saveLanguage} className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Name</label>
                      <input className="form-control" value={languageForm.name} onChange={(e) => setLanguageForm({ ...languageForm, name: e.target.value })} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Slug</label>
                      <input className="form-control" value={languageForm.slug} onChange={(e) => setLanguageForm({ ...languageForm, slug: e.target.value })} placeholder="python" required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Icon class</label>
                      <input className="form-control" value={languageForm.icon} onChange={(e) => setLanguageForm({ ...languageForm, icon: e.target.value })} />
                    </div>
                    <div className="col-md-9">
                      <label className="form-label">Description</label>
                      <input className="form-control" value={languageForm.description || ""} onChange={(e) => setLanguageForm({ ...languageForm, description: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Sort order</label>
                      <input type="number" className="form-control" value={languageForm.sort_order} onChange={(e) => setLanguageForm({ ...languageForm, sort_order: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <button className="btn btn-primary me-2">{languageForm.id ? "Update" : "Add"} Language</button>
                      {languageForm.id && <button type="button" className="btn btn-secondary" onClick={() => setLanguageForm(emptyLanguage)}>Cancel</button>}
                    </div>
                  </form>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-bordered align-middle bg-white">
                  <thead><tr><th>Name</th><th>Slug</th><th>Order</th><th>Actions</th></tr></thead>
                  <tbody>
                    {languages.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td><td><code>{item.slug}</code></td><td>{item.sort_order}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => editLanguage(item)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteLanguage(item.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "topics" && (
            <section>
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                  <h5 className="fw-bold">{topicForm.id ? "Edit Topic" : "Add Topic"}</h5>
                  <form onSubmit={saveTopic} className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Language</label>
                      <select className="form-select" value={topicForm.language_id} onChange={(e) => setTopicForm({ ...topicForm, language_id: e.target.value })} required>
                        <option value="">Select language</option>
                        {languages.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Title</label>
                      <input className="form-control" value={topicForm.title} onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })} required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Slug</label>
                      <input className="form-control" value={topicForm.slug} onChange={(e) => setTopicForm({ ...topicForm, slug: e.target.value })} required />
                    </div>
                    <div className="col-md-1">
                      <label className="form-label">Order</label>
                      <input type="number" className="form-control" value={topicForm.sort_order} onChange={(e) => setTopicForm({ ...topicForm, sort_order: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <button className="btn btn-primary me-2">{topicForm.id ? "Update" : "Add"} Topic</button>
                      {topicForm.id && <button type="button" className="btn btn-secondary" onClick={() => setTopicForm(emptyTopic)}>Cancel</button>}
                    </div>
                  </form>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-bordered align-middle bg-white">
                  <thead><tr><th>Language</th><th>Topic</th><th>Slug</th><th>Order</th><th>Actions</th></tr></thead>
                  <tbody>
                    {topics.map((item) => (
                      <tr key={item.id}>
                        <td>{item.languages?.name || "—"}</td><td>{item.title}</td><td><code>{item.slug}</code></td><td>{item.sort_order}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => editTopic(item)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteTopic(item.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "content" && (
            <section>
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Add / Edit Topic Content</h5>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={newContent}>New</button>
                  </div>
                  <form onSubmit={saveContent}>
                    <div className="mb-3">
                      <label className="form-label">Topic</label>
                      <select className="form-select" value={contentForm.topic_id} onChange={(e) => setContentForm({ ...contentForm, topic_id: e.target.value })} required>
                        <option value="">Select topic</option>
                        {languages.map((lang) => (
                          <optgroup key={lang.id} label={lang.name}>
                            {(topicsByLanguage[lang.id] || []).map((t) => (
                              <option key={t.id} value={t.id}>{t.title}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Content JSON</label>
                      <textarea
  className="form-control font-monospace"
  rows="22"
  value={contentForm.content}
  onChange={(e) =>
    setContentForm({ ...contentForm, content: e.target.value })
  }
  spellCheck="false"
  required
  style={{
    color: "#000000",
    backgroundColor: "#ffffff",
    WebkitTextFillColor: "#000000",
    opacity: 1,
  }}
/>
                      <div className="form-text">
                        Use blocks such as heading, paragraph, code, list, image, note, table and divider.
                      </div>
                    </div>
                    <button className="btn btn-primary">Save Content</button>
                  </form>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-bordered align-middle bg-white">
                  <thead><tr><th>Language</th><th>Topic</th><th>Updated</th><th>Actions</th></tr></thead>
                  <tbody>
                    {contents.map((item) => (
                      <tr key={item.id}>
                        <td>{item.topics?.languages?.name || "—"}</td>
                        <td>{item.topics?.title || "—"}</td>
                        <td>{item.updated_at ? new Date(item.updated_at).toLocaleString() : "—"}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => loadContent(item)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteContent(item.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "profiles" && (
            <section>
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0">{profileEditing ? "Edit Profile" : "Add Profile Row"}</h5>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={newProfile}>New</button>
                  </div>
                  <p className="small text-muted mt-2">
                    Profiles are linked to Supabase Auth users. To add a profile row, the UUID must already exist in <code>auth.users</code>.
                    This panel does not create or delete Auth accounts.
                  </p>
                  <form onSubmit={saveProfile} className="row g-3">
                    <div className="col-md-5">
                      <label className="form-label">Auth User UUID</label>
                      <input
                        className="form-control"
                        value={profileForm.id}
                        onChange={(e) => setProfileForm({ ...profileForm, id: e.target.value })}
                        readOnly={profileEditing}
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Email (add only)</label>
                      <input
                        type="email"
                        className="form-control"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        disabled={profileEditing}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Full name</label>
                      <input className="form-control" value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} />
                    </div>
                    <div className="col-md-1 d-flex align-items-end">
                      <button className="btn btn-primary w-100">{profileEditing ? "Update" : "Add"}</button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-bordered align-middle bg-white">
                  <thead><tr><th>Email</th><th>Name</th><th>User ID</th><th>Created</th><th>Actions</th></tr></thead>
                  <tbody>
                    {profiles.map((p) => (
                      <tr key={p.id}>
                        <td>{p.email || "—"}</td><td>{p.full_name || "—"}</td><td><code className="small">{p.id}</code></td>
                        <td>{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => editProfile(p)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteProfile(p.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "activity" && (
            <section>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {[
                  ["online", "Currently Online", "fa-signal"],
                  ["logins", "Login Activity", "fa-sign-in-alt"],
                  ["visits", "Recent Page Visits", "fa-route"],
                ].map(([key, label, icon]) => (
                  <button
                    type="button"
                    key={key}
                    className={`btn btn-sm ${activitySubTab === key ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setActivitySubTab(key)}
                  >
                    <i className={`fas ${icon} me-1`} />{label}
                  </button>
                ))}
              </div>

              {activitySubTab === "online" && (
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <h5 className="fw-bold mb-3">
                      <span className="badge bg-success me-2">●</span>
                      Currently Online ({onlineUsers.length})
                    </h5>
                    <p className="small text-muted">
                      A user counts as "online" if they've viewed a page in the last 5 minutes. This updates live - no need to refresh the page.
                    </p>
                    <ExportButtons
                      filename="currently-online"
                      columns={[
                        { key: "username", label: "Username" },
                        { key: "email", label: "Email" },
                        { key: "current_page", label: "Current Page" },
                        { key: "device", label: "Device" },
                        { key: "browser", label: "Browser" },
                        { key: "operating_system", label: "OS" },
                        { key: "ip_address", label: "IP" },
                        { key: "last_seen_at", label: "Last Seen" },
                      ]}
                      rows={onlineUsers}
                    />
                    <div className="table-responsive">
                      <table className="table table-bordered align-middle bg-white">
                        <thead>
                          <tr><th>Username</th><th>Email</th><th>Current Page</th><th>Device</th><th>Browser</th><th>OS</th><th>IP</th><th>Last Seen</th></tr>
                        </thead>
                        <tbody>
                          {onlineUsers.length === 0 && (
                            <tr><td colSpan="8" className="text-center text-muted">No one online right now.</td></tr>
                          )}
                          {onlineUsers.map((o) => (
                            <tr key={o.user_id}>
                              <td>{o.username || "—"}</td>
                              <td>{o.email || "—"}</td>
                              <td><code className="small">{o.current_page || "—"}</code></td>
                              <td>{o.device}</td>
                              <td>{o.browser}</td>
                              <td>{o.operating_system}</td>
                              <td><code className="small">{o.ip_address || "—"}</code></td>
                              <td>{new Date(o.last_seen_at).toLocaleTimeString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activitySubTab === "logins" && (
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <h5 className="fw-bold mb-3">Login Activity</h5>
                    <ExportButtons
                      filename="login-activity"
                      columns={[
                        { key: "username", label: "Username" },
                        { key: "email", label: "Email" },
                        { key: "login_count", label: "Login Count" },
                        { key: "login_time", label: "Last Login" },
                      ]}
                      rows={loginActivity}
                    />
                    <div className="table-responsive">
                      <table className="table table-bordered align-middle bg-white">
                        <thead>
                          <tr><th>Username</th><th>Email</th><th>Login Count</th><th>Last Login</th></tr>
                        </thead>
                        <tbody>
                          {loginActivity.map((l) => (
                            <tr key={l.id}>
                              <td>{l.username || "—"}</td>
                              <td>{l.email || "—"}</td>
                              <td>{l.login_count}</td>
                              <td>{l.login_time ? new Date(l.login_time).toLocaleString() : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activitySubTab === "visits" && (
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                      <h5 className="fw-bold mb-0">Recent Page Visits (last 100)</h5>
                      <div className="input-group" style={{ maxWidth: 320 }}>
                        <span className="input-group-text"><i className="fas fa-search" /></span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search username, page, device, IP..."
                          value={visitSearch}
                          onChange={(e) => setVisitSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    <ExportButtons
                      filename="page-visits"
                      columns={[
                        { key: "username", label: "Username" },
                        { key: "page_name", label: "Page" },
                        { key: "device", label: "Device" },
                        { key: "browser", label: "Browser" },
                        { key: "operating_system", label: "OS" },
                        { key: "ip_address", label: "IP" },
                        { key: "visit_time", label: "Time" },
                      ]}
                      rows={filteredVisits}
                    />
                    <div className="table-responsive">
                      <table className="table table-bordered align-middle bg-white">
                        <thead>
                          <tr><th>Username</th><th>Page</th><th>Device</th><th>Browser</th><th>OS</th><th>IP</th><th>Time</th></tr>
                        </thead>
                        <tbody>
                          {filteredVisits.length === 0 && (
                            <tr><td colSpan="7" className="text-center text-muted">No matching visits.</td></tr>
                          )}
                          {filteredVisits.map((v) => (
                            <tr key={v.id}>
                              <td>{v.username || "—"}</td>
                              <td><code className="small">{v.page_name || v.page_url}</code></td>
                              <td>{v.device}</td>
                              <td>{v.browser}</td>
                              <td>{v.operating_system}</td>
                              <td><code className="small">{v.ip_address || "—"}</code></td>
                              <td>{new Date(v.visit_time).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}