import { AuthReviewsPanel } from "./auth-reviews-panel";

/**
 * The right-half brand panel (desktop only): layered indigo background —
 * concentric rings + glow + noise grain — with the rotating reviews carousel.
 * Fixed to the right half of the viewport so the page's centered card sits in
 * the remaining left half.
 */
export function AuthBrandPanel() {
  return (
    <div className="fixed inset-y-0 right-0 hidden w-1/2 overflow-hidden bg-gradient-to-br from-auth-brand-from via-auth-brand-via to-auth-brand-to text-white lg:flex lg:flex-col lg:justify-center lg:px-14">
      {/* Layer 1: concentric rings */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-1/4 top-[-10%] h-[140%] w-[140%] rounded-full opacity-[0.18]"
        style={{
          background:
            "repeating-radial-gradient(circle at 60% 30%, transparent 0, transparent 78px, rgba(255,255,255,0.6) 79px, transparent 80px)",
        }}
      />
      {/* Layer 2: soft glow orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-white/15 blur-[120px]"
      />
      {/* Layer 3: noise grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <AuthReviewsPanel />
    </div>
  );
}
