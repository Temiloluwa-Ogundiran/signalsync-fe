/**
 * Branded loading state. "TP" = TradePartna and Take Profit — a single price
 * line draws up to a take-profit level. Monochrome, minimal, no gradients/glow.
 */
export function AppLoader({
  label = "Loading",
  fullScreen = true,
}: {
  label?: string;
  /** When false, fills its parent container instead of covering the viewport. */
  fullScreen?: boolean;
}) {
  return (
    <div
      className={
        fullScreen
          ? "fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-bg-primary font-sans"
          : "relative flex min-h-[50vh] w-full flex-col items-center justify-center gap-5 font-sans"
      }
    >
      <TpMark />
      <span className="tp-loader-label text-xs font-medium uppercase tracking-[0.2em] text-text-tertiary">
        {label}
      </span>
    </div>
  );
}

/**
 * "TP" letters with a price line that draws from a low entry up to the TP level,
 * marked by a horizontal target tick. Monochrome; the line loops.
 */
function TpMark() {
  return (
    <svg
      viewBox="0 0 180 96"
      className="h-[64px] w-[120px]"
      fill="none"
      role="img"
      aria-label="TradePartna"
    >
      {/* TP target level — a thin dashed line the price climbs to */}
      <line
        x1="8"
        y1="22"
        x2="172"
        y2="22"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
        strokeDasharray="3 4"
      />

      {/* "T" */}
      <g stroke="#F4F4F5" strokeWidth="7">
        <line x1="18" y1="40" x2="66" y2="40" />
        <line x1="42" y1="40" x2="42" y2="84" />
      </g>

      {/* "P" */}
      <g stroke="#F4F4F5" strokeWidth="7" strokeLinejoin="miter">
        <line x1="92" y1="40" x2="92" y2="84" />
        <path d="M92 40 H120 A14 14 0 0 1 120 68 H92" fill="none" />
      </g>

      {/* Take-profit price line: climbs from low to the TP level (y=22) */}
      <polyline
        className="tp-priceline"
        points="10,80 44,66 80,72 116,40 168,22"
        stroke="#A1A1AA"
        strokeWidth="2.5"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
      {/* Square marker landing on the TP level */}
      <rect className="tp-target" x="165" y="19" width="6" height="6" fill="#F4F4F5" />
    </svg>
  );
}
