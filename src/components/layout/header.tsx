"use client";

import { Sparkles } from "lucide-react";
import { useAiDockStore } from "@/features/ai/store/ai-dock-store";
import { FEATURE_FLAGS } from "@/config/feature-flags";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "./notification-bell";

export function Header() {
  const openAi = useAiDockStore((s) => s.open);

  return (
    <header className="relative z-header flex h-header shrink-0 items-center bg-chrome-bar-bg px-chrome font-sans border-b border-nav-hairline">
      <div className="flex w-full min-w-0 items-center gap-3">
        <div className="min-w-0 flex-1" />

        {/* Right group — global chrome: Ask Partna AI → avatar.
            Account selector + date range live in the page header (ROW 2). */}
        <div className="ml-auto flex min-w-0 shrink-0 items-center justify-end gap-2">
          {FEATURE_FLAGS.AI && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => openAi({ source: "Header" })}
              className="ai-trigger flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[10px] text-xs px-3 py-2 h-9"
            >
              <Sparkles className="ai-trigger__spark h-3.5 w-3.5" />
              Ask Partna AI
            </Button>
          )}

          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
