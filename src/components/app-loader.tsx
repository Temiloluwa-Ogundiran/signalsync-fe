import Image from "next/image";

/** SignalSync loading state used by app boot and route transitions. */
export function AppLoader({
  label = "Syncing your workspace…",
  fullScreen = false,
}: {
  label?: string;
  /**
   * When true, covers the whole viewport (fixed overlay) — use only for the
   * pre-auth app-boot loader. Defaults to false: fills its parent container so
   * the loader stays inside the content canvas, not over the app chrome.
   */
  fullScreen?: boolean;
}) {
  return (
    <div
      className={
        fullScreen
          ? "fixed inset-0 z-loader flex flex-col items-center justify-center gap-5 bg-bg-primary font-sans"
          : "relative flex min-h-[50vh] w-full flex-col items-center justify-center gap-5 font-sans"
      }
    >
      <SignalSyncMark />
      <span className="tp-loader-label text-sm text-text-secondary">{label}</span>
    </div>
  );
}

function SignalSyncMark() {
  return (
    <Image
      src="/brand/signalsync-mark.png"
      alt="SignalSync"
      width={128}
      height={128}
      priority
      className="signalsync-loader-mark h-24 w-24 object-contain"
    />
  );
}
