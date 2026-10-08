import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function NotesOnboarding({ onComplete }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const { error } = await supabase.schema("notes").from("profiles").upsert({
      id: user.id,
      full_name: name,
      username: name,
      email: user.email,
      notes_enabled: true,
    });
    if (error) setError(error.message);
    else onComplete();
    setSaving(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3">
        <h1 className="font-semibold text-lg">Set up your Notes account</h1>
        <p className="text-sm text-muted">
          You're signed in as {user.email}, but haven't used Notes before — finish setup to continue.
        </p>
        <input
          className="input"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button disabled={saving} className="btn-primary w-full">
          {saving ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}