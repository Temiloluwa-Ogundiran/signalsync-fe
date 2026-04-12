const SKIP_NEXT_DASHBOARD_AUTO_SYNC_KEY = "journal:skipNextDashboardAutoSync";

/** Call when entering a journal sub-route so the dashboard skips one stale auto-sync on return. */
export function requestSkipNextJournalDashboardAutoSync(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SKIP_NEXT_DASHBOARD_AUTO_SYNC_KEY, "1");
  } catch {
    /* private mode / quota */
  }
}

/** Returns true once per flag; clears the flag so later visits can auto-sync normally. */
export function consumeSkipNextJournalDashboardAutoSync(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(SKIP_NEXT_DASHBOARD_AUTO_SYNC_KEY) !== "1") {
      return false;
    }
    sessionStorage.removeItem(SKIP_NEXT_DASHBOARD_AUTO_SYNC_KEY);
    return true;
  } catch {
    return false;
  }
}
