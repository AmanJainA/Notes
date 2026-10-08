import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error(
    "Missing Supabase env vars. Copy .env.example to .env and fill in " +
      "REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY."
  );
}

// --------------------------------------------------------------------
// Custom-auth token handling (see context/AuthContext.js).
//
// Notes no longer uses supabase.auth.signIn/signUp/auth.users at all.
// Our own Edge Function ("custom-auth") signs a JWT after a successful
// login; we attach it as a plain Authorization header on a fresh
// Supabase client instance so every existing `supabase.from(...)` call
// elsewhere in the app keeps working unchanged (RLS's auth.uid()
// resolves correctly because the JWT's `sub` claim is the profile id).
//
// The exported `supabase` is a Proxy that always forwards to whichever
// client instance is "current", so nothing else in the app needs to
// change when the token is set or cleared.
//
// db.schema stays "notes" - all Notes app tables (including
// notes.profiles) live in that schema, same as before.
// --------------------------------------------------------------------
function buildClient(token) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: "notes" },
    auth: { persistSession: false, autoRefreshToken: false },
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
  });
}

let currentClient = buildClient(null);

export function setAuthToken(token) {
  currentClient = buildClient(token || null);
}

export const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      const value = currentClient[prop];
      return typeof value === "function" ? value.bind(currentClient) : value;
    },
  }
);
