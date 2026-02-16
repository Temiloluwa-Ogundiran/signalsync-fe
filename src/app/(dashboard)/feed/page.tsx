"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FeedPost, type PostData } from "@/features/feed/components/feed-post";
import { FeedRightPanel } from "@/features/feed/components/feed-right-panel";

const filters = [
  "All",
  "Forex",
  "Gold",
  "Crypto",
  "Scalping",
  "Swing",
  "Indices",
];

const posts: PostData[] = [
  {
    id: "1",
    type: "signal",
    streamName: "XAUUSD Master",
    streamAvatar: "https://picsum.photos/100/100?random=50",
    timestamp: "10m ago",
    tags: ["Gold", "Scalping"],
    content:
      "Quick scallop opportunity on Gold. Rejecting the 15m supply zone.",
    signalData: {
      pair: "XAUUSD",
      action: "SELL",
      entry: "2035.50",
      sl: "2038.00",
      tp: "2030.00",
    },
    likes: 124,
    comments: 18,
  },
  {
    id: "2",
    type: "tweet",
    streamName: "Macro Insights",
    streamAvatar: "https://picsum.photos/100/100?random=51",
    timestamp: "1h ago",
    content:
      "The DXY is hitting a major resistance level. Watch for reversals across major pairs in the next 4h candle close.",
    tweetData: { originalAuthor: "FX_Whale", handle: "@fx_whale_real" },
    likes: 85,
    comments: 42,
  },
  {
    id: "3",
    type: "educational",
    streamName: "Trading Psychology",
    streamAvatar: "https://picsum.photos/100/100?random=52",
    timestamp: "3h ago",
    tags: ["Mindset"],
    content:
      "Revenge trading is the fastest way to blow an account. If you lose 2 trades in a row, walk away from the screens. The market will be there tomorrow.",
    likes: 450,
    comments: 89,
  },
  {
    id: "4",
    type: "signal",
    streamName: "Crypto Scalps",
    streamAvatar: "https://picsum.photos/100/100?random=53",
    timestamp: "4h ago",
    tags: ["BTC", "Crypto"],
    content: "Breakout retest on BTC. Looking for continuation up to 65k.",
    signalData: {
      pair: "BTCUSD",
      action: "BUY",
      entry: "63,400",
      sl: "62,800",
      tp: "65,000",
    },
    likes: 210,
    comments: 56,
  },
];

export default function FeedPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed Column */}
        <div className="lg:col-span-8 xl:col-span-7">
          {/* Header & Filters */}
          <div className="sticky top-0 bg-bg-primary/95 backdrop-blur-sm z-20 py-2 -mx-4 px-4 md:mx-0 md:px-0 mb-4 border-b border-border-primary md:border-none md:bg-transparent md:backdrop-filter-none">
            <div className="flex items-center justify-between mb-4 px-1">
              <h1 className="text-2xl font-bold text-text-primary hidden md:block">
                Feed
              </h1>
              <div className="md:hidden text-lg font-bold text-text-primary">
                Discover
              </div>

              <button className="flex items-center space-x-1 text-xs font-semibold text-text-secondary bg-card-bg border border-border-primary px-3 py-1.5 rounded-lg shadow-sm hover:bg-bg-tertiary transition-colors">
                <span>Latest</span>
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeFilter === filter
                      ? "bg-text-primary text-bg-primary shadow-md transform scale-105"
                      : "bg-card-bg text-text-secondary border border-border-primary hover:border-accent/30 hover:text-accent"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4 min-h-[500px]">
            {posts.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}

            <div className="py-8 text-center">
              <div className="inline-block h-6 w-6 border-2 border-border-primary border-t-accent rounded-full animate-spin mb-2" />
              <p className="text-sm text-text-tertiary">
                Loading more updates...
              </p>
            </div>
          </div>
        </div>

        {/* Right Side Panel (Desktop Only) */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-5 pl-4">
          <div className="sticky top-24">
            <FeedRightPanel />

            {/* Footer Links */}
            <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-xs text-text-tertiary px-2">
              <a href="#" className="hover:underline">
                Privacy
              </a>
              <a href="#" className="hover:underline">
                Terms
              </a>
              <a href="#" className="hover:underline">
                Trading Rules
              </a>
              <a href="#" className="hover:underline">
                Help Center
              </a>
              <span>© 2024 Syncgram</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
