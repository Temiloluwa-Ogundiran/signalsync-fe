"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  TrendingUp,
  MessageSquare,
  ArrowLeft,
  Plus,
  Image as ImageIcon,
  BarChart2,
  MoreHorizontal,
  Heart,
  Repeat,
  Share,
  Shield,
  Trophy,
  Zap,
  X,
  Globe,
  Lock,
  Mic,
  Video,
  Monitor,
  Calendar,
} from "lucide-react";

// --- Types & Data ---

interface Space {
  id: string;
  name: string;
  description: string;
  members: string;
  roi: string;
  tags: string[];
  image: string;
  isVerified: boolean;
  activeTraders: number;
}

const MOCK_SPACES: Space[] = [
  {
    id: "1",
    name: "ICT Inner Circle",
    description: "Mastering smart money concepts and institutional order flow.",
    members: "14.2k",
    roi: "+125%",
    tags: ["Forex", "Smart Money"],
    image: "https://picsum.photos/400/200?random=1",
    isVerified: true,
    activeTraders: 1240,
  },
  {
    id: "2",
    name: "Crypto Degens",
    description: "High risk, high reward altcoin setups and memecoin hunting.",
    members: "8.5k",
    roi: "+450%",
    tags: ["Crypto", "High Risk"],
    image: "https://picsum.photos/400/200?random=2",
    isVerified: false,
    activeTraders: 850,
  },
  {
    id: "3",
    name: "Gold Scalpers",
    description: "Sniper entries on XAUUSD during London & NY sessions.",
    members: "22k",
    roi: "+85%",
    tags: ["Gold", "Scalping"],
    image: "https://picsum.photos/400/200?random=3",
    isVerified: true,
    activeTraders: 3100,
  },
  {
    id: "4",
    name: "Indices Futures",
    description: "Daily analysis and live trading for US30 and NAS100.",
    members: "5.1k",
    roi: "+62%",
    tags: ["Indices", "Futures"],
    image: "https://picsum.photos/400/200?random=4",
    isVerified: false,
    activeTraders: 420,
  },
];

// --- Sub-Components ---

