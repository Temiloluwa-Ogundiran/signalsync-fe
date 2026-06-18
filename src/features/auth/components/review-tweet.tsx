import { BadgeCheck } from "lucide-react";

export interface ReviewTweet {
  name: string;
  handle: string;
  /** 2-char initials for the avatar. */
  initials: string;
  /** Tailwind bg class for the avatar disc. */
  avatarClass: string;
  body: string;
  time: string;
}

/** An X / Twitter-style review card used on the auth brand panel. */
export function ReviewTweetCard({ t }: { t: ReviewTweet }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 p-3 shadow-md ring-1 ring-inset ring-white/10 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${t.avatarClass}`}
        >
          {t.initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-[0.8rem] font-bold text-white">
              {t.name}
            </span>
            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-sky-300" />
          </div>
          <span className="block truncate text-[0.7rem] text-white/55">
            {t.handle}
          </span>
        </div>
        {/* X glyph */}
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className="h-3.5 w-3.5 shrink-0 fill-white/70"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>
      <p className="mt-2 text-[0.8rem] leading-snug text-white/85">{t.body}</p>
      <p className="mt-2 text-[0.65rem] text-white/45">{t.time}</p>
    </div>
  );
}
