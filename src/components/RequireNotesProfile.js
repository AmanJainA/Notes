import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import NotesOnboarding from "./Auth/NotesOnboarding";

export default function RequireNotesProfile({ children }) {
  const { user } = useAuth();
  const [status, setStatus] = useState("checking");
  useEffect(() => { if (user) check(); else setStatus("checking"); }, [user]);
  async function check() {
    const { data, error } = await supabase.schema("notes").from("profiles").select("id").eq("id", user.id).maybeSingle();
    if (error) { console.error(error); setStatus("missing"); return; }
    setStatus(data ? "ok" : "missing");
  }
  if (status === "checking") return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;
  if (status === "missing") return <NotesOnboarding onComplete={() => setStatus("ok")} />;
  return children;
}