function SpaceCard({ space, onClick }: { space: Space; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-card-bg rounded-2xl border border-border-primary overflow-hidden cursor-pointer hover:shadow-lg hover:border-accent/30 transition-all group flex flex-col h-full"
    >
      <div className="h-24 bg-bg-tertiary relative overflow-hidden">
        <img
          src={space.image}
          alt={space.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded flex items-center">
          <TrendingUp className="h-3 w-3 mr-1 text-success" /> {space.roi}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-text-primary text-lg group-hover:text-accent transition-colors flex items-center">
            {space.name}
            {space.isVerified && (
              <Shield className="h-4 w-4 text-accent ml-1 fill-accent/10" />
            )}
          </h3>
        </div>
        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
          {space.description}
        </p>
        <div className="mt-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            {space.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-bg-tertiary text-text-tertiary border border-border-primary text-[10px] font-bold uppercase rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border-primary">
            <div className="flex items-center text-xs text-text-tertiary font-medium">
              <Users className="h-3 w-3 mr-1" /> {space.members} Members
            </div>
            <button className="text-xs font-bold text-accent bg-accent-light px-3 py-1.5 rounded-lg hover:bg-accent/20 transition-colors">
              Join Space
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreatePostWidget() {
  return (
    <div className="bg-card-bg rounded-xl border border-border-primary p-4 mb-6 shadow-sm">
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-full bg-bg-tertiary flex-shrink-0">
          <img
            src="https://picsum.photos/100/100?random=100"
            className="h-full w-full rounded-full object-cover"
            alt="User"
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Share a trade idea or market thought..."
            className="w-full bg-bg-tertiary border border-border-primary rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-card-bg transition-all placeholder:text-text-tertiary"
          />
          <div className="flex justify-between items-center mt-3">
            <div className="flex gap-2">
              <button
                className="p-2 text-text-tertiary hover:text-accent hover:bg-accent-light rounded-lg transition-colors"
                title="Add Chart"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
              <button
                className="p-2 text-text-tertiary hover:text-success hover:bg-success-light rounded-lg transition-colors"
                title="Link Trade"
              >
                <BarChart2 className="h-4 w-4" />
              </button>
            </div>
            <button className="bg-accent text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-accent-hover transition-colors shadow-sm">
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedItem({
  name,
  time,
  content,
  type,
  stats,
}: {
  name: string;
  time: string;
  content: string;
  type: "text" | "trade";
  stats?: string;
}) {
  return (
    <div className="bg-card-bg rounded-xl border border-border-primary p-5 mb-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3">
          <img
            src={`https://picsum.photos/100/100?random=${name.length}`}
            className="h-10 w-10 rounded-full object-cover"
            alt={name}
          />
          <div>
            <div className="flex items-center gap-1">
              <h4 className="font-bold text-text-primary text-sm hover:underline">
                {name}
              </h4>
              {stats && (
                <span className="text-[10px] bg-success-light text-success px-1.5 rounded font-bold border border-success/20">
                  {stats}
                </span>
              )}
            </div>
            <span className="text-xs text-text-tertiary">{time}</span>
          </div>
        </div>
        <button className="text-text-tertiary hover:text-text-secondary">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <p className="text-text-secondary text-sm mb-4 leading-relaxed whitespace-pre-line">
        {content}
      </p>
      {type === "trade" && (
        <div className="bg-bg-tertiary border border-border-primary rounded-xl p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-success-light text-success p-2 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-text-tertiary uppercase">
                Long Signal
              </div>
              <div className="font-bold text-text-primary text-sm">
                XAUUSD @ 2035.50
              </div>
            </div>
          </div>
          <button className="bg-text-primary text-bg-primary text-xs font-bold px-3 py-2 rounded-lg hover:opacity-80 flex items-center gap-1">
            <Zap className="h-3 w-3" /> Copy Trade
          </button>
        </div>
      )}
      <div className="flex items-center justify-between pt-3 border-t border-border-primary text-text-tertiary">
        <button className="flex items-center gap-1.5 text-xs font-medium hover:text-accent transition-colors">
          <MessageSquare className="h-4 w-4" /> 12
        </button>
        <button className="flex items-center gap-1.5 text-xs font-medium hover:text-success transition-colors">
          <Repeat className="h-4 w-4" /> 4
        </button>
        <button className="flex items-center gap-1.5 text-xs font-medium hover:text-danger transition-colors">
          <Heart className="h-4 w-4" /> 56
        </button>
        <button className="flex items-center gap-1.5 text-xs font-medium hover:text-text-secondary transition-colors">
          <Share className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// --- Create Space Modal ---
function CreateSpaceModal({
  isOpen,
  onClose,
  onStart,
}: {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}) {
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card-bg rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border-primary flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Create a Space
            </h2>
            <p className="text-sm text-text-secondary">
              Host a live trading session or discussion.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-tertiary rounded-full text-text-tertiary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">
                Space Name
              </label>
              <input
                type="text"
                className="w-full border border-border-primary bg-card-bg rounded-xl px-4 py-2.5 text-sm text-text-primary focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
                placeholder="e.g. NY Session Live Trading"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">
                Description
              </label>
              <textarea
                className="w-full border border-border-primary bg-card-bg rounded-xl px-4 py-2.5 text-sm text-text-primary focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none resize-none h-20"
                placeholder="What will you be discussing or trading?"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-2">
              Visibility
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: "public" as const, icon: Globe, label: "Public" },
                { val: "private" as const, icon: Lock, label: "Invite Only" },
              ].map(({ val, icon: Icon, label }) => (
                <button
                  key={val}
                  onClick={() => setVisibility(val)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${visibility === val ? "border-accent bg-accent-light text-accent" : "border-border-primary hover:border-text-tertiary text-text-secondary"}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-bold">{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-3">
              Audience Permissions
            </label>
            <div className="space-y-3">
              {[
                { icon: Video, label: "Allow audience video", on: false },
                { icon: Mic, label: "Allow audience audio", on: true },
                { icon: Monitor, label: "Allow screen sharing", on: false },
              ].map(({ icon: Icon, label, on }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <div
                    className={`w-10 h-5 rounded-full relative cursor-pointer ${on ? "bg-accent" : "bg-bg-tertiary"}`}
                  >
                    <div
                      className={`w-3 h-3 bg-white rounded-full absolute top-1 shadow-sm ${on ? "right-1" : "left-1"}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-bg-tertiary p-4 rounded-xl border border-border-primary flex items-center gap-3">
            <div className="bg-card-bg p-2 rounded-lg text-accent shadow-sm">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-text-primary">
                Start Immediately
              </div>
              <div className="text-xs text-text-secondary">
                The space will go live as soon as you create it.
              </div>
            </div>
            <div className="h-5 w-5 rounded-full border-2 border-accent flex items-center justify-center">
              <div className="h-2.5 w-2.5 bg-accent rounded-full" />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-border-primary flex justify-end gap-3 bg-bg-tertiary">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-text-secondary font-bold hover:bg-bg-tertiary rounded-xl transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onStart}
            className="px-6 py-2.5 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-colors text-sm flex items-center"
          >
            <Zap className="h-4 w-4 mr-2" /> Create & Start Space
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function SpacesPage() {
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
