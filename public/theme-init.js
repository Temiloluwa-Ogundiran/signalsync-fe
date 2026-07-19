(function () {
  try {
    var path = location.pathname;
    var isAuthRoute = /^\/(login|register|verify-email|forgot-password|reset-password|resend-verification)(\/|$)/.test(path);
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var saved = localStorage.getItem("syncgram-theme");
    var theme = saved ? JSON.parse(saved).state?.theme : "system";
    var dark = isAuthRoute
      ? systemDark
      : path !== "/" && (theme === "dark" || (theme === "system" && systemDark));
    document.documentElement.classList.toggle("dark", dark);
  } catch {
    // The system theme remains the browser default when storage is unavailable.
  }
})();
