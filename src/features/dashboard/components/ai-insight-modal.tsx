"use client";

import { useState, useEffect } from "react";
import { Bot, X, Send, Sparkles, Zap } from "lucide-react";

interface AiInsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string | null;
}

export function AiInsightModal({
  isOpen,
  onClose,
  topic,
}: AiInsightModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  const [prevTopic, setPrevTopic] = useState<string | null>(null);

  if (isOpen && (!prevIsOpen || topic !== prevTopic)) {
    setPrevIsOpen(true);
    setPrevTopic(topic);
    setIsLoading(true);
  }

  if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, topic]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card-bg rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent to-purple-500 p-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <span className="font-bold text-sm tracking-wide">Syncgram AI</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* User Question */}
          <div className="flex justify-end mb-6">
            <div className="bg-bg-tertiary text-text-primary px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm font-medium max-w-[80%]">
              {topic || "What's happening in the market?"}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="flex gap-3">
                <div className="h-8 w-8 bg-accent/20 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-bg-tertiary rounded w-3/4" />
                  <div className="h-4 bg-bg-tertiary rounded w-1/2" />
                </div>
              </div>
              <div className="h-32 bg-bg-tertiary rounded-xl w-full" />
            </div>
          ) : (
            <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="h-8 w-8 bg-gradient-to-br from-accent to-purple-500 rounded-full flex items-center justify-center shrink-0 shadow-sm text-white mt-1">
                <Sparkles className="h-4 w-4" />
              </div>

              <div className="space-y-6 flex-1">
                {/* TLDR Section */}
                <div className="bg-gradient-to-br from-accent/10 to-purple-500/10 border border-accent/20 rounded-xl p-5 relative overflow-hidden">
                  <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-wide mb-2">
                    <Zap className="h-3 w-3 fill-accent" /> TLDR
                  </div>
                  <p className="text-text-primary text-sm leading-relaxed font-medium">
                    The market is currently{" "}
                    <span className="text-success font-bold">Risk-On</span>{" "}
                    driven by lower-than-expected inflation data. Institutional
                    flows are moving into equities and high-beta currencies,
                    while the Dollar (DXY) faces rejection at key resistance.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <span className="text-[10px] bg-bg-tertiary border border-accent/20 text-accent px-2 py-1 rounded-md font-bold">
                      Institutional Buy-side
                    </span>
                    <span className="text-[10px] bg-bg-tertiary border border-accent/20 text-accent px-2 py-1 rounded-md font-bold">
                      Dovish Fed
                    </span>
                  </div>
                </div>

                {/* Deep Dive Section */}
                <div>
                  <h3 className="font-bold text-text-primary text-sm mb-3">
                    Deep Dive Analysis
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="h-5 w-5 rounded-full bg-bg-tertiary text-text-secondary flex items-center justify-center text-xs font-bold shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-primary">
                          Technical Rejection
                        </h4>
                        <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                          Gold&apos;s failure to break 2040 confirms strong
                          sell-side liquidity. Wait for a retest of 2032 support
                          before entering long positions. RSI divergence on the
                          4H timeframe suggests weakening momentum.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-5 w-5 rounded-full bg-bg-tertiary text-text-secondary flex items-center justify-center text-xs font-bold shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-primary">
                          Macro Catalyst
                        </h4>
                        <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                          Upcoming CPI data is priced in at 3.1%. Any deviation
                          above 3.3% will likely trigger a rapid USD rally and a
                          sell-off in risk assets like US30 and Crypto.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Input */}
        <div className="p-4 border-t border-border-primary bg-bg-primary shrink-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Ask follow-up question..."
              className="w-full bg-card-bg border border-border-primary rounded-xl pl-4 pr-12 py-3 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors shadow-sm">
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-text-tertiary">
              AI can make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
