import Link from "next/link";
import { AuthBrandPanel } from "./auth-brand-panel";

/**
 * Centers an auth card and pins the Terms/Privacy line beneath it. With
 * `withPanel`, also renders the fixed brand/reviews panel on the right half
 * (desktop) and constrains BOTH the card and the legal footer to the left half —
 * used by the sign-up page. Without it, everything centers across the full width.
 */
export function AuthCardShell({
  children,
  withPanel = false,
}: {
  children: React.ReactNode;
  withPanel?: boolean;
}) {
  return (
    <>
      {withPanel && <AuthBrandPanel />}
      <div className={"flex flex-1 flex-col " + (withPanel ? "lg:w-1/2" : "")}>
        <div className="flex flex-1 items-center justify-center px-5 py-8">
          <div className="w-full max-w-[440px]">{children}</div>
        </div>

        <div className="px-5 pb-8 text-center text-sm text-text-tertiary">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-2 hover:text-text-secondary"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:text-text-secondary"
          >
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </>
  );
}
