const TAB_COUNTER_KEY = "emi_tab_counter";
const TAB_ID_KEY = "emi_tab_id";

export function generateTabId(): string {
  const existing = sessionStorage.getItem(TAB_ID_KEY);
  if (existing) return existing;

  const raw = localStorage.getItem(TAB_COUNTER_KEY);
  const count = raw ? parseInt(raw, 10) + 1 : 1;
  localStorage.setItem(TAB_COUNTER_KEY, String(count));

  const id = `Tab ${String(count).padStart(2, "0")}`;
  sessionStorage.setItem(TAB_ID_KEY, id);
  return id;
}