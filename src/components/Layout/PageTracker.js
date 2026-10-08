import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { getDeviceInfo, getPublicIp } from "../../lib/deviceInfo";

// Renders nothing - just watches the route and logs a notes.page_visits
// row on every navigation. Mount this once, inside <BrowserRouter> but
// above <Routes>, so it sees every page (public and protected alike).
export default function PageTracker() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { device, browser, operating_system } = getDeviceInfo();
      const ip_address = await getPublicIp();
      if (cancelled) return;

      await supabase.from("page_visits").insert({
        user_id: user?.id ?? null,
        username: user?.full_name ?? null,
        // location.pathname is already relative to the router's
        // basename="/Notes" (react-router strips it), so this is
        // exactly "/admindashboard", "/learn/c/introduction", etc. -
        // the part after /Notes - which is what tells the admin
        // exactly where a user currently is.
        page_name: location.pathname,
        device,
        browser,
        operating_system,
        page_url: window.location.href,
        ip_address,
      });
    })();

    return () => {
      cancelled = true;
    };
    // Re-run whenever the route changes AND whenever the logged-in user
    // itself changes (e.g. right after signIn/signOut). Without user?.id
    // here, a login that navigates to a new page can fire this effect
    // BEFORE AuthContext's `user` state has actually updated - logging
    // that page visit with user_id: null, which then makes the person
    // never show up in notes.currently_online after logging back in.
    // Depending on user?.id too means the moment `user` does settle, this
    // re-fires and logs a corrected row for the same page.
  }, [location.pathname, user?.id]);

  return null;
}