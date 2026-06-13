"use client";

import { useState } from "react";
import { X, Globe, Lock, Mic, Video, Monitor, Calendar, Zap } from "lucide-react";

export function CreateSpaceModal({
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
