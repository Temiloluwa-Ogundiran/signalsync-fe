"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ArrowLeft,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Trophy,
  MessageSquare,
} from "lucide-react";
import { Space, MOCK_SPACES } from "../types";
import { SpaceCard } from "./space-card";
import { CreatePostWidget } from "./create-post-widget";
import { FeedItem } from "./feed-item";
import { CreateSpaceModal } from "./create-space-modal";

export function SpacesPage() {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [activeTab, setActiveTab] = useState<"feed" | "trades" | "leaderboard">(
    "feed",
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleSpaceClick = (space: Space) => {
    setSelectedSpace(space);
    setView("detail");
  };
  const handleBack = () => {
    setView("list");
    setSelectedSpace(null);
  };

  if (view === "list") {
    return (
      <div className="p-4 md:p-8 pb-20 md:pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Community Spaces
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Discover trading hubs, follow top performers, and learn together.
            </p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search spaces..."
                className="w-full bg-card-bg border border-border-primary rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder:text-text-tertiary"
              />
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-text-primary text-bg-primary px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-80 transition-opacity flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" /> Create
            </button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
          {[
            "All Spaces",
            "Forex",
            "Crypto",
            "Indices",
            "Commodities",
            "Verified Only",
          ].map((filter, i) => (
            <button
              key={filter}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${i === 0 ? "bg-accent text-white border-accent" : "bg-card-bg text-text-secondary border-border-primary hover:border-accent/30 hover:text-accent"}`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOCK_SPACES.map((space) => (
            <SpaceCard
              key={space.id}
              space={space}
              onClick={() => handleSpaceClick(space)}
            />
          ))}
        </div>
        <CreateSpaceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onStart={() => setIsCreateModalOpen(false)}
        />
      </div>
    );
  }

  // --- Detail View ---
  return (
    <div className="pb-20 md:pb-8">
      <div className="bg-card-bg rounded-b-2xl md:rounded-2xl border border-border-primary shadow-sm overflow-hidden mb-6 md:mx-4 md:mt-4 lg:mx-8 lg:mt-8">
        <div className="h-32 md:h-48 relative">
          <img
            src={selectedSpace?.image}
            className="w-full h-full object-cover"
            alt="Cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                {selectedSpace?.name}
                {selectedSpace?.isVerified && (
                  <Shield className="h-6 w-6 text-accent ml-2 fill-accent/20" />
                )}
              </h1>
              <div className="flex items-center text-text-secondary text-sm gap-4">
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1.5" /> {selectedSpace?.members}{" "}
                  Members
                </span>
                <span className="flex items-center text-success font-bold">
                  <TrendingUp className="h-4 w-4 mr-1.5" /> ROI{" "}
                  {selectedSpace?.roi}
                </span>
              </div>
            </div>
            <button className="bg-accent text-white px-6 py-2.5 rounded-xl font-bold hover:bg-accent-hover transition-colors shadow-lg w-full md:w-auto">
              Join Space
            </button>
          </div>
        </div>
        <div className="px-4 md:px-6 pt-2">
          <div className="flex space-x-6 overflow-x-auto no-scrollbar">
            {(["feed", "trades", "leaderboard"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-bold capitalize border-b-2 transition-colors ${activeTab === tab ? "border-accent text-accent" : "border-transparent text-text-tertiary hover:text-text-primary"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start px-4 md:px-4 lg:px-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-3 space-y-6 hidden lg:block">
          <div className="bg-card-bg rounded-2xl border border-border-primary p-5 shadow-sm">
            <h3 className="font-bold text-text-primary mb-2">About</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              {selectedSpace?.description}
            </p>
            <h3 className="font-bold text-xs uppercase text-text-tertiary mb-2 mt-4">
              Rules
            </h3>
            <ul className="text-sm text-text-secondary space-y-2 list-disc list-inside">
              <li>Respect all members</li>
              <li>No spam or promotions</li>
              <li>Verify trades before posting</li>
            </ul>
            <div className="pt-4 mt-4 border-t border-border-primary">
              <h3 className="font-bold text-xs uppercase text-text-tertiary mb-3">
                Admins
              </h3>
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <img
                    key={i}
                    src={`https://picsum.photos/50/50?random=${i}`}
                    className="h-8 w-8 rounded-full border-2 border-card-bg"
                    alt="Admin"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center Feed */}
        <div className="lg:col-span-6">
          {activeTab === "feed" && (
            <>
              <CreatePostWidget />
              <FeedItem
                name="Alex Trader"
                stats="Top 10"
                time="2h ago"
                content="Looking at XAUUSD for a potential short if we break below 2030. Market structure shifting bearish on the 1H."
                type="text"
              />
              <FeedItem
                name="Sarah Snipe"
                stats="Admin"
                time="4h ago"
                content="Quick scalp opportunity taken. Setup invalid if we close above 2040."
                type="trade"
              />
              <FeedItem
                name="Crypto King"
                time="6h ago"
                content="BTC reclaiming 63k is huge. Next stop 65k? Charts looking prime for a breakout."
                type="text"
              />
            </>
          )}
          {activeTab === "leaderboard" && (
            <div className="bg-card-bg rounded-2xl border border-border-primary overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border-primary bg-bg-tertiary flex justify-between items-center">
                <h3 className="font-bold text-text-primary">
                  Weekly Top Traders
                </h3>
                <button className="text-xs text-accent font-bold hover:underline">
                  View All
                </button>
              </div>
              <div className="divide-y divide-border-primary">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="p-4 flex items-center justify-between hover:bg-bg-tertiary transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-bold w-6 text-center ${i === 1 ? "text-yellow-500 text-lg" : "text-text-tertiary"}`}
                      >
                        {i}
                      </span>
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://picsum.photos/50/50?random=${10 + i}`}
                          className="h-10 w-10 rounded-full"
                          alt="User"
                        />
                        <div>
                          <h4 className="font-bold text-text-primary text-sm">
                            Trader_{100 + i}
                          </h4>
                          <p className="text-xs text-text-secondary">
                            12 Trades • 90% Win Rate
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-success">
                        +${(1500 - i * 100).toLocaleString()}
                      </div>
                      <div className="text-xs text-success font-medium">
                        ROI +{35 - i}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-3 space-y-6 hidden lg:block">
          <div className="bg-card-bg rounded-2xl border border-border-primary p-5 shadow-sm">
            <h3 className="font-bold text-text-primary mb-4 flex items-center">
              <Zap className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500" />{" "}
              Space Performance
            </h3>
            <div className="space-y-4">
              {[
                {
                  label: "Weekly P&L",
                  value: "+$142,050",
                  color: "text-success",
                },
                {
                  label: "Active Signals",
                  value: "24",
                  color: "text-text-primary",
                },
                { label: "Avg Win Rate", value: "68%", color: "text-info" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">{label}</span>
                  <span className={`text-sm font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-1">Trading Competition</h3>
              <p className="text-indigo-100 text-xs mb-3">
                Join the weekly sprint. Top 3 traders win cash prizes.
              </p>
              <button className="bg-white text-indigo-700 text-xs font-bold px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors w-full">
                Register Now
              </button>
            </div>
            <Trophy className="absolute -bottom-4 -right-4 h-24 w-24 text-white opacity-10 rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
