"use client";

import { useEffect } from "react";

/**
 * Forces light mode for the subtree it's mounted in (login, signup, and any
 * non-dashboard/public route). The theme system toggles `.dark` on <html>; here
 * we strip it while mounted and restore the user's choice on unmount so the
 * dashboard keeps whatever theme they picked.
 */
export function ForceLight() {
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    if (wasDark) root.classList.remove("dark");
    return () => {
      if (wasDark) root.classList.add("dark");
    };
  }, []);

  return null;
}
