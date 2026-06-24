export function generateTabId(): { tabId: string; joinedAt: number } {
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
  return {
    tabId: `Tab ${suffix}`,
    joinedAt: Date.now(),
  };
}
