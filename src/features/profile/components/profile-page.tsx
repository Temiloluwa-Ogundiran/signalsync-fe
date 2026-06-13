"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { MyStreamsTab } from "./my-streams-tab";
import { MyPostsTab } from "./my-posts-tab";
import { FollowingTab } from "./following-tab";

type Tab = "streams" | "posts" | "following";

export function ProfilePage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>("streams");

  const user = session?.user;
  const displayName = user?.displayName || user?.username || "User";

  const tabs: { key: Tab; label: string }[] = [
    { key: "streams", label: "My Streams" },
    { key: "posts", label: "My Posts" },
    { key: "following", label: "Following" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-linear-to-tr from-accent to-blue-400 p-0.5 shrink-0">
          <div className="w-full h-full rounded-full bg-bg-secondary flex items-center justify-center overflow-hidden">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-accent">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">{displayName}</h1>
          <p className="text-sm text-text-tertiary">@{user?.username}</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border-primary mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors relative ${
              tab === t.key
                ? "text-accent"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            {t.label}
            {tab === t.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "streams" && <MyStreamsTab />}
      {tab === "posts" && <MyPostsTab />}
      {tab === "following" && <FollowingTab />}
    </div>
  );
}
