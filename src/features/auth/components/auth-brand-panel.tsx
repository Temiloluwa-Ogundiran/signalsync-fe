import { AuthReviewsPanel } from "./auth-reviews-panel";
import Image from "next/image";

/**
 * The right-half brand panel (desktop only). Keep this surface quiet so the
 * product message and proof points carry the page.
 * Fixed to the right half of the viewport so the page's centered card sits in
 * the remaining left half.
 */
export function AuthBrandPanel() {
  return (
    <div className="fixed inset-y-0 right-0 hidden w-1/2 overflow-hidden border-l border-border-secondary bg-bg-primary text-text-primary lg:flex lg:flex-col lg:justify-center lg:px-14">
      <div className="relative z-10 max-w-lg">
        <Image
          src="/brand/signalsync-mark-cobalt.png"
          alt="SignalSync"
          width={96}
          height={96}
          className="mb-10 h-20 w-20 object-contain"
        />
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          SignalSync
        </p>
        <h2 className="max-w-md font-heading text-4xl font-semibold tracking-tight text-text-primary">
          Review the signal. Improve the decision.
        </h2>
        <p className="mt-5 max-w-md text-base leading-7 text-text-secondary">
          Keep your trades, patterns, and progress in one clear workspace.
        </p>
        <div className="mt-10 border-t border-border-secondary pt-6">
          <AuthReviewsPanel />
        </div>
      </div>
    </div>
  );
}
