"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  TrendingUp,
  Users,
  Copy,
  ShieldCheck,
  Eye,
  Flame,
  Plus,
  BarChart3,
  Award,
} from "lucide-react";
import { Sparkline } from "@/features/dashboard/components/sparkline";

type StreamCategory = "Forex" | "Crypto" | "Indices" | "Gold" | "Commodities";
type BadgeType =
  | "verified"
  | "high-roi"
  | "popular"
  | "educational"
  | "fast-growing";

interface Stream {
  id: string;
  name: string;
  description: string;
  owner: { name: string; avatar: string; verified: boolean };
  category: StreamCategory;
  stats: {
    roi: number;
    winRate: number;
    trades: number;
    followers: string;
    profitFactor: number;
  };
  chartData: number[];
  badges: BadgeType[];
  risk: "Low" | "Medium" | "High";
  isCopyable: boolean;
}

const MOCK_STREAMS: Stream[] = [
  {
    id: "1",
    name: "Forex Snipers Elite",
    description:
      "Precision entries on EURUSD & GBPUSD during London overlap. Strict risk management.",
    owner: {
      name: "James Forex",
      avatar: "https://picsum.photos/100/100?random=101",
      verified: true,
    },
    category: "Forex",
    stats: {
      roi: 124.5,
      winRate: 72,
      trades: 452,
      followers: "12.4k",
      profitFactor: 2.1,
    },
    chartData: [20, 35, 45, 40, 50, 65, 75, 70, 85, 90],
    badges: ["verified", "high-roi"],
    risk: "Medium",
    isCopyable: true,
  },
  {
    id: "2",
    name: "Gold Rush Pro",
    description:
      "Scalping XAUUSD momentum. High frequency trades with tight stops.",
    owner: {
      name: "Sarah Gold",
      avatar: "https://picsum.photos/100/100?random=102",
      verified: true,
    },
    category: "Gold",
    stats: {
      roi: 340.2,
      winRate: 65,
      trades: 1250,
      followers: "28.1k",
      profitFactor: 1.8,
    },
    chartData: [30, 25, 40, 35, 60, 55, 80, 95, 110, 120],
    badges: ["verified", "popular", "fast-growing"],
    risk: "High",
    isCopyable: true,
  },
  {
    id: "3",
    name: "Crypto Swing DAO",
    description:
      "Long term swing positions on BTC and ETH. Low stress, high reward.",
    owner: {
      name: "BitLord",
      avatar: "https://picsum.photos/100/100?random=103",
      verified: false,
    },
    category: "Crypto",
    stats: {
      roi: 85.0,
      winRate: 45,
      trades: 120,
      followers: "8.2k",
      profitFactor: 3.5,
    },
    chartData: [10, 12, 11, 15, 20, 18, 25, 30, 28, 40],
    badges: [],
    risk: "High",
    isCopyable: true,
  },
  {
    id: "4",
    name: "Indices Intraday",
    description: "Trading the US30 open. Fast paced price action analysis.",
    owner: {
      name: "WallSt Wolf",
      avatar: "https://picsum.photos/100/100?random=104",
      verified: true,
    },
    category: "Indices",
    stats: {
      roi: 62.1,
      winRate: 68,
      trades: 890,
      followers: "15.6k",
      profitFactor: 1.9,
    },
    chartData: [50, 52, 55, 53, 58, 60, 62, 65, 63, 68],
    badges: ["verified"],
    risk: "Medium",
    isCopyable: true,
  },
  {
    id: "5",
    name: "Market Structure 101",
    description:
      "Educational stream focusing on SMC concepts. No copy trading, just learning.",
    owner: {
      name: "Professor Pips",
      avatar: "https://picsum.photos/100/100?random=105",
      verified: true,
    },
    category: "Forex",
    stats: { roi: 0, winRate: 0, trades: 0, followers: "45k", profitFactor: 0 },
    chartData: [20, 22, 25, 28, 30, 35, 40, 42, 45, 48],
    badges: ["educational", "popular"],
    risk: "Low",
    isCopyable: false,
  },
  {
    id: "6",
    name: "Commodity Kings",
    description: "Oil and Gas swing setups based on macro fundamentals.",
    owner: {
      name: "Macro Mike",
      avatar: "https://picsum.photos/100/100?random=106",
      verified: false,
    },
    category: "Commodities",
    stats: {
      roi: 28.4,
      winRate: 55,
      trades: 85,
      followers: "3.2k",
      profitFactor: 1.5,
    },
    chartData: [10, 15, 12, 18, 20, 22, 25, 24, 28, 30],
    badges: ["fast-growing"],
    risk: "Low",
    isCopyable: true,
  },
];

