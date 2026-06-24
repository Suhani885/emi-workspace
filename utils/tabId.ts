let memoryTabId: string | null = null;
let memoryJoinedAt: number | null = null;

export function generateTabId(): { tabId: string; joinedAt: number } {
  if (memoryTabId && memoryJoinedAt) {
    return { tabId: memoryTabId, joinedAt: memoryJoinedAt };
  }

  if (typeof window !== "undefined" && window.sessionStorage) {
    const existingId = sessionStorage.getItem("emi_tabId");
    const existingJoinedAt = sessionStorage.getItem("emi_joinedAt");

    if (existingId && existingJoinedAt) {
      memoryTabId = existingId;
      memoryJoinedAt = parseInt(existingJoinedAt, 10);
      sessionStorage.removeItem("emi_tabId");
      sessionStorage.removeItem("emi_joinedAt");

      return { tabId: memoryTabId, joinedAt: memoryJoinedAt };
    }
  }

  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
  memoryTabId = `Tab ${suffix}`;
  memoryJoinedAt = Date.now();

  return { tabId: memoryTabId, joinedAt: memoryJoinedAt };
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    if (memoryTabId && memoryJoinedAt && window.sessionStorage) {
      sessionStorage.setItem("emi_tabId", memoryTabId);
      sessionStorage.setItem("emi_joinedAt", memoryJoinedAt.toString());
    }
  });
}
