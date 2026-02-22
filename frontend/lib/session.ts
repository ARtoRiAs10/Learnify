const SESSION_KEY = "learnai_session_id";

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    // SSR fallback — won't persist but won't crash
    return `session_${Date.now()}`;
  }
  const stored = localStorage.getItem(SESSION_KEY);
  if (stored) return stored;
  const newId = `session_${Date.now()}`;
  localStorage.setItem(SESSION_KEY, newId);
  return newId;
}

export function resetSessionId(): string {
  const newId = `session_${Date.now()}`;
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, newId);
  }
  return newId;
}

export function getCurrentSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}