function getGradient(cat: StreamCategory) {
  const map: Record<StreamCategory, string> = {
    Forex: "bg-gradient-to-br from-blue-500 to-indigo-600",
    Crypto: "bg-gradient-to-br from-violet-500 to-fuchsia-600",
    Gold: "bg-gradient-to-br from-amber-400 to-orange-500",
    Indices: "bg-gradient-to-br from-emerald-400 to-teal-600",
    Commodities: "bg-gradient-to-br from-slate-500 to-slate-700",
  };
  return map[cat];
}

function getSparklineColor(cat: StreamCategory) {
  const map: Record<StreamCategory, string> = {
    Forex: "#3B82F6",
    Crypto: "#8B5CF6",
    Gold: "#F59E0B",
    Indices: "#10B981",
    Commodities: "#64748B",
  };
  return map[cat];
}

function StreamCard({ stream }: { stream: Stream }) {
  return (
    <Link
      href={`/stream/${stream.id}`}
      className="relative overflow-hidden rounded-2xl bg-card-bg border border-border-primary shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col h-full"
    >
      {/* Visual Header */}
      <div className={`h-28 ${getGradient(stream.category)} relative`}>
        <div className="absolute top-3 right-3 flex gap-2">
          {stream.badges.includes("high-roi") && (
            <span className="bg-white/90 backdrop-blur-sm text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center shadow-sm">
              <TrendingUp className="h-3 w-3 mr-1" /> Top ROI
            </span>
          )}
          {stream.badges.includes("fast-growing") && (
            <span className="bg-white/90 backdrop-blur-sm text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center shadow-sm">
              <Flame className="h-3 w-3 mr-1" /> Hot
            </span>
          )}
        </div>
        <div className="absolute top-3 left-3">
          <span className="bg-black/20 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
            {stream.category}
          </span>
        </div>
      </div>

      {/* Main Section */}
      <div className="px-5 pb-5 flex-1 flex flex-col">
        <div className="flex justify-between items-end -mt-10 mb-3 relative z-10">
          <div className="relative">
            <img
              src={stream.owner.avatar}
              alt={stream.owner.name}
              className="h-16 w-16 rounded-2xl border-4 border-card-bg shadow-md bg-card-bg object-cover"
            />
            {stream.owner.verified && (
              <div
                className="absolute -bottom-1 -right-1 bg-accent text-white p-0.5 rounded-full border-2 border-card-bg"
                title="Verified Trader"
              >
                <ShieldCheck className="h-3 w-3" />
              </div>
            )}
          </div>
          <div className="bg-bg-tertiary border border-border-primary px-2 py-1 rounded-lg flex items-center mb-1">
            <Users className="h-3 w-3 text-text-tertiary mr-1.5" />
            <span className="text-xs font-bold text-text-primary">
              {stream.stats.followers}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-bold text-text-primary leading-tight group-hover:text-accent transition-colors">
            {stream.name}
          </h3>
          <p className="text-xs text-text-secondary font-medium mt-1">
            {stream.owner.name}
          </p>
          <p className="text-sm text-text-secondary mt-2 line-clamp-2 leading-relaxed h-10">
            {stream.description}
          </p>
        </div>

        {/* Performance Row */}
        {!stream.badges.includes("educational") ? (
          <div className="grid grid-cols-3 gap-2 py-3 border-t border-border-primary mb-4 bg-bg-tertiary/50 rounded-xl px-2">
            <div className="text-center">
              <div className="text-[10px] text-text-tertiary uppercase font-bold mb-0.5">
                Win Rate
              </div>
              <div
                className={`text-sm font-bold ${stream.stats.winRate > 60 ? "text-success" : "text-text-primary"}`}
              >
                {stream.stats.winRate}%
              </div>
            </div>
            <div className="text-center border-l border-border-primary pl-2">
              <div className="text-[10px] text-text-tertiary uppercase font-bold mb-0.5">
                ROI
              </div>
              <div className="text-sm font-bold text-info">
                +{stream.stats.roi}%
              </div>
            </div>
            <div className="relative h-8 w-12 mx-auto opacity-70">
              <Sparkline
                data={stream.chartData}
                color={getSparklineColor(stream.category)}
              />
            </div>
          </div>
        ) : (
          <div className="py-3 border-t border-border-primary mb-4 bg-indigo-500/10 rounded-xl px-4 flex items-center justify-center gap-2 text-indigo-400">
            <Award className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wide">
              Education Only
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto flex gap-2">
          <button className="flex-1 bg-card-bg border border-border-primary text-text-secondary py-2 rounded-lg text-xs font-bold hover:bg-bg-tertiary hover:text-text-primary transition-colors">
            Follow
          </button>
          {stream.isCopyable ? (
            <button className="flex-1 bg-text-primary text-bg-primary py-2 rounded-lg text-xs font-bold hover:opacity-80 transition-opacity flex items-center justify-center">
              <Copy className="h-3 w-3 mr-1.5" /> Copy
            </button>
          ) : (
            <button className="flex-1 bg-indigo-500/10 text-indigo-400 py-2 rounded-lg text-xs font-bold hover:bg-indigo-500/20 transition-colors flex items-center justify-center">
              <Eye className="h-3 w-3 mr-1.5" /> View
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

const discoverFilters = [
  "All",
  "Forex",
  "Crypto",
  "Gold",
  "Indices",
  "Scalping",
  "Swing",
  "Verified Only",
  "Most Copied",
  "Highest ROI",
];

export default function DiscoverPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Discover Streams
          </h1>
          <p className="text-text-secondary mt-1">
            Explore top-performing trading streams by strategy.
          </p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              placeholder="Search streams, traders, strategies..."
              className="w-full bg-card-bg border border-border-primary rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all shadow-sm"
            />
          </div>
          <button className="bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-hover transition-colors shadow-lg flex items-center whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" /> Create Stream
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {discoverFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              activeFilter === filter
                ? "bg-text-primary text-bg-primary border-text-primary shadow-md"
                : "bg-card-bg text-text-secondary border-border-primary hover:border-accent/30 hover:text-accent"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_STREAMS.map((stream) => (
          <StreamCard key={stream.id} stream={stream} />
        ))}

        {/* Promo Card */}
        <div className="relative overflow-hidden rounded-2xl bg-bg-secondary border border-border-primary shadow-xl flex flex-col items-center justify-center p-8 text-center group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="h-14 w-14 bg-bg-tertiary rounded-full flex items-center justify-center mb-4 text-text-tertiary group-hover:text-text-primary group-hover:scale-110 transition-all">
            <BarChart3 className="h-7 w-7" />
          </div>
          <h3 className="text-text-primary font-bold text-lg mb-2">
            Start Streaming
          </h3>
          <p className="text-text-secondary text-sm mb-6 max-w-[200px]">
            Share your trades, build a following, and earn from copiers.
          </p>
          <button className="bg-text-primary text-bg-primary px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-80 transition-opacity">
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}
