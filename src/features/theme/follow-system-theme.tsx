"use client";

import { useEffect } from "react";

const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";

function applyDarkMode(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
}

function restoreSavedTheme() {
  try {
    const stored = localStorage.getItem("syncgram-theme");
    const preference = stored ? JSON.parse(stored).state?.theme : "system";
    const prefersDark = window.matchMedia(SYSTEM_THEME_QUERY).matches;
    applyDarkMode(preference === "dark" || (preference === "system" && prefersDark));
  } catch {
    applyDarkMode(window.matchMedia(SYSTEM_THEME_QUERY).matches);
  }
}

/** Keeps public auth screens aligned with the operating system theme. */
export function FollowSystemTheme() {
  useEffect(() => {
    const media = window.matchMedia(SYSTEM_THEME_QUERY);
    const applySystemTheme = () => applyDarkMode(media.matches);

    applySystemTheme();
    media.addEventListener("change", applySystemTheme);

    return () => {
      media.removeEventListener("change", applySystemTheme);
      restoreSavedTheme();
    };
  }, []);

  return null;
}
