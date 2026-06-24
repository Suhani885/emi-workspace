export function generateTabId(): { tabId: string; joinedAt: number } {
  if (typeof window !== "undefined" && window.sessionStorage) {
    const existingId = sessionStorage.getItem("emi_tabId");
    const existingJoinedAt = sessionStorage.getItem("emi_joinedAt");
    if (existingId && existingJoinedAt) {
      return { tabId: existingId, joinedAt: parseInt(existingJoinedAt, 10) };
    }
  }

  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
  const tabId = `Tab ${suffix}`;
  const joinedAt = Date.now();

  if (typeof window !== "undefined" && window.sessionStorage) {
    sessionStorage.setItem("emi_tabId", tabId);
    sessionStorage.setItem("emi_joinedAt", joinedAt.toString());
  }

  return { tabId, joinedAt };
}
