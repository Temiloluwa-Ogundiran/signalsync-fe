import { TrendingUp, UserPlus, Star } from "lucide-react";

export function FeedRightPanel() {
  return (
    <div className="space-y-6">
      {/* Trending Streams */}
      <div className="bg-card-bg rounded-2xl border border-border-primary shadow-sm p-5">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide mb-4 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2 text-accent" />
          Trending Streams
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-bg-tertiary flex-shrink-0 mr-3 overflow-hidden">
                  <img
                    src={`https://picsum.photos/100/100?random=${10 + i}`}
                    alt="Stream"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">
                    Gold Killers
                  </h4>
                  <p className="text-xs text-text-secondary">+12% this week</p>
                </div>
              </div>
              <button className="text-xs font-medium text-text-tertiary hover:text-accent border border-border-primary rounded px-2 py-1 hover:border-accent/30 transition-all">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested */}
      <div className="bg-card-bg rounded-2xl border border-border-primary shadow-sm p-5">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide mb-4 flex items-center">
          <UserPlus className="h-4 w-4 mr-2 text-indigo-400" />
          Suggested For You
        </h3>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-start">
              <img
                src={`https://picsum.photos/100/100?random=${20 + i}`}
                className="h-9 w-9 rounded-full mr-3 mt-1"
                alt="Avatar"
              />
              <div>
                <h4 className="text-sm font-bold text-text-primary">
                  London Session Alpha
                </h4>
                <p className="text-xs text-text-secondary mb-2">
                  Technical analysis &amp; live setups during London open.
                </p>
                <div className="flex items-center space-x-2">
                  <button className="text-xs bg-text-primary text-bg-primary px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity">
                    Follow
                  </button>
                  <button className="text-xs text-text-secondary hover:text-text-primary px-2 py-1.5">
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden group cursor-pointer">
        <div className="relative z-10">
          <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center mb-3 backdrop-blur-sm">
            <Star className="h-4 w-4 text-white fill-current" />
          </div>
          <h3 className="font-bold text-lg mb-1">Syncgram Pro</h3>
          <p className="text-indigo-100 text-xs mb-3">
            Unlock unlimited signals and real-time copying.
          </p>
          <span className="text-xs font-bold bg-white text-indigo-600 px-3 py-1.5 rounded-lg shadow-sm">
            Upgrade Now
          </span>
        </div>
        <div className="absolute -right-4 -bottom-4 bg-white/10 w-24 h-24 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
      </div>
    </div>
  );
}
