import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, setAuthToken } from "../lib/supabaseClient";

const AuthContext = createContext(null);
const SESSION_KEY = "notes_session_v2";

async function callAuth(action, payload) {
  const { data, error } = await supabase.functions.invoke("custom-auth", {
    body: {
      action,
      app: "notes",
      ...payload,
    },
  });

  // No Supabase-level error
  if (!error) {
    if (data?.error) {
      return {
        data: null,
        error: new Error(data.error),
      };
    }

    return {
      data,
      error: null,
    };
  }

  // Supabase FunctionsHttpError:
  // error.context contains the actual Edge Function Response.
  let message = null;

  try {
    const response = error.context;

    if (response && typeof response.clone === "function") {
      const responseText = await response.clone().text();

      if (responseText) {
        try {
          const responseData = JSON.parse(responseText);

          message =
            responseData?.error ||
            responseData?.message ||
            responseData?.error_description ||
            null;
        } catch {
          // If response isn't JSON, use the raw response text
          message = responseText;
        }
      }
    }
  } catch (parseError) {
    console.error("[callAuth] Error parsing Edge Function response:", parseError);
  }

  // IMPORTANT:
  // Return the actual Edge Function message
  // instead of:
  // "Edge Function returned a non-2xx status code"
  return {
    data: null,
    error: new Error(
      message ||
        (error.message === "Edge Function returned a non-2xx status code"
          ? "Something went wrong. Please try again."
          : error.message || "Something went wrong. Please try again.")
    ),
  };
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.expiresAt || Date.now() > parsed.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveSession(sessionObj) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionObj));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

// Records/updates this user's row in the admin dashboard's Login Activity
// table. Reads the current count first (rather than a blind upsert) since
// we don't know the exact unique-constraint name on this pre-existing
// table, and a select-then-write is safe either way. Never throws - a
// tracking hiccup should never block someone from actually signing in.
async function recordLoginActivity(profile) {
  if (!profile?.id) return;
  try {
    const { data: existing } = await supabase
      .from("login_activity")
      .select("id, login_count")
      .eq("user_id", profile.id)
      .maybeSingle();

    const payload = {
      user_id: profile.id,
      username: profile.full_name || profile.username || null,
      email: profile.email,
      login_time: new Date().toISOString(),
      login_count: (existing?.login_count || 0) + 1,
    };

    if (existing) {
      await supabase.from("login_activity").update(payload).eq("id", existing.id);
    } else {
      await supabase.from("login_activity").insert(payload);
    }
  } catch (err) {
    console.error("Could not record login activity:", err);
  }
}

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existing = loadSession();
    if (existing) {
      setAuthToken(existing.token);
      setProfile(existing.profile);
    }
    setLoading(false);
  }, []);

  const signUp = async (email, password, fullName) => {
    return callAuth("signup", { name: fullName.trim(), email: email.trim().toLowerCase(), password });
  };

  const signIn = async (email, password) => {
    const result = await callAuth("login", { email: email.trim().toLowerCase(), password });
    if (result.error) return result;
    saveSession({ token: result.data.token, expiresAt: Date.now() + result.data.expiresIn * 1000, profile: result.data.profile });
    setAuthToken(result.data.token);
    setProfile(result.data.profile);
    recordLoginActivity(result.data.profile); // fire-and-forget, doesn't block sign-in
    return result;
  };

  const signOut = async () => {
    clearSession();
    setAuthToken(null);
    setProfile(null);
    window.location.assign(new URL("/Notes/login", window.location.origin).href);
  };

  const resendVerification = (email) => callAuth("resend_verification", { email: email.trim().toLowerCase() });

  const verifyEmail = (token) => callAuth("verify_email", { token });

  const resetPassword = (email) => callAuth("request_reset", { email: email.trim().toLowerCase() });

  const resetPasswordWithToken = (token, newPassword) => callAuth("reset_password", { token, newPassword });

  const changePassword = (currentPassword, newPassword) => callAuth("change_password", { currentPassword, newPassword });

  const refreshProfile = async () => {
    if (!profile?.id) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", profile.id).maybeSingle();
    if (data) {
      setProfile(data);
      const existing = loadSession();
      if (existing) saveSession({ ...existing, profile: data });
    }
  };

  const value = {
    user: profile,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resendVerification,
    verifyEmail,
    resetPassword,
    resetPasswordWithToken,
    changePassword,
    refreshProfile,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);