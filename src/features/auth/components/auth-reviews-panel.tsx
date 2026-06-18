"use client";

import { useEffect, useRef, useState } from "react";
import { ReviewTweetCard, type ReviewTweet } from "./review-tweet";

// 9 placeholder reviews — shown 3 at a time, auto-rotating. Bodies are kept to a
// similar length so every card is the same height (and so is each page). Swap
// for real tweets later.
const REVIEWS: ReviewTweet[] = [
  {
    name: "Marcus Vlad",
    handle: "@prop_funded",
    initials: "MV",
    avatarClass: "bg-emerald-500/80",
    body: "It told me I revenge-trade after every red day before lunch. Nobody put it that plainly. Cut my Monday drawdown in half.",
    time: "2:14 PM · Jun 12",
  },
  {
    name: "Aisha K.",
    handle: "@aisha_trades",
    initials: "AK",
    avatarClass: "bg-pink-500/80",
    body: "Synced my MT5 and it read four months of trades in seconds. The 'one thing to fix next' is the best coaching I've paid for.",
    time: "9:03 AM · Jun 9",
  },
  {
    name: "Devon Reyes",
    handle: "@devsetups",
    initials: "DR",
    avatarClass: "bg-amber-500/80",
    body: "Finally a journal that does the journaling. It tags my setups and tells me which one actually makes money. Not the one I thought.",
    time: "6:41 PM · Jun 5",
  },
  {
    name: "Priya N.",
    handle: "@priya_fx",
    initials: "PN",
    avatarClass: "bg-sky-500/80",
    body: "I stopped over-leveraging the week it flagged my position sizing. The honesty is brutal in exactly the way I needed it to be.",
    time: "11:20 AM · Jun 3",
  },
  {
    name: "Sam Cole",
    handle: "@samtrades",
    initials: "SC",
    avatarClass: "bg-violet-500/80",
    body: "It caught that all of my losers come from the NY session. Switched my focus to London and my win rate jumped twelve percent.",
    time: "4:55 PM · May 30",
  },
  {
    name: "Lena Ortiz",
    handle: "@lena_scalps",
    initials: "LO",
    avatarClass: "bg-rose-500/80",
    body: "The day-by-day discipline read is something my mentor never gave me, trade by trade. Honestly worth the subscription for that alone.",
    time: "8:12 AM · May 27",
  },
  {
    name: "Tariq B.",
    handle: "@tariq_trades",
    initials: "TB",
    avatarClass: "bg-teal-500/80",
    body: "Imported my CSV history and within a minute it knew my edge better than I did. Slightly humbling, mostly just incredibly useful.",
    time: "1:38 PM · May 24",
  },
  {
    name: "Mara V.",
    handle: "@mara_pa",
    initials: "MV",
    avatarClass: "bg-indigo-500/80",
    body: "Most journals are just spreadsheets. This one actually coaches you. The setup tagging alone saves me an hour every single week.",
    time: "10:05 AM · May 21",
  },
  {
    name: "Chris O.",
    handle: "@chris_fx",
    initials: "CO",
    avatarClass: "bg-fuchsia-500/80",
    body: "It told me to stop trading after my second loss of the day, so I did. Best month I've had all year by a comfortable margin.",
    time: "7:29 PM · May 18",
  },
];

const PER_PAGE = 3;
const PAGES = Math.ceil(REVIEWS.length / PER_PAGE);
const ROTATE_MS = 5000;
const OUT_MS = 260; // current page leaves fully before the next arrives

export function AuthReviewsPanel() {
  const [page, setPage] = useState(0);
  // "in" = visible/settled; "out" = animating away (mid-swap, page is hidden).
  const [phase, setPhase] = useState<"in" | "out">("in");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const goTo = (next: number) => {
    if (next === page) return;
    // 1) animate the current page out, 2) once gone, swap + animate in.
    setPhase("out");
    const t = setTimeout(() => {
      setPage(next);
      setPhase("in");
    }, OUT_MS);
    timers.current.push(t);
  };

  useEffect(() => {
    const id = setInterval(() => {
      setPhase("out");
      const t = setTimeout(() => {
        setPage((p) => (p + 1) % PAGES);
        setPhase("in");
      }, OUT_MS);
      timers.current.push(t);
    }, ROTATE_MS);
    return () => {
      clearInterval(id);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative z-10 mx-auto w-full max-w-sm">
      <h2 className="text-2xl font-bold leading-tight tracking-tight">
        Activate Your Personal AI Analyst
      </h2>
      <p className="mt-2 text-[0.85rem] leading-relaxed text-white/70">
        Your path to trading with systematic confidence starts now.
      </p>

      {/* Single-page viewport — the current page fully leaves before the next
          arrives, so pages never overlap mid-transition. */}
      <div className="mt-6 min-h-[18rem] overflow-hidden">
        <div
          className={
            "space-y-3 transition-all duration-300 ease-out " +
            (phase === "out"
              ? "-translate-x-4 opacity-0"
              : "translate-x-0 opacity-100")
          }
        >
          {REVIEWS.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE).map((t) => (
            <ReviewTweetCard key={t.handle} t={t} />
          ))}
        </div>
      </div>

      {/* Page dots */}
      <div className="mt-5 flex justify-center gap-1.5">
        {Array.from({ length: PAGES }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Reviews page ${i + 1}`}
            onClick={() => goTo(i)}
            className={
              "h-1.5 rounded-full transition-all " +
              (i === page ? "w-5 bg-white/80" : "w-1.5 bg-white/30")
            }
          />
        ))}
      </div>
    </div>
  );
}
