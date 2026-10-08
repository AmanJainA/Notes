// Lightweight, dependency-free parsing of navigator.userAgent into the
// three fields notes.page_visits wants (device / browser / operating_system).
// Good enough for analytics - not meant to be bullet-proof UA sniffing.
export function getDeviceInfo() {
  const ua = navigator.userAgent || "";

  let device = "Desktop";
  if (/Mobi|Android(?!.*Tablet)|iPhone/i.test(ua)) {
    device = "Mobile";
  } else if (/Tablet|iPad/i.test(ua)) {
    device = "Tablet";
  }

  let browser = "Unknown";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";

  let operating_system = "Unknown";
  if (/Windows NT/i.test(ua)) operating_system = "Windows";
  else if (/Android/i.test(ua)) operating_system = "Android";
  else if (/iPhone|iPad|iOS/i.test(ua)) operating_system = "iOS";
  else if (/Mac OS X/i.test(ua)) operating_system = "macOS";
  else if (/Linux/i.test(ua)) operating_system = "Linux";

  return { device, browser, operating_system };
}

// Best-effort public IP lookup. A browser has no built-in way to know its
// own public IP, so this calls a free, keyless API. If it fails (offline,
// blocked, rate-limited) we just log the visit without an IP rather than
// blocking the page.
export async function getPublicIp() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip || null;
  } catch {
    return null;
  }
}
