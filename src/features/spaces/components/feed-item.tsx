"use client";

import {
  TrendingUp,
  MessageSquare,
  MoreHorizontal,
  Heart,
  Repeat,
  Share,
  Zap,
} from "lucide-react";

export function FeedItem({
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
