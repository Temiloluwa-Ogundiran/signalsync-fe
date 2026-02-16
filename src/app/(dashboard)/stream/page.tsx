"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Target,
  ShieldCheck,
  Copy,
  MessageCircle,
  ExternalLink,
  Mic,
  Calendar,
} from "lucide-react";
import { FeedPost, type PostData } from "@/features/feed/components/feed-post";

// --- Main Page ---

export default function StreamPage() {
  const [activeTab, setActiveTab] = useState<
    "posts" | "trades" | "performance" | "spaces" | "about"
  >("posts");

  const streamData = {
    name: "Gold Killers",
    avatar: "https://picsum.photos/100/100?random=50",
    description:
      "High probability scalping setups on XAUUSD. London and NY Sessions only. Strict risk management.",
    owner: {
      name: "Sarah Snipe",
      avatar: "https://picsum.photos/100/100?random=99",
    },
    stats: { followers: "12.5k", winRate: "78%", roi: "+420%", trades: 1450 },
    tags: ["Gold", "Scalping", "High Frequency"],
  };

  const tabs = [
    { id: "posts", label: "Posts" },
    { id: "trades", label: "Trades" },
    { id: "performance", label: "Performance" },
    { id: "spaces", label: "Spaces" },
    { id: "about", label: "About" },
  ];

  const posts: PostData[] = [
    {
      id: "1",
      type: "signal",
      streamName: streamData.name,
      streamAvatar: streamData.avatar,
      timestamp: "2h ago",
      tags: ["Gold"],
      content: "Quick scalp long. Rejecting 2020 support.",
      signalData: {
        pair: "XAUUSD",
        action: "BUY",
        entry: "2021.00",
        sl: "2018.00",
        tp: "2025.00",
      },
      likes: 89,
      comments: 12,
    },
    {
      id: "2",
      type: "educational",
      streamName: streamData.name,
      streamAvatar: streamData.avatar,
      timestamp: "5h ago",
      content:
        "Remember: In ranging markets, buy support and sell resistance. Do not chase breakout candles until confirmed.",
      likes: 210,
      comments: 45,
    },
  ];

  const statItems = [
    {
      icon: Users,
      label: "Followers",
      value: streamData.stats.followers,
      color: "bg-accent-light text-accent",
    },
    {
      icon: Target,
      label: "Win Rate",
      value: streamData.stats.winRate,
      color: "bg-success-light text-success",
    },
    {
      icon: TrendingUp,
      label: "ROI (All time)",
      value: streamData.stats.roi,
      color: "bg-indigo-500/10 text-indigo-400",
    },
    {
      icon: ShieldCheck,
      label: "Total Trades",
      value: streamData.stats.trades,
      color: "bg-bg-tertiary text-text-secondary",
    },
  ];

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8">
      {/* Back */}
      <div className="mb-4">
        <Link
          href="/feed"
          className="flex items-center text-sm font-medium text-text-tertiary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Feed
        </Link>
      </div>

      {/* Stream Header */}
      <div className="bg-card-bg rounded-2xl border border-border-primary shadow-sm overflow-hidden mb-6">
        <div className="h-24 bg-gradient-to-r from-bg-tertiary to-bg-secondary relative">
          <div className="absolute top-4 right-4 flex space-x-2">
            <span className="bg-white/10 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-text-secondary uppercase">
              Public Stream
            </span>
          </div>
        </div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-10 mb-6 gap-4">
            <img
              src={streamData.avatar}
              alt={streamData.name}
              className="h-20 w-20 rounded-xl border-4 border-card-bg shadow-md bg-card-bg"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-text-primary flex items-center">
                {streamData.name}{" "}
                <ShieldCheck
                  className="h-5 w-5 text-accent ml-2"
                  fill="currentColor"
                  fillOpacity={0.2}
                />
              </h1>
              <p className="text-text-secondary text-sm mt-1 max-w-xl">
                {streamData.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {streamData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-bg-tertiary text-text-secondary text-xs font-semibold rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center bg-card-bg border border-border-primary text-text-secondary px-4 py-2 rounded-lg font-medium text-sm hover:bg-bg-tertiary transition-colors">
                Following
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center bg-accent text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-accent-hover shadow-sm transition-all">
                <Copy className="h-4 w-4 mr-2" /> Copy Trades
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-border-primary">
            {statItems.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-text-tertiary font-medium uppercase">
                    {label}
                  </div>
                  <div className="text-lg font-bold text-text-primary">
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 bg-bg-primary/95 backdrop-blur-md z-20 -mx-4 px-4 md:-mx-8 md:px-8 mb-6 border-b border-border-primary">
        <div className="flex space-x-6 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? "border-accent text-accent" : "border-transparent text-text-tertiary hover:text-text-primary"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "posts" && (
          <div className="max-w-2xl">
            {posts.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}
            <div className="text-center py-6 text-sm text-text-tertiary">
              End of recent updates
            </div>
          </div>
        )}
        {activeTab === "trades" && (
          <div className="bg-card-bg rounded-xl border border-border-primary overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-bg-tertiary text-text-tertiary font-medium border-b border-border-primary">
                <tr>
                  <th className="px-4 py-3">Pair</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3 hidden md:table-cell">Time</th>
                  <th className="px-4 py-3 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr
                    key={i}
                    className="hover:bg-bg-tertiary transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-text-primary">
                      XAUUSD
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${i % 2 === 0 ? "bg-success-light text-success" : "bg-danger-light text-danger"}`}
                      >
                        {i % 2 === 0 ? "BUY" : "SELL"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">2035.50</td>
                    <td className="px-4 py-3 text-text-tertiary hidden md:table-cell">
                      Oct 24, 14:30
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-success">
                      +45 pips
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-3 bg-bg-tertiary border-t border-border-primary text-center">
              <button className="text-sm font-medium text-accent hover:underline">
                View All History
              </button>
            </div>
          </div>
        )}
        {activeTab === "performance" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card-bg p-6 rounded-xl border border-border-primary shadow-sm">
              <h3 className="text-sm font-bold text-text-primary mb-4">
                Equity Curve (Oct)
              </h3>
              <div className="h-48 flex items-end justify-between space-x-1">
                {[40, 45, 30, 60, 55, 70, 85, 80, 95, 100].map((h, i) => (
                  <div
                    key={i}
                    className="w-full bg-bg-tertiary rounded-t-sm hover:opacity-80 transition-opacity relative group"
                  >
                    <div
                      style={{ height: `${h}%` }}
                      className="bg-accent rounded-t-sm"
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-bg-tertiary text-text-primary text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      +{h}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card-bg p-6 rounded-xl border border-border-primary shadow-sm">
              <h3 className="text-sm font-bold text-text-primary mb-4">
                Monthly Analytics
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Profit Factor",
                    value: "2.45",
                    color: "text-text-primary",
                  },
                  { label: "Avg Win", value: "+$450", color: "text-success" },
                  { label: "Avg Loss", value: "-$120", color: "text-danger" },
                  {
                    label: "Sharpe Ratio",
                    value: "1.8",
                    color: "text-text-primary",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center pb-2 border-b border-border-primary last:border-0"
                  >
                    <span className="text-text-secondary text-sm">{label}</span>
                    <span className={`font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === "spaces" && (
          <div className="space-y-4 max-w-2xl">
            <div className="bg-card-bg p-4 rounded-xl border border-border-primary shadow-sm flex items-start">
              <div className="bg-danger-light text-danger p-3 rounded-lg mr-4">
                <Mic className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-text-primary">
                    NY Session Live Trading
                  </h3>
                  <span className="px-2 py-1 bg-danger-light text-danger text-xs font-bold rounded uppercase">
                    Live Now
                  </span>
                </div>
                <p className="text-sm text-text-secondary mt-1">
                  Join us as we trade the CPI data release live.
                </p>
                <button className="mt-3 w-full bg-text-primary text-bg-primary py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity">
                  Join Listening
                </button>
              </div>
            </div>
            <div className="bg-card-bg p-4 rounded-xl border border-border-primary shadow-sm flex items-start opacity-75">
              <div className="bg-bg-tertiary text-text-tertiary p-3 rounded-lg mr-4">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-text-primary">
                    Weekly Outlook
                  </h3>
                  <span className="text-xs text-text-tertiary">
                    Recorded 2 days ago
                  </span>
                </div>
                <p className="text-sm text-text-secondary mt-1">
                  Reviewing setups for the week ahead.
                </p>
                <button className="mt-3 w-full border border-border-primary text-text-secondary py-2 rounded-lg text-sm font-medium hover:bg-bg-tertiary transition-colors">
                  Play Recording
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === "about" && (
          <div className="bg-card-bg p-6 rounded-xl border border-border-primary shadow-sm max-w-2xl">
            <h3 className="font-bold text-lg text-text-primary mb-4">
              About this Strategy
            </h3>
            <p className="text-text-secondary leading-relaxed mb-6">
              Gold Killers focuses on high-volatility moves during the London
              and New York overlaps. We use a combination of Order Block theory
              and Fibonacci retracements to find sniper entries.
              <br />
              <br />
              Rules for copiers:
              <br />
              1. Minimum balance: $500
              <br />
              2. Recommended leverage: 1:100
              <br />
              3. Do not intervene manually in trades.
            </p>
            <div className="flex flex-col space-y-3 pt-4 border-t border-border-primary">
              <a
                href="#"
                className="flex items-center text-accent hover:underline text-sm font-medium"
              >
                <ExternalLink className="h-4 w-4 mr-2" /> View Verified MyFxBook
              </a>
              <a
                href="#"
                className="flex items-center text-accent hover:underline text-sm font-medium"
              >
                <MessageCircle className="h-4 w-4 mr-2" /> Join Telegram Channel
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
